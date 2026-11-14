/** Pure helpers shared by the WhatsApp transport and its regression tests. */
export function toE164(raw: string): string {
  const normalized = raw.trim().replace(/[٠-٩۰-۹]/g, (c) => String(c.charCodeAt(0) - (c <= "٩" ? 0x660 : 0x6f0)));
  if (!/^[+\d\s().-]+$/.test(normalized)) return "";
  let digits = normalized.replace(/[\s().-]/g, "");
  if (digits.startsWith("00")) digits = `+${digits.slice(2)}`;
  if (/^05\d{8}$/.test(digits)) digits = `+966${digits.slice(1)}`;
  else if (/^5\d{8}$/.test(digits)) digits = `+966${digits}`;
  else if (/^01\d{9}$/.test(digits)) digits = `+20${digits.slice(1)}`;
  else if (!digits.startsWith("+")) digits = `+${digits}`;
  return /^\+[1-9]\d{7,14}$/.test(digits) ? digits : "";
}

export function connectionState(data: unknown): "open" | "connecting" | "closed" | "unknown" {
  const d = data as { instance?: { state?: string }; state?: string } | null;
  const state = d?.instance?.state ?? d?.state;
  if (state === "open") return "open";
  if (state === "connecting") return "connecting";
  if (state === "close" || state === "closed") return "closed";
  return "unknown";
}

export function providerError(data: unknown, status: number): string {
  const d = data as { response?: { message?: unknown }; message?: unknown; error?: unknown } | null;
  const value = d?.response?.message ?? d?.message ?? d?.error;
  const message = Array.isArray(value) ? value.map(String).join("؛ ") : typeof value === "string" ? value : "";
  return `خدمة واتساب (${status})${message ? `: ${message.slice(0, 500)}` : ""}`;
}

export function sendOutcome(data: unknown, status: number): { ok: true; sid: string } | { ok: false; error: string } {
  if (status < 200 || status >= 300) return { ok: false, error: providerError(data, status) };
  const d = data as { key?: { id?: string }; error?: unknown; status?: string } | null;
  if (d?.error || d?.status === "ERROR" || d?.status === "failed") return { ok: false, error: providerError(data, status) };
  if (!d?.key?.id) return { ok: false, error: "لم تؤكد خدمة واتساب قبول الرسالة؛ تحقق من سجل الهاتف قبل إعادة إرسالها" };
  return { ok: true, sid: d.key.id };
}

export function qrImage(data: unknown): string | null {
  const d = data as { base64?: string; qrcode?: { base64?: string } } | null;
  const value = d?.base64 ?? d?.qrcode?.base64;
  if (!value) return null;
  if (value.startsWith("data:image/png;base64,")) return value;
  return /^[A-Za-z0-9+/=\s]+$/.test(value) ? `data:image/png;base64,${value}` : null;
}