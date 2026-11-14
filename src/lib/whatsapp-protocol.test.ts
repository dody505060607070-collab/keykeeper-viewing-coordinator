import { describe, expect, it } from "vitest";
import { connectionState, providerError, qrImage, sendOutcome, toE164 } from "./whatsapp-protocol";

describe("WhatsApp transport", () => {
  it("normalizes the provided Egyptian admin phone without losing its country code", () => {
    expect(toE164("01222576172")).toBe("+201222576172");
  });
  it("preserves Saudi local and international numbers", () => {
    expect(toE164("٠٥٥١٢٣٤٥٦٧")).toBe("+966551234567");
    expect(toE164("00966551234567")).toBe("+966551234567");
    expect(toE164("+20 122 257 6172")).toBe("+201222576172");
  });
  it("rejects malformed recipients", () => {
    expect(toE164("++201222576172")).toBe("");
    expect(toE164("phone 0551234567")).toBe("");
    expect(toE164("123")).toBe("");
  });
  it("does not claim success without the provider message id", () => {
    expect(sendOutcome({}, 200).ok).toBe(false);
    expect(sendOutcome({ key: { id: "message-1" } }, 201)).toEqual({ ok: true, sid: "message-1" });
    expect(sendOutcome({ key: { id: "message-1" }, error: "rejected" }, 200).ok).toBe(false);
  });
  it("retains the actual nested rejection reason", () => {
    expect(providerError({ message: "Bad Request", response: { message: ["Number not on WhatsApp"] } }, 400)).toContain("Number not on WhatsApp");
  });
  it("does not treat a missing or failed state as a disconnected session", () => {
    expect(connectionState({})).toBe("unknown");
    expect(connectionState({ instance: { state: "close" } })).toBe("closed");
    expect(connectionState({ instance: { state: "open" } })).toBe("open");
  });
  it("accepts both QR response shapes", () => {
    expect(qrImage({ base64: "YWJj" })).toBe("data:image/png;base64,YWJj");
    expect(qrImage({ qrcode: { base64: "data:image/png;base64,YWJj" } })).toBe("data:image/png;base64,YWJj");
    expect(qrImage({ base64: "https://invalid.example" })).toBeNull();
  });
});