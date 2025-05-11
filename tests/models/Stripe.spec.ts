import { describe, it, expect, beforeEach, afterEach, jest, beforeAll } from '@jest/globals';
import { Order, Authorization, Offer } from '../../server/models';
import { getCheckoutSession } from '~/server/lib/stripe';

describe('Stripe Order Processing', () => {
  let stripeData: any;
  beforeAll(async () => {
    stripeData = await getCheckoutSession("cs_test_a1lfRMEZEVvw5rPsBK2twoY8PiSCEfVPT7TpJujGv9aLSvRFuzUSy9mnjN");
  });

  describe('saveStripeOrder - standard product', () => {
    let order: Order;
    let authorizations: Authorization[];
    beforeAll(async () => {
      // Load the test data from the support file
      [order, authorizations] = await Order.saveStripeOrder(stripeData);
    });

    it('creates_an_order_with_correct_data', async () => {
      expect(order.number).toBe(`RED4-${stripeData.id.slice(-8)}`);
      expect(order.store).toBe('stripe');
      expect(order.total).toBe(stripeData.amount_total / 100); // Converting cents to dollars
    });


    it('creates_authorization_with_correct_data', async () => {
      expect(authorizations.length).toBe(1);
      expect(authorizations[0].email).toBe("robconery@gmail.com");
      expect(authorizations[0].sku).toBe('imposter-second');
      expect(authorizations[0].order).toBe(order.number);
    });
    

    it('sets_order_status_to_completed', async () => {
      expect(order.status).toBe('completed');
    });

  });

});