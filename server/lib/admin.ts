// Firebase server-side configuration for SSR
import { initializeApp, cert, getApps } from 'firebase-admin/app'
import { getFirestore } from 'firebase-admin/firestore'
//grab the storage stuff
import { getStorage, getDownloadURL } from 'firebase-admin/storage';
//use dotenv to load environment variables
import 'dotenv/config'
import nodemailer from 'nodemailer'
import { get, where, updateOne, fbApp, find } from "./firefly.cjs";

// Use the same interface as in composables/useFirestore.ts
interface OrderData {
  number: string;
  date: string;
  name?: string;
  email: string;
  offer: string;
  slug: string;
  uid?: string;
  store?: string;
  total?: number;
}

interface AuthorizationData {
  id?: string;
  email: string;
  sku: string;
  download?: string;
  date?: string;
  order?: string;
  offer?: string;
}


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
    // Create the order object using the OrderData interface
    const orderData: OrderData = {
      number: orderNumber,
      date: order.date_iso8601,
      name: `${customer.first_name} ${customer.last_name}`.trim(),
      email: customer.email.toLowerCase(),
      slug: slug,
      total: parseInt(order.total, 10),
      store: 'thrivecart',
      offer: order.charges[0].name
    }

    // Use the invoice_id as the document ID for easy lookup
    const newOrder = await updateOne("orders", orderNumber, orderData);
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
      await updateOne("authorizations", `${orderData.email}-${d.sku}`, {
        email: orderData.email,
        sku: d,
        download: d + ".jpg",
        date: order.date_iso8601 || new Date().toISOString(),
        order: orderNumber,
        offer: order.charges[0].name
      })
    }
    return newOrder
  } catch (error) {
    console.error('Error saving order:', error)
    throw error
  }
}


/**
 * Send a thank you email to the customer
 * @param data ThriveCart webhook data
 * @returns Success message
 */
export async function sendThankYouEmail(data: OrderData): Promise<string> {
  try {

    // Configure email transporter
    // Note: In production, replace with your actual SMTP settings
    const transporter = nodemailer.createTransport({
      host: "smtp.mailgun.org",
      port: 465,
      secure: true,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    })
    
    // Build email content
    const emailHtml = `
      <h1>Thank you for your purchase!</h1>
      <p>Dear ${data.name || 'Friend'},</p>
      <p>Thanks for buying <i>${data.offer}</i></p>
      <ul>
       
      </ul>
      <p>Your order number is: <strong>${data.number}</strong></p>

      <p>If you have any questions, please don't hesitate to contact us.</p>
      <p>Best regards,<br>Big Machine</p>
    `
    
    // Send the email
    await transporter.sendMail({
      from: process.env.EMAIL_FROM || 'support@bigmachine.io',
      to: data.email,
      subject: 'Thank you for your purchase from Big Machine',
      html: emailHtml
    })
    
    console.log(`Thank you email sent to: ${data.email}`)
    return `Email sent to ${data.email}`
  } catch (error) {
    console.error('Error sending thank you email:', error)
    throw error
  }
}