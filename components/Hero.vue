<template>
  <div class="container-fluid" id="hero">
    <!-- Title -->
    <div class="container mx-auto" style="min-height: 500px">
      <div class="row align-items-center g-5">
        <!-- Left content START -->
        <div
          class="col-lg-5 col-xl-6 position-relative z-index-1 text-center text-lg-start mb-lg-5 mb-sm-0"
        >
          <!-- Content -->
          <div class="my-4 lead">
            <slot></slot>
          </div>
        </div>
        <!-- Left content END -->

        <!-- Right content START -->
        <div class="col-lg-7 col-xl-6 text-center position-relative">
          <!-- Image -->
          <div class="position-relative">
            <img
              :src="image"
              class="rounded-4 striped"
              alt=""
              style="max-height: 550px"
            />
          </div>
        </div>
        <!-- Right content END -->
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
});
</script>

<style scoped>
.hero-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 3rem 1rem;
  background-color: #f8f9fa;
  border-radius: 8px;
  margin-bottom: 2rem;
}

.hero-image {
  max-width: 100%;
  margin-bottom: 2rem;
}

.hero-image img {
  max-width: 100%;
  height: auto;
  border-radius: 8px;
}

.hero-content {
  text-align: center;
  max-width: 800px;
}

@media (min-width: 768px) {
  .hero-container {
    padding: 5rem 2rem;
  }
}
</style>
