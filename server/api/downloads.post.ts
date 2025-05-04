import { defineEventHandler, readBody } from 'h3'
import nodemailer from 'nodemailer'
import { getDownloadsByEmail } from '../lib/admin';
import 'dotenv/config'

export default defineEventHandler(async (event) => {
  try {
    // Parse the request body to get the email
    const { email } = await readBody(event)
    
    if (!email) {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: 'Email is required' })
      }
    }
    try {

      //get the downloads for the user
      await sendEmailWithDownloads(email)
      
      return {
        statusCode: 200,
        body: JSON.stringify({
          success: true,
          message: 'Download links have been sent to your email!'
        })
      }
    } catch (emailError) {
      console.error('Error sending email:', emailError)
      return {
        statusCode: 500,
        body: JSON.stringify({
          success: false,
          message: 'Failed to send email. Please try again later.'
        })
      }
    }
    
  } catch (error) {
    console.error('Error processing download request:', error)
    
    return {
      statusCode: 500,
      body: JSON.stringify({
        success: false,
        message: 'An error occurred while processing your request.'
      })
    }
  }
});

// Function for sending emails using nodemailer
async function sendEmailWithDownloads(email: string) {
  console.log(`Sending download links to ${email}`)
  
  //user firebaseAdmin plugin
  
  // Create a nodemailer transporter
  // Note: In production, you would use actual SMTP credentials or a service like SendGrid
  const transporter = nodemailer.createTransport({
    host: "smtp.mailgun.org",
    port: 465,
    secure: true,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  })
  const downloads = await getDownloadsByEmail(email)
  let downloadLinks = []
  for (let d of downloads) {
    console.log(d)
    //get the download link from storage
    downloadLinks.push(`<li><a href="${d.link}">${d.download}</a></li>`)
  }
  const linkHtml = downloadLinks.join('\n')
  // Email content
  const emailContent = {
    from: '"Big Machine" <rob@bigmachine.io>',
    to: email,
    subject: 'Your Big Machine Downloads',
    html: `
      <h1>Your Big Machine Downloads</h1>
      <p>Hello!</p>
      <p>Thank you for requesting your downloads. Here are the links to your purchased items:</p>
      <ul>
        ${linkHtml}
      </ul>
      <p>If you're looking for access to video content, you can access it by logging into your account at <a href="https://yourdomain.com/login">our website</a>.</p>
      <p>If you have any questions, please don't hesitate to contact us.</p>
      <p>Best regards,<br>The Big Machine Team</p>
    `,
  }
  
  // Send the email
  const info = await transporter.sendMail(emailContent)
  console.log('Email sent:', info.messageId)
  
  return info
}