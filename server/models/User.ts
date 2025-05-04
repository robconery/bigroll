import { Authorization } from './Authorization';

/**
 * User model representing a user in the system
 */
export class User {
  id: string;
  email: string;
  name?: string;
  uid: string;
  authorizations?: Authorization[];

  constructor(data: Partial<User> = {}) {
    this.id = data.id || '';
    this.email = data.email?.toLowerCase() || '';
    this.name = data.name;
    this.uid = data.uid || '';
    this.authorizations = data.authorizations || [];
  }

  /**
   * Creates a User object from Firestore data
   */
  static fromFirestore(id: string, data: any): User {
    return new User({
      id: id,
      email: data.email,
      name: data.name,
      uid: data.uid
    });
  }

  /**
   * Converts User object to a plain object for Firestore
   */
  toFirestore(): Record<string, any> {
    const user: Record<string, any> = {
      email: this.email.toLowerCase(),
      uid: this.uid
    };

    if (this.name) user.name = this.name;
    
    // authorizations are stored separately in Firestore
    
    return user;
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
}

// Type alias for backward compatibility with existing code
export type UserData = User;

// Type alias for User with authorizations
export type UserWithAuthorizations = User;