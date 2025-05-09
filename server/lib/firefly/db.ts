import admin from 'firebase-admin';
import assert from 'assert';
import "dotenv/config";


interface FirebaseConfig {
  credential: admin.credential.Credential;
}

interface WhereClause {
  key: string;
  op: admin.firestore.WhereFilterOp;
  val: any;
}

const config: FirebaseConfig = {
  //check to ensure the environment variables are set
  credential: admin.credential.cert({
    private_key: process.env.FIREBASE_PRIVATE_KEY,
    client_email: process.env.FIREBASE_CLIENT_EMAIL,
    projectId: "project-8588976765518720764",
    storageBucket: "project-8588976765518720764.appspot.com",
  } as admin.ServiceAccount),
};

admin.initializeApp(config);


class DB {
  fb: admin.firestore.Firestore;
  storage: admin.storage.Storage;
  constructor() {

    assert(process.env.FIREBASE_PRIVATE_KEY, "FIREBASE_PRIVATE_KEY is not set");
    assert(process.env.FIREBASE_CLIENT_EMAIL, "FIREBASE_CLIENT_EMAIL is not set");
  
    this.fb = admin.firestore();
    this.storage = admin.storage();
  }

  ref(collection: string): admin.firestore.CollectionReference {
    return this.fb.collection(collection);
  }

  async exists(collection: string, key: string, val: any): Promise<boolean> {
    const snap = await this.fb
      .collection(collection)
      .where(key, "==", val)
      .get();
    return snap.empty === false;
  }

  async orderBy(collection: string, key: string, dir: 'asc' | 'desc' = "asc", limit = 500): Promise<any[]> {
    assert(collection, "Need a collection please");
    assert(key, "Need key please");
    const out: any[] = [];
    const snap = await this.fb
      .collection(collection)
      .orderBy(key, dir)
      .limit(limit)
      .get();
    if (snap.empty === false) {
      snap.forEach((doc) => {
        const data = doc.data();
        data.id = doc.id;
        out.push(data);
      });
    }
    return out;
  }

  async get(collection: string, val: string | number): Promise<any | null> {
    assert(collection, "Need a collection please");
    assert(val, "Need val please");

    let out = null;
    const snap = await this.fb.collection(collection).doc(val.toString()).get();
    // DocumentSnapshot doesn't have empty property
    if (snap.exists) {
      out = snap.data();
      if (!out) return null;
      out.id = snap.id;
    }
    return out;
  }

  async all(collection: string): Promise<any[]> {
    assert(collection, "Need a collection please");
    const out: any[] = [];
    const snap = await this.fb.collection(collection).get();
    if (snap.empty === false) {
      snap.forEach((doc) => {
        const data = doc.data();
        data.id = doc.id;
        out.push(data);
      });
    }
    return out;
  }

  async find(collection: string, key: string, val: any, limit = 500): Promise<any[]> {
    assert(collection, "Need a collection please");
    assert(key, "Need key please");
    assert(val, "Need val please");
    const out: any[] = [];
    const snap = await this.fb
      .collection(collection)
      .where(key, "==", val)
      .limit(limit)
      .get();
    if (snap.empty === false) {
      snap.forEach((doc) => {
        const data = doc.data();
        data.id = doc.id;
        out.push(data);
      });
    }
    return out;
  }

  async where(collection: string, key: string, op: admin.firestore.WhereFilterOp, val: any): Promise<any[]> {
    assert(collection, "Need a collection please");
    assert(key, "Need key please");
    assert(op, "Need op please");
    const out: any[] = [];
    const snap = await this.fb.collection(collection).where(key, op, val).get();
    if (snap.empty === false) {
      snap.forEach((doc) => {
        const data = doc.data();
        data.id = doc.id;
        out.push(data);
      });
    }
    return out;
  }

  async whereAnd(collection: string, wheres: WhereClause[]): Promise<any[]> {
    const out: any[] = [];
    // Start with a collection reference
    let query = this.fb.collection(collection) as admin.firestore.Query;
    for (const { key, op, val } of wheres) {
      query = query.where(key, op, val);
    }
    const snap = await query.get();
    if (snap.empty === false) {
      snap.forEach((doc) => {
        const data = doc.data();
        data.id = doc.id;
        out.push(data);
      });
    }
    return out;
  }

  async findOne(collection: string, key: string, val: any): Promise<any | null> {
    let out = null;
    const snap = await this.fb
      .collection(collection)
      .where(key, "==", val)
      .get();
    if (snap.empty === false) {
      out = snap.docs[0].data();
      out.id = snap.docs[0].id;
    }
    return out;
  }

  async updateOne(collection: string, key: string, val: any): Promise<admin.firestore.WriteResult> {
    assert(collection, "Need a collection please");
    assert(key, "Need key please");
    assert(val, "Need val please");
    return this.fb.collection(collection).doc(key).set(val, { merge: true });
  }

  async update(collection: string, id: string | number, doc: any): Promise<any> {
    assert(collection, "Need a collection please");
    assert(id, "Need id please");

    //check to ensure the id is a string
    const idStr = id.toString();

    await this.fb.collection(collection).doc(idStr).set(doc);
    return doc;
  }

  async add(collection: string, doc: any): Promise<any> {
    assert(collection, "Need a collection please");
    assert(doc, "Need doc please");
    const res = await this.fb.collection(collection).add(doc);
    doc.id = res.id;
    return doc;
  }

  async delete(collection: string, id: string | number): Promise<boolean> {
    assert(collection, "Need a collection please");
    assert(id, "Need id please");
    await this.fb.collection(collection).doc(id.toString()).delete();
    return true;
  }
}

export const init = (): DB => {
  return new DB();
};