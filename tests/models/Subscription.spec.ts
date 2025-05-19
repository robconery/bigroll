import { describe, it, expect, beforeEach, jest, beforeAll, afterAll } from '@jest/globals';
import { Subscription } from '../../server/models';
import Stripe from 'stripe';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

// Load the test data from the support file
const stripeSubData = JSON.parse(
  fs.readFileSync(path.join(__dirname, '../support/stripe_sub.json'), 'utf8')
);

describe('Subscription', () => {
  describe('initialization', () => {
    let subscription: Subscription;
    
    beforeEach(() => {
      subscription = new Subscription({
        email: 'test@example.com',
        plan: 'Premium Plan',
        stripe_customer_id: 'cus_123456789',
        stripe_sub_id: 'sub_123456789',
        current_period_start: { seconds: 1717060330 },
        current_period_end: { seconds: 1748596330 },
        interval: 'year',
        status: 'active',
        product_id: 'prod_123456789',
        price_id: 'price_123456789',
      });
    });

    it('initializes_with_the_correct_properties', () => {
      expect(subscription.email).toBe('test@example.com');
      expect(subscription.plan).toBe('Premium Plan');
      expect(subscription.stripe_customer_id).toBe('cus_123456789');
      expect(subscription.stripe_sub_id).toBe('sub_123456789');
      expect(subscription.interval).toBe('year');
      expect(subscription.status).toBe('active');
      expect(subscription.product_id).toBe('prod_123456789');
      expect(subscription.price_id).toBe('price_123456789');
    });

    it('initializes_email_as_lowercase', () => {
      const upperCaseSubscription = new Subscription({
        email: 'TEST@EXAMPLE.COM',
      });
      
      expect(upperCaseSubscription.email).toBe('test@example.com');
    });

    it('defaults_empty_properties_to_expected_values', () => {
      const emptySubscription = new Subscription({});
      
      expect(emptySubscription.email).toBe('');
      expect(emptySubscription.plan).toBe('');
      expect(emptySubscription.stripe_customer_id).toBe('');
      expect(emptySubscription.stripe_sub_id).toBe('');
      expect(emptySubscription.interval).toBe('year');
      expect(emptySubscription.status).toBe('active');
      expect(typeof emptySubscription.date.seconds).toBe('number');
      expect(emptySubscription.current_period_start.seconds).toBe(0);
      expect(emptySubscription.current_period_end.seconds).toBe(0);
    });

    it('sets_default_date_to_current_timestamp', () => {
      const now = Math.floor(Date.now() / 1000);
      const newSubscription = new Subscription({});
      
      // Allow a small difference in seconds for the test execution time
      expect(newSubscription.date.seconds).toBeGreaterThanOrEqual(now - 2);
      expect(newSubscription.date.seconds).toBeLessThanOrEqual(now + 2);
    });
  });

  describe('methods', () => {
    let activeSubscription: Subscription;
    let expiredSubscription: Subscription;
    
    beforeEach(() => {
      // Create an active subscription (end date in the future)
      const futureTimestamp = Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60; // 30 days in the future
      activeSubscription = new Subscription({
        email: 'active@example.com',
        current_period_end: { seconds: futureTimestamp },
        status: 'active'
      });

      // Create an expired subscription (end date in the past)
      const pastTimestamp = Math.floor(Date.now() / 1000) - 30 * 24 * 60 * 60; // 30 days in the past
      expiredSubscription = new Subscription({
        email: 'expired@example.com',
        current_period_end: { seconds: pastTimestamp },
        status: 'active'
      });
    });

    it('isActive_returns_true_for_active_subscription_in_period', () => {
      expect(activeSubscription.isActive()).toBe(true);
    });

    it('isActive_returns_false_for_subscription_outside_period', () => {
      expect(expiredSubscription.isActive()).toBe(false);
    });

    it('isActive_returns_false_when_status_is_not_active', () => {
      activeSubscription.status = 'canceled';
      expect(activeSubscription.isActive()).toBe(false);
    });

    it('getEndDate_returns_correct_date_object', () => {
      const endDateTimestamp = 1748596330; // From test data
      const subscription = new Subscription({
        current_period_end: { seconds: endDateTimestamp }
      });
      
      const expected = new Date(endDateTimestamp * 1000);
      expect(subscription.getEndDate()).toEqual(expected);
    });
  });

  describe('createFromStripe', () => {
    // Create a backup of the original environment
    let sub;
    beforeAll(() => {
      const futureTimestamp = Math.floor(Date.now() / 1000) + 365 * 24 * 60 * 60; // 365 days in the future
      //clone the stripeSubData
     const subData = JSON.parse(JSON.stringify(stripeSubData));
      subData.current_period_end = { seconds: futureTimestamp };
      subData.current_period_start = { seconds: Math.floor(Date.now() / 1000) };
      subData.id = 'sub_123456789';
      subData.customer = {
        id: 'cus_123456789',
        email: 'test_yearly@test.com'
      };
      subData.plan = {
        id: 'plan_123456789',
        nickname: 'Test Plan',
        product: 'prod_123456789',
        interval: 'year',
        currency: 'usd',
        amount: 9999,
        active: true,
        metadata: {
          test: 'test'
        }
      }; 
      sub = Subscription.createFromStripe(subData);
    });
    
    //we should have a sub at Firebase
    it('creates_or_updates_subscription_from_stripe_data', async () => {
      const existingSub = await Subscription.find({ stripe_sub_id: 'sub_123456789' });
      expect(existingSub).toBeDefined();
    })

  });

  describe('handleSubscriptionEvent', () => {
    it('handles_subscription_created_event', async () => {
      // Mock createFromStripe
      const mockSub = new Subscription({ email: 'test@example.com' });
      const createFromStripeSpy = jest.spyOn(Subscription, 'createFromStripe')
        .mockResolvedValue(mockSub);
      
      const mockEvent = {
        type: 'customer.subscription.created',
        data: { object: stripeSubData }
      } as Stripe.Event;
      
      const result = await Subscription.handleSubscriptionEvent(mockEvent);
      
      expect(result).toBe(mockSub);
      expect(createFromStripeSpy).toHaveBeenCalledWith(stripeSubData);
      
      createFromStripeSpy.mockRestore();
    });
    
    it('handles_subscription_updated_event', async () => {
      // Mock createFromStripe
      const mockSub = new Subscription({ email: 'test@example.com' });
      const createFromStripeSpy = jest.spyOn(Subscription, 'createFromStripe')
        .mockResolvedValue(mockSub);
      
      const mockEvent = {
        type: 'customer.subscription.updated',
        data: { object: stripeSubData }
      } as Stripe.Event;
      
      const result = await Subscription.handleSubscriptionEvent(mockEvent);
      
      expect(result).toBe(mockSub);
      expect(createFromStripeSpy).toHaveBeenCalledWith(stripeSubData);
      
      createFromStripeSpy.mockRestore();
    });
    
    it('handles_subscription_deleted_event', async () => {
      const deletedSub = new Subscription({
        email: 'deleted@example.com',
        stripe_sub_id: 'sub_0PM51qfqGyWN1S0V0rswhP9W',
        status: 'active'
      });
      
      // Mock find and save
      const findSpy = jest.spyOn(Subscription, 'find').mockResolvedValue(deletedSub);
      const saveSpy = jest.spyOn(deletedSub, 'save').mockResolvedValue(deletedSub);
      
      const mockEvent = {
        type: 'customer.subscription.deleted',
        data: { object: { id: 'sub_0PM51qfqGyWN1S0V0rswhP9W' } }
      } as Stripe.Event;
      
      const result = await Subscription.handleSubscriptionEvent(mockEvent);
      
      expect(result).toBe(deletedSub);
      expect(deletedSub.status).toBe('canceled');
      expect(saveSpy).toHaveBeenCalled();
      
      findSpy.mockRestore();
      saveSpy.mockRestore();
    });
    
    it('handles_subscription_paused_event', async () => {
      const pausedSub = new Subscription({
        email: 'paused@example.com',
        stripe_sub_id: 'sub_0PM51qfqGyWN1S0V0rswhP9W',
        status: 'active'
      });
      
      // Mock find and save
      const findSpy = jest.spyOn(Subscription, 'find').mockResolvedValue(pausedSub);
      const saveSpy = jest.spyOn(pausedSub, 'save').mockResolvedValue(pausedSub);
      
      const mockEvent = {
        type: 'customer.subscription.paused',
        data: { object: { id: 'sub_0PM51qfqGyWN1S0V0rswhP9W' } }
      } as Stripe.Event;
      
      const result = await Subscription.handleSubscriptionEvent(mockEvent);
      
      expect(result).toBe(pausedSub);
      expect(pausedSub.status).toBe('paused');
      expect(saveSpy).toHaveBeenCalled();
      
      findSpy.mockRestore();
      saveSpy.mockRestore();
    });
    
    it('handles_subscription_resumed_event', async () => {
      const resumedSub = new Subscription({
        email: 'resumed@example.com',
        stripe_sub_id: 'sub_0PM51qfqGyWN1S0V0rswhP9W',
        status: 'paused'
      });
      
      // Mock find and save
      const findSpy = jest.spyOn(Subscription, 'find').mockResolvedValue(resumedSub);
      const saveSpy = jest.spyOn(resumedSub, 'save').mockResolvedValue(resumedSub);
      
      const mockEvent = {
        type: 'customer.subscription.resumed',
        data: { object: { id: 'sub_0PM51qfqGyWN1S0V0rswhP9W' } }
      } as Stripe.Event;
      
      const result = await Subscription.handleSubscriptionEvent(mockEvent);
      
      expect(result).toBe(resumedSub);
      expect(resumedSub.status).toBe('active');
      expect(saveSpy).toHaveBeenCalled();
      
      findSpy.mockRestore();
      saveSpy.mockRestore();
    });
  
    
    it('returns_null_when_subscription_not_found_for_event', async () => {
      // Mock find to return null
      const findSpy = jest.spyOn(Subscription, 'find').mockResolvedValue(null);
      
      const mockEvent = {
        type: 'customer.subscription.deleted',
        data: { object: { id: 'non_existent_subscription' } }
      } as Stripe.Event;
      
      const result = await Subscription.handleSubscriptionEvent(mockEvent);
      
      expect(result).toBeNull();
      
      findSpy.mockRestore();
    });
  });
});