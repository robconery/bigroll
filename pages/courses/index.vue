<template>
  <main class="overflow-hidden">
    <div class="pt-2 pt-lg-4 pb-4 pb-lg-8">
      <div class="container">
        <h1 class="text-center">The Library</h1>
        <div class="row justify-content-center mt-lg-5">
          <div class="col-xl-8">
            <p class="lede">
              Every course you see below took me months and months to build.
              <b>I can't stand boring to-do list videos</b> where the presenter
              repeats themselves 100 times! That's not fun - it's tedious and
              belongs in the dark vaults of corporate training.
            </p>
            <p>
              I've built my reputation over the years for creating solid,
              <b>informative content that you enjoy watching</b>. Click through
              and see for yourself!
            </p>
          </div>
        </div>
        <div class="row mt-2">
          <div
            v-for="course in courses"
            :key="course._path"
            class="col-sm-12 col-lg-4 mt-6"
          >
            <CourseCard :course="course" />
          </div>
        </div>
      </div>
    </div>
  </main>
</template>

<script setup>
// Fetch all courses
const { data: courses } = await useAsyncData("courses-all", () => {
  return queryCollection("courses").all();
});

useHead({
  title: "The Library - All Courses",
  meta: [
    {
      name: "description",
      content:
        "Browse our collection of programming courses covering Vue, Nuxt, and web development.",
    },
  ],
});
</script>
