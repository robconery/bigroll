<template>
  <div class="container">
    <div class="row g-0 g-lg-5">
      <!-- Left sidebar START -->
      <div class="col-lg-4">
        <div class="row">
          <div class="col-md-6 col-lg-12 text-center py-4">
            <!-- User profile image -->
            <div
              class="avatar avatar-xxl position-relative mt-n3 mx-auto text-center"
            >
              <img
                class="avatar-img rounded-circle border border-white border-3 shadow text-center"
                :src="
                  user?.photoURL ||
                  'https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y'
                "
                alt="User avatar"
              />
            </div>
            <div>
              <h1 class="mb-2">
                {{ userModel?.name || user?.displayName || user?.email }}
              </h1>
            </div>
          </div>

          <div class="col-md-6 col-lg-12">
            <div class="card card-body shadow p-4 mb-4">
              <!-- Orders section -->
              <h4 class="mb-3">Orders</h4>
              <p class="small">
                These are your <b>non-subscription</b> orders. If you have a
                subscription, you can see your invoices and subscription details
                in the "Manage Subscription" link.
              </p>

              <!-- Loading state -->
              <div v-if="isLoadingOrders && user" class="text-center py-3">
                <div class="spinner-border text-primary" role="status">
                  <span class="visually-hidden">Loading...</span>
                </div>
                <p class="mt-2">Loading your orders...</p>
              </div>

              <!-- No orders state -->
              <div v-else-if="orders.length === 0" class="text-center py-3">
                <i class="bi bi-receipt fs-1 text-muted"></i>
                <p class="mt-2">You don't have any orders yet.</p>
              </div>

              <!-- Order items -->
              <div
                v-else
                v-for="order in orders"
                :key="order.id"
                class="d-flex align-items-center mb-4"
              >
                <span class="icon-md text-dark mb-0 bg-light rounded-3"
                  ><i class="bi bi-cart-check-fill"></i
                ></span>
                <div class="ms-3">
                  <h6 class="mb-0">
                    <NuxtLink :to="`/invoice/${order.number}`">{{
                      order.number
                    }}</NuxtLink>
                  </h6>
                  <p class="mb-0 small">
                    {{ formatOrderDate(order.date) }}
                  </p>
                  <p v-if="order.status" class="mb-0 small">
                    <span>{{ order.status }}</span>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <!-- Left sidebar END -->

      <!-- Main content START -->
      <div class="col-lg-8">
        <!-- Not logged in banner -->
        <div v-if="!user && !isLoading" class="mt-6 mb-4">
          <div class="bg-grad-warning rounded p-4 text-center">
            <h2 class="text-white mb-3">You're Not Logged In</h2>
            <p class="text-white mb-4">
              Please log in to access your dashboard, courses, and downloads.
            </p>
            <button @click="router.push('/login')" class="btn btn-light btn-lg">
              <i class="bi bi-box-arrow-in-right me-2"></i>Go to Login
            </button>
          </div>
        </div>

        <!-- Subscription section for active subscribers -->
        <div
          v-if="subscription && isSubscriptionActive"
          class="container mt-6 p-0"
        >
          <div class="row">
            <div class="col-12 position-relative z-index-1">
              <!-- Decorative SVGs -->

              <div
                class="bg-grad-blue rounded position-relative z-index-n1 overflow-hidden p-4"
              >
                <!-- SVG decorations would go here -->
                <div
                  class="row g-3 align-items-center justify-content-lg-end position-relative py-4"
                >
                  <!-- Subscription message -->
                  <div class="col p-3">
                    <h2 class="text-white">You're a Subscriber!</h2>
                    <p class="text-white mb-0">
                      Thanks so much for supporting me! You're the best! 🙌 You
                      can watch anything in the catalog, which you can access
                      from the "courses" link in the menu.
                    </p>
                    <div class="mt-3 text-white">
                      <div><strong>Plan:</strong> {{ subscription.plan }}</div>
                      <div>
                        <strong>Billing Interval:</strong>
                        {{ subscription.interval }}
                      </div>
                      <div>
                        <strong>Current Period:</strong>
                        {{ formatDate(subscription.current_period_start) }} -
                        {{ formatDate(subscription.current_period_end) }}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div class="col-12 mt-4">
              <div class="d-sm-flex">
                <a
                  href="https://billing.stripe.com/p/login/28oaFsd7PgdXafCeUU"
                  class="btn btn-primary mb-0"
                  >Manage Subscription</a
                >
              </div>
            </div>
          </div>
        </div>

        <!-- Expired subscription notice -->
        <div
          v-if="subscription && !isSubscriptionActive"
          class="container mt-6 p-0"
        >
          <div class="row">
            <div class="col-12 position-relative z-index-1">
              <!-- Similar decorative elements as above -->
              <div
                class="bg-grad-pink rounded position-relative z-index-n1 overflow-hidden p-4"
              >
                <div
                  class="row g-3 align-items-center justify-content-lg-end position-relative py-4"
                >
                  <div class="col">
                    <h2 class="text-white">Your Subscription has Expired</h2>
                    <p class="text-white mb-0">
                      Your {{ subscription.plan }} subscription ended on
                      {{ formatDate(subscription.current_period_end) }}. Thanks
                      so much for your past support! Would love to have you
                      back! 🙌
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div class="col-12 mt-4">
              <div class="d-sm-flex">
                <a
                  href="https://billing.stripe.com/p/login/28oaFsd7PgdXafCeUU"
                  class="btn btn-primary mb-0"
                  >Reactivate Subscription</a
                >
              </div>
            </div>
          </div>
        </div>

        <!-- Courses section -->
        <div class="row g-4 mt-4">
          <h2>Your Courses</h2>
          <div v-for="course in courses" :key="course.id" class="col-sm-6">
            <CourseCard :course="course" />
          </div>
        </div>

        <!-- Downloads section -->
        <div v-if="downloads.length > 0" class="mt-4">
          <h2 class="my-4">Your Downloads</h2>
          <div
            v-for="download in downloads"
            :key="download.id"
            class="download-item"
          >
            <div class="card mb-3">
              <div class="row g-0">
                <div class="col-md-4">
                  <img
                    :src="download.image"
                    class="img-fluid rounded-start"
                    :alt="download.title"
                  />
                </div>
                <div class="col-md-8">
                  <div class="card-body">
                    <h5 class="card-title">{{ download.title }}</h5>
                    <p class="card-text">{{ download.description }}</p>
                    <button
                      @click="generateDownloadLink(download)"
                      class="btn btn-sm btn-outline-primary"
                      :disabled="isGeneratingLink === download.id"
                    >
                      <span v-if="isGeneratingLink === download.id">
                        <span
                          class="spinner-border spinner-border-sm"
                          role="status"
                          aria-hidden="true"
                        ></span>
                        Generating link...
                      </span>
                      <span v-else>Download</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <!-- Main content END -->
    </div>
  </div>
