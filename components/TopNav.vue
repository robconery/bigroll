<template>
  <div>
    <header class="navbar-light navbar-sticky navbar-transparent">
      <!-- Logo Nav START -->
      <nav class="navbar navbar-expand-lg">
        <div class="container">
          <!-- Logo START -->
          <a class="navbar-brand me-0" href="/">
            <img
              class="img-fluid"
              src="/images/new_logo.png"
              alt="logo"
              style="max-width: 220px"
            />
          </a>
          <!-- Logo END -->

          <!-- Responsive navbar toggler -->
          <button
            class="navbar-toggler ms-auto"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#navbarCollapse"
            aria-controls="navbarCollapse"
            aria-expanded="false"
            aria-label="Toggle navigation"
          >
            <span class="navbar-toggler-animation">
              <span></span>
              <span></span>
              <span></span>
            </span>
          </button>

          <!-- Main navbar START -->
          <div class="navbar-collapse collapse" id="navbarCollapse">
            <!-- Nav Search END -->
            <ul class="navbar-nav navbar-nav-scroll ms-auto">
              <li class="nav-item">
                <NuxtLink class="nav-link" to="/downloads"
                  >Find Your Downloads</NuxtLink
                >
              </li>
              <li class="nav-item">
                <NuxtLink class="nav-link" to="/posts">Posts</NuxtLink>
              </li>
              <div class="nav-item px-2">
                <form class="position-relative" action="/search" method="get">
                  <input
                    class="form-control pe-5 bg-transparent"
                    type="search"
                    placeholder="Search"
                    aria-label="Search"
                    name="q"
                  />
                  <button
                    class="btn bg-transparent px-2 py-0 position-absolute top-50 end-0 translate-middle-y"
                    type="submit"
                  >
                    <i class="fas fa-search fs-6"></i>
                  </button>
                </form>
              </div>

              <li class="nav-item ms-2" v-if="user">
                <NuxtLink class="btn btn-dark btn-sm mt-1 mb-0" to="/dashboard">
                  <i class="fa fa-home"></i>
                  Dashboard
                </NuxtLink>
              </li>
              <li class="nav-item ms-2" v-if="user">
                <a class="dropdown-item" href="#" @click.prevent="handleLogout">
                  <i class="bi bi-power fa-fw me-2"></i>Log Out
                </a>
              </li>
              <li class="nav-item ms-2" v-else>
                <button
                  class="btn btn-primary mb-0"
                  type="button"
                  data-bs-toggle="modal"
                  data-bs-target="#loginModal"
                >
                  Login <i class="bi bi-box-arrow-in-right"></i>
                </button>
              </li>
            </ul>
          </div>
        </div>
      </nav>
    </header>

    <!-- Login Modal -->
    <div
      class="modal fade"
      id="loginModal"
      tabindex="-1"
      aria-labelledby="loginModalLabel"
      aria-hidden="true"
    >
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title" id="loginModalLabel">Welcome!</h5>
            <button
              type="button"
              class="btn-close"
              data-bs-dismiss="modal"
              aria-label="Close"
              @click="resetModalState"
            ></button>
          </div>
          <div class="modal-body">
            <div v-if="error" class="alert alert-danger" role="alert">
              {{ error.message || error }}
            </div>
            <div
              v-if="magicLinkSentInModal"
              class="alert alert-success"
              role="alert"
            >
              Magic link sent! Please check your email inbox.
            </div>

            <form @submit.prevent="submitMagicLinkFromModal" v-if="!user">
              <div class="mb-3">
                <label for="modalEmail" class="form-label"
                  >Email address *</label
                >
                <div class="input-group">
                  <span
                    class="input-group-text bg-light border-0 text-secondary px-3"
                  >
                    <i class="bi bi-envelope-fill"></i>
                  </span>
                  <input
                    type="email"
                    class="form-control border-0 bg-light ps-1"
                    id="modalEmail"
                    placeholder="E-mail"
                    v-model="emailForModalLogin"
                    required
                  />
                </div>
              </div>
              <div class="d-grid">
                <button
                  type="submit"
                  class="btn btn-primary"
                  :disabled="isLoading"
                >
                  {{ isLoading ? "Sending..." : "Send Magic Link" }}
                </button>
              </div>
            </form>

            <div v-if="!user">
              <div class="position-relative my-3">
                <hr />
                <p
                  class="small position-absolute top-50 start-50 translate-middle bg-body px-3"
                >
                  Or
                </p>
              </div>
              <div class="d-grid gap-2">
                <button
                  type="button"
                  class="btn bg-danger text-white"
                  @click="submitGoogleLoginFromModal"
                  :disabled="isLoading"
                >
                  <i class="fab fa-fw fa-google me-2"></i>Login with Google
                </button>
                <button
                  type="button"
                  class="btn bg-black text-white"
                  @click="submitGithubLoginFromModal"
                  :disabled="isLoading"
                >
                  <i class="fab fa-fw fa-github me-2"></i>Login with GitHub
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from "vue";
// Use our simplified Firebase Auth composable
const {
  user,
  authorizations,
  isLoading,
  logout,
  initAuthState,
  sendSignInLinkToEmail,
  loginWithGoogle,
  loginWithGithub,
  error,
} = useFirebaseAuth();
const router = useRouter();

