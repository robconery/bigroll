import { Firefly } from '../lib/firefly';
import { Product } from './';
export class Offer extends Firefly<Offer> {
  slug: string;
  name: string;
  thrive: string;
  price: number;
  deliverables: string[];
  constructor(data: Partial<Offer> = {}) {
    super(data);
    this.slug = data.slug || '';
    this.name = data.name || '';
    this.thrive = data.thrive || '';
    this.price = data.price || 0;
    this.deliverables = data.deliverables || [];
  }
  async getProducts(): Promise<Product[]> {
    return Product.where("sku", "in", this.deliverables);
  }
}