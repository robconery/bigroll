<template>
  <section class="story-section">
    <div class="container">
      <div class="col-lg-8 mx-auto">
        <slot />
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
defineProps({
  image: {
    type: String,
    required: false,
  },
});
</script>
