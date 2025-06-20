import { Firefly } from '../lib/firefly';
import { Authorization, Offer, Product, User } from './';
import assert from 'assert';
import { recordPurchase } from '../lib/convertkit';
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
  store?: string;
  total?: number;
  status?: string;
  constructor(data: Partial<Order> = {}) {
    super(data);
    this.id = data.id || '';
    this.number = data.number || '';
    this.date = data.date || new Date().toISOString();
    this.name = data.name;
    this.email = data.email?.toLowerCase() || '';
    this.slug = data.slug || '';
    this.offer = data.offer || '';
    this.store = data.store;
    this.total = data.total;
    this.status = data.status || 'pending';
  }

  async getAuthorizations(): Promise<Authorization[]> {
    return Authorization.filter({ order: this.number });
  }
  async getProducts(): Promise<Product[]> {
    const auths = await this.getAuthorizations();
    let products: Product[] = [];
    for (let auth of auths) {
      const p = await Product.get(auth.sku);
      if (p) {
        products.push(p);
      }
    }
    return products;
  }
    

  static async createNewOrder(data: Partial<Order>): Promise<[Order, Authorization[]]> {
    // Ensure required fields are present
    assert(data.email, 'Email is required');
    assert(data.number, 'Order number is required');
    assert(data.slug, 'Slug is required');
    assert(data.total !== undefined, 'Total is required');
    // look up the offer by slug
    const offer = await Offer.find({ slug: data.slug });
    if (!offer) {
      throw new Error(`Offer with slug ${data.slug} not found`);
    }
    //save the order 
    const order = new Order({
      id: data.number,
      number: data.number,
      date: data.date || new Date().toISOString(),
      email: data.email.toLowerCase(),
      name: data.name,
      slug: data.slug,
      offer: offer.name,
      store: data.store || 'unknown',
      total: parseFloat(data.total.toString()),
      status: 'pending', // Default status
    });
    await order.save();
    const products = await offer.getProducts();
    if (!products || products.length === 0) {
      console.error(`No products found for offer: ${offer.slug}`);
      return [order, []];
    }
    //authorize each product in the order
    const authorizations: Authorization[] = [];
    for (const product of products) {
      const authorization = new Authorization({
        email: order.email.toLowerCase(),
        sku: product.sku,
        date: order.date_iso8601,
        order: order.number,
        offer: offer.slug,
      });
      await authorization.save();
      authorizations.push(authorization);
    }
    order.status = 'completed';
    await order.save();
    //ping convertkit with the order details
    try {
      const user = new User({
        id: order.email,
        email: order.email,
        name: order.name || ''
      });
      await user.save();
      await recordPurchase(order);
    }
    catch (error) {
      console.error('Error recording purchase in ConvertKit:', error);
    }
    return [order, authorizations];
  };

  static async saveThriveOrder(data: any): Promise<[Order, Authorization[]]> {
    const { order, customer, base_product_label: slug } = data;

    // Create the order number based on the order.id from thrive, using the last 5 digits
    const orderNumber = `RED4-${order.id.slice(-8)}`;

    const existingOrder = await Order.get(orderNumber);
    if (existingOrder) {
      if (existingOrder.status === 'completed') {
        // If the order is already completed, return it
        console.log(`Order ${orderNumber} already exists and is completed.`);
        delete existingOrder.storage;
        const authorizations = await existingOrder.getAuthorizations();
        for (const auth of authorizations) {
          delete auth.storage;
        }
        return [existingOrder, authorizations];
      }
    }

    // Create the order object using the Order class
    const newOrder = new Order({
      id: orderNumber,
      number: orderNumber,
      date: order.date_iso8601,
      name: `${customer.first_name} ${customer.last_name}`.trim(),
      email: customer.email.toLowerCase(),
      slug: slug,
      total: parseInt(order.total) / 100,
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

    //ping convertkit with the order details
    try {
      const user = new User({
        id: newOrder.email,
        email: newOrder.email,
        name: newOrder.name || ''
      });
      await user.save();

      await recordPurchase(newOrder);
    } catch (error) {
      console.error('Error recording purchase in ConvertKit:', error);
    }
    return [newOrder, authorizations];

    //send an email to the user with the order details
  }

  static async saveStripeOrder(session: any): Promise<[Order, Authorization[]]> {
    //ensure we have a customer and id using assert
    assert(session.customer_details, 'No customer details');
    assert(session.customer_details.email, 'Missing customer email in session');
    assert(session.id, 'Missing session ID');
    
 // Generate a unique order number
    const orderNumber = `RED4-${session.id.slice(-8)}`;
    
    console.log('Looking up order:', orderNumber);
    //do we have an order already? that's completed?
    try{
      const existingOrder = await Order.get(orderNumber);
      if (existingOrder) {
        console.log('Found existing order:', existingOrder.number);
        if (existingOrder.status === 'completed') {
          // If the order is already completed, return it
          console.log(`Order ${orderNumber} already exists and is completed.`);
          delete existingOrder.storage;
          const authorizations = await existingOrder.getAuthorizations();
          for (const auth of authorizations) {
            delete auth.storage;
          }
          return [existingOrder, authorizations];
        }
      }
    }catch(error){
      console.error('Error checking existing order:', error);
    }

    // We've already validated that customer_email exists before calling this method
    const customerEmail = session.customer_details.email;
    //const customerEmail = session.customer_details.email.toLowerCase();
    
    // Create the order object using the Order class
    const newOrder = new Order({
      id: orderNumber,
      number: orderNumber,
      date: new Date().toISOString(),
      email: customerEmail,
      name: session.customer_details?.name || '',
      store: 'stripe',
      total: session.amount_total ? session.amount_total / 100 : 0, // Convert from cents
      status: 'pending'
    });
    console.log('saving new order:', newOrder);
    await newOrder.save();
    const authorizations: Authorization[] = [];

    //loop the line_items and get the product metadata
    for (const item of session.line_items.data) {
      const product = item.price.product;
      const metadata = product.metadata || {};
      const sku = metadata.sku || metadata.slug;
      const file = metadata.file || null;
      if (sku) {
        const authorization = new Authorization({
          email: customerEmail,
          sku: sku,
          download: file,
          name: product.name,
          date: newOrder.date,
          order: orderNumber,
          offer: sku
        });
        console.log('Creating authorization for SKU:', sku);
        await authorization.save();
        if (file) {
          const downloadUrl = await authorization.getDownloadUrl();
          if (downloadUrl) {
            authorization.link = downloadUrl;
          }
        }

        authorizations.push(authorization);
      }
    }
    
    newOrder.offer = authorizations.map(auth => auth.name).join(', ');
    newOrder.slug = authorizations.map(auth => auth.sku).join(', ');
    newOrder.status = 'completed';
    
    console.log('Finalizing order:', newOrder.number);
    await newOrder.save();

    //ping convertkit with the order details
    try {
      //add a user record
      const user = new User({
        id: newOrder.email,
        email: newOrder.email,
        name: newOrder.name || ''
      });
      await user.save();
      //record the purchase in ConvertKit
      //console.log('Recording purchase in ConvertKit for order:', newOrder);
      await recordPurchase(newOrder);
    } catch (error) {
      console.error('Error recording purchase in ConvertKit:', error);
    }
    return [newOrder, authorizations];
  }
}

// Type alias for backward compatibility with existing code
export type OrderData = Order;