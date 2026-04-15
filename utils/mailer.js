const nodemailer = require('nodemailer');

// Set up a test account using Ethereal Email which intercepts emails
// and provides a preview URL in the console. Or use actual SMTP credentials if provided in .env.
let transporter;

async function initTransporter() {
  if (transporter) return transporter;

  // Use real SMTP if configured in .env
  if (process.env.SMTP_USER && process.env.SMTP_PASS) {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: process.env.SMTP_PORT || 587,
      secure: process.env.SMTP_PORT === '465',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
    return transporter;
  }

  // Fallback to test account
  const testAccount = await nodemailer.createTestAccount();
  transporter = nodemailer.createTransport({
    host: 'smtp.ethereal.email',
    port: 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: testAccount.user, // generated ethereal user
      pass: testAccount.pass, // generated ethereal password
    },
  });
  return transporter;
}

async function sendBookingConfirmation(booking, eventTypeInfo) {
  try {
    const t = await initTransporter();
    const info = await t.sendMail({
      from: '"Calendly Clone" <no-reply@calendly-clone.local>',
      to: booking.inviteeEmail,
      subject: `Confirmed: ${eventTypeInfo.name} with ${eventTypeInfo.user.name}`,
      text: `Hi ${booking.inviteeName},\n\nYour meeting "${eventTypeInfo.name}" with ${eventTypeInfo.user.name} is confirmed.\n\nStart Time: ${new Date(booking.startTime).toLocaleString()}\nEnd Time: ${new Date(booking.endTime).toLocaleString()}\n\nThank you!`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: auto;">
          <h2>Confirmed: ${eventTypeInfo.name}</h2>
          <p>Hi ${booking.inviteeName},</p>
          <p>Your meeting with <strong>${eventTypeInfo.user.name}</strong> is confirmed.</p>
          <div style="background: #f4f5f6; padding: 16px; border-radius: 8px;">
            <p><strong>When:</strong> ${new Date(booking.startTime).toLocaleString()} - ${new Date(booking.endTime).toLocaleString()}</p>
          </div>
          <p>Thank you!</p>
        </div>
      `,
    });
    console.log("Booking Confirmed Preview URL: %s", nodemailer.getTestMessageUrl(info));
  } catch (error) {
    console.error('Failed to send confirmation email', error);
  }
}

async function sendCancellationNotification(booking, eventTypeInfo) {
  try {
    const t = await initTransporter();
    const info = await t.sendMail({
      from: '"Calendly Clone" <no-reply@calendly-clone.local>',
      to: booking.inviteeEmail,
      subject: `Canceled: ${eventTypeInfo.name} with ${eventTypeInfo.user.name}`,
      text: `Hi ${booking.inviteeName},\n\nYour meeting "${eventTypeInfo.name}" with ${eventTypeInfo.user.name} has been canceled.\n\nStart Time: ${new Date(booking.startTime).toLocaleString()}\n\nSorry for any inconvenience!`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: auto;">
          <h2>Canceled: ${eventTypeInfo.name}</h2>
          <p>Hi ${booking.inviteeName},</p>
          <p>Your meeting with <strong>${eventTypeInfo.user.name}</strong> has been canceled.</p>
          <div style="background: #fee2e2; padding: 16px; border-radius: 8px;">
            <p><strong>When:</strong> ${new Date(booking.startTime).toLocaleString()}</p>
          </div>
          <p>Sorry for any inconvenience.</p>
        </div>
      `,
    });
    console.log("Booking Canceled Preview URL: %s", nodemailer.getTestMessageUrl(info));
  } catch (error) {
    console.error('Failed to send cancellation email', error);
  }
}

module.exports = {
  sendBookingConfirmation,
  sendCancellationNotification
};
