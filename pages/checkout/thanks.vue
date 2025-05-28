<template>
  <section class="">
    <div class="container">
      <div class="row mt-2 justify-content-center mb-8 pt-6">
        <div class="col-lg-7" style="min-height: 600px">
          <div
            v-if="error"
            class="alert alert-danger fade show mt-4 mb-3 rounded-3 fs-6"
            role="alert"
          >
            <h1>Problems...</h1>
            <i class="icon-lg bi bi-exclamation-triangle"></i>
            <!-- Info -->
            Looks like this is an invalid checkout session. Please check your
            email for the link to your order or
            <a href="mailto:me@robconery.com" target="_blank">contact me</a> if
            you have any questions.
          </div>
          <div v-else>
            <h2 class="text-center mb-4">Thank You!</h2>
            <div v-if="data.order">
              <div
                class="d-flex justify-content-center align-items-center p-2 bg-light rounded-4 border border-1 mb-4"
              >
                <span class="display-6 lh-1 text-info mb-0"
                  ><i class="bi-credit-card-2-front"></i
                ></span>
                <div class="ms-4 h6 fw-normal mb-0">
                  <div class="d-flex">
                    <h5 class="purecounter mb-0 fw-bold">
                      Order {{ data.order.number }}
                    </h5>
                  </div>
                </div>
              </div>
              <p>
                Your order number is <b>{{ data.order.number }}</b> and you can
                access your goodies below. Please be aware that links expire in
                the next 2 hours so please download!
              </p>
              <h4>Your Invoice</h4>
              <p>
                You will be receiving your invoice in email, along with links to
                your purchases. If you need to make any changes to your invoice,
                you can do it right on this page and print it out.
              </p>
            </div>
            <div>
              <h2 class="mb-4 border-bottom py-2 mt-4">Downloads</h2>
              <p>
                Your downloads are below and please note that
                <b>the link expires in two hours</b>. Please download them now
                and put them in a safe place. I would encourage you not to share
                - I worked very hard on this stuff. If you know someone that
                <i>really needs the help</i> go ahead, I'll trust you. Or you
                can let me know (reply to this email) and I'll do what I can for
                them.
              </p>
              <div
                class="row align-items-center pt-lg-3"
                v-for="item in data.authorizations"
                :key="item.sku"
              >
                <div class="col-6 text-center">
                  <img
                    :src="`/images/slides/${item.sku}.jpg`"
                    class="rounded-2"
                    alt=""
                  />
                </div>
                <div class="col-6">
                  <h5 class="p-0 m-0">{{ item.name }}</h5>
                  <hr />

                  <div v-if="item.download" class="mt-2">
                    <p class="fs-6 mb-0">
                      <i>{{ item.file }}</i>
                    </p>

                    <p class="mt-2">
                      <a :href="item.link" class="btn btn-sm btn-primary">
                        <b>Download </b>
                        <i class="bi bi-cloud-download-fill"></i>
                      </a>
                    </p>
                  </div>
                  <div v-else class="mt-2">
                    <p class="fs-6 mb-0 pb-4">
                      Download links are only good for 24 hours - and this one
                      has expired. That's OK, however, I'll send you an email
                      with a link right not - just press the button below. I do
                      this to avoid link sharing :).
                    </p>

                    <p>
                      <a class="btn btn-sm btn-primary" @click="sendEmail">
                        <span v-if="sending">
                          <span
                            class="spinner-border spinner-border-sm"
                            role="status"
                            aria-hidden="true"
                          ></span>
                          <span class="sr-only">Loading...</span>
                        </span>

                        Link Is Expired - Get By Email
                        <i class="bi bi-send"></i>
                      </a>
                    </p>
                    <div
                      class="alert alert-success fade show mt-4 mb-3 rounded-3 fs-6"
                      role="alert"
                      v-if="sent"
                    >
                      <!-- Avatar -->
                      <i class="icon-lg bi bi-hand-thumbs-up"></i>
                      <!-- Info -->
                      Email sent! You should get it in a minute.
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
//get the id from the url
const route = useRoute();
const id = route.query.id;
let sending = ref(false);
let sent = ref(false);

// use useFetch to get data from the server
const { data, error } = await useFetch(`/api/checkout/?id=${id}`, {
  method: "GET",
  headers: {
    "Content-Type": "application/json",
  },
});

async function sendEmail() {
  // send an email to the user with the download link
  sending.value = true;
  const { data, error } = await useFetch(`/api/send-email`, {
    method: "POST",
    body: {
      id: data.value.order.email,
    },
  });
  if (error.value) {
    console.error(error.value);
    sending.value = false;
  } else {
    console.log(data.value);
    sending.value = false;
    sent.value = true;
  }
}
</script>

<style></style>
