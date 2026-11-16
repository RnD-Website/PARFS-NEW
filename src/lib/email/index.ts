import "server-only";

/**
 * Transactional email. EMAIL_PROVIDER=console (default) logs emails in development.
 * Set EMAIL_PROVIDER=resend + EMAIL_API_KEY + EMAIL_FROM to send for real.
 */
type Email = { to: string; subject: string; text: string; html?: string };

export async function sendEmail(email: Email) {
  const provider = process.env.EMAIL_PROVIDER ?? "console";
  try {
    if (provider === "resend" && process.env.EMAIL_API_KEY && process.env.EMAIL_FROM) {
      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: { authorization: `Bearer ${process.env.EMAIL_API_KEY}`, "content-type": "application/json" },
        body: JSON.stringify({ from: process.env.EMAIL_FROM, to: email.to, subject: email.subject, text: email.text, html: email.html }),
      });
      if (!res.ok) console.error("[email] send failed", res.status, await res.text());
      return;
    }
    console.info(`[email:console] to=${email.to} subject="${email.subject}"\n${email.text}`);
  } catch (err) {
    // Email must never break the user flow (orders, sign-up).
    console.error("[email] error", err);
  }
}
