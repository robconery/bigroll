<script setup>
import { useRoute } from "vue-router";
const slug = useRoute().params.slug;
const { data: document } = await useAsyncData(`offers-${slug}`, () => {
  return queryCollection("offers").where("offer", "=", slug).first();
});
</script>

<template>
  <div class="container-fluid mx-auto p-0 py-8" style="min-height: 500px">
    <ContentRenderer v-if="document" :value="document" />
    <div v-else>Loading content...</div>
  </div>
</template>
