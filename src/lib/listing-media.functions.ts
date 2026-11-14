import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const ALLOWED: Record<string, string> = { "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp" };
const MAX_BYTES = 8 * 1024 * 1024;

export const uploadListingImage = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) =>
    z.object({ type: z.string().max(40), base64: z.string().min(1).max(Math.ceil((MAX_BYTES * 4) / 3) + 8) }).parse(input),
  )
  .handler(async ({ data }) => {
    const ext = ALLOWED[data.type];
    if (!ext) throw new Error("نوع الصورة غير مدعوم");
    const bytes = Uint8Array.from(atob(data.base64), (c) => c.charCodeAt(0));
    if (bytes.byteLength === 0 || bytes.byteLength > MAX_BYTES) throw new Error("حجم الصورة غير مسموح");
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const path = `public/${crypto.randomUUID()}.${ext}`;
    const { error } = await supabaseAdmin.storage.from("listing-request-media").upload(path, bytes, { contentType: data.type });
    if (error) throw new Error("تعذّر رفع الصورة");
    return { path };
  });
