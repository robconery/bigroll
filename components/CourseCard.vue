<template>
  <div class="card shadow h-100 card-hover">
    <div class="rounded-top overflow-hidden">
      <NuxtLink :to="course.path" class="stretched-link">
        <img
          :src="`/images/slides/${course.slug}.jpg`"
          class="card-img-top"
          alt="course image"
        />
      </NuxtLink>
    </div>
    <!-- Card body -->
    <div class="card-body" v-if="course.title">
      <!-- Title -->
      <h5 class="card-title">
        <NuxtLink :to="course.path" class="stretched-link">
          {{ course.title }}
        </NuxtLink>
      </h5>
      <!-- Content -->
      <p>{{ course.description }}</p>
      <div v-if="$slots.default">
        <slot></slot>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps({
  course: {
    type: Object,
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
