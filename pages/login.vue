<template>
  <div id="hero" class="position-relative pt-8 pb-8 mt-0">
    <div class="d-none d-lg-block ocean opacity-25">
      <div class="wave"></div>
      <div class="wave"></div>
    </div>

    <div class="container">
      <div class="row">
        <!-- left column -->
        <div
          class="col-lg-5 col-xl-6 position-relative z-index-1 text-center text-lg-start mb-lg-5 mb-sm-0"
        >
          <!-- Title -->
          <div class="position-relative">
            <img src="/images/doodles/boat.png" class="rounded-4" alt="" />
          </div>
          <p class="my-4 lead">
            If you're looking for your downloads, you can
            <NuxtLink to="/downloads">head over to the downloads page</NuxtLink
            >.
          </p>
          <p class="my-4 lead">
            To log in, please use the "Login" button in the site header. If
            you've been sent a magic link, this page will process your login
            automatically.
          </p>
        </div>

        <!-- Right column -->
        <div class="col-12 col-lg-5 mx-auto mt-lg-8">
          <!-- Title -->
          <span class="mb-0 fs-1">👋</span>
          <h1 class="fs-2">Login Processing</h1>

          <!-- Email update notification from query parameter -->
          <div
            v-if="route.query.message"
            class="alert alert-info mb-4"
            role="alert"
          >
            {{ route.query.message }}
          </div>

          <div v-if="error" class="alert alert-danger" role="alert">
            {{ error.message || error }}
          </div>
          <div
            v-if="isProcessingEmailLink"
            class="alert alert-info"
            role="alert"
          >
            Processing your login... Please wait.
          </div>
          <div
            v-if="!isProcessingEmailLink && !user && !error"
            class="alert alert-info"
            role="alert"
          >
            Please use the login button in the navigation bar to sign in or
            register. If you've clicked a magic link from your email, we're
            attempting to sign you in.
          </div>
          <div
            v-if="user && !isProcessingEmailLink"
            class="alert alert-success"
            role="alert"
          >
            You are logged in! Redirecting to your dashboard...
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, watch, ref } from "vue";
import { isSignInWithEmailLink } from "firebase/auth";

const {
  user,
  completeSignInWithEmailLink,
  error, // Using error from useFirebaseAuth
  // isLoading, // isLoading might not be directly relevant here unless we add specific actions
  initAuthState,
} = useFirebaseAuth();
const route = useRoute();
const router = useRouter();
const { $auth } = useNuxtApp();

const isProcessingEmailLink = ref(false);

// Initialize the auth state observer if needed, though TopNav might already do it.
// initAuthState(); // Consider if this is needed or if TopNav's init is sufficient.

// Redirect logged-in users to dashboard
watch(
  user,
  (newUser) => {
    if (newUser && !isProcessingEmailLink.value) {
      // Check if current route is /login to prevent redirect loops if already navigating away
      if (router.currentRoute.value.path === "/login") {
        router.push("/dashboard");
      }
    }
  },
  { immediate: true }
);

onMounted(async () => {
  // Only run Firebase authentication code on the client side
  if (!import.meta.client) return;

  // If user is already logged in (e.g. navigated back to /login), redirect to dashboard
  // The watcher above should handle this, but an immediate check can be useful.
  if (
    user.value &&
    !isProcessingEmailLink.value &&
    router.currentRoute.value.path === "/login"
  ) {
    router.push("/dashboard");
    return;
  }

  // Check if the URL contains an email sign-in link
  if (isSignInWithEmailLink($auth, window.location.href)) {
    isProcessingEmailLink.value = true;
    // error.value = null; // Clear previous errors before attempting sign-in

    // Get the email from localStorage that was saved when sending the link
    let emailForSignIn = localStorage.getItem("emailForSignIn");

    if (!emailForSignIn) {
      // If email is not in localStorage, prompt user for it
      // This is a fallback, ideally emailForSignIn should always be set
      emailForSignIn = window.prompt(
        "Please provide your email for confirmation"
      );
    }

    if (emailForSignIn) {
      try {
        await completeSignInWithEmailLink(emailForSignIn, window.location.href); // Pass full href
        // Clear email from storage
        localStorage.removeItem("emailForSignIn");
        // Redirect to dashboard after successful sign-in, watcher should also catch this.
        // router.push("/dashboard"); // Watcher will handle this.
      } catch (err) {
        console.error("Error completing sign-in with email link:", err);
        // error ref from useFirebaseAuth should be populated
      } finally {
        isProcessingEmailLink.value = false;
      }
    } else {
      // No email provided for sign-in link completion
      // error.value = { message: "Email not found for completing sign-in. Please try sending the link again." };
      console.error("Email for sign-in not found in localStorage or prompt.");
      isProcessingEmailLink.value = false;
    }
  }
});

// No form submission logic here anymore (sendMagicLink, social logins)
// That logic is now in TopNav.vue's modal.
</script>
