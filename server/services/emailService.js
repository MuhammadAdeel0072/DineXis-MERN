const nodemailer = require('nodemailer');

// Create transporter with robust settings
const createTransporter = () => {
  return nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465, // Use SSL
    secure: true, // Use SSL
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS, // App Password
    },
    tls: {
      rejectUnauthorized: false // Helps with some hosting environments
    }
  });
};

const sendOTPEmail = async (email, otp) => {
  const transporter = createTransporter();

  try {
    // 1. Verify connection first
    await transporter.verify();
    console.log('✅ SMTP Connection verified');

    const mailOptions = {
      from: `"DineXis" <${process.env.EMAIL_FROM || process.env.EMAIL_USER}>`,
      to: email,
      subject: '🔑 Your DineXis Verification Code',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;700&family=Playfair+Display:wght@900&display=swap');
          </style>
        </head>
        <body style="margin: 0; padding: 0; background-color: #0a0a0a; font-family: 'Outfit', sans-serif;">
          <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #0a0a0a; padding: 40px 20px;">
            <tr>
              <td align="center">
                <!-- Main Container -->
                <table width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 600px; background-color: #121212; border: 1px solid #d4af3733; border-radius: 32px; overflow: hidden; box-shadow: 0 20px 50px rgba(0,0,0,0.5);">
                  
                  <!-- Header -->
                  <tr>
                    <td align="center" style="padding: 50px 40px 30px;">
                      <h1 style="margin: 0; font-family: 'Playfair Display', serif; font-size: 42px; font-weight: 900; color: #d4af37; letter-spacing: 4px; text-transform: uppercase;">DINEXIS</h1>
                      <div style="width: 40px; hieght: 2px; border-bottom: 2px solid #d4af37; margin: 15px 0;"></div>
                      <p style="margin: 0; font-size: 10px; font-weight: 700; color: #888; text-transform: uppercase; letter-spacing: 6px;">Midnight Gourmet Experience</p>
                    </td>
                  </tr>

                  <!-- Content -->
                  <tr>
                    <td align="center" style="padding: 0 50px 40px;">
                      <p style="font-size: 18px; color: #ffffff; line-height: 1.6; margin-bottom: 30px; font-weight: 300;">
                        Welcome to the next level of dining. Use the verification code below to access your account.
                      </p>
                      
                      <!-- OTP Box -->
                      <div style="background-color: #1a1a1a; padding: 40px; border-radius: 24px; border: 1px solid #d4af3722;">
                        <span style="display: block; font-size: 10px; font-weight: 700; color: #d4af37; text-transform: uppercase; letter-spacing: 3px; margin-bottom: 15px;">Your Secure Code</span>
                        <h2 style="margin: 0; font-size: 56px; font-weight: 700; color: #d4af37; letter-spacing: 12px; font-family: 'Outfit', sans-serif;">${otp}</h2>
                      </div>

                      <p style="font-size: 12px; color: #555; margin-top: 30px; font-weight: 400; letter-spacing: 1px;">
                        Valid for <span style="color: #d4af37;">5 minutes</span> • Single use only
                      </p>
                    </td>
                  </tr>

                  <!-- Footer -->
                  <tr>
                    <td align="center" style="padding: 30px 50px; background-color: #0f0f0f; border-top: 1px solid #ffffff0a;">
                      <p style="font-size: 11px; color: #444; line-height: 1.8; margin: 0;">
                        If you did not request this verification, please secure your account immediately.
                      </p>
                      <p style="font-size: 9px; color: #333; margin-top: 20px; font-weight: 700; text-transform: uppercase; letter-spacing: 2px;">
                        &copy; 2026 DINEXIS SMART SYSTEMS • ALL RIGHTS RESERVED
                      </p>
                    </td>
                  </tr>

                </table>
              </td>
            </tr>
          </table>
        </body>
        </html>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`📧 Email sent: ${info.messageId}`);
    return true;
  } catch (error) {
    console.error('❌ Nodemailer Error Log:');
    console.error(`- Error Code: ${error.code}`);
    console.error(`- Error Message: ${error.message}`);
    if (error.command) console.error(`- Command: ${error.command}`);
    
    // Fallback log for development
    console.log('\n' + '='.repeat(40));
    console.log('🔑 [SECURITY PROTOCOL: OTP FALLBACK]');
    console.log(`TARGET: ${email}`);
    console.log(`CODE  : ${otp}`);
    console.log('='.repeat(40) + '\n');
    return false;
  }
};

module.exports = { sendOTPEmail };
