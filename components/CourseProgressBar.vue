<template>
  <div class="course-progress position-relative">
    <div class="progress" style="height: 6px">
      <div
        class="progress-bar bg-success"
        role="progressbar"
        :style="{ width: `${progress}%` }"
        :aria-valuenow="progress"
        aria-valuemin="0"
        aria-valuemax="100"
      ></div>
    </div>
    <div
      class="progress-stats d-flex justify-content-between mt-1"
      v-if="showStats"
    >
      <small class="fw-light">
        <span v-if="completedCount !== undefined && totalLessons !== undefined">
          {{ completedCount }} of {{ totalLessons }} completed
        </span>
      </small>
      <small class="fw-light">{{ progress }}% complete</small>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps({
  progress: {
    type: Number,
    default: 0,
  },
  completedCount: {
    type: Number,
    default: undefined,
  },
  totalLessons: {
    type: Number,
    default: undefined,
  },
  showStats: {
    type: Boolean,
    default: true,
  },
});
</script>

<style scoped>
.course-progress {
  width: 100%;
}

.progress-stats {
  font-size: 0.75rem;
  color: #6c757d;
}
</style>
