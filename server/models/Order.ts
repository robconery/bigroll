/**
 * Order model representing an order in the system
 */
export class Order {
  id: string;
  number: string;
  date: string;
  name?: string;
  email: string;
  slug: string;
  offer: string;
  uid?: string;
  store?: string;
  total?: number;
  status?: string;
  items?: any[];

  constructor(data: Partial<Order> = {}) {
    this.id = data.id || '';
    this.number = data.number || '';
    this.date = data.date || new Date().toISOString();
    this.name = data.name;
    this.email = data.email?.toLowerCase() || '';
    this.slug = data.slug || '';
    this.offer = data.offer || '';
    this.uid = data.uid;
    this.store = data.store;
    this.total = data.total;
    this.status = data.status;
    this.items = data.items || [];
  }

  /**
   * Creates an Order object from Firestore data
   */
  static fromFirestore(id: string, data: any): Order {
    return new Order({
      id: id,
      number: data.number,
      date: data.date,
      name: data.name,
      email: data.email,
      slug: data.slug,
      offer: data.offer,
      uid: data.uid,
      store: data.store,
      total: data.total,
      status: data.status,
      items: data.items
    });
  }

  /**
   * Converts Order object to a plain object for Firestore
   */
  toFirestore(): Record<string, any> {
    const order: Record<string, any> = {
      number: this.number,
      date: this.date,
      email: this.email.toLowerCase(),
      slug: this.slug,
      offer: this.offer
    };

    if (this.name) order.name = this.name;
    if (this.uid) order.uid = this.uid;
    if (this.store) order.store = this.store;
    if (this.total !== undefined) order.total = this.total;
    if (this.status) order.status = this.status;
    if (this.items?.length) order.items = this.items;

    return order;
  }
}

// Type alias for backward compatibility with existing code
export type OrderData = Order;