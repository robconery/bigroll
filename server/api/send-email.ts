import {sendEmailWithDownloads} from "../lib/email";

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const { email } = body;
  
  if (!email) {
    console.log('No email provided');
    //return { success: false, error: "Email is required" };
    throw createError({ statusCode: 400, message: "Email is required" });
  }
  try {
    console.log('sending email with downloads to:', email);
    const res = await sendEmailWithDownloads(email);
    console.log('Email sent successfully:', res);
    return { success: true };
  } catch (err) {
    console.error("Error sending email:", err);
    throw createError({ statusCode: 500, message: "Failed to send email" });
  }

})
