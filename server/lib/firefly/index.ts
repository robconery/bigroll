import assert from 'assert';
import { init } from './db';
import * as Inflector from 'inflected';
import * as admin from 'firebase-admin';

const db = init();

interface FireflyData {
  id?: string | number;
  created_at?: string;
  timestamp?: number;
  [key: string]: any;
}

const formattedTableName = (className: string): string => {
  const underscored = Inflector.underscore(className);
  return Inflector.pluralize(underscored);
};

export class Firefly<T extends Firefly<T>> {
  id!: string; // Using the non-null assertion operator to fix initialization error
  created_at!: string;
  timestamp!: number;

  [key: string]: any;

  static async update<T extends Firefly<T>>(this: { new(data: any): T }, id: string | number, data: any): Promise<any> {
    return db.updateOne(formattedTableName(this.name), id.toString(), data);
    
  }

  static where<T extends Firefly<T>>(this: { new(data: any): T }, key: string, op: admin.firestore.WhereFilterOp, val: any) {
    return db.where(formattedTableName(this.name), key, op, val);
  }

  static async whereKeyExists<T extends Firefly<T>>(this: { new(data: any): T }, key: string) {
    return db.orderBy(formattedTableName(this.name), key);
  }

  static async create<T extends Firefly<T>>(this: { new(data: any): T }, args: FireflyData): Promise<T> {
    const newThing = new this(args);
    return newThing.save() as Promise<T>;
  }

  static async all<T extends Firefly<T>>(this: { new(data: any): T }): Promise<T[]> {
    const results = await db.all(formattedTableName(this.name));
    return results.map(data => new this(data));
  }

  static async delete(id: string | number) {
    return db.delete(formattedTableName(this.name), id.toString());
  }

  static async get<T extends Firefly<T>>(this: { new(data: any): T }, id: string | number): Promise<T | null> {
    const data = await db.get(formattedTableName(this.name), id.toString());
    if (data) return new this(data);
    return null;
  }

  static async exists(id: string | number): Promise<boolean> {
    const data = await db.get(formattedTableName(this.name), id.toString());
    return data !== null;
  }

  static async saveMany<T extends Firefly<T>>(this: { new(data: any): T }, docs: T[] = []): Promise<T[]> {
    const saved: T[] = [];
    for (const doc of docs) {
      const res = await doc.save() as T;
      saved.push(res);
    }
    return saved;
  }

  static async find<T extends Firefly<T>>(this: { new(data: any): T }, criteria: Record<string, any>): Promise<T | null> {
    const key = Object.keys(criteria)[0];
    const val = Object.values(criteria)[0];
    const found = await db.findOne(formattedTableName(this.name), key, val);
    if (found) return new this(found);
    return null;
  }

  static async filter<T extends Firefly<T>>(this: { new(data: any): T }, criteria: Record<string, any>): Promise<T[]> {
    const key = Object.keys(criteria)[0];
    const val = Object.values(criteria)[0];
    const found = await db.find(formattedTableName(this.name), key, val);
    const out: T[] = [];
    for (const record of found) {
      out.push(new this(record));
    }
    return out;
  }

  static async deleteMany(criteria: Record<string, any>): Promise<number> {
    const key = Object.keys(criteria)[0];
    const val = Object.values(criteria)[0];
    const collection = formattedTableName(this.name);
    const found = await db.find(collection, key, val);
    let deleted = 0;
    for (const doc of found) {
      await db.delete(collection, doc.id);
      deleted++;
    }
    return deleted;
  }

  constructor(args: FireflyData) {
    //force the id assignment
    assert(args, "Can't save something without data");
    if (!args.id) {
      //create a random id 12 characters long
      args.id = Math.random().toString(36).substring(2, 14);
    } else {
      //ensure the id is a string
      args.id = String(args.id);
    }
    
    Object.assign(this, args);
    this.storage = db.storage;
    this.created_at = args.created_at || new Date().toUTCString();
    this.timestamp = new Date().getTime();
  }

  //for testing mostly
  collection(): string {
    return formattedTableName(this.constructor.name);
  }

  async save(): Promise<this> {
    let saved = null;
    //strip the class stuff
    const data = this._toFirestore();
    
    if (this.id) {
      saved = await db.update(this.collection(), this.id.toString(), data);
    } else {
      saved = await db.add(this.collection(), data);
    }

    return this;
  }

  async delete() {
    return db.delete(this.collection(), this.id.toString());
  }
  /**
   * Internal method to convert the model to plain object for Firestore storage
   * This replaces the toFirestore method in individual models
   */
  _toFirestore(): Record<string, any> {
    if (this.storage) {
      delete this.storage; // Remove the storage property if it exists
    }
    if (this.link) {
      delete this.link; // Remove the link property if it exists
    }
    // Create a plain object copy without any methods
    const json = JSON.stringify(this);
    const data = JSON.parse(json);
    
    // Process fields that require special handling
    if (data.email) {
      data.email = data.email.toLowerCase();
    }

    return data;
  }
}

export default Firefly;