import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { connectionState, providerError, qrImage, sendOutcome, toE164 } from "./whatsapp-protocol";
export { toE164 } from "./whatsapp-protocol";

/**
 * إرسال واتساب عبر Evolution API فقط (الرقم المرتبط برمز QR).
 * السرّيات: WHATSAPP_API_URL + WHATSAPP_API_KEY + WHATSAPP_INSTANCE
 */

type WhatsAppResult =
  | { ok: true; sid: string }
  | { ok: false; error: string; needsTemplate?: boolean };

/** إعداد Evolution API (الجسر المجاني على الـVPS). */
/** الخط 1 = الرقم الأساسي (كل الأتمتة). الخط 2 = رقم رسائل ملاك البيع كل أسبوعين فقط. */
export type WaLine = 1 | 2;
function evoConfig(line: WaLine = 1) {
  const url = process.env["WHATSAPP_API_URL"];
  const key = process.env["WHATSAPP_API_KEY"];
  const instance =
    line === 2
      ? (process.env["WHATSAPP_INSTANCE_2"] ?? "rashoudi_owners")
      : (process.env["WHATSAPP_INSTANCE"] ?? "mithra2");
  if (!url || !key) return null;
  return { url: url.trim().replace(/\/+$/, ""), key: key.trim(), instance: encodeURIComponent(instance.trim()) };
}

async function evoFetch(path: string, init?: RequestInit, line: WaLine = 1) {
  const cfg = evoConfig(line);
  if (!cfg) throw new Error("إعدادات واتساب غير مكتملة");
  return fetch(`${cfg.url}${path}`, {
    ...init,
    signal: init?.signal ?? AbortSignal.timeout(15000),
    headers: {
      apikey: cfg.key,
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
  });
}

/** ينشئ الـ instance الخاصة بهذا الموقع تلقائيًا لو مش موجودة. */
export async function cloudEnsureInstance(line: WaLine = 1): Promise<void> {
  const cfg = evoConfig(line);
  if (!cfg) return;
  try {
    const res = await evoFetch(`/instance/connectionState/${cfg.instance}`, undefined, line);
    if (res.ok) return;
    if (res.status !== 404) throw new Error(providerError(await res.json().catch(() => null), res.status));
    const created = await evoFetch(`/instance/create`, {
      method: "POST",
      body: JSON.stringify({
        instanceName: decodeURIComponent(cfg.instance),
        integration: "WHATSAPP-BAILEYS",
        qrcode: true,
      }),
    }, line);
    if (!created.ok) throw new Error(providerError(await created.json().catch(() => null), created.status));
  } catch (error) {
    throw error;
  }
}

/** إرسال عبر Evolution API من الرقم المرتبط بالـQR. */
async function bridgeSend(to: string, body: string, line: WaLine = 1): Promise<WhatsAppResult | null> {
  const cfg = evoConfig(line);
  if (!cfg) return null;
  try {
    await requireConnected(line);
    const res = await evoFetch(`/message/sendText/${cfg.instance}`, {
      method: "POST",
      signal: AbortSignal.timeout(30000),
      body: JSON.stringify({ number: toE164(to).replace("+", ""), text: body }),
    }, line);
    const data = (await res.json().catch(() => ({}))) as {
      key?: { id?: string };
      message?: string;
      error?: string;
    };
    return sendOutcome(data, res.status);
  } catch (e) {
    return { ok: false, error: transportError(e) };
  }
}

/** إرسال رسالة واتساب عبر الرقم المرتبط (Evolution API). */
export async function whatsappSend(input: { to: string; body: string; line?: WaLine }): Promise<WhatsAppResult> {
  const to = toE164(input.to);
  if (!to) {
    return { ok: false, error: `رقم الجوال غير صالح: ${input.to}` };
  }
  if (!input.body.trim()) return { ok: false, error: "نص الرسالة فارغ" };
  const result = await bridgeSend(to, input.body, input.line ?? 1);
  if (!result) {
    return { ok: false, error: "خدمة واتساب غير مُعدّة — تأكد من إعدادات الربط" };
  }
  return result;
}

/** إرسال صورة/ملف على واتساب عبر رابط مباشر (Evolution API). */
export async function whatsappSendMedia(input: {
  to: string;
  url: string;
  caption?: string;
  fileName?: string;
  mediatype?: "image" | "document" | "video";
}): Promise<WhatsAppResult> {
  const cfg = evoConfig();
  if (!cfg) return { ok: false, error: "خدمة واتساب غير مُعدّة — تأكد من إعدادات الربط" };
  const to = toE164(input.to);
  if (!to) {
    return { ok: false, error: `رقم الجوال غير صالح: ${input.to}` };
  }
  try {
    await requireConnected(1);
    const res = await evoFetch(`/message/sendMedia/${cfg.instance}`, {
      method: "POST",
      signal: AbortSignal.timeout(45000),
      body: JSON.stringify({
        number: to.replace("+", ""),
        mediatype: input.mediatype ?? "image",
        media: input.url,
        ...(input.caption ? { caption: input.caption } : {}),
        ...(input.fileName ? { fileName: input.fileName } : {}),
      }),
    });
    const data = (await res.json().catch(() => ({}))) as {
      key?: { id?: string };
      message?: string;
      error?: string;
    };
    return sendOutcome(data, res.status);
  } catch (e) {
    return { ok: false, error: transportError(e) };
  }
}




export const sendWhatsAppMessage = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(
    (input: unknown) =>
      z
        .object({
          to: z.string().trim().regex(/^\+?[0-9\s()-]{8,20}$/),
          body: z.string().trim().min(1).max(4000),
        })
        .parse(input),
  )
  .handler(async ({ data }): Promise<WhatsAppResult> => {
    const { requireUnlocked } = await import("@/lib/kill-switch.server");
    await requireUnlocked();
    const result = await whatsappSend({ to: data.to, body: data.body });
    const { dispatchAutomation } = await import("@/lib/automation.server");
    await dispatchAutomation("whatsapp.sent", {
      to: data.to,
      body: data.body,
      ok: result.ok,
      sid: result.ok ? result.sid : null,
      error: result.ok ? null : result.error,
    });
    return result;
  });

export const checkWhatsAppConfig = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async () => {
    const cfg = evoConfig();
    return { configured: Boolean(cfg), instance: cfg?.instance ?? null };
  });

