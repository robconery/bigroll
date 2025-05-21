<template>
  <div class="container" style="min-height: 400px">
    <div class="row">
      <div class="col mx-auto text-center my-4">
        <img
          src="/images/observatory.jpg"
          alt=""
          style="text-align: center; width: 600px"
        />
      </div>
    </div>
    <h1>Looks like that post is gone...</h1>
    <p>
      I do that from time to time as posts get old and crusty. You can
      <a href="/posts">read my other stuff though</a> or try and search using
      the box above.
    </p>
  </div>
</template>

<script setup>
const slug = useRoute().params.slug;
const { data: post } = await useAsyncData("posts-wp", () => {
  return queryCollection("posts").where("slug", "=", slug).first();
});

if (post.value) {
  //redirect to the post page
  location.href = `/${post.value.categories.toLowerCase()}/${post.value.slug}`;
} else {
  //redirect to the 404 page
  //location.href = "/404";
}
</script>

<style></style>
