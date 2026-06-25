/**
 * /api/book — Serverless booking endpoint (BOOK-02 / BOOK-04)
 *
 * Receives the form POST from LessonsModal.astro (#lessons-form).
 * Primary delivery: Telegram Bot API sendMessage (D-10).
 * Fallback delivery: Resend email — BUILT but gated OFF for v1 via EMAIL_ENABLED (D-11/D-12).
 * Security: honeypot trap (BOOK-04), in-memory IP rate-limit 5 req/60s → 429,
 *           HTML-escaping of every user field before Telegram HTML parse_mode (T-03B-02),
 *           bot token read only from process.env (no PUBLIC_ prefix) so it never reaches
 *           the client bundle (T-03B-01), and generic error responses only (T-03B-05).
 *
 * This is the only on-demand route; the rest of the site stays output:'static'.
 */
export const prerender = false; // On-demand route; rest of site stays output:'static'

import type { APIRoute } from 'astro';
import { Resend } from 'resend';

// Rate limiter — in-memory Map (per-instance; accepted v1 tradeoff — RESEARCH Pattern 4).
const rateLimit = new Map<string, { count: number; resetAt: number }>();
const LIMIT = 5;
const WINDOW_MS = 60_000;

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimit.get(ip);
  if (!entry || now > entry.resetAt) {
    rateLimit.set(ip, { count: 1, resetAt: now + WINDOW_MS });
    return true;
  }
  if (entry.count >= LIMIT) return false;
  entry.count++;
  return true;
}

// Escape the three characters that are significant in Telegram HTML parse_mode (T-03B-02).
function escapeHtml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

async function sendTelegram(token: string, chatId: string, text: string): Promise<boolean> {
  try {
    const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: chatId, text, parse_mode: 'HTML' }),
    });
    const json = (await res.json()) as { ok?: boolean };
    return json.ok === true;
  } catch {
    // Never surface the raw error to the caller (T-03B-05); treat as delivery failure.
    return false;
  }
}

// Email fallback — BUILT but disabled unless EMAIL_ENABLED === 'true' (D-11/D-12).
async function sendEmailFallback(fields: {
  format: string;
  name: string;
  contact: string;
  experience: string;
}): Promise<boolean> {
  if (process.env.EMAIL_ENABLED !== 'true') return false;
  try {
    const resend = new Resend(process.env.RESEND_API_KEY);
    const { error } = await resend.emails.send({
      from: process.env.EMAIL_FROM ?? 'booking@brusnika.ru',
      to: [process.env.RECIPIENT_EMAIL!],
      subject: `Новая заявка: ${fields.name}`,
      html:
        `<p><b>Формат:</b> ${escapeHtml(fields.format)}</p>` +
        `<p><b>Имя:</b> ${escapeHtml(fields.name)}</p>` +
        `<p><b>Контакт:</b> ${escapeHtml(fields.contact)}</p>` +
        `<p><b>Опыт:</b> ${escapeHtml(fields.experience)}</p>`,
    });
    return !error;
  } catch {
    // Never surface the raw Resend error to the caller (T-03B-05).
    return false;
  }
}

export const POST: APIRoute = async ({ request }) => {
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0].trim() ?? 'unknown';
  if (!checkRateLimit(ip)) {
    return new Response('Too Many Requests', { status: 429 });
  }

  const data = await request.formData();

  // Honeypot — a filled `website` field means a bot; succeed silently without delivering (BOOK-04).
  const honeypot = (data.get('website') as string) ?? '';
  if (honeypot) {
    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const format = (data.get('format') as string) ?? '';
  const name = (data.get('name') as string) ?? '';
  const contact = (data.get('contact') as string) ?? '';
  const experience = (data.get('experience') as string) ?? '';

  // Russian message, four labeled fields each on its own line (D-13); user values escaped.
  const text =
    `<b>Новая заявка на занятие</b>\n\n` +
    `<b>Формат:</b> ${escapeHtml(format)}\n` +
    `<b>Имя:</b> ${escapeHtml(name)}\n` +
    `<b>Контакт:</b> ${escapeHtml(contact)}\n` +
    `<b>Опыт:</b> ${escapeHtml(experience)}`;

  const token = process.env.TELEGRAM_BOT_TOKEN ?? '';
  const chatId = process.env.TELEGRAM_CHAT_ID ?? '';
  const tgOk = await sendTelegram(token, chatId, text);

  if (tgOk) {
    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // Telegram failed — try the (gated) email fallback (D-11).
  const emailOk = await sendEmailFallback({ format, name, contact, experience });
  if (emailOk) {
    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // Both channels failed — generic error only, never leak internals (T-03B-05).
  return new Response(JSON.stringify({ ok: false }), {
    status: 500,
    headers: { 'Content-Type': 'application/json' },
  });
};