</template>

<script setup>
const router = useRouter();
const {
  user,
  userModel,
  logout,
  isLoading,
  authorizations,
  subscription,
  isAuthorizedFor,
} = useFirebaseAuth();
const { getOrdersByEmail } = useFirestore();
const { getSignedUrl, getDownloadUrlForAuthorization } = useFirebaseStorage();

// Reactive state for profile data
const isUpdating = ref(false);
const profile = ref({
  name: "",
  email: "",
});

// Orders data
const orders = ref([]);
const isLoadingOrders = ref(true);

// For download link generation
const isGeneratingLink = ref(null);

// Check if subscription is active (current_period_end is in the future)
const isSubscriptionActive = computed(() => {
  if (!subscription.value) return false;
  //return subscription.value.isActive();
});

// Process authorizations to get downloads
const downloads = computed(() => {
  if (!authorizations.value) return [];

  return authorizations.value
    .filter((auth) => auth.download && auth.download.trim() !== "")
    .map((auth) => ({
      id: auth.id,
      title: auth.sku || `${auth.sku} Download`,
      description: `Download for ${auth.sku}`,
      image: `/images/slides/${auth.sku}.jpg`,
      download: auth.download,
      sku: auth.sku, // Store the full authorization object for easier access
    }));
});

const courses = computed(() => {
  if (!authorizations.value) return [];

  return authorizations.value
    .filter((auth) => !auth.download || auth.download.trim() == "")
    .map((auth) => ({
      id: auth.id,
      slug: auth.sku,
      path: `/courses/${auth.sku}`,
    }));
});

