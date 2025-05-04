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

// Types for user and authorization data
interface UserData {
  id: string;
  email: string;
  name?: string;
  uid: string;
}

interface AuthorizationData {
  id: string;
  email: string;
  sku: string;
  download?: string;
  date?: string;
  order?: string;
  offer?: string;
}

interface OrderData {
  id: string;
  number: string;
  date: string;
  name?: string;
  email: string;
  slug: string;
  offer: string;
  uid?: string;
  store?: string;
  total?: number;
}

interface SubscriptionData {
  email: string;
  plan: string;
  stripe_customer_id: string;
  stripe_sub_id: string;
  current_period_start: { seconds: number };
  current_period_end: { seconds: number };
  interval: string;
  date: { seconds: number };
}

interface UserWithAuthorizations extends UserData {
  authorizations: AuthorizationData[];
}

export const useFirestore = () => {
  const { $firestore } = useNuxtApp()
  
  /**
   * Get user data from Firestore by email
   * @param email User's email address
   * @returns User data or null if not found
   */
  const getUserByEmail = async (email: string): Promise<UserData | null> => {
    try {
      const firestore = $firestore as Firestore
      // Use email directly as the document ID
      const userDocRef = doc(firestore, 'users', email)
      const userSnapshot = await getDoc(userDocRef)
      
      if (!userSnapshot.exists()) {
        return null
      }
      
      const userData = userSnapshot.data()
      
      return {
        id: userSnapshot.id,
        email: userData.email,
        name: userData.name,
        uid: userData.uid
      } as UserData
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
  const getAuthorizations = async (user: UserData): Promise<AuthorizationData[]> => {
    try {
      const firestore = $firestore as Firestore
      const authsRef = collection(firestore, 'authorizations')
      const q = query(authsRef, where('email', '==', user.email))
      
      const querySnapshot = await getDocs(q)
      
      const authorizations: AuthorizationData[] = []
      querySnapshot.forEach((doc) => {
        const authData = doc.data()
        authorizations.push({
          id: doc.id,
          email: authData.email,
          sku: authData.sku,
          download: authData.download,
          date: authData.date,
          order: authData.order,
          offer: authData.offer
        } as AuthorizationData)
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
  const checkAuthorized = async (email: string): Promise<UserWithAuthorizations | null> => {
    try {
      // Get user data and authorizations in parallel
      const user = await getUserByEmail(email)
      if (!user) {
        return null
      }
      const authorizations = await getAuthorizations(user)
      // Combine user data with authorizations
      return {
        ...user,
        authorizations
      }
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
  const getOrdersByEmail = async (email: string): Promise<OrderData[]> => {
    try {
      console.log('Fetching orders for email:', email)
      const firestore = $firestore as Firestore
      const ordersRef = collection(firestore, 'orders')
      const q = query(
        ordersRef, 
        where('email', '==', email)
      )
      
      const querySnapshot = await getDocs(q)
      
      const orders: OrderData[] = []
      querySnapshot.forEach((doc) => {
        const orderData = doc.data()
        orders.push({
          id: doc.id,
          number: orderData.number,
          date: orderData.date,
          email: orderData.email,
          store: orderData.store,
          offer: orderData.offer,
          slug: orderData.slug,
          name: orderData.name,
          total: orderData.total,
        } as OrderData)
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
  const getOrderByNumber = async (number: string): Promise<OrderData | null> => {
    try {
      const firestore = $firestore as Firestore
      // Use order number as the document ID as that's how it's stored in Firestore
      const orderDocRef = doc(firestore, 'orders', number)
      const orderSnapshot = await getDoc(orderDocRef)
      
      if (!orderSnapshot.exists()) {
        return null
      }
      
      const orderData = orderSnapshot.data()
      return {
        id: orderSnapshot.id,
        number: orderData.number,
        date: orderData.date,
        email: orderData.email,
        status: orderData.status,
        total: orderData.total,
        items: orderData.items || [],
        name: orderData.name,
        slug: orderData.slug,
        offer: orderData.offer
      } as OrderData
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
  const getSubscriptionByEmail = async (email: string): Promise<SubscriptionData | null> => {
    try {
      const firestore = $firestore as Firestore
      // Use email directly as the document ID as that's how it's stored in Firestore
      const subscriptionDocRef = doc(firestore, 'subscriptions', email.toLowerCase())
      const subscriptionSnapshot = await getDoc(subscriptionDocRef)
      
      if (!subscriptionSnapshot.exists()) {
        return null
      }
      
      return subscriptionSnapshot.data() as SubscriptionData
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