// Initialize auth state once when the app loads, but only on client side

// Handle logout
const handleLogout = async () => {
  try {
    await logout();
    magicLinkSentInModal.value = false; // Reset modal message
    emailForModalLogin.value = ""; // Reset email in modal
    router.push("/"); // Redirect to home or login page after logout
  } catch (err) {
    console.error("Logout error:", err);
  }
};

// Determine if user is admin
const isAdmin = computed(() => {
  return (
    user.value?.email === "rob@bigmachine.io" ||
    user.value?.email?.includes("admin")
  );
});

// Get user display name or email
const userName = computed(() => {
  return user.value?.displayName || user.value?.email?.split("@")[0] || "User";
});

// Get user avatar or use default
const userAvatar = computed(() => {
  return (
    user.value?.photoURL ||
    `https://api.dicebear.com/7.x/initials/svg?seed=${userName.value}`
  );
});

// Debug to ensure authorizations are loaded
// console.log("Current authorizations in app.vue:", authorizations.value);

// --- Login Modal Specific Logic ---
const emailForModalLogin = ref("");
const magicLinkSentInModal = ref(false);
let loginModalInstance = null;

onMounted(() => {
  if (process.client) {
    // Ensure Bootstrap's Modal is available
    if (
      typeof window.bootstrap !== "undefined" &&
      typeof window.bootstrap.Modal !== "undefined"
    ) {
      const modalElement = document.getElementById("loginModal");
      if (modalElement) {
        loginModalInstance = new window.bootstrap.Modal(modalElement);

        // Reset modal state when it's hidden
        modalElement.addEventListener("hidden.bs.modal", () => {
          resetModalState();
        });
      }
    } else {
      console.warn(
        "Bootstrap Modal API not found. Modal might not function as expected programmatically."
      );
    }
  }
});

const resetModalState = () => {
  magicLinkSentInModal.value = false;
  // error.value = null; // error is from useFirebaseAuth, might clear globally. Be cautious.
  // If 'error' from useFirebaseAuth should be cleared, do it here or ensure it's handled.
  // For now, we rely on new errors overwriting old ones.
  emailForModalLogin.value = "";
};

watch(user, (newUser) => {
  if (
    newUser &&
    loginModalInstance &&
    document.getElementById("loginModal")?.classList.contains("show")
  ) {
    loginModalInstance.hide();
    resetModalState();
  }
});

const submitMagicLinkFromModal = async () => {
  if (!emailForModalLogin.value) {
    // This should be caught by 'required' on input, but as a fallback:
    // error.value = { message: "Email is required." }; // Or handle error display appropriately
    return;
  }
  magicLinkSentInModal.value = false; // Reset before trying
  try {
    await sendSignInLinkToEmail(emailForModalLogin.value);
    if (process.client) {
      localStorage.setItem("emailForSignIn", emailForModalLogin.value);
    }
    magicLinkSentInModal.value = true;
  } catch (err) {
    // error ref from useFirebaseAuth should be automatically populated
    console.error("Error sending magic link from modal:", err);
  }
};

const submitSocialLogin = async (loginProviderAction) => {
  magicLinkSentInModal.value = false;
  try {
    await loginProviderAction();
    // Successful login will trigger the watcher on `user` to close the modal.
  } catch (err) {
    // error ref from useFirebaseAuth should be automatically populated
    console.error("Error with social login from modal:", err);
  }
};

const submitGoogleLoginFromModal = () => {
  submitSocialLogin(loginWithGoogle);
};

const submitGithubLoginFromModal = () => {
  submitSocialLogin(loginWithGithub);
};
</script>

<style></style>
