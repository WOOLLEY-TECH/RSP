import nodemailer from "nodemailer";
import { linkImageBase64 } from "./link-image";

type SendBody = {
  to: string;
  fullName: string;
  attending: boolean;
  attendingDays: string[];
  guests: string[];
};

type VercelReq = { method?: string; body?: unknown };
type VercelRes = {
  status: (code: number) => VercelRes;
  json: (body: unknown) => void;
  end: () => void;
};

const CELEBRANT = "Deborah Woolley";
const TITLE = "70th Birthday Celebration";
const DATES = "October 23–25, 2026";
const EVENTS = [
  {
    day: "Friday",
    date: "October 23, 2026",
    title: "PRAISE NIGHT",
    venue: "International Charismatic Church (ICC)",
    address: "1737 SW 3rd St, Grand Prairie, TX 75051",
  },
  {
    day: "Saturday",
    date: "October 24, 2026",
    title: "70th Birthday Celebration",
    venue: "Bob Duncan Center",
    address: "2800 S Center St., Arlington, TX 76014",
  },
  {
    day: "Sunday",
    date: "October 25, 2026",
    title: "Thanksgiving Service",
    venue: "International Charismatic Church (ICC)",
    address: "1717 SW 3rd St, Grand Prairie, TX 75051",
  },
];

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function buildEmailHtml(body: SendBody): string {
  const { fullName, attending, attendingDays, guests } = body;
  const names = escapeHtml(fullName);
  const days =
    attendingDays && attendingDays.length > 0
      ? EVENTS.filter((e) => attendingDays.includes(e.day))
      : [];
  const guestList = guests && guests.length > 0 ? guests.map(escapeHtml) : [];

  const dayBlocks = days
    .map(
      (e) => `
        <tr>
          <td style="padding:0 0 12px 0;font-family:Arial,Helvetica,sans-serif;">
            <div style="background:#f8f6ff;border:1px solid #e9e4ff;border-radius:10px;padding:14px 16px;">
              <div style="font-size:12px;color:#7c3aed;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;">
                ${e.day} · ${e.date}
              </div>
              <div style="font-size:15px;color:#1f1b30;font-weight:700;margin-top:2px;">${e.title}</div>
              <div style="font-size:13px;color:#5b566b;margin-top:4px;">
                ${e.venue}<br/>${e.address}
              </div>
            </div>
          </td>
        </tr>`,
    )
    .join("");

  const bodyText = attending
    ? `<p style="margin:0 0 14px 0;">We're so happy to hear you'll be joining us, ${names}!</p>
       <p style="margin:0 0 14px 0;font-size:15px;line-height:1.6;">Your spot${guestList.length > 0 ? ` for you and ${guestList.length} guest${guestList.length === 1 ? "" : "s"}` : ""} is confirmed. Here's what you selected:</p>`
    : `<p style="margin:0 0 14px 0;">Thank you for letting us know, ${names}. We're sorry you can't join us, but we truly appreciate your response.</p>`;

  return `
  <!DOCTYPE html>
  <html lang="en" xmlns="http://www.w3.org/1999/xhtml">
    <body style="margin:0;padding:0;background:#f4f2fa;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f4f2fa;padding:24px 12px;">
        <tr>
          <td align="center">
            <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#ffffff;border-radius:16px;overflow:hidden;border:1px solid #ece8f7;">
              <tr>
                <td style="background:#ffffff;padding:28px 32px;text-align:center;border-bottom:1px solid #ece8f7;">
                  <div style="font-size:12px;color:#7c3aed;letter-spacing:0.25em;text-transform:uppercase;font-family:Arial,Helvetica,sans-serif;">Celebrating 70 years</div>
                  <div style="font-size:26px;font-weight:800;color:#1f1b30;margin-top:6px;font-family:Arial,Helvetica,sans-serif;">${TITLE}</div>
                  <div style="font-size:13px;color:#5b566b;margin-top:4px;font-family:Arial,Helvetica,sans-serif;">${DATES} · ${CELEBRANT}</div>
                </td>
              </tr>
              <tr>
                <td style="padding:20px 32px 0 32px;text-align:center;">
                  <img
                    src="cid:invitation"
                    alt="70th Birthday Invitation"
                    width="420"
                    style="max-width:100%;width:420px;height:auto;border-radius:14px;border:1px solid #ece8f7;display:inline-block;"
                  />
                </td>
              </tr>
              <tr>
                <td style="padding:24px 32px 8px 32px;font-family:Arial,Helvetica,sans-serif;color:#1f1b30;">
                  <div style="font-size:12px;color:#7c3aed;font-weight:700;text-transform:uppercase;letter-spacing:0.15em;">${attending ? "RSVP Confirmed" : "Response Received"}</div>
                  ${bodyText}
                </td>
              </tr>
              ${
                attending
                  ? `<tr><td style="padding:8px 32px 0 32px;"><table role="presentation" width="100%" cellpadding="0" cellspacing="0">${dayBlocks}</table></td></tr>`
                  : ""
              }
              ${
                guestList.length > 0 && attending
                  ? `<tr><td style="padding:8px 32px 8px 32px;font-family:Arial,Helvetica,sans-serif;">
                        <div style="font-size:12px;color:#7c3aed;font-weight:700;text-transform:uppercase;letter-spacing:0.15em;margin-bottom:8px;">Your guests</div>
                        <div style="background:#faf9ff;border:1px solid #ece8f7;border-radius:10px;padding:12px 16px;font-size:14px;color:#1f1b30;">${guestList.join("<br/>")}</div>
                      </td></tr>`
                  : ""
              }
              <tr>
                <td style="padding:24px 32px 32px 32px;font-family:Arial,Helvetica,sans-serif;">
                  <div style="background:#faf9ff;border:1px solid #ece8f7;border-radius:12px;padding:16px 18px;">
                    <div style="font-size:13px;color:#1f1b30;font-weight:700;margin-bottom:4px;">Need to make a change?</div>
                    <div style="font-size:13px;color:#5b566b;line-height:1.6;">Just reply to this email and we'll help you update your RSVP.</div>
                  </div>
                  <p style="font-size:12px;color:#8a849c;line-height:1.6;margin:20px 0 0 0;">We can't wait to celebrate ${CELEBRANT}'s 70th birthday with you.</p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
  </html>
  `;
}

