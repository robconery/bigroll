import { useFirebaseAuth } from '~/composables/useFirebaseAuth'

export default defineNuxtRouteMiddleware((to, from) => {
  // Skip authentication check on the server side
  // if (import.meta.server) {
  //   console.log('Skipping auth check on server')
  //   return
  // }
  
  const { user, isLoading, initAuthState } = useFirebaseAuth()
  
  // Initialize auth state if on client side
  initAuthState()

  // Set of paths that require authentication
  const protectedPaths = [
    '/admin',
  ]

  // Check if the current path requires authentication
  const requiresAuth = protectedPaths.some(path => to.path.startsWith(path))

  // If on client-side and the route requires auth, but no user...
  if (requiresAuth && !isLoading.value && !user.value) {
    // Save the intended path to redirect back after login
    const redirect = to.fullPath
    return navigateTo(`/login?redirect=${encodeURIComponent(redirect)}`)
  }
})