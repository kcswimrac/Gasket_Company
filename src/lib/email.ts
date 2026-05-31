const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "https://backyardrestorations.com";
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

export function orderStatusEmail(opts: {
  customerName: string;
  orderId: string;
  status: "paid" | "in_progress" | "shipped" | "delivered";
  trackingNumber?: string | null;
}): { subject: string; html: string } {
  const shortOid = opts.orderId.slice(0, 8).toUpperCase();

  const configs: Record<
    typeof opts.status,
    { subject: string; heading: string; message: string; accent: string; statusLabel: string }
  > = {
    paid: {
      subject: `Payment confirmed for order #${shortOid} — Backyard Restoration`,
      heading: "Payment Confirmed",
      message: "Thank you for your payment. Your order is now in our queue and will begin production shortly.",
      accent: "#3b82f6",
      statusLabel: "Paid",
    },
    in_progress: {
      subject: `Your order #${shortOid} is being manufactured — Backyard Restoration`,
      heading: "Your Order Is Being Manufactured",
      message: "Great news! Your custom parts have entered production. We'll notify you when they ship.",
      accent: "#10b981",
      statusLabel: "In Progress",
    },
    shipped: {
      subject: `Your order #${shortOid} has shipped — Backyard Restoration`,
      heading: "Your Order Has Shipped",
      message: "Your order is on its way! You can track your shipment using the details below.",
      accent: "#a855f7",
      statusLabel: "Shipped",
    },
    delivered: {
      subject: `Your order #${shortOid} has been delivered — Backyard Restoration`,
      heading: "Your Order Has Been Delivered",
      message: "Your order has been delivered. We hope everything looks great! If you have any questions, don't hesitate to reach out.",
      accent: "#22c55e",
      statusLabel: "Delivered",
    },
  };

  const cfg = configs[opts.status];

  const trackingBlock =
    opts.status === "shipped" && opts.trackingNumber
      ? `
          <div style="background: #161b22; border: 1px solid #30363d; border-radius: 8px; padding: 16px; margin-bottom: 16px;">
            <p style="color: #8b949e; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; margin: 0 0 4px;">Tracking Number</p>
            <p style="color: #fff; font-size: 16px; font-weight: bold; font-family: monospace; margin: 0;">${opts.trackingNumber}</p>
          </div>
        `
      : "";

  return {
    subject: cfg.subject,
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 560px; margin: 0 auto; color: #1a1a1a;">
        <div style="background: #0d1117; padding: 32px; border-radius: 12px;">
          <h1 style="color: #fff; font-size: 20px; margin: 0 0 8px;">${cfg.heading}</h1>
          <p style="color: #8b949e; font-size: 14px; margin: 0 0 24px;">Hi ${opts.customerName}, here's an update on your order.</p>

          <div style="background: #161b22; border: 1px solid #30363d; border-radius: 8px; padding: 20px; margin-bottom: 16px;">
            <p style="color: #8b949e; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; margin: 0 0 4px;">Order #${shortOid}</p>
            <p style="color: ${cfg.accent}; font-size: 20px; font-weight: bold; margin: 0;">${cfg.statusLabel}</p>
          </div>

          ${trackingBlock}

          <p style="color: #c9d1d9; font-size: 14px; line-height: 1.6; margin: 0 0 24px;">${cfg.message}</p>

          <p style="color: #484f58; font-size: 12px; text-align: center; margin: 0;">If you have any questions, reply to this email or contact us directly.</p>
        </div>
        <p style="color: #484f58; font-size: 11px; text-align: center; margin-top: 16px;">Backyard Restoration — Custom Gaskets & Reproduction Parts</p>
      </div>
    `,
  };
}

export function passwordResetEmail(opts: {
  token: string;
}): { subject: string; html: string } {
  const resetUrl = `${BASE_URL}/account/reset-password?token=${opts.token}`;
  return {
    subject: "Reset your password — Backyard Restoration",
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 560px; margin: 0 auto; color: #1a1a1a;">
        <div style="background: #0d1117; padding: 32px; border-radius: 12px;">
          <h1 style="color: #fff; font-size: 20px; margin: 0 0 8px;">Reset Your Password</h1>
          <p style="color: #8b949e; font-size: 14px; margin: 0 0 24px;">We received a request to reset your password. Click the button below to choose a new one.</p>

          <a href="${resetUrl}" style="display: block; background: #10b981; color: #fff; text-align: center; padding: 16px; border-radius: 8px; text-decoration: none; font-weight: bold; font-size: 14px; text-transform: uppercase; letter-spacing: 1px;">
            Reset Password
          </a>

          <p style="color: #c9d1d9; font-size: 13px; line-height: 1.6; margin: 24px 0 0;">If you didn't request this, you can safely ignore this email. The link expires in 1 hour.</p>
          <p style="color: #484f58; font-size: 12px; text-align: center; margin: 16px 0 0;">If you have any questions, reply to this email or contact us directly.</p>
        </div>
        <p style="color: #484f58; font-size: 11px; text-align: center; margin-top: 16px;">Backyard Restoration — Custom Gaskets & Reproduction Parts</p>
      </div>
    `,
  };
}

export function welcomeEmail(opts: {
  customerName: string;
}): { subject: string; html: string } {
  const catalogUrl = `${BASE_URL}/catalog`;
  const quoteUrl = `${BASE_URL}/gaskets`;
  return {
    subject: "Welcome to Backyard Restoration",
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 560px; margin: 0 auto; color: #1a1a1a;">
        <div style="background: #0d1117; padding: 32px; border-radius: 12px;">
          <h1 style="color: #fff; font-size: 20px; margin: 0 0 8px;">Welcome to Backyard Restoration</h1>
          <p style="color: #8b949e; font-size: 14px; margin: 0 0 24px;">Hi ${opts.customerName}, thanks for creating an account! We're glad to have you.</p>

          <p style="color: #c9d1d9; font-size: 14px; line-height: 1.6; margin: 0 0 24px;">You can now track orders, save parts to your wishlist, and get custom gasket quotes.</p>

          <div style="display: flex; gap: 12px; margin-bottom: 24px;">
            <a href="${catalogUrl}" style="flex: 1; display: block; background: #161b22; border: 1px solid #30363d; color: #10b981; text-align: center; padding: 14px 8px; border-radius: 8px; text-decoration: none; font-weight: bold; font-size: 13px;">
              Browse Catalog
            </a>
            <a href="${quoteUrl}" style="flex: 1; display: block; background: #10b981; color: #fff; text-align: center; padding: 14px 8px; border-radius: 8px; text-decoration: none; font-weight: bold; font-size: 13px;">
              Get a Gasket Quote
            </a>
          </div>

          <p style="color: #484f58; font-size: 12px; text-align: center; margin: 0;">If you have any questions, reply to this email or contact us directly.</p>
        </div>
        <p style="color: #484f58; font-size: 11px; text-align: center; margin-top: 16px;">Backyard Restoration — Custom Gaskets & Reproduction Parts</p>
      </div>
    `,
  };
}
