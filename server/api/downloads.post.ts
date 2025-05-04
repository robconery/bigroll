import { defineEventHandler, readBody } from 'h3'
import { sendEmailWithDownloads } from '../lib/email'

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
      // Use the centralized email module
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