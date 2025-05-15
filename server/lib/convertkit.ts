const axios = require("axios");
const secret = process.env.KIT_SECRET;
import { Order, Offer } from '../models';

interface ConvertKitData {
  api_secret?: string;
  [key: string]: any;
}

// Define the payload structure
interface ConvertKitPayload {
  transaction_id: string;
  email_address: string;
  first_name: string;
  currency: string;
  transaction_time: string;
  subtotal: number;
  tax: number;
  shipping: number;
  discount: number;
  total: number;
  status: string;
  products: Array<{
    pid: string;
    lid: string;
    name: string;
    sku: string;
    unit_price: number;
    quantity: number;
  }>;
}

const post = function(stub: string, data: ConvertKitData = {}){
  data.api_secret = secret;
  const url = `https://api.convertkit.com/v3/${stub}`
  const config = {
    headers: {
      'Content-Type': 'application/json;charset=UTF-8',
    }
  };
  return axios.post(url, data, config);
}


export const recordPurchase = async function(order: Order){
  const payload: ConvertKitPayload = {
    "transaction_id": order.number || "",
    "email_address": order.email || "",
    "first_name": order.name?.split(' ')[0] || '',
    "currency": "USD",
    "transaction_time": new Date(order.date || new Date()).toISOString(),
    "subtotal": order.total || 0,
    "tax": 0.00,
    "shipping": 0.00,
    "discount": 0,
    "total": order.total || 0,
    "status": order.status || 'paid',
    "products": []
  }
  const offer = await Offer.find({ slug: order.slug });
  if (offer) {
    payload.products.push({
      "pid": offer.slug || "",
      "lid": `${offer.slug || ""}-1`,
      "name": offer.name || "",
      "sku": offer.slug || "",
      "unit_price": offer.price,
      "quantity": 1
    })
  }
  await post("purchases", payload);
  return true;
}
