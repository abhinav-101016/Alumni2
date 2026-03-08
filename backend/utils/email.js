import sgMail from "@sendgrid/mail";
import dotenv from "dotenv";

dotenv.config();

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

export const sendVerificationEmail = async (email, otp) => {
  const msg = {
    to: email,
    from: process.env.EMAIL_USER, // verified sender email
    subject: "Verify your email - IET Lucknow Alumni Portal",
    html: `
      <div style="font-family:Arial;padding:20px">
        <h2>Your Verification Code</h2>
        <h1>${otp}</h1>
        <p>This OTP expires in 10 minutes.</p>
      </div>
    `
  };

  try {
    await sgMail.send(msg);
    console.log("Email sent successfully");
    return true;
  } catch (error) {
    console.error("Email error:", error.response?.body || error);
    return false;
  }
};