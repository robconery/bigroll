import { Authorization } from './Authorization';
import { Firefly } from '../lib/firefly';

/**
 * User model representing a user in the system
 */
export class User extends Firefly<User> {
  email: string;
  name?: string;
  uid: string;
  authorizations?: Authorization[];

  constructor(data: Partial<User> = {}) {
    super(data);
    this.email = data.email?.toLowerCase() || '';
    this.name = data.name;
    this.uid = data.uid || '';
    this.authorizations = data.authorizations || [];
  }

  /**
   * Adds authorization to the user
   */
  addAuthorization(authorization: Authorization): void {
    if (!this.authorizations) {
      this.authorizations = [];
    }
    this.authorizations.push(authorization);
  }

  /**
   * Checks if the user is authorized for a specific SKU
   */
  isAuthorizedFor(sku: string): boolean {
    if (!this.authorizations) return false;
    return this.authorizations.some(auth => auth.sku === sku);
  }

  static async getDownloads(email: string){
    const authorizations = await Authorization.filter({ email: email.toLowerCase() });

    if (authorizations.length === 0) {
      console.log('No matching documents.');
      return [];
    }
    const out = [];
    for(let doc of authorizations) {
      if (doc.download && doc.download.length > 0) {
        const downloadUrl = await doc.getDownloadUrl();
        if (downloadUrl && downloadUrl.length > 0)
          out.push(doc);
      }
    }
    return out;
  }
}

// We no longer need these type aliases as User class is properly typed
// Keeping them for backward compatibility
export type UserData = User;
export type UserWithAuthorizations = User;