<template>
  <div class="container-fluid position-relative" v-if="lesson && course">
    <div class="row g-5">
      <!-- Sidebar -->
      <div class="col-lg-3 pb-lg-5">
        <nav class="navbar navbar-light navbar-expand-lg mx-0">
          <div
            class="offcanvas offcanvas-end"
            tabindex="-1"
            id="offcanvasSidebar"
            aria-labelledby="offcanvasSidebarLabel"
          >
            <div class="offcanvas-header bg-dark">
              <h5 class="offcanvas-title text-white" id="offcanvasSidebarLabel">
                Playlist
              </h5>
              <button
                type="button"
                class="btn btn-sm btn-light mb-0"
                data-bs-dismiss="offcanvas"
                aria-label="Close"
              >
                <i class="bi bi-x-lg"></i>
              </button>
            </div>
            <div class="offcanvas-body p-3 p-lg-0">
              <div class="col-12">
                <!-- Accordion START -->
                <div
                  class="accordion accordion-icon accordion-bg-light"
                  id="videoList"
                >
                  <!-- Categories -->
                  <div
                    v-for="(categoryLessons, category) in lessonsByCategory"
                    :key="category"
                    class="accordion-item mb-3"
                  >
                    <h5 class="accordion-header p-2">
                      {{ category }}
                    </h5>
                    <!-- Lessons in category -->
                    <div
                      v-for="lessonItem in categoryLessons"
                      :key="lessonItem.slug"
                      class="d-flex align-items-start p-2 rounded-2"
                      :class="lesson.slug === lessonItem.slug ? 'bg-light' : ''"
                    >
                      <NuxtLink
                        :to="`/courses/${course.slug}/${lessonItem.slug}`"
                        class="d-flex align-items-start text-decoration-none w-100"
                      >
                        <div class="me-2">
                          <span
                            class="btn btn-round btn-sm mb-0 d-flex align-items-center justify-content-center"
                            :class="getLessonButtonClass(lessonItem)"
                          >
                            <i :class="getLessonIconClass(lessonItem)"></i>
                          </span>
                        </div>
                        <div class="flex-grow-1">
                          <div
                            class="fw-light text-body"
                            style="font-size: medium; line-height: 1.2"
                          >
                            {{ lessonItem.title }}
                          </div>
                          <div
                            v-if="lessonItem.duration"
                            class="text-muted mt-1"
                            style="font-size: small"
                          >
                            {{ $filters.duration(lessonItem.duration) }}
                          </div>
                        </div>
                      </NuxtLink>
                    </div>
                  </div>
                </div>
                <!-- Accordion END -->
              </div>
            </div>
          </div>
        </nav>
      </div>

      <!-- Main content -->
      <div class="col-lg-8 mx-auto">
        <!-- Video player or image -->
        <div v-if="canWatch && lesson.vimeo" class="embed-container">
          <iframe
            id="vimeo-player"
            class="mx-auto"
            :src="`https://player.vimeo.com/video/${lesson.vimeo}`"
            frameborder="0"
            allow="autoplay; fullscreen"
            allowfullscreen
          ></iframe>
        </div>
        <div
          v-if="user && isAuthorized"
          class="course-progress-container py-3 mt-2"
        >
          <CourseProgressBar
            :progress="courseProgress"
            :completedCount="completedCount"
            :totalLessons="totalLessonsCount"
          />
        </div>

        <div
          v-else-if="!canWatch || !lesson.vimeo"
          class="col-12 position-relative bg-dark rounded-4 mt-4"
        >
          <img
            :src="
              lesson.image
                ? lesson.image
                : `/images/slides/${course.slug}/${lesson.slug}.jpg`
            "
            class="img-fluid rounded-4 striped opacity-50"
            alt=""
          />
          <div
            class="row justify-content-center align-items-center p-0 m-0 position-absolute top-0 end-0 w-100 h-100"
          >
            <div class="col text-center">
              <h3 id="overlay" class="text-white">{{ lesson.title }}</h3>
              <p class="text-white">
                This is a premium course, which you can purchase below.
              </p>
              <p>
                <a
                  :href="`https://sales.bigmachine.io/${course.slug}`"
                  class="btn btn-primary text-white"
                  >Buy Now</a
                >
              </p>
            </div>
          </div>
        </div>

        <!-- Navigation buttons -->
        <div class="col-12">
          <div class="row my-4">
            <div class="col d-flex align-items-center">
              <!-- Completed toggle button - positioned under video -->
              <button
                v-if="user && isAuthorized"
                @click="toggleCompleted"
                class="btn outline px-3 py-2 btn-lg me-2"
                :class="
                  isLessonCompleted ? 'btn-success' : 'btn-outline-success'
                "
              >
                <i
                  class="fas fa-check me-0"
                  :class="isLessonCompleted ? 'me-2' : 'me-0'"
                ></i>
                <span v-if="isLessonCompleted">Completed</span>
              </button>
            </div>
            <div class="col text-end">
              <button
                class="btn btn-info-soft outline py-2 px-3 btn-lg border-info d-lg-none"
                type="button"
                data-bs-toggle="offcanvas"
                data-bs-target="#offcanvasSidebar"
                aria-controls="offcanvasSidebar"
              >
                <i class="fas fa-list text-info" aria-hidden="true"></i>
              </button>
              <NuxtLink
                v-if="prevLesson"
                :to="`/courses/${course.slug}/${prevLesson.slug}`"
                class="btn btn-info-soft outline px-3 py-2 btn-lg border-info mx-2"
              >
                <i class="bi bi-arrow-left text-info"></i>
              </NuxtLink>
              <NuxtLink
                v-if="nextLesson"
                :to="`/courses/${course.slug}/${nextLesson.slug}`"
                class="btn btn-info-soft outline px-3 py-2 btn-lg border-info mx-2"
              >
                <i class="bi bi-arrow-right text-info"></i>
              </NuxtLink>
            </div>
          </div>
        </div>

        <!-- Lesson content -->
        <p class="lead">
          {{ lesson.summary }}
        </p>
        <hr />
        <div v-if="lesson.gist" class="mx-auto">
          <div class="gist-embed" :data-gist-id="lesson.gist"></div>
        </div>
        <div v-else class="mx-auto col-lg-8">
          <ContentRenderer v-if="lesson" :value="lesson" />
        </div>
      </div>
    </div>
  </div>
  <div v-else class="container my-6 text-center">
    <div class="spinner-border text-primary" role="status">
      <span class="visually-hidden">Loading...</span>
    </div>
  </div>
