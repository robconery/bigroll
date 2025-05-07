import { defineEventHandler, readBody } from 'h3'

export default defineEventHandler(async (event) => {

  //this is the thrive webook receiver that will validate the webhook ping and save the data to the database
  const body = await readBody(event)
  const { event: eventType, data } = body

  //save the order 

  //save the authorization

  //send off the email

});