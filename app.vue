<template>
  <div>
    <TopNav />
    <main class="position-relative py-8">
      <div class="container mx-auto w-2/3">
        <!-- Alert placeholder -->
      </div>
      <NuxtPage />
    </main>

    <footer class="bg-dark text-white pt-5 mt-8">
      <div class="container">
        <!-- Row START -->
        <div class="row g-4">
          <!-- Widget 1 START -->
          <div class="col-lg-3">
            <!-- logo -->
            <a class="me-0" href="/">
              <img
                class="light-mode-item h-40px"
                src="/images/new_logo.png"
                alt="logo"
              />
            </a>
            <p class="my-3 text-light">A home for self-taught programmers</p>
            <!-- Social media icon -->
            <ul class="list-inline mb-0 mt-3">
              <li class="list-inline-item">
                <a
                  class="btn btn-dark btn-sm shadow px-2 text-twitter"
                  href="https://bsky.app/profile/robconery.com"
                >
                  <i class="fab fa-fw fa-twitter"></i>
                </a>
              </li>
              <li class="list-inline-item">
                <a
                  class="btn btn-dark btn-sm shadow px-2 text-youtube"
                  href="https://youtube.com/@big-machine"
                >
                  <i class="fab fa-fw fa-youtube"></i>
                </a>
              </li>
              <li class="list-inline-item">
                <a
                  class="btn btn-dark btn-sm shadow px-2 text-linkedin"
                  href="https://linkedin.com/in/robconery"
                >
                  <i class="fab fa-fw fa-linkedin-in"></i>
                </a>
              </li>
              <li class="list-inline-item">
                <a
                  class="btn btn-dark btn-sm shadow px-2 text-medium"
                  href="https://medium.com/@robconery"
                >
                  <i class="fab fa-fw fa-medium"></i>
                </a>
              </li>
              <li class="list-inline-item">
                <a
                  class="btn btn-dark btn-sm shadow px-2 text-vimeo"
                  href="https://vimeo.com/bigmachine"
                >
                  <i class="fab fa-fw fa-vimeo"></i>
                </a>
              </li>
            </ul>
          </div>
          <!-- Widget 1 END -->

          <!-- Widget 2 START -->
          <div class="col-lg-5">
            <div class="row g-4">
              <!-- Link block -->
              <div class="col-6">
                <h5 class="mb-2 mb-md-4 text-white">Publications</h5>
                <ul class="nav flex-column">
                  <li class="nav-item">
                    <a
                      class="nav-link text-light"
                      href="/offers/imposter-second"
                      >The Imposter's Handbook</a
                    >
                  </li>
                  <li class="nav-item">
                    <a class="nav-link text-light" href="/offers/roadmap"
                      >The Imposter's Roadmap</a
                    >
                  </li>
                  <li class="nav-item">
                    <a class="nav-link text-light" href="/offers/curious-moon"
                      >A Curious Moon</a
                    >
                  </li>
                </ul>
              </div>
              <div class="col-6">
                <h5 class="mb-2 mb-md-4 text-white">Links</h5>
                <ul class="nav flex-column">
                  <li class="nav-item">
                    <NuxtLink class="nav-link text-light" to="/posts"
                      >Posts</NuxtLink
                    >
                  </li>
                  <li class="nav-item">
                    <a
                      class="nav-link text-light"
                      href="https://a.bigmachine.io"
                      >Newsletter</a
                    >
                  </li>
                  <li class="nav-item">
                    <a
                      class="nav-link text-light"
                      href="https://thisdeveloperslife.com"
                      >This Developer's Life</a
                    >
                  </li>
                </ul>
              </div>
            </div>
          </div>
          <!-- Widget 2 END -->

          <!-- Widget 3 START -->
          <div class="col-lg-4">
            <KitFooter />
          </div>
          <!-- Widget 3 END -->
        </div>
        <!-- Row END -->

        <!-- Divider -->
        <hr class="mt-4 mb-0 border-light" />

        <!-- Bottom footer -->
        <div class="py-3">
          <div class="container px-0">
            <div
              class="d-md-flex justify-content-between align-items-center py-3 text-center text-md-left"
            >
              <!-- copyright text -->
            </div>
          </div>
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup>
import { onMounted, onBeforeMount } from "vue";

// Use our simplified Firebase Auth composable
const { user, authorizations, isLoading, logout, initAuthState } =
  useFirebaseAuth();
const router = useRouter();

// Initialize auth state once when the app loads, but only on client side
onBeforeMount(() => {
  if (import.meta.client) {
    console.log("App before mount (client-side only), initializing auth state");
    initAuthState();
  }
});

// Get user display name or email
const userName = computed(() => {
  return user.value?.displayName || user.value?.email?.split("@")[0] || "User";
});
</script>

<style>
/* Avatar styles */
.avatar {
  height: 40px;
  width: 40px;
  position: relative;
  display: inline-block;
  text-align: center;
}

.avatar-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar-sm {
  height: 32px;
  width: 32px;
}

/* Dropdown animation */
.dropdown-animation {
  animation: fadeIn 0.3s ease both;
}

@keyframes fadeIn {
  0% {
    opacity: 0;
    transform: translateY(10px);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
