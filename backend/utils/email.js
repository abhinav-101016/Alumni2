import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config();

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  tls: {
    rejectUnauthorized: false,
  },
});

/* =====================================================
   COMMON SEND FUNCTION (Reusable)
===================================================== */
const sendMail = async ({ to, subject, html }) => {
  try {
    const info = await transporter.sendMail({
      from: `"Alumni Portal" <${process.env.EMAIL_SENDER || process.env.EMAIL_USER}>`,
      to,
      subject,
      html,
    });

    console.log("✅ Email sent:", info.messageId);
    return info;
  } catch (error) {
    console.error("❌ Email failed:", error.message);
    throw error;
  }
};

/* =====================================================
   1. OTP EMAIL
===================================================== */
export const sendVerificationEmail = async (email, otp) => {
  return sendMail({
    to: email,
    subject: "Verify your email - IET Lucknow Alumni Portal",
    html: `
      <div style="font-family: Arial; max-width: 600px; margin:auto; padding:20px;">
        <h2>Your Verification Code</h2>
        <div style="
          background: linear-gradient(135deg, #667eea, #764ba2);
          color:white; padding:20px; text-align:center;
          font-size:28px; font-weight:bold; letter-spacing:8px;
          margin:30px 0; border-radius:10px;
        ">
          ${otp}
        </div>
        <p>This code expires in <strong>10 minutes</strong>.</p>
        <p>If you didn’t request this, ignore this email.</p>
      </div>
    `,
  });
};

/* =====================================================
   2. ACCOUNT VERIFIED EMAIL
===================================================== */
export const sendAccountApprovedEmail = async (email, name) => {
  return sendMail({
    to: email,
    subject: "🎉 Account Approved - Alumni Portal",
    html: `
      <h2>Hi ${name},</h2>
      <p>Your account has been <b style="color:green;">approved</b> by admin.</p>
      <p>You can now login and explore the platform 🚀</p>
      <p>Welcome to the Alumni Network!</p>
    `,
  });
};

/* =====================================================
   3. ACCOUNT REJECTED EMAIL
===================================================== */
export const sendAccountRejectedEmail = async (email, name) => {
  return sendMail({
    to: email,
    subject: "❌ Account Rejected",
    html: `
      <h2>Hi ${name},</h2>
      <p>Your account request has been <b style="color:red;">rejected</b>.</p>
      <p>If you believe this is a mistake, please contact support.</p>
    `,
  });
};

/* =====================================================
   4. ACCOUNT SUSPENDED EMAIL
===================================================== */
export const sendAccountSuspendedEmail = async (email, name) => {
  return sendMail({
    to: email,
    subject: "⚠️ Account Suspended",
    html: `
      <h2>Hi ${name},</h2>
      <p>Your account has been <b style="color:orange;">suspended</b>.</p>
      <p>Please contact admin for more details.</p>
    `,
  });
};