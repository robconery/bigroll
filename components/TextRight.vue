<template>
  <div class="container">
    <div class="row g-4 align-items-center py-4">
      <div class="col-md-6 text-md-end position-relative py-3 py-lg-6 px-4">
        <!-- SVG decoration -->
        <figure
          class="position-absolute top-50 end-0 translate-middle-y me-n8 pe-6 pt-6"
        >
          <DecorationBigBlueBlob v-if="blob"></DecorationBigBlueBlob>
        </figure>
        <!-- Image -->
        <img :src="image" class="position-relative rounded-3" alt="" />
      </div>

      <div class="col-md-5 position-relative z-index-9 px-4">
        <slot></slot>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  blob: {
    type: Boolean,
    default: false,
  },
  image: {
    type: String,
    default: null,
  },
});
</script>

<style></style>
