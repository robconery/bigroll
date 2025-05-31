import { Firefly } from '../lib/firefly';

/**
 * Post model representing a blog post in the system 📝
 */
export class Post extends Firefly<Post> {
  key: string;
  slug: string;
  tag?: string;
  title: string;
  excerpt?: string;
  body?: string;
  image?: string;
  published: boolean;
  published_at?: string;
  created_at: string;

  constructor(data: Partial<Post> = {}) {
    super(data);
    this.key = data.key || this.generateUUID();
    this.slug = data.slug || '';
    this.tag = data.tag;
    this.title = data.title || '';
    this.excerpt = data.excerpt;
    this.body = data.body;
    this.image = data.image;
    this.published = data.published ?? false;
    this.published_at = data.published_at;
    this.created_at = new Date().toISOString();
  }
  
  /**
   * Generates a UUID for the post 🆔
   */
  private generateUUID(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }

  /**
   * Creates a published post 🚀
   */
  static createPublished(data: Partial<Post>): Post {
    return new Post({
      ...data,
      published: true,
      published_at: new Date().toISOString(),
    });
  }

  /**
   * Creates a draft post 📄
   */
  static createDraft(data: Partial<Post>): Post {
    return new Post({
      ...data,
      published: false,
    });
  }

  /**
   * Gets all published posts 📚
   */
  static async getPublished(): Promise<Post[]> {
    return Post.filter({ published: true });
  }

  /**
   * Publishes the post 📢
   */
  publish(): Post {
    this.published = true;
    this.published_at = new Date().toISOString();
    return this;
  }

  /**
   * Converts to string representation
   */
  toString(): string {
    return `Post: ${this.title} (${this.published ? 'Published' : 'Draft'})`;
  }

  /**
   * Converts to JSON
   */
  toJson() {
    return this._toFirestore();
  }
}

// Type alias for backward compatibility with existing code
export type PostData = Post;
