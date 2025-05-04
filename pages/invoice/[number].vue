<template>
  <main class="">
    <div class="container h-100">
      <div id="wrapper" class="row mt-4 g-4">
        <!-- Left sidebar -->

        <div
          v-if="order && order.offer"
          id="invoice"
          class="col-lg-8 mb-sm-0 mx-auto"
        >
          <div class="card card-body p-4 rounded-4 striped py-8">
            <div class="px-lg-4">
              <h2 class="text-center mb-4">
                {{ order.thanks_title || "Thanks!" }}
              </h2>
              <p v-html="order.thanks_text"></p>
              <div
                class="d-flex justify-content-center align-items-center p-2 bg-light rounded-4 border border-1 my-5"
              >
                <span style="font-size: 3em">🙌🏽</span>

                <div class="ms-4 h6 fw-normal mb-0">
                  <div class="">
                    <h4 class="purecounter mb-0 fw-bold">
                      Order <b>{{ order.number }}</b>
                    </h4>
                  </div>
                </div>
              </div>
              <div class="row mt-4">
                <div class="col">
                  <img src="/images/logos/invoice.png" alt="" />
                </div>
                <div class="col">
                  <h5 class="mt-2 border-bottom">Billed To:</h5>
                  <template v-if="order.customer && order.customer.name">
                    <b>{{ order.customer.name }}</b
                    ><br />
                    <i>{{ order.customer.email }}</i>
                  </template>
                  <template v-else>
                    <b>{{ order.email }}</b
                    ><br />
                  </template>

                  <div
                    class="editable fs-6 mt-2 bg-white p-0 border-0"
                    contenteditable
                  >
                    <i>This space is editable. Add your address, VAT, etc.</i>
                  </div>
                </div>
              </div>
              <table class="table table-responsive">
                <thead>
                  <tr>
                    <th>Item</th>
                    <th class="text-center">Quantity</th>
                    <th class="text-end">Price</th>
                  </tr>
                </thead>
                <tbody class="">
                  <tr>
                    <td>{{ order.offer }}</td>
                    <td align="center">1</td>
                    <td align="right">${{ order.total || 0 }}</td>
                  </tr>
                </tbody>
                <tfoot class="">
                  <tr>
                    <td colspan="3" align="right">
                      Total: <b>${{ order.total || 0 }}</b>
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
            <div class="text-center p-3">
              <i
                >Thanks again! If you ever have any questions, please email me
                at rob@bigmachine.io.</i
              >
            </div>
          </div>
        </div>
        <div
          v-else-if="order && !order.offer"
          class="alert alert-info fade show mt-2 mb-2 rounded-3"
          role="alert"
        >
          <!-- Avatar -->
          <i class="icon-lg bi bi-hand-thumbs-up"></i>
          <!-- Info -->
          Sorry about that - this is an old order and we can't find the details.
          You can still download your goodies on the
          <NuxtLink to="/dashboard">Dashboard</NuxtLink>, however.
        </div>

        <!-- Loading state -->
        <div
          v-else-if="isLoading"
          class="col-lg-8 mb-sm-0 mx-auto text-center p-5"
        >
          <div class="spinner-border text-primary" role="status">
            <span class="visually-hidden">Loading...</span>
          </div>
          <p class="mt-3">Loading invoice details...</p>
        </div>

        <!-- Error state - not found or not authorized -->
        <div v-else class="col-lg-8 mb-sm-0 mx-auto">
          <div
            class="alert alert-danger fade show mt-2 mb-2 rounded-3"
            role="alert"
          >
            <i class="icon-lg bi bi-exclamation-triangle"></i>
            <span v-if="!user">
              Please
              <NuxtLink to="/login" class="alert-link">log in</NuxtLink> to view
              this invoice.
            </span>
            <span v-else>
              Sorry, we couldn't find this order. Please check the order number
              and try again.
            </span>
          </div>
        </div>
      </div>
    </div>
  </main>
</template>

<script setup>
// Get the route parameter (order number)
const route = useRoute();
const orderNumber = route.params.number;

// Get user authentication state and Firestore methods
const { user } = useFirebaseAuth();
const { getOrderByNumber, getUserByEmail } = useFirestore();

// Reactive state
const order = ref(null);
const isLoading = ref(true);
const error = ref(null);

// Load the order data when authenticated
watchEffect(async () => {
  if (!user.value) {
    isLoading.value = false;
    return;
  }

  try {
    isLoading.value = true;
    order.value = await getOrderByNumber(orderNumber);

    // If we have an order, get the customer details
    if (order.value) {
      // In the original Rails app, there was a @customer object
      // We can use the email from the order to get customer info
      const customer = await getUserByEmail(order.value.email);
      // Merge customer details if found
      if (customer) {
        order.value = {
          ...order.value,
          customer,
        };
      }
    }
  } catch (err) {
    console.error("Error fetching invoice:", err);
    error.value = err;
  } finally {
    isLoading.value = false;
  }
});

// Set page metadata
useHead({
  title: () => (order.value ? `${order.value.number}` : "Invoice"),
  meta: [
    {
      name: "description",
      content: () =>
        order.value
          ? `Invoice details for order ${order.value.number}`
          : "Invoice details",
    },
  ],
});
</script>

<style scoped>
.icon-lg {
  font-size: 1.5rem;
  margin-right: 0.5rem;
}

.editable:focus {
  outline: 1px solid #ced4da;
  padding: 0.25rem !important;
}
</style>
