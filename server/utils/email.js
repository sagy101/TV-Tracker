const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
  // 1. Create a transporter
  // Using Mailtrap for testing, replace with your actual email provider in production
  // Ensure EMAIL_HOST, EMAIL_PORT, EMAIL_USER, EMAIL_PASS are in your .env file
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST || 'sandbox.smtp.mailtrap.io', // Default to mailtrap sandbox
    port: process.env.EMAIL_PORT || 2525, // Default mailtrap port
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
    // Note: For services like Gmail, you might need to enable "less secure app access" or use OAuth2
  });

  // 2. Define the email options
  const mailOptions = {
    from: 'TrackTV Admin <noreply@tracktv.example.com>', // Sender address
    to: options.email, // List of receivers
    subject: options.subject, // Subject line
    text: options.message, // Plain text body
    // html: options.html // HTML body (optional)
  };

  // 3. Actually send the email
  try {
    await transporter.sendMail(mailOptions);
    console.log(`Email sent successfully to ${options.email}`);
  } catch (error) {
    console.error('Error sending email:', error);
    // Rethrow the error or handle it as needed
    // Depending on the use case, you might not want to block the entire request if email fails
    throw new Error('There was an error sending the email. Try again later.');
  }
};

module.exports = sendEmail; 