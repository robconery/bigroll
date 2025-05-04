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
            If you're looking for your downloads you don't need to login, though
            you're welcome to. You can just
            <NuxtLink to="/downloads">head over to the downloads page</NuxtLink>
            and we'll send them over to you. Otherwise, pop your stuff to the
            right.
          </p>
          <!-- Content -->
          <div class="my-4 lead"></div>
        </div>

        <!-- Right column -->
        <div class="col-12 col-lg-5 mx-auto mt-lg-8">
          <!-- Title -->
          <span class="mb-0 fs-1">👋</span>
          <h1 class="fs-2">Welcome!</h1>

          <div v-if="error" class="alert alert-danger" role="alert">
            {{ error }}
          </div>
          <div v-if="magicLinkSent" class="alert alert-success" role="alert">
            Magic link sent! Please check your email inbox.
          </div>

          <form @submit.prevent="sendMagicLink" v-if="!isProcessingEmailLink">
            <div class="mb-4">
              <label for="email" class="form-label">Email address *</label>
              <div class="input-group input-group-lg">
                <span
                  class="input-group-text bg-light rounded-start border-0 text-secondary px-3"
                >
                  <i class="bi bi-envelope-fill"></i>
                </span>
                <input
                  type="email"
                  class="form-control border-0 bg-light rounded-end ps-1"
                  id="email"
                  placeholder="E-mail"
                  v-model="email"
                  required
                />
              </div>
            </div>

            <div class="align-items-center mt-0">
              <div class="d-grid">
                <button
                  type="submit"
                  class="btn btn-primary mb-0"
                  id="submit-button"
                  :disabled="isLoading"
                >
                  {{ isLoading ? "Sending..." : "Send Magic Link" }}
                </button>
              </div>
            </div>
          </form>

          <!-- Social buttons and divider -->
          <div class="row" v-if="!isProcessingEmailLink">
            <!-- Divider with text -->
            <div class="position-relative my-4">
              <hr />
              <p
                class="small position-absolute top-50 start-50 translate-middle bg-body px-5"
              >
                Or
              </p>
            </div>

            <!-- Social btn -->
            <div class="col-lg-6 d-grid">
              <button
                type="button"
                class="btn bg-danger mb-2 mb-xxl-0 w-100 text-white"
                @click="loginWithGoogle"
                :disabled="isLoading"
              >
                <i class="fab fa-fw fa-google text-white me-2"></i>Login with
                Google
              </button>
            </div>

            <!-- Social btn -->
            <div class="col-lg-6 d-grid">
              <button
                type="button"
                class="btn bg-black mb-2 mb-xxl-0 w-100 text-white"
                @click="loginWithGithub"
                :disabled="isLoading"
              >
                <i class="fab fa-fw fa-github me-2 text-white"></i>Login with
                GitHub
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted } from "vue";
import { isSignInWithEmailLink } from "firebase/auth";

const {
  sendSignInLinkToEmail,
  completeSignInWithEmailLink,
  loginWithGoogle,
  loginWithGithub,
  error,
  isLoading,
} = useFirebaseAuth();
const email = ref("");
const magicLinkSent = ref(false);
const isProcessingEmailLink = ref(false);
const router = useRouter();
const { $auth } = useNuxtApp();

onMounted(async () => {
  // Check if the URL contains an email sign-in link
  if (process.client && isSignInWithEmailLink($auth, window.location.href)) {
    isProcessingEmailLink.value = true;

    // Get the email from localStorage that was saved when sending the link
    let emailForSignIn = localStorage.getItem("emailForSignIn");

    if (!emailForSignIn) {
      // If email is not in localStorage, prompt user for it
      emailForSignIn = window.prompt(
        "Please provide your email for confirmation"
      );
    }

    if (emailForSignIn) {
      try {
        await completeSignInWithEmailLink(emailForSignIn);
        // Clear email from storage
        localStorage.removeItem("emailForSignIn");
        // Redirect to dashboard or home page after successful sign-in
        router.push("/");
      } catch (err) {
        console.error("Error completing sign-in with email link:", err);
        // Reset the isProcessingEmailLink so the user can try again
        isProcessingEmailLink.value = false;
      }
    } else {
      isProcessingEmailLink.value = false;
    }
  }
});

const sendMagicLink = async () => {
  try {
    await sendSignInLinkToEmail(email.value);
    // Store the email in localStorage so we can retrieve it when the user clicks the link
    localStorage.setItem("emailForSignIn", email.value);
    magicLinkSent.value = true;
  } catch (err) {
    console.error("Error sending magic link:", err);
  }
};
</script>
