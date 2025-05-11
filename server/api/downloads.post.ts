import { defineEventHandler, readBody } from 'h3'
import { sendEmailWithDownloads } from '../lib/email'

export default defineEventHandler(async (event) => {
  let out = {
    statusCode: 400,
    body: {
      success: false,
      message: 'Nothing done'
    }
  }
  try {

    const { email } = await readBody(event)
    //console.log('Sending downloads to:', email)
    if (!email) {
      out.body.message = 'Email is required'
      //return a 500 error
      out.statusCode = 500
    } else {
          // Use the centralized email module
      await sendEmailWithDownloads(email)
      out.body.message = 'Download links have been sent to your email!'
      out.statusCode = 200
    }


    
  } catch (error) {
    console.error('Error processing download request:', error)
    out.body.message = 'An error occurred while processing your request.'
    out.statusCode = 500

  }
  return JSON.stringify(out)
});