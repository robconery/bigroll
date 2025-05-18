import { defineEventHandler, readBody, createError } from 'h3'
import { Order } from '../models/Order'

export default defineEventHandler(async (event) => {
  // This is the thrive webhook receiver that will validate the webhook ping and save the data to the database
  const body = await readBody(event)
  
  try {
    // Check if this is a valid Thrive webhook event
    if (body.event === 'order.success') {
      // Save the order using Order.saveThriveOrder
      const [order, authorizations] = await Order.saveThriveOrder(body)
      
      return {
        success: true,
        order: {
          id: order.id,
          number: order.number,
          status: order.status
        },
        authorizationsCount: authorizations.length
      }
    } else {
      // If it's not an order.success event, just acknowledge receipt
      return { 
        success: true, 
        message: `Event '${body.event}' received but not processed` 
      }
    }
  } catch (error: any) {
    console.error('Error processing Thrive webhook:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Error processing Thrive webhook',
      data: {
        message: error.message || 'Unknown error'
      }
    })
  }
});