<template>
  <div class="container mt-5 h-full" style="min-height: 300px">
    <h1>Search Results</h1>
    <div v-if="searchTerm" class="mb-4">
      <p>
        Showing results for: <strong>{{ searchTerm }}</strong>
      </p>
    </div>
    <div v-if="isLoading" class="spinner-border text-primary" role="status">
      <span class="visually-hidden">Loading...</span>
    </div>
    <div v-else-if="error">
      <p class="text-danger">
        Error fetching search results: {{ error.message || "Unknown error" }}
      </p>
    </div>
    <div v-if="posts && posts.length > 0">
      <h2 class="p2">✍🏻 Posts</h2>
      <ul class="list-group">
        <li v-for="result in posts" :key="result._path" class="">
          <NuxtLink :to="getPostLink(result)">
            <p>{{ result.title || "Untitled Document" }}</p>
          </NuxtLink>
        </li>
      </ul>
    </div>
    <div v-if="lessons && lessons.length > 0">
      <h2 class="p2">▶️ Lessons</h2>
      <ul class="list-group">
        <li v-for="result in lessons" :key="result._path" class="">
          <NuxtLink :to="`/courses/${result.course}/${result.slug}`">
            <p>{{ result.title || "Untitled Document" }}</p>
          </NuxtLink>
        </li>
      </ul>
    </div>
    <div
      v-if="
        (!posts || posts.length === 0) && (!lessons || lessons.length === 0)
      "
    >
      <p v-if="searchTerm">
        <!-- Only show 'no results' if a search was actually made -->
        No results found for "{{ searchTerm }}". Try a different search term.
      </p>
      <p v-else>Please enter a search term to begin.</p>
    </div>
  </div>
</template>

<script setup>
const route = useRoute();
const error = ref(null);
const isLoading = ref(true);

const searchTerm = computed(() => {
  const query = route.query.q;
  return typeof query === "string" && query.trim() !== "" ? query.trim() : "";
});

if (searchTerm.value && searchTerm.value.length < 3) {
  error.value = new Error("Search term must be at least 3 characters long.");
  isLoading.value = false;
}
if (!error.value) {
  isLoading.value = true;
  const { data: lessons } = await useAsyncData("lessons-search", () => {
    return queryCollection("lessons")
      .where("summary", "LIKE", `%${searchTerm.value}%`)
      .all();
  });
  const { data: posts } = await useAsyncData("posts-search", () => {
    return queryCollection("posts")
      .where("summary", "LIKE", `%${searchTerm.value}%`)
      .all();
  });
}

// Function to get proper post link with category
const getPostLink = (post) => {
  // Extract category from post data
  let category = "uncategorized";
  // Get slug from post
  const slug = post.slug || (post._path ? post._path.split("/").pop() : "");

  return `/${post.categories}/${slug}`;
};

isLoading.value = false;
</script>

<style scoped>
.container {
  max-width: 800px;
}
.list-group-item h5 {
  margin-bottom: 0.25rem;
}
</style>
