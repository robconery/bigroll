/**
 * Authorization model representing a user's access permission to a product
 */
export class Authorization {
  id: string;
  email: string;
  sku: string;
  download?: string;
  date?: string;
  order?: string;
  offer?: string;
  link?: string; // For download URL

  constructor(data: Partial<Authorization> = {}) {
    this.id = data.id || '';
    this.email = data.email?.toLowerCase() || '';
    this.sku = data.sku || '';
    this.download = data.download;
    this.date = data.date || new Date().toISOString();
    this.order = data.order;
    this.offer = data.offer;
    this.link = data.link;
  }

  /**
   * Creates an Authorization object from Firestore data
   */
  static fromFirestore(id: string, data: any): Authorization {
    return new Authorization({
      id: id,
      email: data.email,
      sku: data.sku,
      download: data.download,
      date: data.date,
      order: data.order,
      offer: data.offer,
      link: data.link
    });
  }

  /**
   * Converts Authorization object to a plain object for Firestore
   */
  toFirestore(): Record<string, any> {
    const auth: Record<string, any> = {
      email: this.email.toLowerCase(),
      sku: this.sku
    };

    if (this.download) auth.download = this.download;
    if (this.date) auth.date = this.date;
    if (this.order) auth.order = this.order;
    if (this.offer) auth.offer = this.offer;
    
    // link is a runtime property, not stored in Firestore
    
    return auth;
  }
}

// Type alias for backward compatibility with existing code
export type AuthorizationData = Authorization;