// 1. MUST BE LINE 1 so process.env variables load before anything else initializes!
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const nodemailer = require('nodemailer');
const path = require('path');

// Explicit Firebase Admin imports with cert support
const { initializeApp, getApps, cert } = require('firebase-admin/app');
const { getAuth } = require('firebase-admin/auth');

const app = express();
const PORT = process.env.PORT || 5000;

// Initialize Firebase Admin with Service Account Credentials
if (getApps().length === 0) {
  try {
    const serviceAccount = require(path.join(__dirname, 'serviceAccountKey.json'));
    initializeApp({
      credential: cert(serviceAccount)
    });
    console.log('✅ [FIREBASE ADMIN READY] Authenticated with Service Account Key successfully!');
  } catch (fbError) {
    console.warn('⚠️ [FIREBASE ADMIN WARNING] Could not load serviceAccountKey.json:', fbError.message);
  }
}

// Temporary In-Memory Store for OTPs (Key: email, Value: { otp, expiresAt })
const otpStore = new Map();

// Configure Nodemailer Transporter using explicit Gmail SSL configuration
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 465,
  secure: true, // Use SSL for Port 465
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  },
  tls: {
    rejectUnauthorized: false
  }
});

// Verify SMTP Connection at Server Startup
if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
  transporter.verify((error, success) => {
    if (error) {
      console.error('❌ [SMTP ERROR] Transporter Verification Failed:', error.message);
    } else {
      console.log('✅ [SMTP READY] Connected to Gmail SMTP Server successfully!');
    }
  });
} else {
  console.warn('⚠️ [SMTP WARNING] EMAIL_USER or EMAIL_PASS is missing in server/.env!');
}

// Allowed origins for CORS (Local Dev + Production)
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  'http://127.0.0.1:5173',
  'https://zyrisai.com',
  'https://www.zyrisai.com'
];

// Configure CORS Options
const corsOptions = {
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin) || process.env.NODE_ENV !== 'production') {
      callback(null, true);
    } else {
      callback(new Error('Blocked by CORS policy'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  optionsSuccessStatus: 200
};

// Global Middleware
app.use(cors(corsOptions));
app.options('/{*splat}', cors(corsOptions));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Global COOP Isolation Header
app.use((req, res, next) => {
  res.setHeader('Cross-Origin-Opener-Policy', 'same-origin-allow-popups');
  next();
});

// 1. Health Check Endpoint
app.get('/', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'ZyrisAI VPS Server active' });
});

// 2. Send Reset OTP Route (Refined ZyrisAI Security Branding)
app.post('/api/auth/send-otp', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ success: false, message: 'Email address is required.' });
    }

    const generatedOtp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = Date.now() + 10 * 60 * 1000; // Code valid for 10 minutes

    // Store OTP in memory for verification
    otpStore.set(email.toLowerCase(), { otp: generatedOtp, expiresAt });
    console.log(`[OTP GENERATED] Email: ${email} | Code: ${generatedOtp}`);

    // Dispatch email via Nodemailer if SMTP credentials exist
    if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
      try {
        const info = await transporter.sendMail({
          from: `"ZyrisAI Security" <${process.env.EMAIL_USER}>`,
          to: email,
          subject: 'ZyrisAI Verification Code',
          text: `Your ZyrisAI verification code is ${generatedOtp}. It will expire in 10 minutes. If you did not request a password reset, please ignore this email.`,
          html: `
            <!DOCTYPE html>
            <html>
            <head>
              <meta charset="utf-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
            </head>
            <body style="margin: 0; padding: 0; background-color: #030712; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
              <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="padding: 40px 20px; background-color: #030712;">
                <tr>
                  <td align="center">
                    <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 480px; background-color: #080d1a; border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 20px; padding: 32px; text-align: center;">
                      <tr>
                        <td align="center" style="padding-bottom: 24px;">
                          <div style="display: inline-block; width: 44px; height: 44px; background: linear-gradient(135deg, #06b6d4, #3b82f6); border-radius: 12px; line-height: 44px; color: #ffffff; font-weight: 900; font-size: 22px;">Z</div>
                          <div style="color: #ffffff; font-size: 20px; font-weight: 800; margin-top: 10px; letter-spacing: -0.5px;">Zyris<span style="color: #38bdf8;">AI</span></div>
                        </td>
                      </tr>
                      <tr>
                        <td style="color: #f8fafc; font-size: 18px; font-weight: 700; padding-bottom: 8px;">Password Reset Request</td>
                      </tr>
                      <tr>
                        <td style="color: #94a3b8; font-size: 13px; line-height: 1.5; padding-bottom: 24px;">Use the verification code below to reset your password. This security code is valid for <strong>10 minutes</strong>.</td>
                      </tr>
                      <tr>
                        <td align="center" style="padding-bottom: 24px;">
                          <div style="background-color: #030712; border: 1px solid rgba(56, 189, 248, 0.3); border-radius: 12px; padding: 16px 28px; display: inline-block;">
                            <span style="font-family: 'Courier New', Courier, monospace; font-size: 32px; font-weight: 800; letter-spacing: 8px; color: #38bdf8;">${generatedOtp}</span>
                          </div>
                        </td>
                      </tr>
                      <tr>
                        <td style="color: #64748b; font-size: 11px; line-height: 1.4; border-t: 1px solid rgba(255, 255, 255, 0.05); padding-top: 20px;">
                          If you didn't initiate this request, you can safely ignore this email. Someone may have typed your address by mistake.
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </body>
            </html>
          `
        });
        console.log(`[EMAIL DISPATCHED] Real OTP email sent to ${email} | ID: ${info.messageId}`);
      } catch (mailError) {
        console.error('❌ [OTP MAIL ERROR]:', mailError.message);
        return res.status(500).json({ success: false, message: `Failed to dispatch OTP email: ${mailError.message}` });
      }
    } else {
      console.warn('⚠️ [SMTP WARNING] EMAIL_USER or EMAIL_PASS missing in .env file!');
    }

    return res.status(200).json({
      success: true,
      message: 'OTP sent successfully to your email inbox.',
      otp: process.env.NODE_ENV === 'development' ? generatedOtp : undefined
    });

  } catch (error) {
    console.error('Error in send-otp:', error);
    return res.status(500).json({ success: false, message: 'Internal server error while generating OTP.' });
  }
});