function buildTransporter() {
  const user = process.env.GMAIL_USER;
  const appPassword = process.env.GMAIL_APP_PASSWORD;
  const clientId = process.env.GMAIL_CLIENT_ID;
  const clientSecret = process.env.GMAIL_CLIENT_SECRET;
  const refreshToken = process.env.GMAIL_REFRESH_TOKEN;

  if (user && clientId && clientSecret && refreshToken) {
    return nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      secure: true,
      auth: {
        type: "OAuth2",
        user,
        clientId,
        clientSecret,
        refreshToken,
      },
    });
  }

  if (user && appPassword) {
    return nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      secure: true,
      auth: { user, pass: appPassword },
    });
  }

  return null;
}

export default async function handler(req: VercelReq, res: VercelRes) {
  if (req.method !== "POST") {
    res.status(405).json({ ok: false, error: "Method not allowed" });
    return;
  }

  const transporter = buildTransporter();

  if (!transporter) {
    res.status(500).json({ ok: false, error: "Email sending is not configured" });
    return;
  }

  let body: SendBody;
  try {
    body = req.body as SendBody;
  } catch {
    res.status(400).json({ ok: false, error: "Invalid request body" });
    return;
  }

  if (!body?.to || !body.fullName) {
    res.status(400).json({ ok: false, error: "Missing recipient or name" });
    return;
  }

  try {
    await transporter.sendMail({
      from: `"${TITLE}" <${process.env.GMAIL_USER}>`,
      to: body.to,
      subject: body.attending ? `RSVP Confirmed — ${TITLE} 🎉` : `${TITLE} — Response Received`,
      html: buildEmailHtml(body),
      attachments: [
        {
          filename: "invitation.jpeg",
          content: Buffer.from(linkImageBase64, "base64"),
          cid: "invitation",
        },
      ],
    });

    res.status(200).json({ ok: true });
  } catch (err) {
    console.error("Failed to send confirmation email:", err);
    res.status(502).json({ ok: false, error: "Email delivery failed" });
  }
}
