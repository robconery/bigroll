import {sendEmailWithDownloads} from "../lib/email";

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const { email } = body;
  if (!email) {
    return { success: false, error: "Email is required" };
  }
  try {
    const res = await sendEmailWithDownloads(email);
    return { success: true };
  } catch (err) {
    console.error("Error sending email:", err);
    return { success: false, error: "Failed to send email" };
  }

})
