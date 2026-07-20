type EmailMessage = {
  to: string;
  subject: string;
  html: string;
  text: string;
  idempotencyKey: string;
};

export interface EmailAdapter {
  send(message: EmailMessage): Promise<string>;
}

export class ResendEmailAdapter implements EmailAdapter {
  constructor(private readonly apiKey: string, private readonly from: string) {}

  async send(message: EmailMessage): Promise<string> {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        authorization: `Bearer ${this.apiKey}`,
        "content-type": "application/json",
        "idempotency-key": message.idempotencyKey,
      },
      body: JSON.stringify({
        from: this.from,
        to: [message.to],
        subject: message.subject,
        html: message.html,
        text: message.text,
      }),
    });
    const body = await response.json().catch(() => null) as { id?: string } | null;
    if (!response.ok || !body?.id) throw new Error(`EMAIL_PROVIDER_${response.status}`);
    return body.id;
  }
}

function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (character) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;",
  })[character]!);
}

function layout(content: string): string {
  return `<!doctype html><html lang="sl"><body style="margin:0;background:#fff8fb;color:#401326;font-family:Arial,sans-serif">
  <div style="max-width:600px;margin:0 auto;padding:32px 20px">
    <div style="font-size:14px;font-weight:800;letter-spacing:.08em;color:#db2777;margin-bottom:24px">EVENTAJ GALERIJA</div>
    <div style="background:#fff;border:1px solid #efd8e2;border-radius:20px;padding:28px">${content}</div>
    <p style="font-size:13px;line-height:1.6;color:#7b5d69;margin:20px 4px">To je transakcijsko sporočilo za naročen dogodek. Prijava ni potrebna.</p>
  </div></body></html>`;
}

function button(label: string, href: string): string {
  return `<a href="${escapeHtml(href)}" style="display:inline-block;background:#db2777;color:#fff;text-decoration:none;font-weight:700;padding:14px 20px;border-radius:12px">${escapeHtml(label)}</a>`;
}

export function qrDeliveryEmail(input: {
  deliveryId: string;
  recipientEmail: string;
  recipientName: string;
  eventName: string;
  eventDate: string;
  qrImageUrl: string;
  eventUrl: string;
  qrDownloadUrl: string;
  liveshowUrl: string;
}): EmailMessage {
  const name = escapeHtml(input.recipientName);
  const event = escapeHtml(input.eventName);
  return {
    to: input.recipientEmail,
    subject: `QR koda za ${input.eventName}`,
    idempotencyKey: `eventaj-qr-${input.deliveryId}`,
    html: layout(`<p style="margin:0 0 8px;color:#db2777;font-weight:700">PLAČILO USPEŠNO</p>
      <h1 style="font-size:28px;line-height:1.2;margin:0 0 12px">${name}, tvoja galerija je pripravljena.</h1>
      <p style="line-height:1.65;color:#684554;margin:0 0 24px"><strong>${event}</strong> · ${escapeHtml(input.eventDate)}<br>QR pokaži gostom ali ga natisni. Računa in prijave ne potrebuješ.</p>
      <div style="text-align:center;background:#fff8fb;border-radius:16px;padding:20px;margin-bottom:22px"><img src="${escapeHtml(input.qrImageUrl)}" width="260" height="260" alt="QR koda za ${event}" style="width:100%;max-width:260px;height:auto"></div>
      <div style="text-align:center;margin-bottom:14px">${button("Odpri galerijo", input.eventUrl)}</div>
      <p style="text-align:center;margin:0 0 22px"><a href="${escapeHtml(input.qrDownloadUrl)}" style="color:#9d174d">Prenesi QR za tisk</a></p>
      <div style="background:#fff8fb;border:1px solid #efd8e2;border-radius:16px;padding:18px 20px">
        <p style="margin:0 0 6px;color:#db2777;font-weight:700;font-size:14px">PRIKAZ V ŽIVO</p>
        <p style="line-height:1.6;color:#684554;margin:0 0 14px">Fotografije gostov predvajaj v živo na projektorju ali zaslonu med dogodkom.</p>
        <div>${button("Odpri prikaz v živo", input.liveshowUrl)}</div>
      </div>
      <hr style="border:0;border-top:1px solid #efd8e2;margin:24px 0"><p style="line-height:1.6;color:#684554;margin:0">Po zaključku dogodka ti na ta naslov pošljemo še ZIP vseh fotografij.</p>`),
    text: `Živjo ${input.recipientName},\n\nGalerija za ${input.eventName} (${input.eventDate}) je pripravljena.\nOdpri galerijo: ${input.eventUrl}\nPrenesi QR: ${input.qrDownloadUrl}\nPrikaz v živo (projekcija na dogodku): ${input.liveshowUrl}\n\nRačuna in prijave ne potrebuješ. Po dogodku ti pošljemo ZIP vseh fotografij.`,
  };
}

export function archiveDeliveryEmail(input: {
  deliveryId: string;
  recipientEmail: string;
  recipientName: string;
  eventName: string;
  mediaCount: number;
  downloadUrl: string;
  expiresAtLabel: string;
}): EmailMessage {
  return {
    to: input.recipientEmail,
    subject: `Fotografije dogodka ${input.eventName} so pripravljene`,
    idempotencyKey: `eventaj-archive-${input.deliveryId}`,
    html: layout(`<p style="margin:0 0 8px;color:#16a34a;font-weight:700">DOGODEK ZAKLJUČEN</p>
      <h1 style="font-size:28px;line-height:1.2;margin:0 0 12px">${escapeHtml(input.recipientName)}, fotografije so pripravljene.</h1>
      <p style="line-height:1.65;color:#684554;margin:0 0 24px">V ZIP-u je ${input.mediaCount} fotografij dogodka <strong>${escapeHtml(input.eventName)}</strong>.</p>
      <div style="margin-bottom:20px">${button("Prenesi vse fotografije", input.downloadUrl)}</div>
      <p style="font-size:14px;color:#7b5d69;margin:0">Povezava velja do ${escapeHtml(input.expiresAtLabel)}. Ne posreduj je drugim.</p>`),
    text: `Živjo ${input.recipientName},\n\nZIP z ${input.mediaCount} fotografijami dogodka ${input.eventName} je pripravljen.\nPrenos: ${input.downloadUrl}\nPovezava velja do ${input.expiresAtLabel}.`,
  };
}
