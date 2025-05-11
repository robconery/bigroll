import { getCheckoutSession } from "../lib/stripe";
import { Order, Authorization } from "../models";

export default defineEventHandler(async (event) => {
  // Get the session id from the query
  const { id } = getQuery(event);

  if (!id) {
    return { error: 'No session id provided' };
  }
  
  // Get checkout session data from Stripe
  //const session = await getCheckout(String(id));


  const session = await getCheckoutSession(String(id));
  const [order, authorizations] = await Order.saveStripeOrder(session);
  return { order, authorizations };
})
