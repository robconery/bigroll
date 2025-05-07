<template>
  <div class="col-12 col-md-6 col-lg-4 mb-4">
    <div
      class="bg-light text-center p-4 rounded-3 border border-1 position-relative"
    >
      <!-- Avatar -->
      <div class="avatar-xxl text-center mb-3 mx-auto">
        <img
          class="avatar-img rounded-circle"
          :src="`/images/testimonials/${image}`"
          alt="avatar"
        />
      </div>
      <!-- Title -->
      <h6 class="mb-2">{{ name }}</h6>
      <!-- Content -->
      <blockquote class="mt-1">
        <p>
          <span class="me-1 small"><i class="fas fa-quote-left"></i></span>
          <slot></slot>
          <span class="ms-1 small"><i class="fas fa-quote-right"></i></span>
        </p>
      </blockquote>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps({
  image: {
    type: String,
    default: null,
  },
  name: {
    type: String,
    default: null,
  },
});
</script>

<style>
.tiny {
  font-size: 12px !important;
  font-style: italic;
}
</style>
