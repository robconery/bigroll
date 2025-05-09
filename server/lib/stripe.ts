import 'dotenv/config';
import Stripe from 'stripe';
import { H3Event, readRawBody, getHeader } from "h3";
import { createError } from 'h3';

// Initialize Stripe with the API key
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2022-11-15' // Use appropriate API version
});

export const searchCustomers = async (query: string) => {
  try {
    const customers = await stripe.customers.list({
      email: query,
      limit: 5,
    });
    return customers.data;
  } catch (error) {
    console.error('Error searching customers:', error);
    return[]
  }
}
export const findUserByEmail = async (email: string) => {
  try {
    const customers = await stripe.customers.list({
      email: email,
      limit: 1,
    });
    if (customers.data.length > 0) {
      return customers.data[0];
    }
    return null;
  } catch (error) {
    return null;
  }
}

export const validateWebhook = async (event: H3Event) => {
  const body = await readRawBody(event, false);
  const signature = getHeader(event, 'stripe-signature');

  if (!body) {
    return { error: 'Invalid request body' }
  }

  if (!signature) {
    return { error: 'Invalid stripe-signature' }
  }

  try {
    const stripeEvent = stripe.webhooks.constructEvent(
      body,
      signature,
      "whsec_3OfmLq1kmtH3p86kh51jVknYKTxdZsS6"
    );
    return stripeEvent;
  } catch (err: unknown) {
    throw createError({
      statusCode: 400,
      statusMessage: `Webhook Error: ${err instanceof Error ? err.message : 'Unknown error'}`,
    });
  }
}

export const getInvoice = async (id: string) => {
  try {
    const invoice = await stripe.invoices.retrieve(id);
    return invoice;
  } catch (error) {
    console.error('Error retrieving invoice:', error);
    throw error;
  }
}

/**
 * Get details of a checkout session from Stripe
 * @param sessionId The ID of the Stripe checkout session
 * @returns Checkout session data with any error information
 */
export async function getCheckout(sessionId: string) {
  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ['line_items', 'line_items.data.price.product']
    });

    // Extract product information from the session
    let product = null;
    let metadata = null;

    // Get the product information from the first line item
    if (session.line_items?.data && session.line_items.data.length > 0) {
      const lineItem = session.line_items.data[0];
      if (lineItem.price?.product) {
        product = lineItem.price.product as Stripe.Product;
        metadata = product.metadata || {};
      }
    }

    return {
      id: session.id,
      customer_email: session.customer_details?.email || session.customer_email,
      customer_name: session.customer_details?.name || '',
      payment_status: session.payment_status,
      amount_total: session.amount_total,
      created: session.created,
      metadata: session.metadata,
      product: {
        id: product?.id || '',
        name: product?.name || '',
        description: product?.description || '',
        metadata: metadata
      }
    };
  } catch (error: any) {
    console.error('Error retrieving checkout session:', error);
    return {
      error: error.message || 'Failed to retrieve checkout session'
    };
  }
}

export const getProduct = async (id: string) => {
  try {
    const product = await stripe.products.retrieve(id);
    return product;
  } catch (error) {
    console.error('Error retrieving product:', error);
    throw error;
  }
}
export const updateCheckout = async (id: string, data: Stripe.Checkout.SessionUpdateParams) => {
  try {
    const session = await stripe.checkout.sessions.update(id, data);
    return session;
  } catch (error) {
    console.error('Error updating checkout session:', error);
    throw error;
  }
}