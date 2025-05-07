<template>
  <section class="pt-0">
    <div class="container">
      <div class="row">
        <div class="col-12">
          <div
            class="bg-light p-sm-4 p2 border border-1 rounded-3 position-relative overflow-hidden"
          >
            <div class="col-12 mx-auto position-relative">
              <div class="row align-items-center p-4 p-lg-0">
                <!-- Title -->
                <div class="col-lg-7 text-center mx-auto">
                  <h3 class="py-3 py-lg-0">{{ title }}</h3>

                  <slot></slot>
                  <p v-if="link">
                    <BigButton :text="buttonText" :link="link" class="mt-4" />
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
defineProps({
  title: {
    type: String,
    default: null,
  },
  image: {
    type: String,
    default: null,
  },
  link: {
    type: String,
    default: null,
  },
  buttonText: {
    type: String,
    default: null,
  },
});
</script>

<style></style>
