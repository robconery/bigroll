<template>
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

            <!-- Search form 
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
            -->
            <!-- Auth links -->
            <template v-if="user">
              <!-- Admin buttons -->

              <!-- Regular user -->

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
</template>

<script setup>
// Use our simplified Firebase Auth composable
const { user, authorizations, isLoading, logout, initAuthState } =
  useFirebaseAuth();
const router = useRouter();

// Initialize auth state once when the app loads, but only on client side

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

<style></style>
