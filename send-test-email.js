// Test Brevo SMTP Email Script
// Run with: node send-test-email.js

const https = require('https');

const emailData = JSON.stringify({
  sender: {
    name: 'Cafe Management System',
    email: '9de95e001@smtp-brevo.com',
  },
  to: [
    {
      email: 'pavankuar.nagaraj@gmail.com',
      name: 'Pavankumar Nagaraj',
    },
  ],
  subject: '✅ Test Email - Brevo SMTP Configuration Verification',
  htmlContent: `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 10px; text-align: center; }
        .content { background: #f9fafb; padding: 30px; margin: 20px 0; border-radius: 10px; border-left: 4px solid #667eea; }
        .success-badge { background: #d1fae5; color: #065f46; padding: 15px; border-radius: 8px; border: 2px solid #10b981; margin: 20px 0; text-align: center; font-weight: bold; font-size: 18px; }
        .info-box { background: #e0e7ff; border-left: 4px solid #6366f1; padding: 15px; border-radius: 8px; margin: 15px 0; }
        .footer { text-align: center; color: #6b7280; margin-top: 30px; padding-top: 20px; border-top: 2px solid #e5e7eb; font-size: 12px; }
        ul { list-style: none; padding: 0; }
        li { padding: 8px 0; }
        li:before { content: "✅ "; color: #10b981; font-weight: bold; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🎉 Brevo SMTP Test Email</h1>
          <p style="font-size: 16px; margin: 10px 0 0 0;">Configuration Verification</p>
        </div>

        <div class="success-badge">
          ✅ EMAIL DELIVERED SUCCESSFULLY!
        </div>

        <div class="content">
          <h2 style="color: #667eea; margin-top: 0;">📧 SMTP Configuration Status</h2>
          <p>If you're reading this email, your Brevo SMTP configuration is working perfectly!</p>
          
          <div class="info-box">
            <strong>📋 Configuration Details:</strong><br><br>
            <strong>Server:</strong> smtp-relay.brevo.com<br>
            <strong>Port:</strong> 587<br>
            <strong>Login:</strong> 9de95e001@smtp-brevo.com<br>
            <strong>Method:</strong> Brevo API v3<br>
            <strong>Status:</strong> <span style="color: #10b981; font-weight: bold;">✅ VERIFIED</span>
          </div>

          <h3 style="color: #667eea;">🎯 What This Means:</h3>
          <ul>
            <li>Your Brevo SMTP credentials are correct</li>
            <li>Email sending is fully functional</li>
            <li>Daily reports will be delivered successfully</li>
            <li>You can now receive automated cafe reports</li>
          </ul>

          <h3 style="color: #667eea;">📊 Daily Report Features:</h3>
          <ul>
            <li>Orders summary with revenue breakdown</li>
            <li>Inventory status and low stock alerts</li>
            <li>Items to purchase urgently</li>
            <li>Pending credit orders and customer dues</li>
            <li>Expenses summary and net cash flow</li>
            <li>Actionable insights and recommendations</li>
          </ul>

          <div style="background: #fffbeb; border-left: 4px solid #f59e0b; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <strong>💡 Next Steps:</strong><br>
            1. Go to Reports tab in your Cafe Management System<br>
            2. Enter your email in the Daily Email Reports section<br>
            3. Enable "Send daily report automatically"<br>
            4. Save settings<br>
            5. Receive comprehensive reports every day at 11:55 PM!
          </div>
        </div>

        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 10px; text-align: center;">
          <h3 style="margin: 0 0 10px 0;">🚀 Your Cafe Management System is Ready!</h3>
          <p style="margin: 0; font-size: 14px;">All systems operational. Email reports configured and working.</p>
        </div>

        <div class="footer">
          <p><strong>Cafe Management System</strong></p>
          <p>Test email sent at ${new Date().toLocaleString()}</p>
          <p style="color: #9ca3af;">This is an automated test email from your Cafe Management System</p>
        </div>
      </div>
    </body>
    </html>
  `,
});

const options = {
  hostname: 'api.brevo.com',
  port: 443,
  path: '/v3/smtp/email',
  method: 'POST',
  headers: {
    'accept': 'application/json',
    'api-key': 'yTcSL0hbzBF1Prqk',
    'content-type': 'application/json',
    'Content-Length': emailData.length,
  },
};

console.log('📧 Sending test email to pavankuar.nagaraj@gmail.com...\n');

const req = https.request(options, (res) => {
  let data = '';

  res.on('data', (chunk) => {
    data += chunk;
  });

  res.on('end', () => {
    if (res.statusCode === 201) {
      const response = JSON.parse(data);
      console.log('✅ SUCCESS! Test email sent successfully!\n');
      console.log('📬 Details:');
      console.log('   Message ID:', response.messageId);
      console.log('   To:', 'pavankuar.nagaraj@gmail.com');
      console.log('   Subject: ✅ Test Email - Brevo SMTP Configuration Verification\n');
      console.log('📥 Check your inbox! (may take a few seconds to arrive)');
      console.log('   Don\'t forget to check spam folder if not in inbox.\n');
    } else {
      console.error('❌ ERROR: Failed to send email');
      console.error('   Status Code:', res.statusCode);
      console.error('   Response:', data);
    }
  });
});

req.on('error', (error) => {
  console.error('❌ ERROR:', error.message);
  console.error('\nPossible reasons:');
  console.error('   • Network connection issue');
  console.error('   • Invalid API key');
  console.error('   • Brevo service temporarily unavailable\n');
});

req.write(emailData);
req.end();
