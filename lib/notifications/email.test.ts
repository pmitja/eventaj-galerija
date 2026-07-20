import { describe, expect, it } from "vitest";
import { archiveDeliveryEmail, qrDeliveryEmail } from "./email";

describe("event delivery emails", () => {
  it("explains the passwordless QR handoff and escapes customer content", () => {
    const email = qrDeliveryEmail({
      deliveryId: "delivery-1", recipientEmail: "nina@example.com", recipientName: "Nina <script>",
      eventName: "Poroka & zabava", eventDate: "1. avgust 2026", qrImageUrl: "https://example.test/qr/code.png",
      eventUrl: "https://example.test/t/code", qrDownloadUrl: "https://example.test/qr/code.png?download=1",
      liveshowUrl: "https://example.test/display/live-token",
    });
    expect(email.html).toContain("prijave ne potrebuješ");
    expect(email.html).not.toContain("<script>");
    expect(email.html).toContain("https://example.test/display/live-token");
    expect(email.text).toContain("https://example.test/display/live-token");
    expect(email.idempotencyKey).toBe("eventaj-qr-delivery-1");
  });

  it("makes archive expiry and photo count explicit", () => {
    const email = archiveDeliveryEmail({
      deliveryId: "delivery-1", recipientEmail: "nina@example.com", recipientName: "Nina",
      eventName: "Poroka", mediaCount: 42, downloadUrl: "https://example.test/prenosi/token", expiresAtLabel: "jutri ob 12:00",
    });
    expect(email.text).toContain("42 fotografijami");
    expect(email.text).toContain("jutri ob 12:00");
  });
});
