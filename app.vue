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
                <NuxtLink class="nav-link" to="/courses/">Courses</NuxtLink>
              </li>
              <li class="nav-item dropdown">
                <a
                  class="nav-link dropdown-toggle"
                  href="#"
                  data-bs-toggle="dropdown"
                  aria-haspopup="true"
                  aria-expanded="false"
                  >Books</a
                >
                <ul class="dropdown-menu" aria-labelledby="accounntMenu">
                  <li>
                    <a class="dropdown-item" href="/offers/imposter-second"
                      >The Imposter's Handbook</a
                    >
                  </li>
                  <li>
                    <a class="dropdown-item" href="/offers/roadmap"
                      >The Imposter's Roadmap</a
                    >
                  </li>
                  <li>
                    <a class="dropdown-item" href="/offers/curious-moon"
                      >A Curious Moon</a
                    >
                  </li>
                  <li>
                    <a
                      class="dropdown-item"
                      href="https://www.troyhunt.com/pwned-the-book-is-now-available-for-free/"
                      >PWNED!</a
                    >
                  </li>
                </ul>
              </li>
              <li class="nav-item">
                <NuxtLink class="nav-link" to="/downloads">Downloads</NuxtLink>
              </li>
              <li class="nav-item">
                <NuxtLink class="nav-link" to="/posts">Posts</NuxtLink>
              </li>

              <!-- Search form -->
              <div class="nav-item px-2" v-if="!isAdmin">
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

              <!-- Auth links -->
              <template v-if="user">
                <!-- Admin buttons -->
                <template v-if="isAdmin">
                  <li class="nav-item ms-2">
                    <a class="btn btn-dark btn-sm mt-1 mb-0" href="/rob">
                      <i class="fa fa-home"></i>
                      Admin
                    </a>
                  </li>
                  <li class="nav-item ms-2">
                    <a class="btn btn-dark btn-sm mt-1 mb-0" href="/juice">
                      <i class="fa fa-home"></i>
                      CMS
                    </a>
                  </li>
                </template>
                <!-- Regular user -->
                <template v-else>
                  <!-- User avatar with dropdown -->
                  <li class="nav-item dropdown ms-2">
                    <a
                      class="avatar avatar-sm p-0"
                      href="#"
                      id="profileDropdown"
                      role="button"
                      data-bs-auto-close="outside"
                      data-bs-display="static"
                      data-bs-toggle="dropdown"
                      aria-expanded="false"
                    >
                      <img
                        class="avatar-img rounded-circle"
                        :src="userAvatar"
                        alt="avatar"
                      />
                    </a>
                    <ul
                      class="dropdown-menu dropdown-animation dropdown-menu-end shadow pt-3"
                      aria-labelledby="profileDropdown"
                    >
                      <!-- Avatar -->
                      <li class="px-3">
                        <div class="d-flex align-items-center">
                          <!-- Avatar -->
                          <div class="avatar me-3">
                            <img
                              class="avatar-img rounded-circle shadow"
                              :src="userAvatar"
                              alt="avatar"
                            />
                          </div>
                          <div>
                            <a class="h6" href="#">{{ userName }}</a>
                            <p class="small m-0">{{ user.email }}</p>
                          </div>
                        </div>
                        <hr />
                      </li>
                      <!-- Links -->
                      <li>
                        <NuxtLink class="dropdown-item" to="/dashboard">
                          <i class="bi bi-person fa-fw me-2"></i>Dashboard
                        </NuxtLink>
                      </li>
                      <li>
                        <NuxtLink class="dropdown-item" to="/settings">
                          <i class="bi bi-gear fa-fw me-2"></i>Account Settings
                        </NuxtLink>
                      </li>
                      <li>
                        <a
                          class="dropdown-item"
                          href="#"
                          @click.prevent="handleLogout"
                        >
                          <i class="bi bi-power fa-fw me-2"></i>Sign Out
                        </a>
                      </li>
                    </ul>
                  </li>
                </template>
              </template>
              <!-- Guest links -->
              <template v-else>
                <li class="nav-item ms-2">
                  <NuxtLink class="btn btn-primary mb-0" to="/login">
                    Login <i class="bi bi-box-arrow-in-right"></i>
                  </NuxtLink>
                </li>
              </template>
            </ul>
          </div>
        </div>
      </nav>
    </header>

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
                  href="https://twitter.com/@robconery"
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
          <div class="col-lg-6">
            <div class="row g-4">
              <!-- Link block -->
              <div class="col-6 col-md-5">
                <h5 class="mb-2 mb-md-4 text-white">Publications</h5>
                <ul class="nav flex-column">
                  <li class="nav-item">
                    <a
                      class="nav-link text-light"
                      href="https://bigmachine.io/products/the-imposters-handbook"
                      >The Imposter's Handbook</a
                    >
                  </li>
                  <li class="nav-item">
                    <a
                      class="nav-link text-light"
                      href="https://bigmachine.io/products/imposter-interview"
                      >Imposter Video Companion</a
                    >
                  </li>
                  <li class="nav-item">
                    <a
                      class="nav-link text-light"
                      href="https://bigmachine.io/products/a-curious-moon"
                      >A Curious Moon</a
                    >
                  </li>
                  <li class="nav-item">
                    <a
                      class="nav-link text-light"
                      href="https://bigmachine.io/products/pwned"
                      >PWNED!</a
                    >
                  </li>
                </ul>
              </div>
              <div class="col-6 col-md-3">
                <h5 class="mb-2 mb-md-4 text-white">Links</h5>
                <ul class="nav flex-column">
                  <li class="nav-item">
                    <NuxtLink class="nav-link text-light" to="/posts"
                      >Blog Archive</NuxtLink
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
                    <NuxtLink class="nav-link text-light" to="/terms"
                      >Terms</NuxtLink
                    >
                  </li>
                  <li class="nav-item">
                    <NuxtLink class="nav-link text-light" to="/privacy"
                      >Privacy</NuxtLink
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
              <div class="col-6 col-md-4">
                <h5 class="mb-2 mb-md-4 text-white">Courses</h5>
                <ul class="nav flex-column">
                  <li class="nav-item">
                    <NuxtLink
                      class="nav-link text-light"
                      to="/courses/imposter-video"
                      >CS Fundamentals</NuxtLink
                    >
                  </li>
                  <li class="nav-item">
                    <NuxtLink
                      class="nav-link text-light"
                      to="/courses/mission-interview"
                      >Mission: Interview</NuxtLink
                    >
                  </li>
                  <li class="nav-link text-light">
                    <NuxtLink
                      class="nav-link text-light"
                      to="/courses/accelerator"
                      >Frontend Accelerator</NuxtLink
                    >
                  </li>
                  <li class="nav-item">
                    <NuxtLink
                      class="nav-link text-light"
                      to="/courses/sql-orbit"
                      >PostgreSQL Fundamentals</NuxtLink
                    >
                  </li>
                  <li class="nav-item">
                    <NuxtLink
                      class="nav-link text-light"
                      to="/courses/take-off-with-elixir"
                      >Take Off With Elixir</NuxtLink
                    >
                  </li>
                </ul>
              </div>
            </div>
          </div>
          <!-- Widget 2 END -->

          <!-- Widget 3 START -->
          <div class="col-lg-3">
            <h5 class="mb-2 mb-md-4 text-white">Contact</h5>
            <p class="text-light">
              <b>Rob Conery</b><br />
              rob@bigmachine.io <br />
              @robconery <br />
            </p>
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
  if (process.client) {
    console.log("App before mount (client-side only), initializing auth state");
    initAuthState();
  }
});

// Handle logout
const handleLogout = async () => {
  try {
    await logout();
    router.push("/login");
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
console.log("Current authorizations in app.vue:", authorizations.value);
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