</template>

<script setup>
const route = useRoute();
const { slug, lesson: lessonSlug } = route.params;

// Get auth state
const { user, authorizations } = useFirebaseAuth();

// Import Vue utilities
import { watchEffect } from "vue";

// Import components
import CourseProgressBar from "~/components/CourseProgressBar.vue";

// Import progress tracking functions from useFirestore
const {
  isLessonCompleted: checkLessonCompleted,
  markLessonCompleted,
  markLessonNotCompleted,
  getCourseProgress,
  getCompletedLessons,
} = useFirestore();

// Import confetti
const { triggerConfetti } = useConfetti();

// Fetch the course data
const { data: course } = await useAsyncData(`course-${slug}`, () => {
  return queryCollection("courses").where("slug", "==", slug).first();
});

// Fetch all lessons for this course
const { data: lessons } = await useAsyncData(`lessons-${slug}`, () => {
  return queryCollection("lessons").where("course", "==", slug).all();
});

// Get the current lesson data
const lesson = computed(() => {
  return lessons.value?.find((l) => l.slug === lessonSlug);
});

const isAuthorized = computed(() => {
  // Check if the user is authorized for the course
  return (
    user.value &&
    authorizations.value.some((auth) => auth.sku === course.value.slug)
  );
});

// Check if user can watch the lesson (either authorized or free lesson)
const canWatch = computed(() => {
  return isAuthorized.value || lesson.value?.free;
});

// Lesson completion state
const isLessonCompleted = ref(false);
const completedLessons = ref([]);
const courseProgress = ref(0);
const completedCount = ref(0);

// Calculate total lessons count
const totalLessonsCount = computed(() => {
  return lessons.value?.length || 0;
});

// Check if current lesson is completed when user, course or lesson changes
watchEffect(async () => {
  if (user.value?.uid && course.value?.slug && lesson.value?.slug) {
    // Check if this lesson is completed
    isLessonCompleted.value = await checkLessonCompleted(
      user.value.uid,
      course.value.slug,
      lesson.value.slug
    );

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
      totalLessonsCount.value
    );
  }
});

// Toggle completion status of current lesson
const toggleCompleted = async () => {
  if (!user.value?.uid || !course.value?.slug || !lesson.value?.slug) return;

  try {
    if (isLessonCompleted.value) {
      // If already completed, mark as not completed
      await markLessonNotCompleted(
        user.value.uid,
        course.value.slug,
        lesson.value.slug
      );
      isLessonCompleted.value = false;
    } else {
      // If not completed, mark as completed
      await markLessonCompleted(
        user.value.uid,
        course.value.slug,
        lesson.value.slug,
        lesson.value.title
      );
      isLessonCompleted.value = true;

      // Trigger confetti animation
      triggerConfetti({
        particleCount: 150,
        spread: 100,
        origin: { y: 0.5 },
      });
    }

    // Recalculate course progress
    const completed = await getCompletedLessons(user.value.uid);
    completedLessons.value = completed.filter(
      (item) => item.courseSlug === course.value.slug
    );
    completedCount.value = completedLessons.value.length;

    courseProgress.value = await getCourseProgress(
      user.value.uid,
      course.value.slug,
      totalLessonsCount.value
    );
  } catch (error) {
    console.error("Error toggling lesson completion:", error);
  }
};

