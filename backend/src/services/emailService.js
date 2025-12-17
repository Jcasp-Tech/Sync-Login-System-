const nodemailer = require('nodemailer');

/**
 * Create a nodemailer transporter based on environment configuration
 * Supports SMTP (Gmail, custom SMTP) configuration
 */
const createTransporter = () => {
  // Get email configuration from environment variables
  const emailConfig = {
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  };

  // Validate required configuration
  if (!emailConfig.auth.user || !emailConfig.auth.pass) {
    throw new Error('SMTP_USER and SMTP_PASS environment variables are required');
  }

  return nodemailer.createTransport({
    host: emailConfig.host,
    port: emailConfig.port,
    secure: emailConfig.secure,
    auth: emailConfig.auth,
    tls: {
      rejectUnauthorized: false // Allow self-signed certificates (for development)
    }
  });
};

/**
 * Generate email verification HTML template
 * @param {String} verificationLink - The verification link URL
 * @param {String} userName - Name of the user/client
 * @returns {String} HTML email template
 */
const generateVerificationEmailTemplate = (verificationLink, userName = 'User') => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Email Verification</title>
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background-color: #f4f4f4; padding: 20px; border-radius: 5px;">
        <h2 style="color: #333; margin-top: 0;">Email Verification Required</h2>
        <p>Hello ${userName},</p>
        <p>Thank you for registering with us. Please verify your email address by clicking the button below:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${verificationLink}" 
             style="background-color: #007bff; color: #ffffff; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">
            Verify Email Address
          </a>
        </div>
        <p>Or copy and paste this link into your browser:</p>
        <p style="word-break: break-all; color: #007bff;">${verificationLink}</p>
        <p style="margin-top: 30px; font-size: 12px; color: #666;">
          This verification link will expire in 24 hours. If you didn't create an account, please ignore this email.
        </p>
        <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
        <p style="font-size: 12px; color: #666; margin: 0;">
          This is an automated message, please do not reply to this email.
        </p>
      </div>
    </body>
    </html>
  `;
};

/**
 * Send email verification email
 * @param {String} to - Recipient email address
 * @param {String} verificationLink - The verification link URL
 * @param {String} userName - Name of the user/client (optional)
 * @returns {Promise<Object>} Email sending result
 */
const sendVerificationEmail = async (to, verificationLink, userName = 'User') => {
  try {
    const transporter = createTransporter();
    
    const fromEmail = process.env.SMTP_FROM_EMAIL || process.env.SMTP_USER;
    const appName = process.env.APP_NAME || 'Authentication Service';

    const mailOptions = {
      from: `"${appName}" <${fromEmail}>`,
      to: to,
      subject: 'Verify Your Email Address',
      html: generateVerificationEmailTemplate(verificationLink, userName),
      text: `Hello ${userName},\n\nPlease verify your email address by clicking this link: ${verificationLink}\n\nThis link will expire in 24 hours.\n\nIf you didn't create an account, please ignore this email.`
    };

    const info = await transporter.sendMail(mailOptions);
    
    return {
      success: true,
      messageId: info.messageId,
      message: 'Verification email sent successfully'
    };
  } catch (error) {
    console.error('Error sending verification email:', error);
    throw new Error(`Failed to send verification email: ${error.message}`);
  }
};

/**
 * Send generic email (for future use)
 * @param {String} to - Recipient email address
 * @param {String} subject - Email subject
 * @param {String} html - HTML email content
 * @param {String} text - Plain text email content (optional)
 * @returns {Promise<Object>} Email sending result
 */
const sendEmail = async (to, subject, html, text = null) => {
  try {
    const transporter = createTransporter();
    
    const fromEmail = process.env.SMTP_FROM_EMAIL || process.env.SMTP_USER;
    const appName = process.env.APP_NAME || 'Authentication Service';

    const mailOptions = {
      from: `"${appName}" <${fromEmail}>`,
      to: to,
      subject: subject,
      html: html,
      text: text || html.replace(/<[^>]*>/g, '') // Strip HTML tags for text version
    };

    const info = await transporter.sendMail(mailOptions);
    
    return {
      success: true,
      messageId: info.messageId,
      message: 'Email sent successfully'
    };
  } catch (error) {
    console.error('Error sending email:', error);
    throw new Error(`Failed to send email: ${error.message}`);
  }
};

module.exports = {
  sendVerificationEmail,
  sendEmail,
  createTransporter
};
