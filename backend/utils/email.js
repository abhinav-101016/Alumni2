import { Resend } from 'resend';
import dotenv from 'dotenv';
dotenv.config();

// Initialize Resend with your API Key
const resend = new Resend(process.env.RESEND_API_KEY);

export const sendVerificationEmail = async (email, otp) => {
  try {
    const { data, error } = await resend.emails.send({
      // IMPORTANT: Until you verify your domain, you MUST use 'onboarding@resend.dev'
      from: 'Alumni Portal <onboarding@resend.dev>',
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
      `,
    });

    if (error) {
      console.error("Resend Error Details:", error);
      return false;
    }

    console.log('Email sent successfully via Resend. ID:', data.id);
    return data; // Returns the full response object
  } catch (error) {
    console.error("System Error during email dispatch:", error);
    return false;
  }
};