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
          class="mt-5"
          v-for="[year, postsInYear] in Object.entries(postsByYear).reverse()"
          :key="year"
        >
          <h2 class="mb-4 border-bottom pb-2">{{ year }}</h2>
          <ul class="list-unstyled">
            <li
              v-for="post in postsInYear"
              :key="post._path"
              class="mb-4 pb-3 border-bottom border-light"
            >
              <div class="mb-2">
                <h5 class="mb-2 d-flex align-items-center">
                  <NuxtLink
                    :to="`/${post.categories.toLowerCase()}/${post.slug}`"
                    class="text-decoration-none me-3"
                  >
                    {{ post.title }}
                  </NuxtLink>
                  <span class="badge bg-primary">
                    {{ post.categories }}
                  </span>
                </h5>
                <p class="text-dark mb-2" v-html="post.summary"></p>
                <small class="text-muted">{{ formatDate(post.date) }}</small>
              </div>
            </li>
          </ul>
        </div>

        <div
          v-if="Object.keys(postsByYear).length === 0"
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