// 3. Send Welcome Email Route (Premium VIP Onboarding Template)
app.post('/api/mail/welcome', async (req, res) => {
  try {
    const { email, name } = req.body;

    if (!email) {
      return res.status(400).json({ success: false, message: 'Email address is required.' });
    }

    const userName = name || email.split('@')[0];

    // Dispatch Welcome Email via Nodemailer
    if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
      try {
        const info = await transporter.sendMail({
          from: `"ZyrisAI Team" <${process.env.EMAIL_USER}>`,
          to: email,
          subject: '🚀 Welcome to ZyrisAI Early Access',
          text: `Welcome to ZyrisAI, ${userName}! Your account is created and verified. Status: VIP Early Access Granted. Free Brief Credits: 2.`,
          html: `
            <!DOCTYPE html>
            <html>
            <head>
              <meta charset="utf-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
            </head>
            <body style="margin: 0; padding: 0; background-color: #030712; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
              <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="padding: 40px 20px; background-color: #030712;">
                <tr>
                  <td align="center">
                    <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 480px; background-color: #080d1a; border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 20px; padding: 32px; text-align: left;">
                      <tr>
                        <td align="center" style="padding-bottom: 24px;">
                          <div style="display: inline-block; width: 44px; height: 44px; background: linear-gradient(135deg, #06b6d4, #3b82f6); border-radius: 12px; line-height: 44px; color: #ffffff; font-weight: 900; font-size: 22px; text-align: center;">Z</div>
                          <div style="color: #ffffff; font-size: 20px; font-weight: 800; margin-top: 10px; letter-spacing: -0.5px; text-align: center;">Zyris<span style="color: #38bdf8;">AI</span></div>
                        </td>
                      </tr>
                      <tr>
                        <td style="color: #f8fafc; font-size: 20px; font-weight: 800; padding-bottom: 8px;">Welcome aboard, ${userName}! 🚀</td>
                      </tr>
                      <tr>
                        <td style="color: #94a3b8; font-size: 13px; line-height: 1.6; padding-bottom: 20px;">
                          You've locked in priority access to ZyrisAI. You now have sub-100ms market intelligence and execution roadmaps right at your fingertips.
                        </td>
                      </tr>
                      <tr>
                        <td style="padding-bottom: 24px;">
                          <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #030712; border: 1px solid rgba(6, 182, 212, 0.2); border-radius: 14px; padding: 16px;">
                            <tr>
                              <td style="color: #38bdf8; font-size: 12px; font-weight: 700; padding-bottom: 4px;">ACCOUNT STATUS</td>
                            </tr>
                            <tr>
                              <td style="color: #f8fafc; font-size: 14px; font-weight: 600; padding-bottom: 12px;">VIP Early Access Granted</td>
                            </tr>
                            <tr>
                              <td style="color: #38bdf8; font-size: 12px; font-weight: 700; padding-bottom: 4px;">INITIAL BRIEF CREDITS</td>
                            </tr>
                            <tr>
                              <td style="color: #10b981; font-size: 14px; font-weight: 600;">2 Free Briefs Loaded</td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                      <tr>
                        <td align="center" style="padding-bottom: 24px;">
                          <a href="https://zyrisai.com" style="background: linear-gradient(135deg, #2563eb, #06b6d4); color: #ffffff; text-decoration: none; font-size: 13px; font-weight: 700; padding: 12px 28px; border-radius: 10px; display: inline-block;">Open Workspace →</a>
                        </td>
                      </tr>
                      <tr>
                        <td style="color: #64748b; font-size: 11px; line-height: 1.4; border-t: 1px solid rgba(255, 255, 255, 0.05); padding-top: 16px; text-align: center;">
                          Need help or custom integrations? Contact us anytime at support@zyrisai.com
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </body>
            </html>
          `
        });
        console.log(`[WELCOME MAIL DISPATCHED] Sent to ${email} | ID: ${info.messageId}`);
      } catch (mailError) {
        console.error('❌ [WELCOME MAIL ERROR]:', mailError.message);
        return res.status(500).json({ success: false, message: `Failed to dispatch welcome email: ${mailError.message}` });
      }
    } else {
      console.warn('⚠️ [SMTP WARNING] EMAIL_USER or EMAIL_PASS missing in .env file!');
    }

    return res.status(200).json({
      success: true,
      message: 'Welcome email sent successfully.'
    });

  } catch (error) {
    console.error('Error in /api/mail/welcome:', error);
    return res.status(500).json({ success: false, message: 'Internal server error while sending welcome email.' });
  }
});

