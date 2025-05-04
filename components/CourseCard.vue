<template>
  <div class="card shadow h-100">
    <!-- Image -->
    <NuxtLink :to="`/courses/${course.slug}`">
      <img
        :src="course.image || `/images/slides/${course.slug}.jpg`"
        class="card-img-top"
        alt="course image"
      />
    </NuxtLink>
    <!-- Card body -->
    <div class="card-body pb-0" v-if="course.title">
      <!-- Title -->
      <NuxtLink :to="`/courses/${course.slug}`">
        <h5 class="card-title fw-normal">{{ course.title }}</h5>
      </NuxtLink>
      <p class="mb-2 text-truncate-2" v-html="course.summary"></p>
      <span v-if="course.access === 'Free'" class="badge bg-success text-white">
        <i class="fa fa-lock-open me-0"></i>
        Free!
      </span>
    </div>
    <!-- Card footer -->
    <div class="card-footer pt-0 pb-3" v-if="course.videoCount > 0">
      <hr />
      <div class="d-flex justify-content-between">
        <span class="h6 fw-light mb-0" v-if="course.duration">
          <i class="far fa-clock text-danger me-2"></i>{{ course.duration }}
        </span>
        <span class="h6 fw-light mb-0">
          <i class="fas fa-table text-orange me-2"></i
          >{{ course.videoCount || "0" }} Videos
        </span>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  course: {
    type: Object,
    required: true,
  },
});
</script>

<style scoped>
.text-truncate-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
