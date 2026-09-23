const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false,
  auth: process.env.SMTP_USER ? {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  } : undefined,
  tls: {
    rejectUnauthorized: false
  }
});

exports.sendOtpEmail = async (toEmail, otpCode, subjectPrefix = 'EvoTivity Identity Verification') => {
  console.log(`📩 [EMAIL SERVICE] Dispatching OTP ${otpCode} to ${toEmail}`);
  try {
    if (process.env.SMTP_USER && process.env.SMTP_PASS) {
      await transporter.sendMail({
        from: `"EvoTivity Security" <${process.env.SMTP_USER}>`,
        to: toEmail,
        subject: `${subjectPrefix}: ${otpCode}`,
        html: `
          <div style="font-family: Arial, sans-serif; padding: 24px; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px; max-width: 500px; margin: 0 auto;">
            <h2 style="color: #4f46e5; margin-bottom: 12px;">EvoTivity Security Code</h2>
            <p style="color: #475569; font-size: 15px;">Use the 6-digit one-time passcode below to verify your voter identity:</p>
            <div style="font-size: 32px; font-weight: 800; letter-spacing: 6px; color: #0f172a; padding: 16px; background: #f8fafc; border: 1px dashed #cbd5e1; text-align: center; border-radius: 6px; margin: 20px 0;">
              ${otpCode}
            </div>
            <p style="color: #64748b; font-size: 13px;">This code will expire in 10 minutes. If you did not request this, please ignore this email.</p>
          </div>
        `
      });
      console.log(`✅ [EMAIL DELIVERED] Successfully sent email to ${toEmail}`);
    } else {
      console.log(`💡 [DEV MODE] SMTP Credentials not configured in .env. Code ${otpCode} generated and saved to DB.`);
    }
  } catch (err) {
    console.warn(`⚠️ [EMAIL WARNING] SMTP delivery notice: ${err.message}`);
  }
};
