// import { defineEventHandler, readBody, H3Error, createError } from 'h3';
// import { User, Authorization, Subscription , Order} from '../models';
// import { getAuth } from 'firebase-admin/auth';

// export default defineEventHandler(async (event) => {
//   try {
//     // Get the Firebase ID token from the Authorization header
//     const authHeader = event.headers.get('Authorization');
//     if (!authHeader || !authHeader.startsWith('Bearer ')) {
//       throw createError({
//         statusCode: 401,
//         statusMessage: 'Unauthorized - No valid authentication token provided'
//       });
//     }

//     const idToken = authHeader.split('Bearer ')[1];
//     if (!idToken) {
//       throw createError({
//         statusCode: 401,
//         statusMessage: 'Unauthorized - No valid authentication token provided'
//       });
//     }

//     // Verify the ID token
//     const decodedToken = await getAuth().verifyIdToken(idToken);
//     if (!decodedToken || !decodedToken.email) {
//       throw createError({
//         statusCode: 401,
//         statusMessage: 'Unauthorized - Invalid token'
//       });
//     }

//     // Get request data
//     const body = await readBody(event);
//     const { name, email } = body || {};
    
//     // Ensure at least one field was provided for update
//     if ((name === undefined || name === null) && (email === undefined || email === null)) {
//       throw createError({
//         statusCode: 400,
//         statusMessage: 'Bad Request - No update data provided'
//       });
//     }

//     // Get the original email from the token (this is the current email we use to find records)
//     const originalEmail = decodedToken.email;

//     // Find the user by their original email
//     const user = await User.find({ email: originalEmail });
//     if (!user) {
//       throw createError({
//         statusCode: 404,
//         statusMessage: 'Not Found - User not found'
//       });
//     }

//     // Update the user record
//     if (name) {
//       user.name = name;
//     }
    
//     // Handle email change
//     if (email && email !== originalEmail) {
//       // Validate email format
//       const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
//       if (!emailRegex.test(email)) {
//         throw createError({
//           statusCode: 400,
//           statusMessage: 'Bad Request - Invalid email format'
//         });
//       }
      
//       // Update user email
//       user.email = email;

//       // Update all authorizations with the new email
//       const authorizations = await Authorization.filter({ email: originalEmail });
//       for (const auth of authorizations) {
//         auth.email = email;
//         // Since the ID is based on email-sku, we need to update that too
//         auth.id = `${email}-${auth.sku}`;
//         await auth.save();
//       }
//       const orders = await Order.filter({ email: originalEmail });
//       for (const order of orders) {
//         order.email = email;

//         await order.save();
//       }

//       // Update subscription if exists
//       const subscription = await Subscription.find({ email: originalEmail });
//       if (subscription) {
//         subscription.email = email;
//         await subscription.save();
//       }

//       // Update Firebase Auth record
//       // Note: This only updates Firebase records, it doesn't send email verification
//       // If email verification is needed, you should implement that separately
//       try {
//         const userRecord = await getAuth().getUserByEmail(originalEmail);
//         await getAuth().updateUser(userRecord.uid, {
//           email: email,
//           emailVerified: false // Reset email verified flag as this is a new email
//         });
//       } catch (error: any) {
//         console.error('Error updating Firebase Auth record:', error);
        
//         // If the Firebase Auth update fails specifically because the email is already in use,
//         // we should not proceed with the update
//         if (error.code === 'auth/email-already-exists') {
//           throw createError({
//             statusCode: 409,
//             statusMessage: 'Email already in use by another account'
//           });
//         }
        
//         // For other errors, continue with the update as we've already modified the database records
//       }
//     }

//     // Save the updated user
//     await user.save();

//     // Return success response
//     return {
//       success: true,
//       user: {
//         email: user.email,
//         name: user.name
//       }
//     };

//   } catch (error) {
//     console.error('Profile update error:', error);
    
//     // If it's already a H3Error, just rethrow it
//     if (error instanceof H3Error) {
//       throw error;
//     }
    
//     // Handle specific error types
//     if (error instanceof Error) {
//       // Check if it's a specific Firebase error
//       if (error.message?.includes('auth/') || error.message?.includes('Firebase')) {
//         throw createError({
//           statusCode: 400,
//           statusMessage: `Authentication error: ${error.message}`
//         });
//       }
      
//       // For database or other errors
//       if (error.message?.includes('database') || error.message?.includes('Firestore')) {
//         throw createError({
//           statusCode: 500,
//           statusMessage: `Database error: ${error.message}`
//         });
//       }
//     }

//     // For any other errors
//     throw createError({
//       statusCode: 500,
//       statusMessage: 'Internal Server Error - Failed to update profile'
//     });
//   }
// });
