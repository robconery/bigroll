<template>
  <section>
    <div class="container">
      <div class="row">
        <div class="col-lg-8 mx-auto">
          <slot />
        </div>
      </div>
      <div class="row mb-4">
        <div class="col-md-8 text-center mx-auto">
          <div class="video-player" v-if="vimeo">
            <div class="embed-container w-100" color="mx-auto">
              <iframe
                id="vimeo-player"
                class="w-full mx-auto"
                :src="`https://player.vimeo.com/video/${vimeo}`"
                frameborder="0"
                allow="autoplay; fullscreen"
                allowfullscreen
              ></iframe>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
defineProps({
  vimeo: {
    type: String,
    default: null,
  },
});
</script>
<style></style>
