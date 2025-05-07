import { 
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  type DocumentData,
  type Firestore,
  type QuerySnapshot
} from 'firebase/firestore'

export const useFirestore = () => {
  const { $firestore } = useNuxtApp()
  
  /**
   * Get user data from Firestore by email
   * @param email User's email address
   * @returns User data or null if not found
   */
  const getUserByEmail = async (email: string): Promise<any | null> => {
    try {
      const firestore = $firestore as Firestore
      // Use email directly as the document ID
      const userDocRef = doc(firestore, 'users', email)
      const userSnapshot = await getDoc(userDocRef)
      
      if (!userSnapshot.exists()) {
        return null
      }
      
      const userData = userSnapshot.data()
      // Return the raw data with ID added
      return {
        id: userSnapshot.id,
        ...userData
      };
    } catch (error) {
      console.error('Error getting user by email:', error)
      throw error
    }
  }

  /**
   * Get all authorizations for a user by email
   * @param user The user object to get authorizations for
   * @returns Array of authorization data
   */
  const getAuthorizations = async (user: any): Promise<any[]> => {
    try {
      const firestore = $firestore as Firestore
      const authsRef = collection(firestore, 'authorizations')
      const q = query(authsRef, where('email', '==', user.email))
      
      const querySnapshot = await getDocs(q)
      
      const authorizations: any[] = []
      querySnapshot.forEach((doc) => {
        const authData = doc.data()
        // Return raw data with ID added
        authorizations.push({
          id: doc.id,
          ...authData
        });
      })

      return authorizations
    } catch (error) {
      console.error('Error getting authorizations by email:', error)
      throw error
    }
  }

  /**
   * Get a complete user profile including authorizations
   * @param email User's email address
   * @returns User data with authorizations or null if not found
   */
  const checkAuthorized = async (email: string): Promise<any | null> => {
    try {
      // Get user data and authorizations in parallel
      const user = await getUserByEmail(email)
      if (!user) {
        return null
      }
      const authorizations = await getAuthorizations(user)
      // Add authorizations to user object
      user.authorizations = authorizations;
      return user;
    } catch (error) {
      console.error('Error getting user with authorizations:', error)
      throw error
    }
  }

  /**
   * Get all orders for a user by email
   * @param email User's email address
   * @returns Array of order data
   */
  const getOrdersByEmail = async (email: string): Promise<any[]> => {
    try {
      console.log('Fetching orders for email:', email)
      const firestore = $firestore as Firestore
      const ordersRef = collection(firestore, 'orders')
      const q = query(
        ordersRef, 
        where('email', '==', email)
      )
      
      const querySnapshot = await getDocs(q)
      
      const orders: any[] = []
      querySnapshot.forEach((doc) => {
        const orderData = doc.data()
        // Return raw data with ID added
        orders.push({
          id: doc.id,
          ...orderData
        });
      })
      return orders
    } catch (error) {
      console.error('Error getting orders by email:', error)
      return []
    }
  }

  /**
   * Get an order by its number
   * @param number Order number
   * @returns Order data or null if not found
   */
  const getOrderByNumber = async (number: string): Promise<any | null> => {
    try {
      const firestore = $firestore as Firestore
      // Use order number as the document ID as that's how it's stored in Firestore
      const orderDocRef = doc(firestore, 'orders', number)
      const orderSnapshot = await getDoc(orderDocRef)
      
      if (!orderSnapshot.exists()) {
        return null
      }
      
      const orderData = orderSnapshot.data()
      // Return raw data with ID added
      return {
        id: orderSnapshot.id,
        ...orderData
      };
    } catch (error) {
      console.error('Error getting order by number:', error)
      return null
    }
  }

  /**
   * Get subscription data for a user by email
   * @param email User's email address
   * @returns Subscription data or null if not found
   */
  const getSubscriptionByEmail = async (email: string): Promise<any | null> => {
    try {
      const firestore = $firestore as Firestore
      // Use email directly as the document ID as that's how it's stored in Firestore
      const subscriptionDocRef = doc(firestore, 'subscriptions', email.toLowerCase())
      const subscriptionSnapshot = await getDoc(subscriptionDocRef)
      
      if (!subscriptionSnapshot.exists()) {
        return null
      }
      
      // Return raw data with ID added
      return {
        id: subscriptionSnapshot.id,
        ...subscriptionSnapshot.data()
      };
    } catch (error) {
      console.error('Error getting subscription by email:', error)
      return null
    }
  }

  return {
    getUserByEmail,
    getAuthorizations,
    checkAuthorized,
    getOrdersByEmail,
    getOrderByNumber,
    getSubscriptionByEmail
  }
}