<template>
  <main class="overflow-hidden">
    <!-- Hero Section -->
    <section class="position-relative" id="hero">
      <div class="container">
        <div class="row justify-content-center">
          <div class="col-xl-10">
            <div class="text-center py-5 py-lg-6">
              <!-- Decorative elements -->
              <figure
                class="position-absolute top-0 start-0 d-none d-lg-block ms-n7 mt-5"
              >
                <DecorationYellowBlob></DecorationYellowBlob>
              </figure>
              <figure
                class="position-absolute top-0 end-0 mt-3 me-n5 d-none d-sm-block"
              >
                <DecorationBlueCircle></DecorationBlueCircle>
              </figure>

              <!-- Title -->
              <h1 class="display-4 fw-bold mb-4">
                <span class="phased">Blog Archive</span>
              </h1>

              <!-- Subtitle -->
              <div class="row justify-content-center">
                <div class="col-lg-8 col-xl-7">
                  <p class="lead fs-5 text-dark-emphasis mb-4">
                    A collection of my thoughts, tutorials, and insights about
                    web development, programming, and technology. For more
                    recent content, check out
                    <a
                      href="https://a.bigmachine.io"
                      class="text-primary fw-semibold text-decoration-none"
                      >my newsletter</a
                    >.
                  </p>
                </div>
              </div>

              <!-- Stats -->
              <div class="row justify-content-center mt-4">
                <div class="col-auto">
                  <div class="d-flex align-items-center gap-4">
                    <div class="text-center">
                      <div class="fs-4 fw-bold text-primary">
                        {{ Object.keys(postsByYear).length }}
                      </div>
                      <small class="text-muted text-uppercase">Years</small>
                    </div>
                    <div class="vr"></div>
                    <div class="text-center">
                      <div class="fs-4 fw-bold text-primary">
                        {{ totalPosts }}
                      </div>
                      <small class="text-muted text-uppercase">Articles</small>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Background decoration -->
      <figure
        class="position-absolute bottom-0 start-50 translate-middle-x d-none d-lg-block"
      >
        <DecorationLattice></DecorationLattice>
      </figure>
    </section>

    <!-- Posts Section -->
    <section class="py-5">
      <div class="container">
        <div class="row justify-content-center">
          <div class="col-xl-10">
            <div
              v-for="[year, postsInYear] in Object.entries(
                postsByYear
              ).reverse()"
              :key="year"
              class="mb-5"
            >
              <!-- Year Header -->
              <div class="d-flex align-items-center mb-4">
                <div class="bg-primary rounded-circle p-3 me-3">
                  <h3 class="text-white mb-0 fw-bold">{{ year }}</h3>
                </div>
                <div class="flex-grow-1">
                  <hr class="mb-0" style="height: 2px; opacity: 0.1" />
                </div>
                <small class="text-muted ms-3"
                  >{{ postsInYear.length }} article{{
                    postsInYear.length !== 1 ? "s" : ""
                  }}</small
                >
              </div>

              <!-- Posts Grid -->
              <div class="row g-4">
                <div
                  v-for="post in postsInYear"
                  :key="post._path"
                  class="col-lg-6"
                >
                  <article
                    class="card h-100 border-0 shadow-sm card-hover-lift"
                  >
                    <div class="card-body p-4">
                      <!-- Category Badge -->
                      <div class="mb-3">
                        <span
                          class="badge bg-primary-soft text-primary px-3 py-2 rounded-pill"
                        >
                          {{ post.categories }}
                        </span>
                      </div>

                      <!-- Title -->
                      <h4 class="card-title mb-3 lh-base">
                        <NuxtLink
                          :to="`/${post.categories.toLowerCase()}/${post.slug}`"
                          class="text-decoration-none text-dark stretched-link"
                        >
                          {{ post.title }}
                        </NuxtLink>
                      </h4>

                      <!-- Summary -->
                      <p
                        class="card-text text-dark-emphasis mb-3 text-truncate-3"
                        v-html="post.summary"
                      ></p>

                      <!-- Meta -->
                      <div class="d-flex align-items-center text-muted small">
                        <i class="bi bi-calendar3 me-2"></i>
                        <span>{{ formatDate(post.date) }}</span>
                        <span class="mx-2">•</span>
                        <i class="bi bi-clock me-2"></i>
                        <span>5 min read</span>
                      </div>
                    </div>
                  </article>
                </div>
              </div>
            </div>

            <!-- Empty State -->
            <div
              v-if="Object.keys(postsByYear).length === 0"
              class="text-center py-5"
            >
              <div class="mb-4">
                <i
                  class="bi bi-journal-text display-1 text-muted opacity-50"
                ></i>
              </div>
              <h3 class="text-muted mb-3">No posts available yet</h3>
              <p class="text-muted">Check back soon for new content!</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  </main>