// 4. Verify OTP Route
app.post('/api/auth/verify-otp', async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ success: false, message: 'Email and OTP are required.' });
    }

    const record = otpStore.get(email.toLowerCase());

    if (!record) {
      return res.status(400).json({ success: false, message: 'No OTP requested for this email or code has expired.' });
    }

    if (Date.now() > record.expiresAt) {
      otpStore.delete(email.toLowerCase());
      return res.status(400).json({ success: false, message: 'OTP has expired. Please request a new code.' });
    }

    if (record.otp !== otp.trim()) {
      return res.status(400).json({ success: false, message: 'Invalid OTP code. Please check and try again.' });
    }

    return res.status(200).json({
      success: true,
      message: 'OTP verified successfully.'
    });

  } catch (error) {
    console.error('Error in verify-otp:', error);
    return res.status(500).json({ success: false, message: 'Server error during OTP verification.' });
  }
});

// 5. Reset Password Route (Executes actual password updates in Firebase Auth)
app.post('/api/auth/reset-password', async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;

    if (!email || !otp || !newPassword) {
      return res.status(400).json({ success: false, message: 'Email, OTP, and new password are required.' });
    }

    const record = otpStore.get(email.toLowerCase());

    if (!record || record.otp !== otp.trim()) {
      return res.status(400).json({ success: false, message: 'Unauthorized password reset attempt. Verify OTP first.' });
    }

    // Execute password update in Firebase Auth via Admin SDK
    try {
      if (getApps().length > 0) {
        const authAdmin = getAuth();
        const userRecord = await authAdmin.getUserByEmail(email.toLowerCase());
        await authAdmin.updateUser(userRecord.uid, {
          password: newPassword
        });
        console.log(`[FIREBASE AUTH] Password updated successfully for UID: ${userRecord.uid}`);
      } else {
        console.warn('⚠️ [FIREBASE ADMIN WARNING] Cannot update password: Admin SDK not initialized.');
      }
    } catch (fbUpdateErr) {
      console.error('❌ [FIREBASE AUTH UPDATE ERROR]:', fbUpdateErr.message);
      return res.status(500).json({ success: false, message: `Firebase password update failed: ${fbUpdateErr.message}` });
    }

    // Clear used OTP from memory after successful update
    otpStore.delete(email.toLowerCase());

    console.log(`[PASSWORD UPDATED] Password reset completed for: ${email}`);

    return res.status(200).json({
      success: true,
      message: 'Password reset successfully. You can now log in with your new password.'
    });

  } catch (error) {
    console.error('Error in reset-password:', error);
    return res.status(500).json({ success: false, message: 'Server error during password update.' });
  }
});

// 6. Catch-all 404 Route
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'API Route Not Found' });
});

// 7. Global Error Handler
app.use((err, req, res, next) => {
  console.error('Global Error Handler caught:', err.message);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error'
  });
});

// Launch Express Server
app.listen(PORT, () => {
  console.log(`🚀 ZyrisAI VPS Server active on http://localhost:${PORT}`);
});