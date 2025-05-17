<template>
  <div>
    <!-- Hero section -->
    <section id="hero">
      <div class="container">
        <div class="row justify-content-center">
          <div class="col-xl-12">
            <div class="row align-items-center g-5 my-md-6">
              <!-- Left content START -->
              <div
                class="col-lg-5 col-xl-6 position-relative z-index-1 text-center text-lg-start mb-5 mb-sm-0"
              >
                <h1 class="mb-0 display-6">
                  Books and Videos for Self-taught Programmers
                </h1>
                <!-- Content -->
                <div class="my-4 lead pt-2">
                  <p>
                    <b>Don't have a degree and feel like you should?</b> Hey me
                    too! Then again I love teaching myself things and sharing
                    with people and I wouldn't have it any other way. That's
                    what I do here. You've taken yourself this far,<b>
                      now the fun starts</b
                    >
                  </p>
                </div>
              </div>
              <!-- Left content END -->

              <!-- Right content START -->
              <div class="col-lg-7 col-xl-6 text-center position-relative">
                <!-- Image -->
                <div class="position-relative">
                  <img
                    src="/images/hero.png"
                    alt="Hero image"
                    class="rounded-3"
                  />
                </div>
              </div>
              <!-- Right content END -->
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Yellow subscription section -->
    <section>
      <div class="container mt-4">
        <div
          class="bg-warning rounded-3 shadow p-3 p-sm-4 position-relative overflow-hidden"
        >
          <!-- SVG decoration -->
          <figure
            class="position-absolute top-100 start-100 translate-middle mt-n6 ms-n5"
          >
            <svg width="211px" height="211px">
              <path
                class="fill-white opacity-4"
                d="M210.030,105.011 C210.030,163.014 163.010,210.029 105.012,210.029 C47.013,210.029 -0.005,163.014 -0.005,105.011 C-0.005,47.015 47.013,-0.004 105.012,-0.004 C163.010,-0.004 210.030,47.015 210.030,105.011 Z"
              ></path>
            </svg>
          </figure>
          <!-- SVG decoration -->
          <figure
            class="position-absolute top-100 start-0 translate-middle mt-n6 ms-5"
          >
            <svg width="141px" height="141px">
              <path
                class="fill-white opacity-4"
                d="M140.520,70.258 C140.520,109.064 109.062,140.519 70.258,140.519 C31.454,140.519 -0.004,109.064 -0.004,70.258 C-0.004,31.455 31.454,-0.003 70.258,-0.003 C109.062,-0.003 140.520,31.455 140.520,70.258 Z"
              ></path>
            </svg>
          </figure>
          <!-- SVG decoration -->
          <figure class="position-absolute top-0 start-50 mt-4 ms-n9">
            <svg width="41px" height="41px">
              <path
                class="fill-white opacity-4"
                d="M40.531,20.265 C40.531,31.458 31.457,40.531 20.265,40.531 C9.072,40.531 -0.001,31.458 -0.001,20.265 C-0.001,9.073 9.072,-0.001 20.265,-0.001 C31.457,-0.001 40.531,9.073 40.531,20.265 Z"
              ></path>
            </svg>
          </figure>

          <!-- Icon logos START -->
          <div
            class="p-2 bg-white shadow rounded-3 rotate-74 position-absolute top-0 start-0 ms-3 mt-5 d-none d-sm-block"
          >
            <img src="/images/client/science.svg" class="h-40px" alt="Icon" />
          </div>
          <div
            class="p-1 bg-white shadow rounded-3 rotate-74 position-absolute top-0 end-0 mt-5 me-5 d-none d-sm-block"
          >
            <img src="/images/client/vue.png" class="h-30px" alt="Icon" />
          </div>
          <div
            class="p-2 bg-white shadow rounded-3 rotate-320 position-absolute bottom-0 start-50 ms-5 mb-2 d-none d-lg-block"
          >
            <img src="/images/client/postgres.png" class="h-40px" alt="Icon" />
          </div>
          <!-- Icon logos END -->

          <div class="row justify-center">
            <div class="col-md-8 mx-auto text-center py-5 position-relative">
              <!-- Title -->
              <h2>
                Join thousands of self-taught programmers just like you and me.
              </h2>
              <p>
                No spam. No marketing nonsense. Just helpful, actionable posts
                every few weeks.
              </p>
              <!-- Form -->
              <div class="col-lg-12 mx-auto py-lg-2">
                <div class="mx-auto">
                  <KitSignup />
                </div>
              </div>
            </div>
          </div>
          <!-- Row END -->
        </div>
      </div>
    </section>

    <!-- Books section -->
    <section>
      <div class="container pt-lg-4">
        <div class="row mb-4">
          <div class="col-lg-8 mx-auto text-center">
            <h2 class="fs-1">Best Selling Books</h2>
            <p class="mb-0 lead">
              I enjoy writing a lot, and I really enjoy pushing the boundaries
              of "the modern coding book". I <i>hate</i>
              dry walls of text with meaningless "foo bar" demos. I prefer
              having fun, focusing on real scenarios.
            </p>
          </div>
        </div>

        <!-- Books cards -->
        <div class="row g-4">
          <div
            v-for="book in books"
            :key="book._path"
            class="col-sm-6 col-lg-4"
          >
            <div class="card card-hover-shadow h-100 border-0 rounded-4 shadow">
              <div class="card-img-top overflow-hidden rounded-top-4">
                <img :src="book.image" class="img-fluid" :alt="book.title" />
                <div
                  class="card-img-overlay d-flex align-items-start flex-column p-3"
                >
                  <div class="w-100 mt-auto">
                    <span class="badge bg-primary mb-2">{{ book.price }}</span>
                  </div>
                </div>
              </div>
              <div class="card-body pb-0">
                <h5 class="card-title">
                  <a
                    :href="book.link"
                    target="_blank"
                    class="stretched-link text-decoration-none"
                    >{{ book.title }}</a
                  >
                </h5>
                <p class="card-text mb-3">{{ book.summary }}</p>
              </div>
              <div class="card-footer pt-0 border-0">
                <div class="d-flex justify-content-between">
                  <a
                    :href="book.link"
                    target="_blank"
                    class="btn btn-sm btn-outline-primary mt-2"
                    >Learn more</a
                  >
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Courses section -->
        <div class="row mt-lg-6 mb-4">
          <div class="col-lg-8 mx-auto text-center">
            <h2 class="fs-1">Radical Courses</h2>
            <p class="mb-0 lead">
              I started doing online technical content in 2005 which led me to
              founding Tekpub.com in 2009. This is what I'm good at.
            </p>
          </div>
        </div>

        <!-- Courses cards -->
        <div class="row g-4">
          <div
            v-for="course in courses"
            :key="course._path"
            class="col-sm-6 col-lg-4"
          >
            <div class="card card-hover-shadow h-100 border-0 rounded-4 shadow">
              <div
                class="card-img-top overflow-hidden rounded-top-4 position-relative"
              >
                <img
                  :src="course.image"
                  class="img-fluid"
                  :alt="course.title"
                />
                <div
                  class="card-img-overlay d-flex align-items-start flex-column p-3"
                >
                  <div class="w-100 d-flex justify-content-between">
                    <span
                      :class="`badge ${
                        course.access === 'Free' ? 'bg-success' : 'bg-dark'
                      } mb-2`"
                      >{{ course.access }}</span
                    >
                    <span class="badge bg-info mb-2">{{
                      course.category
                    }}</span>
                  </div>
                </div>
              </div>
              <div class="card-body pb-0">
                <h5 class="card-title">
                  <a
                    :href="`/courses/${course.slug}`"
                    class="stretched-link text-decoration-none"
                    >{{ course.title }}</a
                  >
                </h5>
                <p class="card-text mb-3">{{ course.summary }}</p>
              </div>
              <div class="card-footer pt-0 border-0">
                <div class="d-flex justify-content-between align-items-center">
                  <div>
                    <span class="me-2"
                      ><i class="fas fa-clock"></i> {{ course.duration }}</span
                    >
                    <span
                      ><i class="fas fa-video"></i>
                      {{ course.videoCount }} videos</span
                    >
                  </div>
                  <a
                    :href="`/courses/${course.slug}`"
                    class="btn btn-sm btn-outline-primary mt-2"
                    >View course</a
                  >
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
const route = useRoute();
const { data: books } = await useAsyncData("books-list", () => {
  return queryCollection("books").all();
});

const { data: courses } = await useAsyncData("courses-list", () => {
  return queryCollection("courses").all();
});

useHead({
  title: "Welcome",
  meta: [
    {
      name: "description",
      content:
        "Learn how to build modern web applications with Vue, Nuxt, and other cutting-edge technologies.",
    },
  ],
});
</script>

<style>
/* Add any custom styles here */
.rotate-74 {
  transform: rotate(-74deg);
}

.rotate-320 {
  transform: rotate(320deg);
}

.h-30px {
  height: 30px;
}

.h-40px {
  height: 40px;
}

.striped {
  box-shadow: 5px 5px 15px rgba(0, 0, 0, 0.2);
}

/* Card hover effect */
.card-hover-shadow:hover {
  transform: translateY(-5px);
  transition: all 0.3s ease;
}
</style>
