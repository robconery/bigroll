<template>
  <div class="container py-8">
    <div class="row">
      <!-- Main content column -->
      <div class="col-lg-8 mx-auto">
        <div v-if="post" class="blog-post">
          <!-- Post header -->
          <div class="mb-4">
            <div class="d-flex align-items-center mb-3">
              <span class="badge bg-primary me-2">{{ post.categories }}</span>
              <span class="text-muted">{{ formatDate(post.date) }}</span>
            </div>
            <h1 class="display-5 mb-3">{{ post.title }}</h1>
            <p class="lead" v-html="post.summary"></p>
          </div>

          <!-- Featured Image -->
          <div v-if="post.image" class="featured-image mb-4">
            <img
              :src="post.image"
              :alt="post.title"
              class="img-fluid rounded shadow-sm"
            />
          </div>

          <!-- Post content -->
          <div class="post-content">
            <ContentRenderer :value="post" />
          </div>

          <!-- Post navigation -->
          <div class="mt-5 pt-3 border-top">
            <div class="row">
              <div class="col-6 text-start">
                <NuxtLink
                  v-if="prevPost"
                  :to="`/${prevPost.categories.toLowerCase()}/${prevPost.slug}`"
                  class="btn btn-outline-primary"
                >
                  <i class="bi bi-arrow-left me-2"></i>
                  Previous Post
                </NuxtLink>
              </div>
              <div class="col-6 text-end">
                <NuxtLink
                  v-if="nextPost"
                  :to="`/${nextPost.categories.toLowerCase()}/${nextPost.slug}`"
                  class="btn btn-outline-primary"
                >
                  Next Post
                  <i class="bi bi-arrow-right ms-2"></i>
                </NuxtLink>
              </div>
            </div>
          </div>
        </div>

        <!-- Loading state -->
        <div v-else-if="pending" class="text-center py-5">
          <div class="spinner-border text-primary" role="status">
            <span class="visually-hidden">Loading...</span>
          </div>
        </div>

        <!-- Not found state -->
        <div v-else class="text-center py-5">
          <h2>Post Not Found</h2>
          <p>
            Sorry, the post you're looking for doesn't exist or has been
            removed.
          </p>
          <NuxtLink to="/posts" class="btn btn-primary">Back to Blog</NuxtLink>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
const route = useRoute();
const { category, slug } = route.params;

// Fetch all posts in the specified category
// Fetch current post
const { data: post } = await useAsyncData(`post-${category}-${slug}`, () => {
  // Find post with matching slug in the specified category
  return queryCollection("posts")
    .where("slug", "=", slug)
    .where("categories", "=", category.toLowerCase())
    .first();
});

// Fetch all posts in the same category for navigation
const { data: categoryPosts } = await useAsyncData(
  `category-posts-${category}`,
  () => {
    return queryCollection("posts").where("categories", "=", category).all();
  }
);
const pending = computed(() => {
  return post.value === null && categoryPosts.value === null;
});
// Find previous and next posts for navigation
const currentIndex = computed(() => {
  if (!categoryPosts.value || !post.value) return -1;
  return categoryPosts.value.findIndex((p) => p.slug === post.value.slug);
});

const prevPost = computed(() => {
  if (currentIndex.value > 0 && categoryPosts.value) {
    return categoryPosts.value[currentIndex.value - 1];
  }
  return null;
});

const nextPost = computed(() => {
  if (
    currentIndex.value !== -1 &&
    currentIndex.value < categoryPosts.value?.length - 1 &&
    categoryPosts.value
  ) {
    return categoryPosts.value[currentIndex.value + 1];
  }
  return null;
});

// Format date for display
const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

// Set page metadata
useHead(() => ({
  title: post.value?.title || "Post Not Found",
  meta: [
    {
      name: "description",
      content: post.value?.summary || "Blog post not found",
    },
    {
      property: "og:title",
      content: post.value?.title || "Post Not Found",
    },
    {
      property: "og:description",
      content: post.value?.summary || "Blog post not found",
    },
    ...(post.value?.image
      ? [
          {
            property: "og:image",
            content: post.value.image,
          },
        ]
      : []),
  ],
}));
</script>
<style>
pre > code {
  color: aliceblue !important;
}
</style>
