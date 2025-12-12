// Supabase Edge Function for sending emails via Brevo API
// Setup type definitions for built-in Supabase Runtime APIs
import "jsr:@supabase/functions-js/edge-runtime.d.ts"

const BREVO_API_KEY = Deno.env.get('BREVO_API_KEY') || 'xkeysib-a6b4c8d2e1f3a5b7c9d0e2f4a6b8c0d2e4f6a8b0c2d4e6f8a0b2c4d6e8f0a2b4'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { recipientEmail, recipientName, subject, htmlContent } = await req.json()

    if (!recipientEmail || !htmlContent) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: recipientEmail and htmlContent' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Send email via Brevo API
    const brevoResponse = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'api-key': BREVO_API_KEY,
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        sender: {
          name: 'Afterburn Cafe',
          email: 'pavan@afterburn.fit',
        },
        to: [
          {
            email: recipientEmail,
            name: recipientName || 'Cafe Manager',
          },
        ],
        subject: subject || `☕ Daily Report - ${new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`,
        htmlContent: htmlContent,
      }),
    })

    if (!brevoResponse.ok) {
      const error = await brevoResponse.json()
      console.error('Brevo API error:', error)
      throw new Error(JSON.stringify(error) || 'Failed to send email via Brevo')
    }

    const result = await brevoResponse.json()

    return new Response(
      JSON.stringify({
        success: true,
        messageId: result.messageId,
        message: 'Email sent successfully',
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error: any) {
    console.error('Error sending email:', error)
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || 'Unknown error',
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})

/* To invoke locally:

  1. Set environment variable:
     export BREVO_API_KEY=your_api_key_here

  2. Run function locally:
     supabase functions serve send-email

  3. Test with curl:
     curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/send-email' \
       --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0' \
       --header 'Content-Type: application/json' \
       --data '{
         "recipientEmail": "pavankumar.nagaraj@gmail.com",
         "recipientName": "Pavan Kumar",
         "subject": "Test Email",
         "htmlContent": "<h1>Test Email from Supabase</h1>"
       }'

*/
