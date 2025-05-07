<template>
  <section class="titled">
    <div class="container py-xl-6">
      <div class="row">
        <div class="col-lg-8 mx-auto">
          <slot />
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
defineProps({});
</script>
<style>
.titled {
  padding: 2rem 0;
  text-align: center;
}
</style>
