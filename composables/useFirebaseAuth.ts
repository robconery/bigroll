import { 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  GoogleAuthProvider,
  GithubAuthProvider,
  signInWithPopup,
  sendSignInLinkToEmail as firebaseSendSignInLinkToEmail,
  isSignInWithEmailLink,
  signInWithEmailLink,
  type User,
  type Auth
} from 'firebase/auth'
import { ref } from 'vue'

// Define authorization types
interface AuthorizationData {
  id: string
  email: string
  sku: string
  download?: string
  date?: string
  order?: string
  offer?: string
}

// Define subscription type
interface SubscriptionData {
  // Add appropriate fields based on your subscription structure
  id?: string
  email?: string
  plan?: string,
  current_period_start?: string | { seconds: number },
  current_period_end?: string | { seconds: number },
  stripe_sub_id?: string,
  stripe_customer_id?: string,
  interval?: string,
  // Add other fields as needed
}

// Create persistent refs outside the composable to share state
const user = ref<User | null>(null)
const authorizations = ref<AuthorizationData[]>([])
const subscription = ref<SubscriptionData | null>(null)
const isLoading = ref(true)
const error = ref<string | null>(null)
let authStateInitialized = false

export const useFirebaseAuth = () => {
  const { $auth } = useNuxtApp()
  const { getAuthorizations, getSubscriptionByEmail } = useFirestore()

  // Initialize Firebase auth state observer if not already initialized
  const initAuthState = () => {
    if (authStateInitialized) return
    
    console.log('Initializing auth state observer')
    authStateInitialized = true
    
    // Set up the Firebase auth state observer
    onAuthStateChanged($auth as Auth, async (firebaseUser) => {
      console.log('Auth state changed:', firebaseUser ? `User ${firebaseUser.email} logged in` : 'User logged out')
      
      // Update user state
      user.value = firebaseUser
      

      // Handle authorizations
      if (firebaseUser && firebaseUser.email) {
        const firebaseAuths = await getAuthorizations({
          id: firebaseUser.email,
          email: firebaseUser.email,
          uid: firebaseUser.uid
        });
        authorizations.value = firebaseAuths;

      } else {
        authorizations.value = [];
      }
      
      //do we have a sub?
      if (firebaseUser && firebaseUser.email) {
        const sub = await getSubscriptionByEmail(firebaseUser.email);
        if (sub) {
          subscription.value = sub;
        }
      }

      isLoading.value = false
    })
  }

  // Login with email and password
  const login = async (email: string, password: string) => {
    error.value = null
    try {
      isLoading.value = true
      const userCredential = await signInWithEmailAndPassword($auth as Auth, email, password)
      return userCredential.user
    } catch (e: any) {
      error.value = e.message
      throw e
    } finally {
      isLoading.value = false
    }
  }

  // Send sign-in link to email (Magic Link)
  const sendSignInLinkToEmail = async (email: string) => {
    error.value = null
    try {
      isLoading.value = true
      // URL that will handle the sign-in process
      const actionCodeSettings = {
        url: `${window.location.origin}/login`,
        handleCodeInApp: true,
      }
      
      await firebaseSendSignInLinkToEmail($auth as Auth, email, actionCodeSettings)
      return true
    } catch (e: any) {
      error.value = e.message
      throw e
    } finally {
      isLoading.value = false
    }
  }

  // Complete sign-in with email link
  const completeSignInWithEmailLink = async (email: string) => {
    error.value = null
    try {
      isLoading.value = true
      if (isSignInWithEmailLink($auth as Auth, window.location.href)) {
        const userCredential = await signInWithEmailLink($auth as Auth, email, window.location.href)
        
        // Clear the URL to remove the sign-in link parameters
        window.history.replaceState(null, '', window.location.pathname)
        return userCredential.user
      } else {
        throw new Error("Invalid sign-in link")
      }
    } catch (e: any) {
      error.value = e.message
      throw e
    } finally {
      isLoading.value = false
    }
  }

  // Login with Google
  const loginWithGoogle = async () => {
    error.value = null
    try {
      isLoading.value = true
      const provider = new GoogleAuthProvider()
      const userCredential = await signInWithPopup($auth as Auth, provider)
      return userCredential.user
    } catch (e: any) {
      error.value = e.message
      throw e
    } finally {
      isLoading.value = false
    }
  }

  // Login with GitHub
  const loginWithGithub = async () => {
    error.value = null
    try {
      isLoading.value = true
      const provider = new GithubAuthProvider()
      const userCredential = await signInWithPopup($auth as Auth, provider)
      return userCredential.user
    } catch (e: any) {
      error.value = e.message
      throw e
    } finally {
      isLoading.value = false
    }
  }

  // Logout
  const logout = async () => {
    error.value = null
    try {
      isLoading.value = true
      await signOut($auth as Auth)
      // User will be set to null by the auth state observer
      // and clearAuthorizations will be called
    } catch (e: any) {
      error.value = e.message
      throw e
    } finally {
      isLoading.value = false
    }
  }


  return {
    user,
    authorizations,
    subscription,
    isLoading,
    error,
    initAuthState,
    login,
    sendSignInLinkToEmail,
    completeSignInWithEmailLink,
    loginWithGoogle,
    loginWithGithub,
    logout
  }
}