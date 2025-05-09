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
  type User as FirebaseUser,
  type Auth
} from 'firebase/auth'
import { ref } from 'vue'

// Create persistent refs outside the composable to share state
const user = ref<FirebaseUser | null>(null)
const userModel = ref<any>(null)
const authorizations = ref<any[]>([])
const subscription = ref<any>(null)
const isLoading = ref(true)
const error = ref<string | null>(null)
let authStateInitialized = false

export const useFirebaseAuth = () => {
  const { $auth } = useNuxtApp()
  const { getUserByEmail, getAuthorizations, getSubscriptionByEmail } = useFirestore()

  // Initialize Firebase auth state observer if not already initialized
  const initAuthState = () => {
    //No errors please from server nonsense
    if (import.meta.server) return;
    if (authStateInitialized) return
    
    console.log('Initializing auth state observer')
    authStateInitialized = true
    
    // Set up the Firebase auth state observer
    onAuthStateChanged($auth as Auth, async (firebaseUser) => {
      console.log('Auth state changed:', firebaseUser ? `User ${firebaseUser.email} logged in` : 'User logged out')
      
      // Update user state
      user.value = firebaseUser
      
      // Reset state when logged out
      if (!firebaseUser) {
        userModel.value = null;
        authorizations.value = [];
        subscription.value = null;
        isLoading.value = false;
        return;
      }

      // Fetch user data and authorizations when logged in
      if (firebaseUser.email) {
        try {
          // Get user from Firestore
          const fetchedUser = await getUserByEmail(firebaseUser.email);
          
          if (fetchedUser) {
            userModel.value = fetchedUser;
            
            // Fetch authorizations
            const fetchedAuths = await getAuthorizations(fetchedUser);
            authorizations.value = fetchedAuths;
            
            // Associate authorizations with user
            userModel.value.authorizations = fetchedAuths;
            
            // Fetch subscription
            const fetchedSubscription = await getSubscriptionByEmail(firebaseUser.email);
            if (fetchedSubscription) {
              subscription.value = fetchedSubscription;
            } else {
              subscription.value = null;
            }
          } else {
            // Create a new user model if not found in Firestore
            userModel.value = {
              email: firebaseUser.email,
              uid: firebaseUser.uid,
              name: firebaseUser.displayName || undefined,
              authorizations: []
            };
            authorizations.value = [];
            subscription.value = null;
          }
        } catch (e) {
          console.error('Error fetching user data:', e);
        }
      }
      
      isLoading.value = false;
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
      // and state will be cleared
    } catch (e: any) {
      error.value = e.message
      throw e
    } finally {
      isLoading.value = false
    }
  }

  // Check if a user is authorized for a specific SKU
  const isAuthorizedFor = (sku: string): boolean => {
    if (!userModel.value || !userModel.value.authorizations) {
      return false;
    }
    
    // Simple implementation without using the User model's method
    return userModel.value.authorizations.some((auth: any) => auth.sku === sku);
  }

  return {
    user,
    userModel,
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
    logout,
    isAuthorizedFor
  }
}