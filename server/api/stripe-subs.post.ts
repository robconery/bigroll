import "dotenv/config" 
import { Order } from '../models'
import { defineEventHandler, readBody, createError, getHeader, readRawBody } from 'h3'
import Stripe from 'stripe'
import { getCheckoutSession } from "../lib/stripe"


// Initialize Stripe with the API key
const stripe = new Stripe(process.env.STRIPE_BIG_SECRET || '', {
  // @ts-ignore - Typescript might have a newer version in its type definitions
  apiVersion: '2022-11-15' // Use the existing compatible API version
})

export default defineEventHandler(async (event) => {
  // Get the raw body and signature
  const body = await readRawBody(event)
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
      process.env.STRIPE_BIG_WEBHOOK || ''
    )
  } catch (err: any) {
    console.error(`Webhook signature verification failed: ${err.message}`)
    out.statusMessage = `Webhook signature verification failed: ${err.message}`
    return out;
  }

  switch (stripeEvent.type) {
    case 'customer.subscription.created':
    case 'customer.subscription.updated':
    case 'customer.subscription.deleted':
    case 'customer.subscription.paused':
    case 'customer.subscription.resumed':
      try {
        const { Subscription } = await import('../models');
        const subscription = await Subscription.handleSubscriptionEvent(stripeEvent);
        console.log(`Successfully handled subscription event ${stripeEvent.type} for subscription ${subscription?.stripe_sub_id || 'unknown'}`);
      } catch (error) {
        console.error(`Error handling subscription event ${stripeEvent.type}:`, error);
      }
      break;
      
    case 'invoice.payment_succeeded':
      // Handle invoice payment success - this might need to update subscription status or create order records
      try {
        const invoicePaymentSucceeded = stripeEvent.data.object as any;
        
        // If this payment is for a subscription, update the subscription
        if (invoicePaymentSucceeded.subscription) {
          // Fetch the full subscription data from Stripe to get complete details
          const subscription = await stripe.subscriptions.retrieve(invoicePaymentSucceeded.subscription as string);
          
          const { Subscription } = await import('../models');
          const updatedSubscription = await Subscription.createFromStripe(subscription);
          
          console.log(`Updated subscription ${updatedSubscription.stripe_sub_id} from invoice payment`);
          
          // Check if we need to create an order for this payment
          if (invoicePaymentSucceeded.paid && !invoicePaymentSucceeded.forgiven) {
            // Create an order record
            const session = await getCheckoutSession(invoicePaymentSucceeded.id);
            if (session && !('error' in session)) {
              // Use the existing saveStripeOrder method to create an order from the session
              const [order, authorizations] = await Order.saveStripeOrder(session);
              console.log(`Created order ${order.number} for invoice payment on subscription ${updatedSubscription.stripe_sub_id}`);
            }
          }
        }
      } catch (error) {
        console.error('Error handling invoice payment event:', error);
      }
      break;
      
    // ... handle other event types
    default:
      console.log(`Unhandled event type ${stripeEvent.type}`);
  }
  
  // Return a successful response for other event types
  return { received: true, type: stripeEvent?.type }
});