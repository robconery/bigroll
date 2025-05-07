<template>
  <section class="py-lg-5">
    <div class="container position-relative">
      <div class="row">
        <div class="col-12">
          <!-- SVG decoration START -->
          <figure class="position-absolute top-50 start-50 translate-middle">
            <svg>
              <path
                class="fill-white opacity-2"
                d="m496 22.999c0 10.493-8.506 18.999-18.999 18.999s-19-8.506-19-18.999 8.507-18.999 19-18.999 18.999 8.506 18.999 18.999z"
              ></path>
              <path
                class="fill-white opacity-2"
                d="m775 102.5c0 5.799-4.701 10.5-10.5 10.5-5.798 0-10.499-4.701-10.499-10.5 0-5.798 4.701-10.499 10.499-10.499 5.799 0 10.5 4.701 10.5 10.499z"
              ></path>
              <path
                class="fill-white opacity-2"
                d="m192 102c0 6.626-5.373 11.999-12 11.999s-11.999-5.373-11.999-11.999c0-6.628 5.372-12 11.999-12s12 5.372 12 12z"
              ></path>
              <path
                class="fill-white opacity-2"
                d="m20.499 10.25c0 5.66-4.589 10.249-10.25 10.249-5.66 0-10.249-4.589-10.249-10.249-0-5.661 4.589-10.25 10.249-10.25 5.661-0 10.25 4.589 10.25 10.25z"
              ></path>
            </svg>
          </figure>
          <!-- SVG decoration END -->

          <div class="bg-dark p-sm-5 rounded-3 striped">
            <div class="row justify-content-center position-relative">
              <!-- Svg decoration START -->
              <figure
                class="fill-white opacity-1 position-absolute top-50 start-0 translate-middle-y"
              >
                <svg width="141px" height="141px">
                  <path
                    d="M140.520,70.258 C140.520,109.064 109.062,140.519 70.258,140.519 C31.454,140.519 -0.004,109.064 -0.004,70.258 C-0.004,31.455 31.454,-0.003 70.258,-0.003 C109.062,-0.003 140.520,31.455 140.520,70.258 Z"
                  ></path>
                </svg>
              </figure>
              <!-- SVG decoration END -->

              <!-- Action box -->
              <div class="col-12 position-relative">
                <div class="row align-items-center px-4">
                  <div class="col-lg-2 text-center py-4">
                    <img
                      :src="`/images/testimonials/${image}`"
                      class="img-fluid avatar avatar-img rounded-circle"
                      alt=""
                    />
                  </div>
                  <!-- Title -->
                  <div class="col">
                    <h3 class="text-white mb-3">{{ title }}</h3>
                    <blockquote class="text-white">
                      <slot></slot>
                      <p v-if="name" class="">
                        <i
                          ><b>{{ name }}</b></i
                        >
                      </p>
                    </blockquote>
                  </div>
                </div>
                <!-- Row END -->
              </div>
            </div>
          </div>
        </div>
      </div>
      <!-- Row END -->
    </div>
  </section>
</template>

<script setup lang="ts">
defineProps({
  image: {
    type: String,
    default: null,
  },
  title: {
    type: String,
    default: null,
  },
  name: {
    type: String,
    default: null,
  },
});
</script>

<style></style>
