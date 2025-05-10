<template>
  <div class="container">
    <div class="row align-items-center g-5 my-6" v-if="course">
      <div
        class="col-lg-5 col-xl-6 position-relative z-index-1 text-center text-lg-start mb-5 mb-sm-0"
      >
        <h1 class="mb-0 display-6">{{ course.title }}</h1>
        <div class="my-4 lead pt-2" v-html="course.summary"></div>
      </div>

      <!-- Right content START -->
      <div class="col-lg-7 col-xl-6 text-center position-relative">
        <!-- Image -->
        <div class="position-relative">
          <div v-if="course.vimeo" class="ratio ratio-16x9">
            <iframe
              :src="`https://player.vimeo.com/video/${course.vimeo}?title=0&byline=0&portrait=0`"
              allow="autoplay; fullscreen; picture-in-picture"
              allowfullscreen
            ></iframe>
          </div>
          <div v-else-if="course.youtube" class="ratio ratio-16x9">
            <iframe
              :src="`https://www.youtube.com/embed/${course.youtube}?rel=0`"
              allow="autoplay; fullscreen; picture-in-picture"
              allowfullscreen
            ></iframe>
          </div>
          <img v-else :src="course.image" alt="" class="striped rounded" />
        </div>
      </div>
      <!-- Right content END -->
    </div>

    <!-- Access section -->
    <div v-if="hasAccess" class="bg-info p-4 p-sm-5 rounded-3">
      <div class="row position-relative">
        <!-- Svg decoration -->
        <figure
          class="fill-white opacity-1 position-absolute top-50 start-0 translate-middle-y"
        >
          <svg width="141px" height="141px">
            <path
              d="M140.520,70.258 C140.520,109.064 109.062,140.519 70.258,140.519 C31.454,140.519 -0.004,109.064 -0.004,70.258 C-0.004,31.455 31.454,-0.003 70.258,-0.003 C109.062,-0.003 140.520,31.455 140.520,70.258 Z"
            ></path>
          </svg>
        </figure>
        <!-- Action box -->
        <div class="col-12 mx-auto position-relative">
          <div class="row align-items-center">
            <!-- Title -->
            <div class="col-lg-7">
              <h3 class="text-white">You Have Access!</h3>
              <p class="text-white mb-0">
                Feel free to look over the lessons below to find what you're
                looking for, otherwise jump right in!
              </p>
              <!-- Course progress -->
              <div class="pt-3" v-if="completedCount > 0">
                <CourseProgressBar
                  :progress="courseProgress"
                  :completedCount="completedCount"
                  :totalLessons="lessons.length"
                />
                <p
                  class="text-white mt-1 small"
                  v-if="completedCount === lessons.length"
                >
                  <i class="fas fa-trophy text-warning me-1"></i> You've
                  completed this course! Great job!
                </p>
              </div>
            </div>
            <!-- Content and input -->
            <div class="col-lg-5 text-lg-end">
              <NuxtLink
                v-if="lessons && lessons.length > 0"
                :to="`/courses/${course.slug}/${lessons[0].slug}`"
                class="btn btn-outline-white mb-0 text-white"
              >
                Go watch the first video!
              </NuxtLink>
            </div>
          </div>
        </div>
      </div>
      <!-- Row END -->
    </div>

    <div v-else class="bg-grad-blue p-3 p-sm-5 rounded-3">
      <div class="row justify-content-center position-relative">
        <!-- SVG decoration -->
        <figure
          class="fill-white opacity-1 position-absolute top-50 start-0 translate-middle-y"
        >
          <svg width="141px" height="141px">
            <path
              d="M140.520,70.258 C140.520,109.064 109.062,140.519 70.258,140.519 C31.454,140.519 -0.004,109.064 -0.004,70.258 C-0.004,31.455 31.454,-0.003 70.258,-0.003 C109.062,-0.003 140.520,31.455 140.520,70.258 Z"
            ></path>
          </svg>
        </figure>

        <h4 class="text-white mb-3 mb-lg-0">This is a premium course</h4>
        <p class="text-white">
          And it's amazing and you'll love it, I promise (and guarantee it).
        </p>
        <p>
          <a
            :href="`https://sales.bigmachine.io/${course.slug}`"
            class="btn btn-dark text-white"
            >Buy Standalone</a
          >
        </p>
      </div>
      <!-- Row END -->
    </div>

    <!-- Progress bar -->
    <div v-if="hasAccess && lessons.length > 0" class="my-4">
      <CourseProgressBar
        :progress="courseProgress"
        :completed="completedCount"
      />
    </div>

    <!-- Lessons grid -->
    <div class="row">
      <div
        v-for="lesson in lessons"
        :key="lesson.slug"
        class="col-sm-12 col-lg-4 mt-6"
      >
        <div class="card shadow">
          <!-- Image -->
          <NuxtLink :to="`/courses/${course.slug}/${lesson.slug}`">
            <img
              :src="
                lesson.image ||
                `/images/slides/${course.slug}/${lesson.slug}.jpg`
              "
              class="card-img-top"
              alt="course image"
            />
            <!-- Completed badge -->
            <div
              v-if="
                hasAccess &&
                completedLessons.some((cl) => cl.lessonSlug === lesson.slug)
              "
              class="position-absolute top-0 end-0 m-2"
            >
              <span class="badge bg-success rounded-pill">
                <i class="fas fa-check"></i> Completed
              </span>
            </div>
          </NuxtLink>
          <!-- Card body -->
          <div class="card-body pb-0">
            <!-- Title -->
            <NuxtLink :to="`/courses/${course.slug}/${lesson.slug}`">
              <h5 class="card-title fw-normal">{{ lesson.title }}</h5>
            </NuxtLink>
            <p class="mb-2 text-truncate-2" v-html="lesson.summary"></p>
          </div>
          <!-- Card footer -->
          <div class="card-footer pt-0 pb-3">
            <hr />
            <div class="d-flex justify-content-between">
              <span class="h6 fw-light mb-0" v-if="lesson.duration">
                <i class="far fa-clock text-danger me-2"></i
                >{{ $filters.duration(lesson.duration) }}
              </span>
              <span
                v-if="
                  hasAccess &&
                  completedLessons.some((cl) => cl.lessonSlug === lesson.slug)
                "
                class="text-success"
              >
                <i class="fas fa-check-circle"></i>
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { watchEffect } from "vue";
import CourseProgressBar from "~/components/CourseProgressBar.vue";
import { useFirestore } from "~/composables/useFirestore";

