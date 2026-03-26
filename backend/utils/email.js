import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

const transporter = nodemailer.createTransport({
  host: "smtp-relay.brevo.com",
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export const sendVerificationEmail = async (email, otp) => {
  const msg = {
    from: `"IET Lucknow Alumni" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "Verify your email - IET Lucknow Alumni Portal",
    html: `
      <div style="font-family:Arial;padding:20px">
        <h2>Your Verification Code</h2>
        <h1>${otp}</h1>
        <p>This OTP expires in 10 minutes.</p>
      </div>
    `,
  };

  try {
    await transporter.sendMail(msg);
    return true;
  } catch (error) {
    return false;
  }
};