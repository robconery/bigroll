import 'dotenv/config'
import nodemailer from 'nodemailer'
import { Authorization } from '../models'


// Create a nodemailer transporter using environment variables
const createTransporter = () => {
  return nodemailer.createTransport({
    host: "smtp.mailgun.org",
    port: 465,
    secure: true,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  })
}

/**
 * Send email with download links to a user
 * @param email Email address of the recipient
 * @returns Information about the sent email
 */
export async function sendEmailWithDownloads(email: string) {
  console.log(`Sending download links to ${email}`)
  
  const transporter = createTransporter()
  const downloads = await Authorization.getByEmail(email)
  
  let downloadLinks = []
  for (let d of downloads) {
    const link = await d.getDownloadUrl();
    downloadLinks.push(`<li><a href="${link}">${d.download}</a></li>`)
  }
  const linkHtml = downloadLinks.join('\n')
  //const linkHtml = "";
  // Email content
  const emailContent = {
    from: '"Big Machine" <rob@bigmachine.io>',
    to: email,
    subject: "Your Big Machine Downloads",
    html: `
      <h1>Here's Your Goodies!</h1>
      <p>Below are the things that you bought from me (thank you!), I hope they're complete. If you have any issues at all, just reply to this email and I'll get you sorted as fast as possible.</p>
      <ul>
        ${linkHtml}
      </ul>
      <p>If you're looking for access to video content, you can access it by logging into your account at <a href="https://bigmachine.io/">my website</a>.</p>
      <p>If you have any questions, please don't hesitate to hit reply. I can usually get back to you within 24 hours..</p>
      <p>Thanks so much,</p>
      <p>Rob</p>
    `
  }
  
  const info = await transporter.sendMail(emailContent)
  console.log("Email sent:", info.messageId)
  return info
}

/**
 * Interface for order data
 */
interface OrderData {
  number: string;
  date: string;
  name?: string;
  email: string;
  offer: string;
  slug: string;
  uid?: string;
  store?: string;
  total?: number;
}

/**
 * Send a thank you email to the customer after purchase
 * @param data Order data
 * @returns Success message
 */
export async function sendThankYouEmail(data: OrderData): Promise<string> {
  try {
    const transporter = createTransporter()
    
    // Build email content
    const emailHtml = `
      <h1>Thank you for your purchase!</h1>
      <p>Dear ${data.name || 'Friend'},</p>
      <p>Thanks for buying <i>${data.offer}</i></p>
      <p>Your order number is: <strong>${data.number}</strong></p>

      <p>If you have any questions, please don't hesitate to contact us.</p>
      <p>Best regards,<br>Big Machine</p>
    `
    
    // Send the email
    await transporter.sendMail({
      from: process.env.EMAIL_FROM || 'support@bigmachine.io',
      to: data.email,
      subject: 'Thank you for your purchase from Big Machine',
      html: emailHtml
    })
    
    console.log(`Thank you email sent to: ${data.email}`)
    return `Email sent to ${data.email}`
  } catch (error) {
    console.error('Error sending thank you email:', error)
    throw error
  }
}