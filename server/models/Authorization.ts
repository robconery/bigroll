import { Firefly } from '../lib/firefly';
import { getStorage, getDownloadURL } from 'firebase-admin/storage';
/**
 * Authorization model representing a user's access permission to a product
 */
export class Authorization extends Firefly<Authorization> {
  email: string;
  sku: string;
  download?: string;
  date?: string;
  order?: string;
  offer?: string;
  link?: string; // For download URL

  constructor(data: Partial<Authorization> = {}) {
    super(data);
    this.email = data.email?.toLowerCase() || '';
    this.sku = data.sku || '';
    this.download = data.download;
    this.date = data.date || new Date().toISOString();
    this.order = data.order;
    this.offer = data.offer;
    this.link = data.link || "";
    //override the id to be email-sku
    this.id = `${this.email}-${this.sku}`;
  }

  async getDownloadUrl(): Promise<string | null> {
    if (!this.download) {
      return null;
    }
    let storagePath = this.download
    const storage = getStorage();
    const bucket = storage.bucket('project-8588976765518720764.appspot.com'); // Replace with your actual bucket name
    const storageRef = bucket.file(storagePath);
    // Create a reference from the storage path
    //const storageRef = this.storage.bucket().file(storagePath)
    try {
      // Generate a signed URL that expires in 2 hours (7200 seconds)
      const signedUrl = await getDownloadURL(storageRef)
      
      // For web-based Firebase Storage, we can't directly set expiration on client side
      // The URL itself is already time-limited by Firebase
      // We append a token parameter to help track links
      const expiryTime = Date.now() + 2 * 60 * 60 * 1000 // 2 hours in milliseconds
      const tokenizedUrl = `${signedUrl}&token=${expiryTime}`
      return tokenizedUrl
    } catch (error) {
      console.error('Error getting signed URL:', error)
      return "";
    }
  }

  static async getByEmail(email: string): Promise<Authorization[]> {
    const authorizations = await Authorization.filter({ email: email.toLowerCase() });

    if (authorizations.length === 0) {
      console.log('No matching documents.');
      return [];
    }
    const out = [];
    for(let doc of authorizations) {
      if (doc.download && doc.download.length > 0) {
        out.push(doc);
      }
    }
    return out;
  }
}

// Type alias for backward compatibility with existing code
export type AuthorizationData = Authorization;