// Group lessons by category
const lessonsByCategory = computed(() => {
  if (!lessons.value) return {};

  // Create an object to hold lessons grouped by category
  const categories = {};

  // Group lessons by their category
  lessons.value.forEach((lesson) => {
    const category = lesson.category || "Uncategorized";
    if (!categories[category]) {
      categories[category] = [];
    }
    categories[category].push(lesson);
  });

  return categories;
});

// Compute the button class based on lesson status
const getLessonButtonClass = (lessonItem) => {
  if (course.value.access.toLowerCase() === "free") {
    return "btn-success";
  }
  if (lessonItem.free) {
    return "btn-success";
  }

  if (
    isAuthorized.value &&
    completedLessons.value.some((cl) => cl.lessonSlug === lessonItem.slug)
  ) {
    return "btn-success";
  }

  if (isAuthorized.value) {
    return "btn-info";
  }

  return "btn-secondary";
};

// Compute the icon class based on lesson status
const getLessonIconClass = (lessonItem) => {
  if (!lessonItem.vimeo) {
    //return a reading icon if no vimeo id
    return "fas fa-book";
  }

  if (course.value.access.toLowerCase() === "free") {
    return "fas fa-play";
  }

  if (lesson.value.slug === lessonItem.slug) {
    return "fas fa-play";
  }

  if (lessonItem.free) {
    return "fas fa-unlock";
  }

  if (
    isAuthorized.value &&
    completedLessons.value.some((cl) => cl.lessonSlug === lessonItem.slug)
  ) {
    return "fas fa-check";
  }

  if (isAuthorized.value) {
    return "far fa-circle";
  }

  return "fas fa-lock";
};

// Calculate the current lesson index
const currentLessonIndex = computed(() => {
  if (!lessons.value || !lesson.value) return 0;
  return lessons.value.findIndex((l) => l.slug === lesson.value.slug);
});

// Get previous and next lesson for navigation
const prevLesson = computed(() => {
  if (!lessons.value || currentLessonIndex.value <= 0) return null;
  return lessons.value[currentLessonIndex.value - 1];
});

const nextLesson = computed(() => {
  if (!lessons.value || currentLessonIndex.value >= lessons.value.length - 1)
    return null;
  return lessons.value[currentLessonIndex.value + 1];
});

// Set page metadata
useHead({
  title: lesson.value?.title,
  meta: [
    {
      name: "description",
      content: lesson.value?.summary,
    },
    {
      property: "og:title",
      content: `${lesson.value?.title} - ${course.value?.title}`,
    },
    {
      property: "og:description",
      content: lesson.value?.summary,
    },
    {
      property: "og:image",
      content:
        lesson.value?.image ||
        `/images/slides/${course.value?.slug}/${lesson.value?.slug}.jpg`,
    },
  ],
});
</script>

<style scoped>
.col-fixed-sidebar {
  width: 400px;
  min-width: 400px;
}

.col-main-content {
  flex: 1;
  max-width: calc(
    100% - 320px
  ); /* Account for sidebar width plus some margin */
}

/* Make the row display as flex for proper layout */
.container-fluid .row {
  display: flex;
  flex-wrap: nowrap;
}

.lesson-content {
  font-size: 1.1rem;
  line-height: 1.7;
}

.lesson-content h2,
.lesson-content h3 {
  margin-top: 1.5rem;
  margin-bottom: 1rem;
}

.lesson-content img {
  max-width: 100%;
  height: auto;
  border-radius: 0.375rem;
}

.lesson-index {
  min-width: 24px;
  text-align: right;
}

/* Category heading styles */
h5 {
  color: #495057;
  font-weight: 600;
}

/* Media query for very small screens to allow scrolling horizontally if needed */
@media (max-width: 768px) {
  .container-fluid .row {
    flex-wrap: wrap;
  }

  .col-fixed-sidebar,
  .col-main-content {
    width: 100%;
    max-width: 100%;
  }

  .col-fixed-sidebar {
    height: auto;
    position: relative;
    margin-bottom: 20px;
  }
}
</style>
