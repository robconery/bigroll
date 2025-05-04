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
import { User, Order, Authorization, Subscription } from '~/server/models';

export const useFirestore = () => {
  const { $firestore } = useNuxtApp()
  
  /**
   * Get user data from Firestore by email
   * @param email User's email address
   * @returns User data or null if not found
   */
  const getUserByEmail = async (email: string): Promise<User | null> => {
    try {
      const firestore = $firestore as Firestore
      // Use email directly as the document ID
      const userDocRef = doc(firestore, 'users', email)
      const userSnapshot = await getDoc(userDocRef)
      
      if (!userSnapshot.exists()) {
        return null
      }
      
      const userData = userSnapshot.data()
      
      return User.fromFirestore(userSnapshot.id, userData);
    } catch (error) {
      console.error('Error getting user by email:', error)
      throw error
    }
  }

  /**
   * Get all authorizations for a user by email
   * @param email User's email address
   * @returns Array of authorization data
   */
  const getAuthorizations = async (user: User): Promise<Authorization[]> => {
    try {
      const firestore = $firestore as Firestore
      const authsRef = collection(firestore, 'authorizations')
      const q = query(authsRef, where('email', '==', user.email))
      
      const querySnapshot = await getDocs(q)
      
      const authorizations: Authorization[] = []
      querySnapshot.forEach((doc) => {
        const authData = doc.data()
        authorizations.push(Authorization.fromFirestore(doc.id, authData));
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
  const checkAuthorized = async (email: string): Promise<User | null> => {
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
  const getOrdersByEmail = async (email: string): Promise<Order[]> => {
    try {
      console.log('Fetching orders for email:', email)
      const firestore = $firestore as Firestore
      const ordersRef = collection(firestore, 'orders')
      const q = query(
        ordersRef, 
        where('email', '==', email)
      )
      
      const querySnapshot = await getDocs(q)
      
      const orders: Order[] = []
      querySnapshot.forEach((doc) => {
        const orderData = doc.data()
        orders.push(Order.fromFirestore(doc.id, orderData));
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
  const getOrderByNumber = async (number: string): Promise<Order | null> => {
    try {
      const firestore = $firestore as Firestore
      // Use order number as the document ID as that's how it's stored in Firestore
      const orderDocRef = doc(firestore, 'orders', number)
      const orderSnapshot = await getDoc(orderDocRef)
      
      if (!orderSnapshot.exists()) {
        return null
      }
      
      const orderData = orderSnapshot.data()
      return Order.fromFirestore(orderSnapshot.id, orderData);
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
  const getSubscriptionByEmail = async (email: string): Promise<Subscription | null> => {
    try {
      const firestore = $firestore as Firestore
      // Use email directly as the document ID as that's how it's stored in Firestore
      const subscriptionDocRef = doc(firestore, 'subscriptions', email.toLowerCase())
      const subscriptionSnapshot = await getDoc(subscriptionDocRef)
      
      if (!subscriptionSnapshot.exists()) {
        return null
      }
      
      return Subscription.fromFirestore(subscriptionSnapshot.data());
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