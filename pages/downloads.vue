<template>
  <div id="hero" class="position-relative pt-lg-8 pb-8 mt-0">
    <div class="container" id="app">
      <!-- Title -->
      <div class="row align-items-center g-5">
        <!-- Left content START -->
        <div
          class="col-lg-5 col-xl-6 position-relative z-index-1 text-center text-lg-start mb-lg-5 mb-sm-0"
        >
          <!-- Title -->
          <h1 class="mb-0">Get Your Downloads</h1>
          <p class="my-4">
            Hiya! Just pop your email below and I'll send along links to the
            things you can download - it takes about 10 seconds. If you're
            looking for access to videos, the links will be in the emails too.
          </p>
          <p class="my-4">
            If you're trying to access a course you can do that by logging in
            (click login button above). Head to your dashboard and you'll see
            all your stuff but be sure to use the same email as your order when
            you login.
          </p>
          <!-- Content -->
          <div class="my-4 lead">
            <div v-if="errorMessage" class="alert alert-danger" role="alert">
              {{ errorMessage }}
            </div>
            <div v-if="successMessage" class="alert alert-success" role="alert">
              {{ successMessage }}
            </div>

            <form @submit.prevent="submitDownloadRequest">
              <div class="mb-4">
                <div class="input-group input-group-lg">
                  <span
                    class="input-group-text rounded-start text-secondary px-3"
                  >
                    <i class="bi bi-envelope-fill"></i>
                  </span>
                  <input
                    type="email"
                    class="form-control rounded-end"
                    placeholder="Your Order Email"
                    v-model="email"
                    required
                  />
                </div>
              </div>
              <!-- Button -->
              <div class="align-items-center mt-0">
                <div class="d-grid">
                  <button
                    class="btn btn-primary mb-0"
                    type="submit"
                    :disabled="loading"
                  >
                    {{ loading ? "Sending..." : "Send Me My Downloads" }}
                    <i class="bi bi-send"></i>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
        <!-- Left content END -->

        <!-- Right content START -->
        <div class="col-lg-7 col-xl-6 text-center position-relative">
          <!-- Image -->
          <div class="position-relative">
            <img src="/images/doodles/cat.png" class="rounded-4" alt="" />
          </div>
        </div>
        <!-- Right content END -->
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";

const email = ref("");
const loading = ref(false);
const errorMessage = ref("");
const successMessage = ref("");

async function submitDownloadRequest() {
  loading.value = true;
  errorMessage.value = "";
  successMessage.value = "";

  try {
    // Connect to our API endpoint that handles the download request
    const response = await fetch("/api/downloads", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email: email.value }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Failed to process request");
    }

    successMessage.value =
      data.message || "Download links have been sent to your email!";
    email.value = "";
  } catch (error: any) {
    errorMessage.value =
      error.message || "Something went wrong. Please try again.";
  } finally {
    loading.value = false;
  }
}
</script>
