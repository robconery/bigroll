import { 
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  addDoc,
  deleteDoc,
  Timestamp,
  type DocumentData,
  type Firestore,
  type QuerySnapshot
} from 'firebase/firestore'
import { ref } from 'vue'

export const useFirestore = () => {
  const { $firestore } = useNuxtApp()
  const isLoading = ref(false)
  
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

  /**
   * Get lesson progress for a user by uid
   * @param uid User's Firebase Auth UID
   * @returns Array of lesson progress data
   */
  const getLessonProgressByUid = async (uid: string): Promise<any[]> => {
    try {
      const firestore = $firestore as Firestore
      const progressRef = collection(firestore, 'lessonProgress')
      const q = query(progressRef, where('uid', '==', uid))
      
      const querySnapshot = await getDocs(q)
      
      const progress: any[] = []
      querySnapshot.forEach((doc) => {
        const progressData = doc.data()
        // Return raw data with ID added
        progress.push({
          id: doc.id,
          ...progressData
        });
      })
      return progress
    } catch (error) {
      console.error('Error getting lesson progress by email:', error)
      return []
    }
  }

  /**
   * Add lesson progress for a user
   * @param uid User's Firebase Auth UID
   * @param lessonId Lesson ID
   * @param progress Progress data
   * @returns The added progress data
   */
  const addLessonProgress = async (uid: string, lessonId: string, progress: any): Promise<any> => {
    try {
      const firestore = $firestore as Firestore
      const progressRef = collection(firestore, 'lessonProgress')
      const newProgress = {
        uid,
        lessonId,
        progress,
        createdAt: Timestamp.now()
      }
      const docRef = await addDoc(progressRef, newProgress)
      return {
        id: docRef.id,
        ...newProgress
      }
    } catch (error) {
      console.error('Error adding lesson progress:', error)
      throw error
    }
  }

  /**
   * Delete lesson progress for a user
   * @param progressId Progress document ID
   * @returns void
   */
  const deleteLessonProgress = async (progressId: string): Promise<void> => {
    try {
      const firestore = $firestore as Firestore
      const progressDocRef = doc(firestore, 'lessonProgress', progressId)
      await deleteDoc(progressDocRef)
    } catch (error) {
      console.error('Error deleting lesson progress:', error)
      throw error
    }
  }

  /**
   * Get all completed lessons for a user
   * 
   * @param uid The user's Firebase Auth UID
   * @returns Array of completed lesson objects
   */
  const getCompletedLessons = async (uid: string) => {
    if (!uid) return []

    try {
      isLoading.value = true
      const firestore = $firestore as Firestore
      const q = query(
        collection(firestore, 'progress'),
        where('uid', '==', uid)
      )
      
      const snapshot = await getDocs(q)
      const completedLessons = snapshot.docs.map(doc => {
        return {
          id: doc.id,
          ...doc.data()
        }
      })
      
      return completedLessons
    } catch (error) {
      console.error('Error fetching completed lessons:', error)
      return []
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Check if a specific lesson is completed
   * 
   * @param uid The user's Firebase Auth UID
   * @param courseSlug The course slug
   * @param lessonSlug The lesson slug
   * @returns Boolean indicating if lesson is completed
   */
  const isLessonCompleted = async (uid: string, courseSlug: string, lessonSlug: string) => {
    if (!uid || !courseSlug || !lessonSlug) return false

    try {
      isLoading.value = true
      const firestore = $firestore as Firestore
      const q = query(
        collection(firestore, 'progress'),
        where('uid', '==', uid),
        where('courseSlug', '==', courseSlug),
        where('lessonSlug', '==', lessonSlug)
      )
      
      const snapshot = await getDocs(q)
      return !snapshot.empty
    } catch (error) {
      console.error('Error checking if lesson is completed:', error)
      return false
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Mark a lesson as completed
   * 
   * @param uid The user's Firebase Auth UID
   * @param courseSlug The course slug
   * @param lessonSlug The lesson slug
   * @param lessonTitle The lesson title
   * @returns The ID of the created progress document
   */
  const markLessonCompleted = async (uid: string, courseSlug: string, lessonSlug: string, lessonTitle: string) => {
    if (!uid || !courseSlug || !lessonSlug) return null

    try {
      isLoading.value = true
      const firestore = $firestore as Firestore
      
      // Check if it's already completed
      const isCompleted = await isLessonCompleted(uid, courseSlug, lessonSlug)
      if (isCompleted) return null
      
      const progressRef = await addDoc(collection(firestore, 'progress'), {
        uid,
        courseSlug,
        lessonSlug,
        lessonTitle,
        completedAt: Timestamp.now()
      })
      
      return progressRef.id
    } catch (error) {
      console.error('Error marking lesson as completed:', error)
      return null
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Mark a lesson as not completed (remove completion status)
   * 
   * @param uid The user's Firebase Auth UID
   * @param courseSlug The course slug
   * @param lessonSlug The lesson slug
   * @returns Boolean indicating success
   */
  const markLessonNotCompleted = async (uid: string, courseSlug: string, lessonSlug: string) => {
    if (!uid || !courseSlug || !lessonSlug) return false

    try {
      isLoading.value = true
      const firestore = $firestore as Firestore
      
      const q = query(
        collection(firestore, 'progress'),
        where('uid', '==', uid),
        where('courseSlug', '==', courseSlug),
        where('lessonSlug', '==', lessonSlug)
      )
      
      const snapshot = await getDocs(q)
      
      if (snapshot.empty) return false
      
      // Delete all matching documents (should only be one, but being thorough)
      const deletePromises = snapshot.docs.map(doc => deleteDoc(doc.ref))
      await Promise.all(deletePromises)
      
      return true
    } catch (error) {
      console.error('Error marking lesson as not completed:', error)
      return false
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Calculate the course progress percentage
   * 
   * @param uid The user's Firebase Auth UID
   * @param courseSlug The course slug
   * @param totalLessons The total number of lessons in the course
   * @returns Progress percentage (0-100)
   */
  const getCourseProgress = async (uid: string, courseSlug: string, totalLessons: number) => {
    if (!uid || !courseSlug || !totalLessons) return 0

    try {
      isLoading.value = true
      const firestore = $firestore as Firestore
      
      const q = query(
        collection(firestore, 'progress'),
        where('uid', '==', uid),
        where('courseSlug', '==', courseSlug)
      )
      
      const snapshot = await getDocs(q)
      const completedCount = snapshot.size
      
      return Math.round((completedCount / totalLessons) * 100)
    } catch (error) {
      console.error('Error calculating course progress:', error)
      return 0
    } finally {
      isLoading.value = false
    }
  }

  return {
    getUserByEmail,
    getAuthorizations,
    checkAuthorized,
    getOrdersByEmail,
    getOrderByNumber,
    getSubscriptionByEmail,
    getLessonProgressByUid,
    addLessonProgress,
    deleteLessonProgress,
    getCompletedLessons,
    isLessonCompleted,
    markLessonCompleted,
    markLessonNotCompleted,
    getCourseProgress,
    isLoading
  }
}