<template>
  <div class="card mb-3">
    <div class="row g-0">
      <div class="col-md-4">
        <img
          :src="download.image"
          class="img-fluid rounded-start"
          :alt="download.title"
        />
      </div>
      <div class="col-md-8">
        <div class="card-body">
          <h5 class="card-title">{{ download.title }}</h5>
          <p class="card-text">{{ download.description }}</p>
          <button
            @click="$emit('generate-download-link', download)"
            class="btn btn-sm btn-outline-primary"
            :disabled="isGeneratingLink === download.id"
          >
            <span v-if="isGeneratingLink === download.id">
              <span
                class="spinner-border spinner-border-sm"
                role="status"
                aria-hidden="true"
              ></span>
              Generating link...
            </span>
            <span v-else>Download</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
// 📁 Download card component for displaying downloadable items
defineProps({
  download: {
    type: Object,
    required: true
  },
  isGeneratingLink: {
    type: [String, Number, null],
    default: null
  }
});

defineEmits(['generate-download-link']);
</script>
