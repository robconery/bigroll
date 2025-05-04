/**
 * Subscription model representing a user's subscription
 */
export class Subscription {
  email: string;
  plan: string;
  stripe_customer_id: string;
  stripe_sub_id: string;
  current_period_start: { seconds: number };
  current_period_end: { seconds: number };
  interval: string;
  date: { seconds: number };

  constructor(data: Partial<Subscription> = {}) {
    this.email = data.email?.toLowerCase() || '';
    this.plan = data.plan || '';
    this.stripe_customer_id = data.stripe_customer_id || '';
    this.stripe_sub_id = data.stripe_sub_id || '';
    this.current_period_start = data.current_period_start || { seconds: 0 };
    this.current_period_end = data.current_period_end || { seconds: 0 };
    this.interval = data.interval || 'month';
    this.date = data.date || { seconds: Math.floor(Date.now() / 1000) };
  }

  /**
   * Creates a Subscription object from Firestore data
   */
  static fromFirestore(data: any): Subscription {
    return new Subscription({
      email: data.email,
      plan: data.plan,
      stripe_customer_id: data.stripe_customer_id,
      stripe_sub_id: data.stripe_sub_id,
      current_period_start: data.current_period_start,
      current_period_end: data.current_period_end,
      interval: data.interval,
      date: data.date
    });
  }

  /**
   * Converts Subscription object to a plain object for Firestore
   */
  toFirestore(): Record<string, any> {
    return {
      email: this.email.toLowerCase(),
      plan: this.plan,
      stripe_customer_id: this.stripe_customer_id,
      stripe_sub_id: this.stripe_sub_id,
      current_period_start: this.current_period_start,
      current_period_end: this.current_period_end,
      interval: this.interval,
      date: this.date
    };
  }

  /**
   * Checks if the subscription is currently active
   */
  isActive(): boolean {
    const now = Math.floor(Date.now() / 1000);
    return now < this.current_period_end.seconds;
  }

  /**
   * Gets the date when the subscription ends
   */
  getEndDate(): Date {
    return new Date(this.current_period_end.seconds * 1000);
  }
}

// Type alias for backward compatibility with existing code
export type SubscriptionData = Subscription;