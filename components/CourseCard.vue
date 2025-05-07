<template>
  <div class="card shadow h-100 card-hover">
    <div class="rounded-top overflow-hidden">
      <img :src="image" class="card-img-top" alt="course image" />
    </div>
    <!-- Card body -->
    <div class="card-body">
      <!-- Title -->
      <h5 class="card-title">
        <NuxtLink :to="link" class="stretched-link">
          {{ title }}
        </NuxtLink>
      </h5>
      <!-- Content -->
      <p>{{ summary }}</p>
      <div v-if="$slots.default">
        <slot></slot>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps({
  image: {
    type: String,
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  summary: {
    type: String,
    required: true,
  },
  link: {
    type: String,
    required: true,
  },
});
</script>

<style scoped>
.card-hover {
  transition: all 0.3s ease;
  transform: translateY(0);
}

.card-hover:hover {
  transform: translateY(-8px);
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.15) !important;
}
</style>
