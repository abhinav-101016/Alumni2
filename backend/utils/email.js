import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config();

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: 587,
  secure: false, // TLS
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});
export const sendVerificationEmail = async (email, otp) => {
  const mailOptions = {
    from: `"Alumni Portal" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: 'Verify your email - IET Lucknow Alumni Portal',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #333;">Your Verification Code</h2>
        <div style="
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white; padding: 20px; text-align: center; font-size: 28px;
          font-weight: bold; letter-spacing: 8px; margin: 30px 0;
          border-radius: 10px; box-shadow: 0 4px 15px rgba(0,0,0,0.1);
        ">
          ${otp}
        </div>
        <p>This code expires in <strong>10 minutes</strong>.</p>
        <p style="color: #666;">If you didn't request this, please ignore this email.</p>
        <hr style="margin: 30px 0;">
        <p style="color: #888; font-size: 12px;">IET Lucknow Alumni Portal</p>
      </div>
    `
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent successfully:', info.messageId);
    return info;
  } catch (error) {
    return false;
  }
};
