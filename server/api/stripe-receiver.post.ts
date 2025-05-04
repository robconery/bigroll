import { defineEventHandler, readBody } from 'h3'

export default defineEventHandler(async (event) => {

  //this is the stripe webhook receiver that will go off when a checkout session is completed
  //it will receive the event from stripe and then send it to the stripe service
  const body = await readBody(event)

});