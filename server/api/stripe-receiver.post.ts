import "dotenv/config" 
import { Order } from '../models'
import { defineEventHandler, readBody, createError, getHeader, readRawBody } from 'h3'
import Stripe from 'stripe'
import { getCheckoutSession } from "../lib/stripe"
import assert from "assert"
import { sign } from "crypto"

// Initialize Stripe with the API key
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  // @ts-ignore - Typescript might have a newer version in its type definitions
  apiVersion: '2022-11-15' // Use the existing compatible API version
})

export default defineEventHandler(async (event) => {
  // Get the raw body and signature
  const body = await readRawBody(event)
  const signature = getHeader(event, 'stripe-signature')
  const out = {
    statusMessage: 'Invalid request'
  }

  assert(process.env.STRIPE_WEBHOOK_SECRET, 'Missing STRIPE_WEBHOOK_SECRET in environment variables')
  assert(signature, 'Missing stripe-signature header');

  // if (!signature) {
  //   out.statusMessage = 'Missing stripe-signature header'
  //   return out;
  // }

  let stripeEvent: Stripe.Event | undefined;
  
  try {
    // Verify the event using the webhook secret
    stripeEvent = stripe.webhooks.constructEvent(
      body || "",
      signature,
      process.env.STRIPE_WEBHOOK_SECRET || ''
    )
  } catch (err: any) {
    console.error(`Webhook signature verification failed: ${err.message}`)
    out.statusMessage = `Webhook signature verification failed: ${err.message}`
    setResponseStatus(event, 400)
    return out;
  }

  // Handle the checkout.completed event
  if (stripeEvent && stripeEvent.type === 'checkout.session.completed') {
    try {
      //const session = stripeEvent.data.object as Stripe.Checkout.Session
      const session = getCheckoutSession(stripeEvent.data.object.id);
      
      // The updated Order.saveStripeOrder method only needs the session parameter
      await Order.saveStripeOrder(session);
      setResponseStatus(event, 200);
      out.statusMessage = 'Order processed successfully'

    } catch (error: any) {
      console.error('Error processing checkout session:', error)
      setResponseStatus(event, 500)
      out.statusMessage = `Failed to process checkout: ${error.message}`
      // Optionally, you can throw an error or return a specific response
    }
    return out;
  }
  
  // Return a successful response for other event types
  return { received: true, type: stripeEvent?.type }
});