</template>

<script setup>
// Fetch all posts
const { data: posts } = await useAsyncData("posts-all", () => {
  return queryCollection("posts").all();
});

// Total posts count for hero stats
const totalPosts = computed(() => {
  return posts.value ? posts.value.length : 0;
});

// Group posts by year
const postsByYear = computed(() => {
  if (!posts.value) return {};

  const grouped = {};
  posts.value.forEach((post) => {
    const year = new Date(post.date).getFullYear().toString();
    if (!grouped[year]) {
      grouped[year] = [];
    }
    grouped[year].push(post);
  });

  // Sort posts within each year by date (newest first)
  Object.keys(grouped).forEach((year) => {
    grouped[year].sort((a, b) => new Date(b.date) - new Date(a.date));
  });

  // Sort years in descending order (newest first)
  const sortedGrouped = {};
  const years = Object.keys(grouped).map((year) => parseInt(year, 10));
  years.sort((a, b) => b - a); // Sort numerically, descending order
  years.forEach((year) => {
    sortedGrouped[year.toString()] = grouped[year.toString()];
  });

  return sortedGrouped;
});

// Format date for display
const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

useHead({
  title: "Blog Posts",
  meta: [
    {
      name: "description",
      content:
        "Thoughts, tutorials, and insights about web development, programming, and technology.",
    },
  ],
});
</script>

<style scoped>
.hero-section {
  background: linear-gradient(135deg, #fafafa 0%, #f5f5f5 100%);
  position: relative;
  overflow: hidden;
}

.hero-section::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: radial-gradient(
      circle at 20% 50%,
      rgba(204, 79, 7, 0.05) 0%,
      transparent 50%
    ),
    radial-gradient(
      circle at 80% 20%,
      rgba(204, 79, 7, 0.03) 0%,
      transparent 50%
    );
}

.hero-content {
  position: relative;
  z-index: 2;
}

.gradient-text {
  background: linear-gradient(
    135deg,
    var(--bs-primary) 0%,
    var(--primary-600) 100%
  );
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.stats-card {
  backdrop-filter: blur(10px);
  background: rgba(255, 255, 255, 0.8);
  border: 1px solid rgba(255, 255, 255, 0.2);
  transition: all 0.3s ease;
}

.stats-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 30px rgba(204, 79, 7, 0.1);
}

.card-hover-lift {
  transition: all 0.3s ease;
  border: 1px solid rgba(0, 0, 0, 0.05);
}

.card-hover-lift:hover {
  transform: translateY(-8px);
  box-shadow: 0 15px 35px rgba(0, 0, 0, 0.1);
  border-color: rgba(204, 79, 7, 0.2);
}

.text-truncate-3 {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.text-truncate-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.lede {
  font-size: 1.25rem;
  font-weight: 300;
  line-height: 1.5;
  text-align: center;
  margin-bottom: 2rem;
}

.decoration-element {
  position: absolute;
  pointer-events: none;
  z-index: 1;
}

.decoration-1 {
  top: 10%;
  left: 5%;
  opacity: 0.6;
}

.decoration-2 {
  top: 20%;
  right: 10%;
  opacity: 0.4;
}

.decoration-3 {
  bottom: 15%;
  left: 15%;
  opacity: 0.3;
}

.stretched-link:hover {
  color: var(--bs-primary) !important;
}

.bg-primary-soft {
  background-color: rgba(var(--bs-primary-rgb), 0.1) !important;
}

.badge.bg-primary-soft {
  font-weight: 500;
  font-size: 0.75rem;
}

@media (max-width: 768px) {
  .hero-section {
    padding: 3rem 0;
  }

  .card-hover-lift:hover {
    transform: none;
  }

  .stats-card:hover {
    transform: none;
  }
}
</style>
