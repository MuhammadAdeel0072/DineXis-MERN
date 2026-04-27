const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const nodemailer = require('nodemailer');

const testEmail = async () => {
  console.log('🧪 Starting Email Diagnostic...');
  console.log('------------------------------');
  console.log(`Email User: ${process.env.EMAIL_USER}`);
  console.log(`Email Service: ${process.env.EMAIL_SERVICE}`);
  
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.error('❌ ERROR: Missing EMAIL_USER or EMAIL_PASS in .env file.');
    return;
  }

  const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
    tls: {
      rejectUnauthorized: false
    }
  });

  try {
    console.log('🔄 Attempting to verify SMTP connection...');
    await transporter.verify();
    console.log('✅ SMTP Connection Verified Successfully!');

    console.log('🔄 Attempting to send test email...');
    const info = await transporter.sendMail({
      from: `"DineXis Test" <${process.env.EMAIL_USER}>`,
      to: process.env.EMAIL_USER,
      subject: 'DineXis SMTP Diagnostic',
      text: 'If you see this, your SMTP settings are working perfectly!',
      html: '<h1>SMTP Connection Test</h1><p>Your DineXis email system is ready for production.</p>'
    });
    
    console.log(`✅ Test Email Sent! Message ID: ${info.messageId}`);
    console.log('------------------------------');
    console.log('RESULT: SUCCESS');
  } catch (error) {
    console.error('❌ DIAGNOSTIC FAILED');
    console.error(`Error Code: ${error.code}`);
    console.error(`Error Message: ${error.message}`);
    
    if (error.code === 'EAUTH') {
      console.error('\n💡 TIP: Authentication failed. This usually means:');
      console.error('1. Your EMAIL_PASS is not an "App Password".');
      console.error('2. 2-Step Verification is not enabled on your Gmail account.');
    } else if (error.code === 'ESOCKET') {
      console.error('\n💡 TIP: Connection timed out. This usually means:');
      console.error('1. Your internet or firewall is blocking Port 465.');
      console.error('2. Try switching to Port 587 and secure: false in emailService.js.');
    }
    
    console.log('------------------------------');
    console.log('RESULT: FAILURE');
  }
};

testEmail();
