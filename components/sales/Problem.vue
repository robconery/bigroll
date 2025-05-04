<template>
  <div
    class="container bg-light px-2 position-relative rounded-4 striped py-2 py-lg-7"
  >
    <figure class="position-absolute top-0 start-0 d-none d-lg-block ms-n7">
      <DecorationYellowBlob></DecorationYellowBlob>
    </figure>
    <figure class="position-absolute top-0 end-0 mt-5 me-n5 d-none d-sm-block">
      <DecorationBlueCircle></DecorationBlueCircle>
    </figure>
    <div
      class="row justify-content-center align-items-center position-relative"
    >
      <div
        class="col-lg-4 col-xl-9 text-center text-lg-start ps-0"
        v-if="image"
      >
        <!-- Image -->
        <img :src="image" alt="" />
      </div>
      <div class="col-lg-8 text-center text-lg-start">
        <!-- Content -->
        <slot />
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
});
</script>
