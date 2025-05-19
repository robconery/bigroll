import { Firefly } from '../lib/firefly';
import Stripe from 'stripe';

/**
 * Subscription model representing a user's subscription
 */
export class Subscription extends Firefly<Subscription> {
  email: string;
  plan: string;
  stripe_customer_id: string;
  stripe_sub_id: string;
  current_period_start: { seconds: number };
  current_period_end: { seconds: number };
  interval: string;
  date: { seconds: number };
  status?: string;
  product_id?: string;
  price_id?: string;

  constructor(data: Partial<Subscription> = {}) {
    super(data);
    this.email = data.email?.toLowerCase() || '';
    this.plan = data.plan || '';
    this.stripe_customer_id = data.stripe_customer_id || '';
    this.stripe_sub_id = data.stripe_sub_id || '';
    this.current_period_start = data.current_period_start || { seconds: 0 };
    this.current_period_end = data.current_period_end || { seconds: 0 };
    this.interval = data.interval || 'year';
    this.date = data.date || { seconds: Math.floor(Date.now() / 1000) };
    this.status = data.status || 'active';
    this.product_id = data.product_id;
    this.price_id = data.price_id;
  }

  /**
   * Checks if the subscription is currently active
   */
  isActive(): boolean {
    const now = Math.floor(Date.now() / 1000);
    return now < this.current_period_end.seconds && this.status === 'active';
  }

  /**
   * Gets the date when the subscription ends
   */
  getEndDate(): Date {
    return new Date(this.current_period_end.seconds * 1000);
  }

  /**
   * Create or update a subscription from a Stripe subscription object
   * @param stripeSubscription The Stripe subscription object
   * @returns The created or updated subscription
   */
  static async createFromStripe(stripeSubscription: Stripe.Subscription): Promise<Subscription> {
    // Extract customer email from the customer object if available
    let email = '';
    let customerId = '';

    if (typeof stripeSubscription.customer === 'string') {
      customerId = stripeSubscription.customer;
    } else if (stripeSubscription.customer && 'id' in stripeSubscription.customer) {
      customerId = stripeSubscription.customer.id;
      if ('email' in stripeSubscription.customer && stripeSubscription.customer.email) {
        email = stripeSubscription.customer.email;
      }
    }

    // If we couldn't get the email from the customer object, try to retrieve the customer
    if (!email && customerId) {
      try {
        const stripe = new Stripe(process.env.STRIPE_BIG_SECRET || '', {
          // @ts-ignore - Typescript might have a newer version in its type definitions
          apiVersion: '2022-11-15'
        });
        
        const customer = await stripe.customers.retrieve(customerId);
        if (customer && !customer.deleted && 'email' in customer && customer.email) {
          email = customer.email;
        }
      } catch (error) {
        console.error('Error retrieving customer from Stripe:', error);
      }
    }

    if (!email) {
      throw new Error('Could not determine customer email for subscription');
    }

    let planName = '';
    let productId = '';
    let priceId = '';
    let interval = 'month';

    // Extract subscription details from the items
    if (stripeSubscription.items && 
        stripeSubscription.items.data && 
        stripeSubscription.items.data.length > 0) {
      const item = stripeSubscription.items.data[0];
      
      if (item.plan) {
        interval = item.plan.interval || 'month';
        
        if (item.plan.product) {
          if (typeof item.plan.product === 'string') {
            productId = item.plan.product;
          } else if ('id' in item.plan.product) {
            productId = item.plan.product.id;
            if ('name' in item.plan.product && item.plan.product.name) {
              planName = item.plan.product.name;
            }
          }
        }

        if (item.price && typeof item.price === 'object' && 'id' in item.price) {
          priceId = item.price.id;
        }
      }
    }

    // If plan name is not available from product, use nickname or ID
    const stripeSub = stripeSubscription as any;
    if (!planName && stripeSub.plan) {
      planName = stripeSub.plan.nickname || stripeSub.plan.id || 'Unknown Plan';
    }

    // Check if a subscription with this ID already exists
    let subscription = await Subscription.find({ stripe_sub_id: stripeSubscription.id });

    if (!subscription) {
      // Create a new subscription
      subscription = new Subscription({
        email,
        stripe_customer_id: customerId,
        stripe_sub_id: stripeSubscription.id,
        plan: planName,
        interval,
        product_id: productId,
        price_id: priceId,
        current_period_start: { seconds: stripeSub.current_period_start || 0 },
        current_period_end: { seconds: stripeSub.current_period_end || 0 },
        date: { seconds: stripeSub.created || Math.floor(Date.now() / 1000) },
        status: stripeSub.status
      });
    } else {
      // Update existing subscription
      subscription.plan = planName;
      subscription.interval = interval;
      subscription.current_period_start = { seconds: stripeSub.current_period_start || 0 };
      subscription.current_period_end = { seconds: stripeSub.current_period_end || 0 };
      subscription.status = stripeSub.status || 'active';
      subscription.product_id = productId;
      subscription.price_id = priceId;
    }

    // Save the subscription
    await subscription.save();
    return subscription;
  }

  /**
   * Handle a Stripe subscription event
   * @param event The Stripe event object
   * @returns The handled subscription
   */
  static async handleSubscriptionEvent(event: Stripe.Event): Promise<Subscription | null> {
    const subscription = event.data.object as Stripe.Subscription;
    
    switch (event.type) {
      case 'customer.subscription.created':
        return await Subscription.createFromStripe(subscription);
        
      case 'customer.subscription.updated':
        return await Subscription.createFromStripe(subscription);
        
      case 'customer.subscription.deleted':
        const deletedSub = await Subscription.find({ stripe_sub_id: subscription.id });
        if (deletedSub) {
          deletedSub.status = 'canceled';
          await deletedSub.save();
          return deletedSub;
        }
        return null;
        
      case 'customer.subscription.paused':
        const pausedSub = await Subscription.find({ stripe_sub_id: subscription.id });
        if (pausedSub) {
          pausedSub.status = 'paused';
          await pausedSub.save();
          return pausedSub;
        }
        return null;
        
      case 'customer.subscription.resumed':
        const resumedSub = await Subscription.find({ stripe_sub_id: subscription.id });
        if (resumedSub) {
          resumedSub.status = 'active';
          await resumedSub.save();
          return resumedSub;
        }
        return null;
        
      default:
        return null;
    }
  }
}

// Type alias for backward compatibility with existing code
export type SubscriptionData = Subscription;