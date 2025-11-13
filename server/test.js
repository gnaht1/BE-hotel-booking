import transporter from './configs/nodemailer.js';
import dotenv from 'dotenv';
dotenv.config();

async function sendTest() {
  try {
    const info = await transporter.sendMail({
      from: process.env.SENDER_EMAIL,
      to: 'nguyenanhduy2004@gmail.com',
      subject: '🔔 Test Brevo Email',
      text: 'Hello! This is a test email from Nodemailer + Brevo ✅',
    });
    console.log('✅ Email sent successfully:', info.response);
  } catch (error) {
    console.error('❌ Email send error:', error);
  }
}

sendTest();