/** حالة ربط واتساب + رمز QR للمسح (Evolution API). */
export const getWhatsAppLinkStatus = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ line: z.union([z.literal(1), z.literal(2)]).default(1) }).parse(input ?? {}))
  .handler(async ({ data: input }) => {
    const line = input.line as WaLine;
    const cfg = evoConfig(line);
    if (!cfg) {
      return { configured: false, connection: "closed" as const, qr: null, me: null, error: null };
    }
    try {
      const stateRes = await evoFetch(`/instance/connectionState/${cfg.instance}`, undefined, line);
      const stateData = (await stateRes.json().catch(() => ({}))) as {
        instance?: { state?: string };
        message?: string;
      };
      if (!stateRes.ok) {
        return { configured: true, connection: stateRes.status === 404 ? "closed" as const : "unknown" as const, qr: null, me: null, error: providerError(stateData, stateRes.status) };
      }
      const state = connectionState(stateData);
      if (state === "open") {
        let me: string | null = null;
        try {
          const listRes = await evoFetch(`/instance/fetchInstances`, undefined, line);
          const list = (await listRes.json().catch(() => [])) as Array<{
            name?: string;
            instance?: { instanceName?: string; owner?: string };
            ownerJid?: string;
          }>;
          const found = list.find(
            (i) => i.name === decodeURIComponent(cfg.instance) || i.instance?.instanceName === decodeURIComponent(cfg.instance),
          );
          me = (found?.ownerJid ?? found?.instance?.owner ?? null)?.split("@")[0] ?? null;
        } catch {
          /* الاسم اختياري */
        }
        return { configured: true, connection: "open" as const, qr: null, me, error: null };
      }

      return {
        configured: true,
        connection: state,
        qr: null,
        me: null,
        error: state === "unknown" ? "تعذر التأكد من حالة الربط" : null,
      };
    } catch (e) {
      return {
        configured: true,
        connection: "unknown" as const,
        qr: null,
        me: null,
        error: `تعذر الوصول لخدمة واتساب: ${(e as Error).message}`,
      };
    }
  });

/** Request a QR only on explicit pairing, never during status polling. */
export const getWhatsAppQr = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ line: z.union([z.literal(1), z.literal(2)]).default(1) }).parse(input ?? {}))
  .handler(async ({ data }) => {
    const cfg = evoConfig(data.line);
    if (!cfg) return { qr: null, error: "إعدادات واتساب غير مكتملة" };
    try {
      await cloudEnsureInstance(data.line);
      const state = await evoFetch(`/instance/connectionState/${cfg.instance}`, undefined, data.line);
      const stateData = await state.json().catch(() => null);
      if (!state.ok) return { qr: null, error: providerError(stateData, state.status) };
      if (connectionState(stateData) === "open") return { qr: null, error: null };
      const res = await evoFetch(`/instance/connect/${cfg.instance}`, undefined, data.line);
      const body = await res.json().catch(() => null);
      if (!res.ok) return { qr: null, error: providerError(body, res.status) };
      let qr = qrImage(body);
      if (!qr && typeof body?.code === "string" && body.code.length > 40) {
        const QRCode = await import("qrcode");
        qr = await QRCode.toDataURL(body.code, { width: 512, margin: 4, errorCorrectionLevel: "M" });
      }
      return { qr, error: null };
    } catch (error) {
      return { qr: null, error: transportError(error) };
    }
  });

function transportError(error: unknown): string {
  if (error instanceof Error && (error.name === "TimeoutError" || error.name === "AbortError")) {
    return "خدمة واتساب تأخرت في الرد؛ حالة الإرسال غير مؤكدة، تحقق من الهاتف قبل إعادة الإرسال";
  }
  return error instanceof Error ? error.message : "تعذر الاتصال بخدمة واتساب";
}

async function requireConnected(line: WaLine): Promise<void> {
  const cfg = evoConfig(line);
  if (!cfg) throw new Error("إعدادات واتساب غير مكتملة");
  const res = await evoFetch(`/instance/connectionState/${cfg.instance}`, undefined, line);
  const body = await res.json().catch(() => null);
  if (!res.ok) throw new Error(providerError(body, res.status));
  if (connectionState(body) !== "open") throw new Error("رقم واتساب غير متصل؛ افتح صفحة ربط واتساب وتحقق من الاتصال");
}

/** فصل الرقم المرتبط وإظهار رمز QR جديد. */
export const unlinkWhatsApp = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ line: z.union([z.literal(1), z.literal(2)]).default(1) }).parse(input ?? {}))
  .handler(async ({ data: input }) => {
    const line = input.line as WaLine;
    const cfg = evoConfig(line);
    if (!cfg) return { ok: false, error: "خدمة واتساب غير مُعدّة" };
    try {
      const res = await evoFetch(`/instance/logout/${cfg.instance}`, { method: "DELETE" }, line);
      return { ok: res.ok, error: res.ok ? null : `WhatsApp ${res.status}` };
    } catch (e) {
      return { ok: false, error: (e as Error).message };
    }
  });
