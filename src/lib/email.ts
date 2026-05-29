const FROM_ADDRESS = process.env.EMAIL_FROM || "Backyard Restoration <orders@backyardrestorations.com>";

interface SendResult {
  sent: boolean;
  reason?: string;
}

export async function sendEmail(opts: {
  to: string;
  subject: string;
  html: string;
}): Promise<SendResult> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return { sent: false, reason: "RESEND_API_KEY not configured" };

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: FROM_ADDRESS,
        to: opts.to,
        subject: opts.subject,
        html: opts.html,
      }),
    });

    if (!res.ok) {
      const body = await res.json().catch(() => ({ message: res.statusText }));
      return { sent: false, reason: body.message || `HTTP ${res.status}` };
    }

    return { sent: true };
  } catch (e) {
    return { sent: false, reason: e instanceof Error ? e.message : "Unknown error" };
  }
}

export function paymentLinkEmail(opts: {
  customerName: string;
  orderId: string;
  total: string;
  paymentUrl: string;
}): { subject: string; html: string } {
  const shortId = opts.orderId.slice(0, 8).toUpperCase();
  return {
    subject: `Your order #${shortId} is ready for payment — Backyard Restoration`,
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 560px; margin: 0 auto; color: #1a1a1a;">
        <div style="background: #0d1117; padding: 32px; border-radius: 12px;">
          <h1 style="color: #fff; font-size: 20px; margin: 0 0 8px;">Your Order is Ready</h1>
          <p style="color: #8b949e; font-size: 14px; margin: 0 0 24px;">Hi ${opts.customerName}, we've confirmed pricing on your order.</p>

          <div style="background: #161b22; border: 1px solid #30363d; border-radius: 8px; padding: 20px; margin-bottom: 24px;">
            <p style="color: #8b949e; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; margin: 0 0 4px;">Order #${shortId}</p>
            <p style="color: #fff; font-size: 28px; font-weight: bold; margin: 0;">$${opts.total}</p>
          </div>

          <a href="${opts.paymentUrl}" style="display: block; background: #10b981; color: #fff; text-align: center; padding: 16px; border-radius: 8px; text-decoration: none; font-weight: bold; font-size: 14px; text-transform: uppercase; letter-spacing: 1px;">
            Pay Now
          </a>

          <p style="color: #484f58; font-size: 12px; text-align: center; margin: 16px 0 0;">Secure checkout powered by Stripe. This link expires in 24 hours.</p>
        </div>
        <p style="color: #484f58; font-size: 11px; text-align: center; margin-top: 16px;">Backyard Restoration — Custom Gaskets & Reproduction Parts</p>
      </div>
    `,
  };
}
