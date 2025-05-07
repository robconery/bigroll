// import { defineEventHandler, readBody, createError, getHeader } from 'h3'
// import Stripe from 'stripe'
// import { Order } from '../models'
// import "dotenv/config"

// // Initialize Stripe with the API key
// const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
//   // @ts-ignore - Typescript might have a newer version in its type definitions
//   apiVersion: '2022-11-15' // Use the existing compatible API version
// })

// export default defineEventHandler(async (event) => {
//   // Get the raw body and signature
//   const body = await readBody(event)
//   const signature = getHeader(event, 'stripe-signature')

//   if (!signature) {
//     throw createError({
//       statusCode: 400,
//       statusMessage: 'Missing stripe-signature header'
//     })
//   }

//   let stripeEvent: Stripe.Event
  
//   try {
//     // Verify the event using the webhook secret
//     stripeEvent = stripe.webhooks.constructEvent(
//       JSON.stringify(body),
//       signature,
//       process.env.STRIPE_WEBHOOK_SECRET || ''
//     )
//   } catch (err: any) {
//     console.error(`Webhook signature verification failed: ${err.message}`)
//     throw createError({
//       statusCode: 400,
//       statusMessage: `Webhook signature verification failed: ${err.message}`
//     })
//   }

//   // Handle the checkout.completed event
//   if (stripeEvent.type === 'checkout.session.completed') {
//     try {
//       const session = stripeEvent.data.object as Stripe.Checkout.Session
      
//       // Ensure we have a valid session with the necessary data
//       if (!session.customer_email && !session.customer_details?.email || session.payment_status !== 'paid') {
//         return { success: false, message: 'Invalid or unpaid session data' }
//       }
      
//       // The updated Order.saveStripeOrder method only needs the session parameter
//       const [order, authorizations] = await Order.saveStripeOrder(session);
      
//       return { 
//         success: true, 
//         orderNumber: order.number,
//         authorizationsCreated: authorizations.length
//       }
//     } catch (error: any) {
//       console.error('Error processing checkout session:', error)
//       throw createError({
//         statusCode: 500,
//         statusMessage: `Failed to process checkout: ${error.message}`
//       })
//     }
//   }
  
//   // Return a successful response for other event types
//   return { received: true, type: stripeEvent.type }
// });