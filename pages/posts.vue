<template>
  <main class="overflow-hidden">
    <div class="pt-2 pt-lg-4 pb-4 pb-lg-8">
      <div class="container">
        <h1 class="text-center">Blog Posts</h1>
        <div class="row justify-content-center mt-lg-5">
          <div class="col-xl-8">
            <p class="lede">
              Thoughts, tutorials, and insights about web development,
              programming, and technology.
            </p>
          </div>
        </div>

        <div
          class="mt-4"
          v-for="(postsInCategory, category) in postsByCategory"
          :key="category"
        >
          <h2 class="mb-4">{{ category }}</h2>
          <div class="row g-4">
            <div
              v-for="post in postsInCategory"
              :key="post._path"
              class="col-12 mb-4"
            >
              <div
                class="card card-hover-shadow h-100 border-0 rounded-4 shadow"
              >
                <div class="row g-0">
                  <!-- Post content -->
                  <div class="col-md-12">
                    <div class="card-body">
                      <!-- Post header -->
                      <div class="d-flex align-items-center mb-2">
                        <div class="badge bg-primary me-2">
                          {{ post.categories }}
                        </div>
                        <small class="text-muted">{{
                          formatDate(post.date)
                        }}</small>
                      </div>
                      <!-- Title -->
                      <h5 class="card-title">
                        <NuxtLink
                          :to="`/${post.categories.toLowerCase()}/${post.slug}`"
                          class="stretched-link text-decoration-none"
                        >
                          {{ post.title }}
                        </NuxtLink>
                      </h5>
                      <p class="card-text mb-3" v-html="post.summary"></p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div
          v-if="Object.keys(postsByCategory).length === 0"
          class="text-center py-5"
        >
          <p class="fs-5">No posts available yet. Check back soon!</p>
        </div>
      </div>
    </div>
  </main>
</template>

<script setup>
// Fetch all posts
const { data: posts } = await useAsyncData("posts-all", () => {
  return queryCollection("posts").all();
});

// Group posts by category
const postsByCategory = computed(() => {
  if (!posts.value) return {};

  const grouped = {};
  posts.value.forEach((post) => {
    const category = post.categories || "Uncategorized";
    if (!grouped[category]) {
      grouped[category] = [];
    }
    grouped[category].push(post);
  });

  // Sort posts within each category by date (newest first)
  Object.keys(grouped).forEach((category) => {
    grouped[category].sort((a, b) => new Date(b.date) - new Date(a.date));
  });

  return grouped;
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
</style>
