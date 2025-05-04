import { useFirebaseAuth } from '~/composables/useFirebaseAuth'

export default defineNuxtRouteMiddleware((to, from) => {
  const { user, isLoading } = useFirebaseAuth()

  // Set of paths that require authentication
  const protectedPaths = [
    '/dashboard',
    '/invoice'
  ]

  // Check if the current path requires authentication
  const requiresAuth = protectedPaths.some(path => to.path.startsWith(path))

  // If on client-side and the route requires auth, but no user...
  if (process.client && requiresAuth && !isLoading.value && !user.value) {
    // Save the intended path to redirect back after login
    const redirect = to.fullPath
    return navigateTo(`/login?redirect=${encodeURIComponent(redirect)}`)
  }
})