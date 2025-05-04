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
                      class="d-flex justify-content-between align-items-center p-2 rounded-2"
                      :class="lesson.slug === lessonItem.slug ? 'bg-light' : ''"
                    >
                      <div class="position-relative d-flex align-items-center">
                        <NuxtLink
                          :to="`/courses/${course.slug}/${lessonItem.slug}`"
                          class="btn btn-round btn-sm mb-0 stretched-link position-static"
                          :class="
                            lessonItem.free
                              ? 'btn-success'
                              : isAuthorized
                              ? 'btn-info'
                              : 'btn-secondary'
                          "
                        >
                          <i
                            :class="
                              lesson.slug === lessonItem.slug
                                ? 'fas fa-play'
                                : lessonItem.free
                                ? 'fas fa-unlock'
                                : isAuthorized
                                ? 'fas fa-check'
                                : 'fas fa-lock'
                            "
                          ></i>
                        </NuxtLink>
                        <span class="d-inline-block ms-2 mb-0 h6 fw-light">{{
                          lessonItem.title
                        }}</span>
                      </div>
                      <p
                        class="mb-0 text-caption"
                        style="font-size: 0.8em"
                        v-if="lessonItem.duration"
                      >
                        {{ $filters.duration(lessonItem.duration) }}
                      </p>
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
        <div
          v-if="(isAuthorized || lesson.free) && lesson.vimeo"
          class="embed-container"
        >
          <iframe
            id="vimeo-player"
            class="mx-auto"
            :src="`https://player.vimeo.com/video/${lesson.vimeo}`"
            frameborder="0"
            allow="autoplay; fullscreen"
            allowfullscreen
          ></iframe>
        </div>
        <div v-else class="col-12 position-relative bg-dark rounded-4 mt-4">
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
            <div class="col-2">
              <button
                v-if="user && isAuthorized"
                @click="toggleCompleted"
                class="btn outline px-3 py-2 btn-lg"
                :class="
                  isLessonCompleted ? 'btn-success' : 'btn-outline-success'
                "
              >
                <i class="fas fa-check me-0"></i>
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

// Fetch the course data
const { data: course } = await useAsyncData(`course-${slug}`, () => {
  return queryCollection("courses").where("slug", "=", slug).first();
});

// Fetch all lessons for this course
const { data: lessons } = await useAsyncData(`lessons-${slug}`, () => {
  return queryCollection("lessons").where("course", "=", slug).all();
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
const isLessonCompleted = ref(false);
// Check authorization when user or course changes
// watch(
//   [user, course],
//   ([currentUser, currentCourse]) => {
//     if (currentUser && currentCourse) {
//       // Simply use the authStore's isAuthorizedForSku method
//       isAuthorized.value = isAuthorizedForSku(currentCourse.slug);
//     } else {
//       isAuthorized.value = false;
//     }
//   },
//   { immediate: true }
// );

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

.lesson-content pre {
  background-color: #f8f9fa;
  padding: 1rem;
  border-radius: 0.375rem;
  overflow-x: auto;
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