const route = useRoute();
const { slug } = route.params;

// Get the current user and auth store
const { user, authorizations } = useFirebaseAuth();

// Handle course access using the auth store
const hasAccess = computed(() => {
  // Allow access if the user is authenticated and authorized for this course
  return (
    user.value &&
    authorizations.value.some((auth) => auth.sku === course.value.slug)
  );
});

// Fetch the course data
const { data: course } = await useAsyncData(`course-${slug}`, () => {
  return queryCollection("courses").where("slug", "=", slug).first();
});

// Fetch the lessons for this course
const { data: lessons } = await useAsyncData(`lessons-${slug}`, () => {
  return queryCollection("lessons").where("course", "=", slug).all();
});

// Use the lesson progress functions from useFirestore
const { getCompletedLessons, getCourseProgress } = useFirestore();

// Progress tracking state
const completedLessons = ref([]);
const courseProgress = ref(0);
const completedCount = ref(0);

// Track progress when user and course are available
watchEffect(async () => {
  if (user.value?.uid && course.value?.slug && lessons.value?.length) {
    try {
      // Get all completed lessons for this course
      const completed = await getCompletedLessons(user.value.uid);
      completedLessons.value = completed.filter(
        (item) => item.courseSlug === course.value.slug
      );
      completedCount.value = completedLessons.value.length;

      // Calculate course progress
      courseProgress.value = await getCourseProgress(
        user.value.uid,
        course.value.slug,
        lessons.value.length
      );
    } catch (error) {
      console.error("Error fetching course progress:", error);
    }
  }
});

useHead({
  title: course.value?.title,
  meta: [
    {
      name: "description",
      content: course.value?.summary,
    },
    {
      property: "og:title",
      content: course.value?.title,
    },
    {
      property: "og:description",
      content: course.value?.summary,
    },
    {
      property: "og:image",
      content: course.value?.image,
    },
  ],
});
</script>

<style scoped>
.text-truncate-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.striped {
  max-width: 100%;
  height: auto;
}

.bg-grad-blue {
  background: linear-gradient(135deg, #0061f2 0%, #6c8aff 100%);
}
</style>
