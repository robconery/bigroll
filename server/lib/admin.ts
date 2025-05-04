// Firebase server-side configuration for SSR
import { initializeApp, cert, getApps } from 'firebase-admin/app'
import { getFirestore } from 'firebase-admin/firestore'
//grab the storage stuff
import { getStorage, getDownloadURL } from 'firebase-admin/storage';
//use dotenv to load environment variables
import 'dotenv/config'
// Removed nodemailer import as it's now in the email module
import { get, where, updateOne, fbApp, find } from "./firefly.cjs";
import { sendThankYouEmail } from './email';
import { Order, Authorization } from '../models';

// Use the imported model classes instead of interfaces

const storage = getStorage(fbApp);

const getSignedUrl = async (path: string): Promise<string> => {
  
  let storagePath = path
  
  // Create a reference from the storage path
  const storageRef = storage.bucket().file(storagePath)
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

export const getDownloadsByEmail = async (email: string) => {
  const authorizations = await find("authorizations", "email", email);

  if (authorizations.length === 0) {
    console.log('No matching documents.');
    return [];
  }
  const out = [];
  for(let doc of authorizations) {
    if (doc.download && doc.download.length > 0) {
      const downloadUrl = await getSignedUrl(doc.download);
      doc.link = downloadUrl;
      if (downloadUrl && downloadUrl.length > 0)
        out.push(doc);
    }
  }
  return out;
}


export async function saveOrder(data: any): Promise<any> {
  try {
    const { order, customer, base_product_label: slug } = data
    
    //create the order number based on the order.id from thrive, using the last 5 digits
    const orderNumber = `RED4-${order.id.slice(-8)}`
    
    // Create the order object using the Order class
    const orderData = new Order({
      number: orderNumber,
      date: order.date_iso8601,
      name: `${customer.first_name} ${customer.last_name}`.trim(),
      email: customer.email.toLowerCase(),
      slug: slug,
      total: parseInt(order.total, 10),
      store: 'thrivecart',
      offer: order.charges[0].name
    });

    // Use the invoice_id as the document ID for easy lookup
    const newOrder = await updateOne("orders", orderNumber, orderData.toFirestore());
    console.log(`Order saved: ${order.invoice_id}`)
    
    //authorize things
    const offer = await get("offers", order.charges[0].label);
    if (!offer) {
      console.error(`Offer not found for Thrive ID: ${order.id}`)
      return "Offer not found"
    }
    console.log(`Offer found: ${offer.name}`)
    //authorize
    for (let d of offer.deliverables) {
      const authorization = new Authorization({
        email: orderData.email,
        sku: d,
        download: d + ".jpg",
        date: order.date_iso8601 || new Date().toISOString(),
        order: orderNumber,
        offer: order.charges[0].name
      });
      
      await updateOne("authorizations", `${orderData.email}-${d.sku}`, authorization.toFirestore());
    }
    return newOrder
  } catch (error) {
    console.error('Error saving order:', error)
    throw error
  }
}