// Function to generate and open a signed download URL
const generateDownloadLink = async (item) => {
  try {
    isGeneratingLink.value = item.id;

    // Check if we have a valid download URL
    if (!item.download) {
      alert("Download information not available.");
      return;
    }

    // Generate a signed URL using the Authorization model's method
    const downloadUrl = await getSignedUrl(item.download);

    if (!downloadUrl) {
      alert("Unable to generate download link. Please try again later.");
      return;
    }

    // Open the signed URL in a new tab
    location.href = downloadUrl;
  } catch (error) {
    console.error("Error generating download link:", error);
    alert("Failed to generate download link. Please try again later.");
  } finally {
    isGeneratingLink.value = null;
  }
};

// Watch user changes
watch(
  user,
  async (newUser) => {
    if (newUser) {
      // Update profile with user data
      profile.value.name = newUser.displayName || "";
      profile.value.email = newUser.email || "";

      // Fetch orders using our Firestore composable with email
      try {
        isLoadingOrders.value = true;
        orders.value = await getOrdersByEmail(newUser.email);
      } catch (error) {
        console.error("Failed to fetch orders:", error);
      } finally {
        isLoadingOrders.value = false;
      }
    } else {
      // Reset orders and loading state if not logged in
      orders.value = [];
      isLoadingOrders.value = false;
    }
  },
  { immediate: true }
);

// Also use userModel to populate profile when it changes
watch(
  userModel,
  (newUserModel) => {
    if (newUserModel) {
      profile.value.name = newUserModel.name || "";
      profile.value.email = newUserModel.email || "";
    }
  },
  { immediate: true }
);

const updateProfile = async () => {
  isUpdating.value = true;
  try {
    // In a real app, we would call an API to update the profile
    console.log("Updating profile:", profile.value);
    await new Promise((resolve) => setTimeout(resolve, 1000)); // Fake delay
    // Success message would go here
  } catch (error) {
    console.error("Failed to update profile:", error);
    // Error message would go here
  } finally {
    isUpdating.value = false;
  }
};

const formatDate = (dateObj) => {
  if (!dateObj) return "";
  const date = new Date(dateObj.seconds * 1000);
  return date.toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

const formatOrderDate = (date) => {
  if (!date) return "";
  // Handle both timestamp objects and ISO strings
  const dateObj = date.seconds ? new Date(date.seconds * 1000) : new Date(date);

  return dateObj.toLocaleDateString(undefined, {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

useHead({
  title: "Your Dashboard",
  meta: [
    {
      name: "description",
      content: "User dashboard with profile and order management.",
    },
  ],
});
</script>

<style scoped>
/* Add any specific styling for dashboard components here */
.bg-grad-blue {
  background: linear-gradient(to right, #0d6efd, #0dcaf0);
}

.bg-grad-pink {
  background: linear-gradient(to right, #d63384, #dc3545);
}

.bg-grad-warning {
  background: linear-gradient(to right, #fd7e14, #ffc107);
}

.bg-grad-warning {
  background: linear-gradient(to right, #ffc107, #fd7e14);
}

.rotate-74 {
  transform: rotate(-74deg);
}

.avatar-xxl {
  width: 8rem;
  height: 8rem;
}

.z-index-1 {
  z-index: 1;
}

.z-index-n1 {
  z-index: -1;
}

.mt-6 {
  margin-top: 4rem;
}

.icon-md {
  width: 2.5rem;
  height: 2.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
