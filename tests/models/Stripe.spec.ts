import fs from 'fs';
import path from 'path';
import { describe, it, expect, beforeEach, afterEach, jest, beforeAll } from '@jest/globals';
import { Order, Authorization, Offer } from '../../server/models';
import stripe_checkout from '../support/stripe_checkout.json';
import stripe_checkout_file from '../support/stripe_checkout_file.json';


describe('Stripe Order Processing', () => {
  describe('saveStripeOrder - standard product', () => {
    let stripeData = stripe_checkout.data.object;
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
      expect(authorizations.length).toBe(2);
      expect(authorizations[0].email).toBe("robconery@gmail.com");
      expect(authorizations[0].sku).toBe('imposter-second');
      expect(authorizations[0].order).toBe(order.number);
    });
    

    it('sets_order_status_to_completed', async () => {
      expect(order.status).toBe('completed');
    });

  });

  describe('saveStripeOrder - direct file download', () => {
    let stripeData = stripe_checkout_file.data.object;
    let order: Order;
    let authorizations: Authorization[];
    beforeAll(async () => {
      // Load the test data from the support file
      [order, authorizations] = await Order.saveStripeOrder(stripeData);
    });

    afterEach(() => {
      jest.restoreAllMocks();
    });

    it('creates_authorization_with_download_file', async () => {
      expect(authorizations.length).toBe(1);
      expect(authorizations[0].download).toBe('The Imposter\'s Handbook, Second Edition.zip');
    });

    it('uses_sku_from_metadata_for_authorization', async () => {
      expect(authorizations[0].sku).toBe('imposter-second');
    });
  });

  describe('error conditions', () => {
    let stripeData = stripe_checkout.data.object;
    let order: Order;
    let authorizations: Authorization[];

    it('handles_missing_offer', async () => {
      // Create a copy of stripeData to avoid modifying the original
      const testData = { 
        ...stripeData,
        metadata: { ...stripeData.metadata, sku: 'non-existent-offer' } 
      };
      
      // Test that the promise rejects with the expected error
      await expect(Order.saveStripeOrder(testData))
        .rejects.toThrow('Offer not found for non-existent-offer');
    });

    it('handles_offer_with_no_products', async () => {
      const testData = { 
        ...stripeData,
        metadata: {} 
      };
      
      // Test that the promise rejects with the expected error
      await expect(Order.saveStripeOrder(testData))
        .rejects.toThrow('Missing sku or slug in session metadata');
    });


    it('throws when no session id', async () => {
      const testData = { 
        ...stripeData,
        id: null
      };
      
      // Test that the promise rejects with the expected error
      await expect(Order.saveStripeOrder(testData))
        .rejects.toThrow('Missing session ID');
    });
  });
});