import { Firefly } from '../lib/firefly';
import { Authorization, Offer } from './';

/**
 * Order model representing an order in the system
 */
export class Order extends Firefly<Order> {
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

  constructor(data: Partial<Order> = {}) {
    super(data);
    this.number = data.number || '';
    this.date = data.date || new Date().toISOString();
    this.name = data.name;
    this.email = data.email?.toLowerCase() || '';
    this.slug = data.slug || '';
    this.offer = data.offer || '';
    this.uid = data.uid;
    this.store = data.store;
    this.total = data.total;
    this.status = data.status || 'pending';

  }

  static async saveThriveOrder(data: any): Promise<[Order, Authorization[]]> {
    const { order, customer, base_product_label: slug } = data;

    // Create the order number based on the order.id from thrive, using the last 5 digits
    const orderNumber = `RED4-${order.id.slice(-8)}`;

    // Create the order object using the Order class
    const newOrder = new Order({
      number: orderNumber,
      date: order.date_iso8601,
      name: `${customer.first_name} ${customer.last_name}`.trim(),
      email: customer.email.toLowerCase(),
      slug: slug,
      total: parseInt(order.total, 10),
      store: 'thrivecart',
      offer: order.charges[0].name,
    });
    await newOrder.save();

    //get the offer for the order based on slug
    const offer = await Offer.find({ slug: slug });
    if (!offer) {
      console.error(`Offer not found for Thrive ID: ${order.id}`);
      return [newOrder, []];
    }

    //get the products for the offer
    const products = await offer.getProducts();
    if (!products || products.length === 0) {
      console.error(`No products found for offer: ${offer.slug}`);
      return [newOrder, []];
    }
    //authorize each product in the order
    const authorizations: Authorization[] = [];
    for (const product of products) {
      const authorization = new Authorization({
        email: customer.email.toLowerCase(),
        sku: product.sku,
        date: order.date_iso8601,
        order: orderNumber,
        offer: offer.slug,
      });
      await authorization.save();
      authorizations.push(authorization);
    }

    newOrder.status = 'completed';
    await newOrder.save();
    return [newOrder, authorizations];

    //send an email to the user with the order details


  }
}

// Type alias for backward compatibility with existing code
export type OrderData = Order;