// server/src/utils/email.js
const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

const sendEmail = async ({ to, subject, html }) => {
  try {
    const info = await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to,
      subject,
      html,
    });
    console.log("📧 Email sent:", info.messageId);
    return info;
  } catch (error) {
    console.error("❌ Email error:", error.message);
    throw error;
  }
};

const emailTemplates = {
  bookingConfirmation: (booking) => `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #1a1a1a; color: #f5f5f5; padding: 40px; border-radius: 12px;">
      <div style="text-align: center; margin-bottom: 30px;">
        <h1 style="color: #D4AF37; font-size: 28px; margin: 0;">🏨 HamroStay</h1>
        <p style="color: #aaa; margin: 5px 0;">Luxury Hotel</p>
      </div>
      <h2 style="color: #D4AF37;">Booking Confirmed! ✅</h2>
      <p>Dear <strong>${booking.guestName}</strong>,</p>
      <p>Your reservation has been confirmed. Here are your booking details:</p>
      <div style="background: #2a2a2a; border-radius: 8px; padding: 20px; margin: 20px 0; border-left: 4px solid #D4AF37;">
        <p><strong>Booking Ref:</strong> ${booking.bookingRef}</p>
        <p><strong>Room:</strong> ${booking.roomName}</p>
        <p><strong>Check-in:</strong> ${booking.checkIn}</p>
        <p><strong>Check-out:</strong> ${booking.checkOut}</p>
        <p><strong>Guests:</strong> ${booking.guests}</p>
        <p><strong>Total Amount:</strong> रू${booking.finalAmount}</p>
      </div>
      <p style="color: #aaa; font-size: 13px;">Check-in time: 2:00 PM | Check-out time: 12:00 PM</p>
      <p>We look forward to welcoming you!</p>
      <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #333;">
        <p style="color: #888; font-size: 12px;">HamroStay Luxury Hotel | Nepal</p>
      </div>
    </div>
  `,

  bookingCancellation: (booking) => `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #1a1a1a; color: #f5f5f5; padding: 40px; border-radius: 12px;">
      <div style="text-align: center; margin-bottom: 30px;">
        <h1 style="color: #D4AF37; font-size: 28px; margin: 0;">🏨 HamroStay</h1>
      </div>
      <h2 style="color: #e74c3c;">Booking Cancelled</h2>
      <p>Dear <strong>${booking.guestName}</strong>,</p>
      <p>Your booking <strong>${booking.bookingRef}</strong> has been cancelled.</p>
      <p>If you paid, a refund will be processed within 5-7 business days.</p>
      <p>We hope to welcome you again soon!</p>
    </div>
  `,

  welcomeEmail: (user) => `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #1a1a1a; color: #f5f5f5; padding: 40px; border-radius: 12px;">
      <div style="text-align: center; margin-bottom: 30px;">
        <h1 style="color: #D4AF37; font-size: 28px; margin: 0;">🏨 HamroStay</h1>
        <p style="color: #aaa;">Welcome to Luxury</p>
      </div>
      <h2>Welcome, ${user.name}! 🎉</h2>
      <p>Thank you for joining HamroStay. Your account has been created successfully.</p>
      <p>Start exploring our luxury rooms and book your perfect stay today.</p>
      <div style="text-align: center; margin: 30px 0;">
        <a href="${process.env.CLIENT_URL}/rooms" style="background: #D4AF37; color: #000; padding: 12px 30px; border-radius: 6px; text-decoration: none; font-weight: bold;">Explore Rooms</a>
      </div>
    </div>
  `,
};

module.exports = { sendEmail, emailTemplates };
