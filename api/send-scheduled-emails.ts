import nodemailer from "nodemailer";
import { neon } from "@neondatabase/serverless";
import { linkImageBase64 } from "./link-image";

const CELEBRANT = "Deborah Woolley";
const TITLE = "70th Birthday Celebration";
const DATES = "October 23\u201325, 2026";
const EVENTS = [
  {
    day: "Friday",
    date: "October 23, 2026",
    title: "PRAISE NIGHT",
    time: "6:30 PM \u2013 8:30 PM",
    venue: "International Charismatic Church (ICC)",
    address: "1737 SW 3rd St, Grand Prairie, TX 75051",
  },
  {
    day: "Saturday",
    date: "October 24, 2026",
    title: "70th Birthday Celebration",
    time: "5:00 PM \u2013 10:00 PM",
    venue: "Bob Duncan Center",
    address: "2800 S Center St., Arlington, TX 76014",
  },
  {
    day: "Sunday",
    date: "October 25, 2026",
    title: "Thanksgiving Service",
    time: "9:00 AM \u2013 12:30 PM",
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

function getSql() {
  const url = process.env.DATABASE_URL || process.env.VITE_DATABASE_URL;
  if (!url) return null;
  return neon(url);
}

function buildReminderHtml(): string {
  const dayBlocks = EVENTS.map(
    (e) => `
      <tr>
        <td style="padding:0 0 12px 0;font-family:Arial,Helvetica,sans-serif;">
          <div style="background:#f8f6ff;border:1px solid #e9e4ff;border-radius:10px;padding:14px 16px;">
            <div style="font-size:12px;color:#7c3aed;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;">
              ${e.day} \u00b7 ${e.date}
            </div>
            <div style="font-size:15px;color:#1f1b30;font-weight:700;margin-top:2px;">${e.title}</div>
            <div style="font-size:13px;color:#5b566b;margin-top:2px;">${e.time}</div>
            <div style="font-size:13px;color:#5b566b;margin-top:4px;">
              ${e.venue}<br/>${e.address}
            </div>
          </div>
        </td>
      </tr>`,
  ).join("");

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
                  <div style="font-size:13px;color:#5b566b;margin-top:4px;font-family:Arial,Helvetica,sans-serif;">${DATES} \u00b7 ${CELEBRANT}</div>
                </td>
              </tr>
              <tr>
                <td style="padding:20px 32px 0 32px;text-align:center;">
                  <img src="cid:invitation" alt="70th Birthday Invitation" width="420" style="max-width:100%;width:420px;height:auto;border-radius:14px;border:1px solid #ece8f7;display:inline-block;" />
                </td>
              </tr>
              <tr>
                <td style="padding:24px 32px 8px 32px;font-family:Arial,Helvetica,sans-serif;color:#1f1b30;">
                  <div style="font-size:12px;color:#7c3aed;font-weight:700;text-transform:uppercase;letter-spacing:0.15em;margin-bottom:8px;">Your Celebration Is Almost Here!</div>
                  <p style="margin:0 0 14px 0;font-size:15px;line-height:1.6;">We're so excited to celebrate with you! Just <strong>2 days to go</strong> until ${CELEBRANT}'s 70th Birthday Celebration. Here's the full schedule:</p>
                </td>
              </tr>
              <tr>
                <td style="padding:8px 32px 0 32px;">
                  <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                    ${dayBlocks}
                  </table>
                </td>
              </tr>
              <tr>
                <td style="padding:20px 32px 0 32px;font-family:Arial,Helvetica,sans-serif;">
                  <div style="background:#faf9ff;border:1px solid #ece8f7;border-radius:12px;padding:16px 18px;">
                    <div style="font-size:13px;color:#1f1b30;font-weight:700;margin-bottom:4px;">Don't Forget!</div>
                    <div style="font-size:13px;color:#5b566b;line-height:1.6;">
                      \u2022 Bring your friends and family<br/>
                      \u2022 Follow the dress code for each day<br/>
                      \u2022 Reply to this email if you have any questions
                    </div>
                  </div>
                </td>
              </tr>
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
  </html>`;
}

function buildBirthdayHtml(): string {
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
                  <div style="font-size:13px;color:#5b566b;margin-top:4px;font-family:Arial,Helvetica,sans-serif;">${DATES} \u00b7 ${CELEBRANT}</div>
                </td>
              </tr>
              <tr>
                <td style="padding:20px 32px 0 32px;text-align:center;">
                  <img src="cid:invitation" alt="70th Birthday Invitation" width="420" style="max-width:100%;width:420px;height:auto;border-radius:14px;border:1px solid #ece8f7;display:inline-block;" />
                </td>
              </tr>
              <tr>
                <td style="padding:24px 32px 8px 32px;font-family:Arial,Helvetica,sans-serif;color:#1f1b30;text-align:center;">
                  <div style="font-size:40px;margin-bottom:8px;">&#127874;</div>
                  <div style="font-size:12px;color:#7c3aed;font-weight:700;text-transform:uppercase;letter-spacing:0.15em;margin-bottom:8px;">Happy 70th Birthday!</div>
                  <p style="margin:0 0 14px 0;font-size:15px;line-height:1.6;">Today we celebrate 70 beautiful years of <strong>${escapeHtml(CELEBRANT)}</strong>! Thank you for being part of this joyous milestone.</p>
                  <p style="margin:0 0 14px 0;font-size:15px;line-height:1.6;">Your presence and prayers mean the world to us. Join us tonight as we kick off the celebration with <strong>PRAISE NIGHT</strong>!</p>
                </td>
              </tr>
              <tr>
                <td style="padding:8px 32px 0 32px;font-family:Arial,Helvetica,sans-serif;">
                  <div style="background:#f8f6ff;border:1px solid #e9e4ff;border-radius:10px;padding:16px;text-align:center;">
                    <div style="font-size:12px;color:#7c3aed;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;">Tonight</div>
                    <div style="font-size:17px;color:#1f1b30;font-weight:700;margin-top:2px;">PRAISE NIGHT</div>
                    <div style="font-size:13px;color:#5b566b;margin-top:2px;">6:30 PM \u2013 8:30 PM</div>
                    <div style="font-size:13px;color:#5b566b;margin-top:4px;">International Charismatic Church (ICC)<br/>1737 SW 3rd St, Grand Prairie, TX 75051</div>
                    <div style="font-size:12px;color:#7c3aed;margin-top:6px;font-weight:600;">Dress Code: All White</div>
                  </div>
                </td>
              </tr>
              <tr>
                <td style="padding:20px 32px 0 32px;font-family:Arial,Helvetica,sans-serif;">
                  <div style="background:#faf9ff;border:1px solid #ece8f7;border-radius:12px;padding:16px 18px;">
                    <div style="font-size:13px;color:#1f1b30;font-weight:700;margin-bottom:4px;">This Weekend's Schedule</div>
                    <div style="font-size:13px;color:#5b566b;line-height:1.8;">
                      &#128336; <strong>Friday Oct 23</strong> \u2014 PRAISE NIGHT (6:30 PM)<br/>
                      &#127874; <strong>Saturday Oct 24</strong> \u2014 70th Birthday Celebration (5:00 PM)<br/>
                      &#128332; <strong>Sunday Oct 25</strong> \u2014 Thanksgiving Service (9:00 AM)
                    </div>
                  </div>
                </td>
              </tr>
              <tr>
                <td style="padding:24px 32px 32px 32px;font-family:Arial,Helvetica,sans-serif;">
                  <p style="font-size:14px;color:#5b566b;line-height:1.6;text-align:center;margin:0;">We can't wait to celebrate with you tonight! &#127775;</p>
                  <p style="font-size:12px;color:#8a849c;line-height:1.6;margin:16px 0 0 0;">Reply to this email if you have any questions.</p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
  </html>`;
}

type VercelReq = {
  method?: string;
  headers?: Record<string, string | undefined>;
};
type VercelRes = {
  status: (code: number) => VercelRes;
  json: (body: unknown) => void;
  end: () => void;
};

export default async function handler(req: VercelReq, res: VercelRes) {
  if (req.method !== "GET") {
    res.status(405).json({ ok: false, error: "Method not allowed" });
    return;
  }

  const authHeader = req.headers?.authorization;
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    res.status(401).json({ ok: false, error: "Unauthorized" });
    return;
  }

  const now = new Date();
  const year = now.getUTCFullYear();
  const month = now.getUTCMonth() + 1;
  const day = now.getUTCDate();

  let emailType: "reminder" | "birthday" | null = null;

  if (year === 2026 && month === 10 && day === 21) {
    emailType = "reminder";
  } else if (year === 2026 && month === 10 && day === 23) {
    emailType = "birthday";
  }

  if (!emailType) {
    res.status(200).json({ ok: true, skipped: true, reason: "No emails scheduled for today" });
    return;
  }

  const sql = getSql();
  if (!sql) {
    res.status(500).json({ ok: false, error: "Database not configured" });
    return;
  }

  const transporter = buildTransporter();
  if (!transporter) {
    res.status(500).json({ ok: false, error: "Email not configured" });
    return;
  }

  const rows = await sql`
    SELECT full_name, email
    FROM rsvps
    WHERE attending = true
      AND email IS NOT NULL
      AND email != ''
  `;

  if (rows.length === 0) {
    res.status(200).json({ ok: true, sent: 0, reason: "No attending guests with emails" });
    return;
  }

  const subject =
    emailType === "reminder"
      ? `Just 2 Days Away \u2014 ${TITLE} \ud83c\udf89`
      : `Happy 70th Birthday, ${CELEBRANT}! \ud83c\udf82`;

  const html = emailType === "reminder" ? buildReminderHtml() : buildBirthdayHtml();

  let sent = 0;
  let failed = 0;

  for (const row of rows) {
    const { full_name: name, email } = row as { full_name: string; email: string };
    try {
      await transporter.sendMail({
        from: `"${TITLE}" <${process.env.GMAIL_USER}>`,
        to: email,
        subject,
        html,
        attachments: [
          {
            filename: "invitation.jpeg",
            content: Buffer.from(linkImageBase64, "base64"),
            cid: "invitation",
          },
        ],
      });
      sent++;
    } catch (err) {
      console.error(`Failed to send ${emailType} to ${email} (${name}):`, err);
      failed++;
    }
  }

  res.status(200).json({ ok: true, type: emailType, sent, failed });
}
