<template>
  <a :href="link" class="btn btn-primary text-uppercase py-3 px-7 fs-6 striped">
    {{ text }}
  </a>
</template>

<script lang="ts" setup>
defineProps({
  link: {
    type: String,
    default: null,
  },
  text: {
    type: String,
    default: null,
  },
});
</script>

<style></style>
