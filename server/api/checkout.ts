import { getCheckout } from "../lib/stripe";
import { Order, Authorization } from "../models";

export default defineEventHandler(async (event) => {
  // Get the session id from the query
  const { id } = getQuery(event);

  if (!id) {
    return { error: 'No session id provided' };
  }
  
  // Get checkout session data from Stripe
  const session = await getCheckout(String(id));
  
  // Check if the session is valid
  if (session.error) {
    return { error: session.error };
  }

  try {
    // Process the checkout and create order/authorizations
    const sessionData = {
      id: session.id,
      customer_details: {
        email: session.customer_email,
        name: session.customer_name
      },
      amount_total: session.amount_total,
      payment_status: session.payment_status,
      created: session.created,
      metadata: session.metadata || {},
    };

    // Add product metadata to the session data
    if (session.product && session.product.metadata) {
      sessionData.metadata = {
        ...sessionData.metadata,
        ...session.product.metadata,
        name: session.product.name || sessionData.metadata.name,
        sku: session.product.metadata.sku || session.product.metadata.slug || sessionData.metadata.sku || sessionData.metadata.slug,
        file: session.product.metadata.file || sessionData.metadata.file,
      };
    }

    // Save the order and create authorizations
    const [order, authorizations] = await Order.saveStripeOrder(sessionData);
    
    // Prepare response with order details
    const response: {
      success: boolean;
      order: {
        number: string;
        date: string;
        email: string;
        status?: string;
        total?: number;
      };
      downloads: Array<{
        sku: string;
        description: string;
        url: string;
      }>;
    } = {
      success: true,
      order: {
        number: order.number,
        date: order.date,
        email: order.email,
        status: order.status,
        total: order.total
      },
      downloads: []
    };
    
    // Add download URLs for any digital products
    if (authorizations && authorizations.length > 0) {
      for (const auth of authorizations) {
        if (auth.download) {
          const downloadUrl = await auth.getDownloadUrl();
          if (downloadUrl) {
            response.downloads.push({
              sku: auth.sku,
              description: session.product?.description || "Your download",
              url: downloadUrl
            });
          }
        }
      }
    }
    
    return response;
  } catch (error: any) {
    console.error('Error processing checkout:', error);
    return { 
      error: "Failed to process checkout",
      details: error.message 
    };
  }
})
