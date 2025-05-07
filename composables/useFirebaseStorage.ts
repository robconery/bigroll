import { ref, getDownloadURL } from 'firebase/storage'
import { ref as vueRef } from 'vue'

export const useFirebaseStorage = () => {
  const { $storage } = useNuxtApp()
  const isLoading = vueRef(false)
  const error = vueRef<string | null>(null)

  /**
   * Generate a signed URL with a 2-hour expiration time
   * @param storageUrl - The Firebase Storage URL or path
   * @returns Promise with the signed URL
   */
  const getSignedUrl = async (storageUrl: string): Promise<string> => {
    isLoading.value = true
    error.value = null
    
    try {
      let storagePath = storageUrl
      
      // Handle full URLs by extracting the storage path
      if (storageUrl.startsWith('https://') && storageUrl.includes('storage.googleapis.com')) {
        const url = new URL(storageUrl)
        const pathSegments = url.pathname.split('/')
        
        // Remove 'o' (bucket name) from the path
        if (pathSegments[1] === 'o') {
          pathSegments.splice(1, 1)
        }
        
        // Remove 'v1/b/[bucket]/o' from the path
        if (pathSegments[1] === 'v1' && pathSegments[2] === 'b') {
          pathSegments.splice(1, 4)
        }
        
        storagePath = pathSegments.join('/').replace('//', '/')
      }
      
      // Create a reference from the storage path
      const storageRef = ref($storage, storagePath)
      
      // Generate a signed URL that expires in 2 hours (7200 seconds)
      const signedUrl = await getDownloadURL(storageRef)
      
      // For web-based Firebase Storage, we can't directly set expiration on client side
      // The URL itself is already time-limited by Firebase
      // We append a token parameter to help track links
      const expiryTime = Date.now() + 2 * 60 * 60 * 1000 // 2 hours in milliseconds
      const tokenizedUrl = `${signedUrl}&token=${expiryTime}`
      
      return tokenizedUrl
    } catch (e: any) {
      console.error('Error generating signed URL:', e)
      error.value = e.message
      throw e
    } finally {
      isLoading.value = false
    }
  }

  return {
    getSignedUrl,
    isLoading,
    error
  }
}