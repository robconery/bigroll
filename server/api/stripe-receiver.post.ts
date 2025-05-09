import "dotenv/config" 
import { Order } from '../models'
import { defineEventHandler, readBody, createError, getHeader } from 'h3'
import Stripe from 'stripe'


// Initialize Stripe with the API key
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  // @ts-ignore - Typescript might have a newer version in its type definitions
  apiVersion: '2022-11-15' // Use the existing compatible API version
})

export default defineEventHandler(async (event) => {
  // Get the raw body and signature
  const body = await readBody(event)
  const signature = getHeader(event, 'stripe-signature')
  const out = {
    statusCode: 400,
    statusMessage: 'Invalid request'
  }
  if (!signature) {
    out.statusMessage = 'Missing stripe-signature header'
    return out;
  }

  let stripeEvent: Stripe.Event | undefined;
  
  try {
    // Verify the event using the webhook secret
    stripeEvent = stripe.webhooks.constructEvent(
      JSON.stringify(body),
      signature,
      process.env.STRIPE_WEBHOOK_SECRET || ''
    )
  } catch (err: any) {
    console.error(`Webhook signature verification failed: ${err.message}`)
    out.statusMessage = `Webhook signature verification failed: ${err.message}`
    return out;
  }

  // Handle the checkout.completed event
  if (stripeEvent && stripeEvent.type === 'checkout.session.completed') {
    try {
      const session = stripeEvent.data.object as Stripe.Checkout.Session
      
      // Ensure we have a valid session with the necessary data
      if (!session.customer_email && !session.customer_details?.email || session.payment_status !== 'paid') {
        out.statusMessage = 'Invalid or unpaid session data'
        return out;
      }
      
      // The updated Order.saveStripeOrder method only needs the session parameter
      await Order.saveStripeOrder(session);
      out.statusCode = 200;
      out.statusMessage = 'Order processed successfully'

    } catch (error: any) {
      console.error('Error processing checkout session:', error)
      out.statusCode = 500
      out.statusMessage = `Failed to process checkout: ${error.message}`
      // Optionally, you can throw an error or return a specific response
    }
    return out;
  }
  
  // Return a successful response for other event types
  return { received: true, type: stripeEvent?.type }
});