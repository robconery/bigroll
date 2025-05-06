import { defineEventHandler, readBody, createError, getHeader } from 'h3'
import Stripe from 'stripe'
import { Order, Authorization } from '../models'
import { get, updateOne, fbApp } from '../lib/firefly.cjs'
import "dotenv/config"
// Initialize Stripe with the API key
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  // @ts-ignore - Typescript might have a newer version in its type definitions
  apiVersion: '2022-11-15' // Use the existing compatible API version
})

export default defineEventHandler(async (event) => {
  // Get the raw body and signature
  const body = await readBody(event)
  const signature = getHeader(event, 'stripe-signature')

  if (!signature) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Missing stripe-signature header'
    })
  }

  let stripeEvent: Stripe.Event
  
  try {
    // Verify the event using the webhook secret
    stripeEvent = stripe.webhooks.constructEvent(
      JSON.stringify(body),
      signature,
      process.env.STRIPE_WEBHOOK_SECRET || ''
    )
  } catch (err: any) {
    console.error(`Webhook signature verification failed: ${err.message}`)
    throw createError({
      statusCode: 400,
      statusMessage: `Webhook signature verification failed: ${err.message}`
    })
  }

  // Handle the checkout.completed event
  if (stripeEvent.type === 'checkout.session.completed') {
    try {
      const session = stripeEvent.data.object as Stripe.Checkout.Session
      
      // Ensure we have a valid session with the necessary data
      if (!session.customer_email || session.payment_status !== 'paid') {
        return { success: false, message: 'Invalid or unpaid session data' }
      }

      // Generate a unique order number if not provided by Stripe
      const orderNumber = session.id || `stripe-${Date.now()}`
      
      // Get the line items to determine what was purchased
      const lineItems = await stripe.checkout.sessions.listLineItems(session.id)
      if (!lineItems.data.length) {
        return { success: false, message: 'No line items found in the session' }
      }
      
      // Get product details from the first line item
      // In a real app, you might want to handle multiple products
      const item = lineItems.data[0]
      
      // Fetch product details if you need more information
      let productDetails: Stripe.Response<Stripe.Product> | undefined
      if (item.price?.product) {
        productDetails = await stripe.products.retrieve(
          typeof item.price.product === 'string' ? item.price.product : item.price.product.id
        )
      }
      
      // We've already validated that customer_email exists above
      const customerEmail = session.customer_email!.toLowerCase()
      
      // Create and save the order
      const order = new Order({
        number: orderNumber,
        date: new Date().toISOString(),
        email: customerEmail,
        name: session.customer_details?.name || '',
        slug: productDetails?.metadata?.slug || '',
        offer: productDetails?.name || item.description || 'Unknown Product',
        store: 'stripe',
        total: session.amount_total ? session.amount_total / 100 : 0, // Convert from cents
        status: 'completed',
        items: lineItems.data.map(item => ({
          name: item.description || '',
          price: item.amount_total ? item.amount_total / 100 : 0 // Convert from cents
        }))
      })
      
      // Save the order to Firestore using firefly.cjs
      await updateOne('orders', orderNumber, order.toFirestore())
      
      // Create authorizations based on product metadata
      // In a real app, you might want to check for product-specific SKUs
      const skusToAuthorize = productDetails?.metadata?.skus 
        ? JSON.parse(productDetails.metadata.skus as string) 
        : [productDetails?.id || item.price?.id || 'default-sku']
        
      // Create an authorization for each SKU
      const authPromises = skusToAuthorize.map(async (sku: string) => {
        const authorization = new Authorization({
          email: customerEmail,
          sku: sku,
          date: new Date().toISOString(),
          order: orderNumber,
          offer: productDetails?.name || item.description || 'Unknown Product'
        })
        
        const authId = `${authorization.email}-${sku}`
        return updateOne('authorizations', authId, authorization.toFirestore())
      })
      
      // Wait for all authorizations to be created
      await Promise.all(authPromises)
      
      return { success: true, orderNumber }
    } catch (error: any) {
      console.error('Error processing checkout session:', error)
      throw createError({
        statusCode: 500,
        statusMessage: `Failed to process checkout: ${error.message}`
      })
    }
  }
  
  // Return a successful response for other event types
  return { received: true, type: stripeEvent.type }
});