import nodemailer from "nodemailer";

export function checkEmailConfig() {
  console.log("📧 Email configuration check:");
  console.log("  EMAIL_HOST:", process.env.EMAIL_HOST ? "✓ Set" : "❌ Missing");
  console.log("  EMAIL_PORT:", process.env.EMAIL_PORT ? "✓ Set" : "❌ Missing");
  console.log("  EMAIL_USER:", process.env.EMAIL_USER ? "✓ Set" : "❌ Missing");
  console.log("  EMAIL_PASS:", process.env.EMAIL_PASS ? "✓ Set (length: " + (process.env.EMAIL_PASS?.length || 0) + ")" : "❌ Missing");
  console.log("  EMAIL_FROM:", process.env.EMAIL_FROM || "Using default: Bitell <noreply@bitell.app>");
  console.log("  CLIENT_ORIGIN:", process.env.CLIENT_ORIGIN ? "✓ Set" : "❌ Missing");
}

let transporter = null;

function getTransporter() {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: Number(process.env.EMAIL_PORT) || 587,
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
  }
  return transporter;
}

export function verifyEmailTransporter() {
  const t = getTransporter();
  t.verify((error) => {
    if (error) {
      console.error("❌ Email transporter verification failed:", error.message);
    } else {
      console.log("✅ Email transporter verified successfully");
    }
  });
}

export async function sendPasswordResetEmail(to, token) {
  console.log("📧 Sending password reset email to:", to);
  try {
    const resetUrl = `${process.env.CLIENT_ORIGIN}/reset-password?token=${token}`;
    const result = await getTransporter().sendMail({
      from: process.env.EMAIL_FROM || "Bitell <noreply@bitell.app>",
      to,
      subject: "Reset your Bitell password",
      html: `
        <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:32px;background:#0f172a;border-radius:12px;">
          <div style="margin-bottom:24px;">
            <span style="font-size:24px;font-weight:800;color:#10b981;letter-spacing:-0.5px;">Bi</span>
            <span style="font-size:24px;font-weight:800;color:#ffffff;letter-spacing:-0.5px;">tell</span>
          </div>
          <h2 style="font-size:20px;color:#ffffff;margin-bottom:8px;">Reset your password</h2>
          <p style="color:#94a3b8;line-height:1.6;margin-bottom:24px;">
            We received a request to reset the password for your Bitell account.
            Click the button below to set a new password. This link expires in <strong style="color:#e2e8f0;">1 hour</strong>.
          </p>
          <a href="${resetUrl}"
             style="display:inline-block;background:#10b981;color:#0f172a;font-weight:700;
                    padding:14px 32px;border-radius:10px;text-decoration:none;font-size:15px;">
            Reset Password
          </a>
          <p style="color:#475569;font-size:12px;margin-top:32px;">
            If you didn't request this, you can safely ignore this email.<br/>
            This link will expire in 1 hour.
          </p>
          <hr style="border:none;border-top:1px solid #1e293b;margin:24px 0;"/>
          <p style="color:#334155;font-size:11px;">
            Bitell · Business Financial Intelligence
          </p>
        </div>
      `,
    });
    console.log("✅ Password reset email sent:", result.messageId);
  } catch (error) {
    console.error("❌ Failed to send reset email:", error.message);
    throw error;
  }
}

export async function sendWelcomeEmail(to, name) {
  console.log("📧 Sending welcome email to:", to);
  try {
    const result = await getTransporter().sendMail({
      from: process.env.EMAIL_FROM || "Bitell <noreply@bitell.app>",
      to,
      subject: "Welcome to Bitell — your 14-day trial has started",
      html: `
        <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:32px;background:#0f172a;border-radius:12px;">
          <div style="margin-bottom:24px;">
            <span style="font-size:24px;font-weight:800;color:#10b981;letter-spacing:-0.5px;">Bi</span>
            <span style="font-size:24px;font-weight:800;color:#ffffff;letter-spacing:-0.5px;">tell</span>
          </div>
          <h2 style="font-size:20px;color:#ffffff;margin-bottom:8px;">Welcome, ${name}!</h2>
          <p style="color:#94a3b8;line-height:1.6;margin-bottom:16px;">
            Your 14-day free trial has started. Upload your first bank statement and
            get a complete picture of your business finances — instantly.
          </p>
          <ul style="color:#94a3b8;line-height:2.2;padding-left:20px;">
            <li>Upload PDF or CSV bank statements from any bank</li>
            <li>AI auto-categorises every transaction in seconds</li>
            <li>Monthly + annual performance dashboards</li>
            <li>Automatic currency detection</li>
            <li>Actionable financial health recommendations</li>
          </ul>
          <a href="${process.env.CLIENT_ORIGIN}/dashboard"
             style="display:inline-block;margin-top:24px;background:#10b981;color:#0f172a;
                    font-weight:700;padding:14px 32px;border-radius:10px;
                    text-decoration:none;font-size:15px;">
            Go to Dashboard →
          </a>
          <p style="color:#475569;font-size:12px;margin-top:32px;">
            Trial ends in 14 days. No credit card required.
          </p>
          <hr style="border:none;border-top:1px solid #1e293b;margin:24px 0;"/>
          <p style="color:#334155;font-size:11px;">
            Bitell · Business Financial Intelligence
          </p>
        </div>
      `,
    });
    console.log("✅ Welcome email sent:", result.messageId);
  } catch (error) {
    console.error("❌ Failed to send welcome email:", error.message);
    throw error;
  }
}
