<template>
  <div class="col-md-6 col-xl-4">
    <div class="card p-2 shadow h-100 card-hover">
      <div class="rounded-top overflow-hidden" v-if="image">
        <div class="">
          <!-- Image -->
          <img :src="image" class="card-img-top" alt="course image" />
        </div>
      </div>
      <!-- Card body -->
      <div class="card-body">
        <!-- Rating and avatar -->
        <!-- Divider -->
        <hr v-if="image" />
        <!-- Title -->
        <h5 class="card-title" v-if="title">
          {{ title }}
        </h5>
        <!-- Badge and Price -->
        <div class="d-flex justify-content-between align-items-center mb-0">
          <slot></slot>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps({
  image: {
    type: String,
    required: false,
  },
  title: {
    type: String,
    required: false,
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
