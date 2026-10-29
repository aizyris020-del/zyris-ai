// server/emailTemplates.js

const brandHeader = `
  <div style="background-color: #080d1a; padding: 24px; text-align: center; border-bottom: 1px solid rgba(255,255,255,0.1);">
    <h1 style="color: #ffffff; font-family: sans-serif; font-size: 24px; font-weight: 900; margin: 0; tracking-tight: -0.05em;">
      Zyris<span style="color: #38bdf8;">AI</span>
    </h1>
    <p style="color: #94a3b8; font-family: sans-serif; font-size: 11px; margin-top: 4px; text-transform: uppercase; letter-spacing: 1px;">
      Sub-100ms Business Intelligence
    </p>
  </div>
`;

const brandFooter = `
  <div style="background-color: #030712; padding: 20px; text-align: center; border-top: 1px solid rgba(255,255,255,0.08);">
    <p style="color: #64748b; font-family: sans-serif; font-size: 11px; margin: 0;">
      © ${new Date().getFullYear()} ZyrisAI Inc. All rights reserved.
    </p>
    <p style="color: #475569; font-family: sans-serif; font-size: 10px; margin-top: 6px;">
      Zero Data Retention • Encrypted Session • support@zyrisai.com
    </p>
  </div>
`;

// 1. WELCOME EMAIL TEMPLATE
const getWelcomeEmailHTML = (userName) => `
  <!DOCTYPE html>
  <html>
    <head><meta charset="utf-8"></head>
    <body style="background-color: #030712; margin: 0; padding: 20px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
      <div style="max-w: 560px; margin: 0 auto; background-color: #0b1329; border: 1px solid rgba(255,255,255,0.1); border-radius: 16px; overflow: hidden;">
        ${brandHeader}
        <div style="padding: 32px 24px; color: #e2e8f0;">
          <h2 style="color: #ffffff; font-size: 20px; font-weight: 700; margin-top: 0;">Welcome to ZyrisAI, ${userName || 'Innovator'}! 🚀</h2>
          <p style="color: #94a3b8; font-size: 14px; line-height: 1.6;">
            Your account has been successfully created. You now have priority access to LPU-accelerated market analysis and sub-100ms strategic intelligence.
          </p>
          
          <div style="background-color: rgba(56, 189, 248, 0.05); border: 1px solid rgba(56, 189, 248, 0.2); border-radius: 12px; padding: 16px; margin: 24px 0;">
            <p style="color: #38bdf8; font-size: 13px; font-weight: 600; margin: 0;">⚡ Starter Bonus</p>
            <p style="color: #cbd5e1; font-size: 12px; margin-top: 4px; margin-bottom: 0;">
              You have <strong>2 Free AI Analysis Credits</strong> loaded in your account balance to test live market scans.
            </p>
          </div>

          <p style="color: #94a3b8; font-size: 13px; line-height: 1.5;">
            If you ever need assistance or custom intelligence workflows, reply directly to this email or reach out to our team at <a href="mailto:support@zyrisai.com" style="color: #38bdf8;">support@zyrisai.com</a>.
          </p>
        </div>
        ${brandFooter}
      </div>
    </body>
  </html>
`;

// 2. PASSWORD RESET OTP TEMPLATE
const getResetOTPEmailHTML = (otpCode) => `
  <!DOCTYPE html>
  <html>
    <head><meta charset="utf-8"></head>
    <body style="background-color: #030712; margin: 0; padding: 20px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
      <div style="max-w: 560px; margin: 0 auto; background-color: #0b1329; border: 1px solid rgba(255,255,255,0.1); border-radius: 16px; overflow: hidden;">
        ${brandHeader}
        <div style="padding: 32px 24px; color: #e2e8f0; text-align: center;">
          <h2 style="color: #ffffff; font-size: 20px; font-weight: 700; margin-top: 0;">Password Reset Request</h2>
          <p style="color: #94a3b8; font-size: 14px; line-height: 1.6; margin-bottom: 24px;">
            We received a request to reset your ZyrisAI account password. Use the 6-digit verification code below:
          </p>
          
          <div style="background-color: #030712; border: 1px dashed #38bdf8; border-radius: 12px; padding: 18px; display: inline-block; margin: 12px 0;">
            <span style="font-family: monospace; font-size: 32px; font-weight: 800; letter-spacing: 8px; color: #38bdf8;">${otpCode}</span>
          </div>

          <p style="color: #64748b; font-size: 12px; margin-top: 20px;">
            This code will expire in 10 minutes. If you did not request a password reset, you can safely ignore this message.
          </p>
        </div>
        ${brandFooter}
      </div>
    </body>
  </html>
`;

module.exports = {
  getWelcomeEmailHTML,
  getResetOTPEmailHTML
};