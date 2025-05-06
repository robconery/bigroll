import { Firefly } from '../lib/firefly';

export class Product extends Firefly<Product> {
  sku: string;
  name: string;
  description?: string;
  summary?: string;
  download?: string;

  constructor(data: Partial<Product> = {}) {
    super(data);
    this.sku = data.sku || '';
    this.name = data.name || '';
    this.description = data.description || '';
    this.summary = data.summary || '';
    this.download = data.download || '';
  }
}