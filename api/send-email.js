// API endpoint for sending emails via Brevo SMTP
// This can be deployed as a serverless function or run as Express endpoint

const nodemailer = require('nodemailer');

// Configure SMTP
const transporter = nodemailer.createTransport({
  host: 'smtp-relay.brevo.com',
  port: 587,
  secure: false,
  auth: {
    user: '9de95e001@smtp-brevo.com',
    pass: 'yTcSL0hbzBF1Prqk'
  }
});

// Handler function
const handler = async (req, res) => {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    const { recipientEmail, recipientName, subject, htmlContent } = req.body;

    if (!recipientEmail || !htmlContent) {
      res.status(400).json({ error: 'Missing required fields' });
      return;
    }

    const mailOptions = {
      from: '"Afterburn Cafe" <pavan@afterburn.fit>',
      to: recipientEmail,
      subject: subject || `☕ Daily Report - ${new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`,
      html: htmlContent
    };

    const info = await transporter.sendMail(mailOptions);

    res.status(200).json({
      success: true,
      messageId: info.messageId,
      message: 'Email sent successfully'
    });
  } catch (error) {
    console.error('Error sending email:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// For serverless deployment (Vercel, Netlify, etc.)
module.exports = handler;

// For local Express server
if (require.main === module) {
  const express = require('express');
  const bodyParser = require('body-parser');
  const app = express();
  
  app.use(bodyParser.json({ limit: '10mb' }));
  app.post('/api/send-email', handler);
  
  const PORT = process.env.PORT || 3001;
  app.listen(PORT, () => {
    console.log(`Email API running on http://localhost:${PORT}`);
  });
}
