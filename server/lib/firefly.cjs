import { initializeApp, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { assert } from "console";
import "dotenv/config";

const app = initializeApp({
  credential: cert({
    projectId: "project-8588976765518720764",
    privateKey: process.env.FIREBASE_PRIVATE_KEY,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
  }),
  storageBucket: "project-8588976765518720764.appspot.com",
});

const fb = getFirestore(app);

export const fbApp = app;

export const ref = function (collection) {
  return fb.collection(collection);
};

export const exists = async function (collection, key, val) {
  let out = null;
  const snap = await fb.collection(collection).where(key, "==", val).get();
  return !snap.empty;
};
export const orderBy = async function (
  collection,
  key,
  dir = "asc",
  limit = 500
) {
  let out = [];
  const snap = await fb
    .collection(collection)
    .orderBy(key, dir)
    .limit(limit)
    .get();
  if (!snap.empty) {
    snap.forEach((doc) => {
      let data = doc.data();
      data.id = doc.id;
      out.push(data);
    });
  }
  return out;
};

export const get = async function (collection, val) {
  let out = null;
  const snap = await fb.collection(collection).doc(val).get();
  if (!snap.empty) {
    out = snap.data();
    if (!out) return null;
    out.id = snap.id;
  }
  return out;
};
export const all = async function (collection) {
  let out = [];
  const snap = await fb.collection(collection).get();
  if (!snap.empty) {
    snap.forEach((doc) => {
      let data = doc.data();
      data.id = doc.id;
      out.push(data);
    });
  }
  return out;
};

export const find = async function (collection, key, val, limit = 500) {
  let out = [];
  const snap = await fb
    .collection(collection)
    .where(key, "==", val)
    .limit(limit)
    .get();
  if (!snap.empty) {
    snap.forEach((doc) => {
      let data = doc.data();
      data.id = doc.id;
      out.push(data);
    });
  }
  return out;
};
export const where = async function (collection, key, op, val) {
  let out = [];
  const snap = await fb.collection(collection).where(key, op, val).get();
  if (!snap.empty) {
    snap.forEach((doc) => {
      let data = doc.data();
      data.id = doc.id;
      out.push(data);
    });
  }
  return out;
};
export const whereAnd = async function (
  collection,
  wheres = [{ key, op, val }]
) {
  let out = [];
  let query = fb.collection(collection);
  for (let { key, op, val } of wheres) {
    console.log(key, op, val);
    query.where(key, op, val);
  }
  const snap = await query.get();
  if (!snap.empty) {
    snap.forEach((doc) => {
      let data = doc.data();
      data.id = doc.id;
      out.push(data);
    });
  }
  return out;
};

export const findOne = async function (collection, key, val) {
  let out = null;
  const snap = await fb.collection(collection).where(key, "==", val).get();
  if (!snap.empty) {
    out = snap.docs[0].data();
    out.id = snap.docs[0].id;
  }
  return out;
};

export const updateOne = async function (collection, key, val) {
  assert(collection, "Need a collection please");
  assert(key, "Need key please");
  assert(val, "Need val please");
  return fb.collection(collection).doc(key).set(val, { merge: true });
};

export const create = async function (collection, id, doc) {
  assert(collection, "Need a collection please");
  assert(id, "Need id please");
  await fb.collection(collection).doc(id).set(doc);
  return doc;
};
export const add = async function (collection, doc) {
  assert(collection, "Need a collection please");
  assert(doc, "Need doc please");
  const res = await fb.collection(collection).add(doc);
  doc.id = res.id;
  return doc;
};

export const remove = async function (collection, id) {
  assert(collection, "Need a collection please");
  assert(id, "Need id please");
  const res = await fb.collection(collection).doc(id).delete();
  return true;
};
