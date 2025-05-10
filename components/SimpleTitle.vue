<template>
  <section class="titled">
    <div class="container py-xl-3">
      <div class="row">
        <div class="col-lg-8 mx-auto mb-4" v-if="image">
          <img :src="image" class="rounded-4" alt="" />
        </div>
        <div class="col-lg-8 mx-auto">
          <slot />
        </div>
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
