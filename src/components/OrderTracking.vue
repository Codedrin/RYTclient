<template>
   
  <div class="order-tracking-page">
    <div class="container py-5">
      <h2 class="fw-bold mb-5 section-title text-center">Your Order History</h2>

      <div v-if="isLoading" class="text-center py-5">
        <div class="spinner-border text-primary" role="status">
          <span class="visually-hidden">Loading...</span>
        </div>
      </div>

      <div v-else-if="orders.length === 0" class="text-center py-5">
        <i class="fas fa-box-open fa-3x text-muted mb-3"></i>
        <h4 class="fw-bold text-light">No Orders Found</h4>
        <p class="text-muted text-light">You haven't placed any orders yet.</p>
      </div>

      <div v-else>
        <div class="card shadow-sm mb-4 order-card" v-for="order in orders" :key="order.order_id">
          <div class="card-header bg-white d-flex flex-wrap justify-content-between align-items-center py-3">
            <div>
              <h6 class="fw-bold mb-1">Order #{{ order.order_id.slice(0, 8).toUpperCase() }}</h6>
              <p class="text-muted small mb-0">Placed on {{ new Date(order.created_at).toLocaleDateString() }}</p>
            </div>
            <div>
              <span class="fw-bold me-3">Item Total: ₱{{ order.total_price.toLocaleString() }}</span>
            </div>
          </div>
          <div class="card-body p-4">
            <div class="row mb-4">
               <div class="col-md-6">
                  <h6 class="fw-bold">Items in this Order</h6>
                  <ul class="list-unstyled">
                    <li v-for="item in order.order_items" :key="item.id" class="mb-2">
                        <p class="mb-0 fw-medium">{{ item.products.brand }} ({{ item.products.size }})</p>
                        <p class="mb-0 text-muted small">
                          Quantity: {{ item.quantity }} @ ₱{{ item.price_at_purchase.toLocaleString() }} each
                        </p>
                    </li>
                  </ul>
              </div>
            </div>

            <h6 class="fw-bold mb-4">Status: <span class="text-primary">{{ order.status }}</span></h6>
            
            <div class="status-tracker">
              <div :class="getStepClass(order.status, 'Payment Process')">
                <div class="icon"><i class="fas fa-hourglass-half"></i></div>
                <div class="label">Payment Process</div>
              </div>
              <div :class="getConnectorClass(order.status, 'Payment Process')"></div>
              <div :class="getStepClass(order.status, 'Payment Success')">
                <div class="icon"><i class="fas fa-check-circle"></i></div>
                <div class="label">Payment Success</div>
              </div>
              <div :class="getConnectorClass(order.status, 'Payment Success')"></div>
              <div :class="getStepClass(order.status, 'Order Processed')">
                <div class="icon"><i class="fas fa-box"></i></div>
                <div class="label">Order Processed</div>
              </div>
              <div :class="getConnectorClass(order.status, 'Order Processed')"></div>
              <div :class="getStepClass(order.status, 'Shipped')">
                <div class="icon"><i class="fas fa-shipping-fast"></i></div>
                <div class="label">Shipped</div>
              </div>
              <div :class="getConnectorClass(order.status, 'Shipped')"></div>
              <div :class="getStepClass(order.status, 'Delivered')">
                <div class="icon"><i class="fas fa-home"></i></div>
                <div class="label">Delivered</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
  <div class="order-tracking-page">
    <div class="container py-5">
      </div>

    <button @click="goToOrderingSystem" class="fab" title="Shop More">
      <i class="fas fa-shopping-bag"></i>
    </button>
  </div>
</template>

<script setup>
// --- IMPORTS & SETUP ---
import { ref, onMounted } from 'vue'; // Core Vue functions for state and lifecycle
import { supabase } from '../server/supabase'; // Supabase client for data fetching
import { useRouter } from 'vue-router'; // Vue Router for navigation

// Initialize the router
const router = useRouter();

// --- REACTIVE STATE ---
const orders = ref([]); // Array to store the list of the current user's orders
const isLoading = ref(true); // Boolean to manage the loading state while fetching data
// Defines the sequence and valid names for the order status steps
const statusHierarchy = ['Payment Process', 'Payment Success', 'Order Processed', 'Shipped', 'Delivered']; 

// --- DATABASE FUNCTION ---
/**
 * Fetches all orders belonging to the currently logged-in user.
 * Orders the results by newest first.
 */
const fetchOrders = async () => {
  isLoading.value = true;
  try {
    // Get the current user's session data
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        orders.value = []; // Clear orders if no user is logged in
        return;
    }

    // Fetch orders associated with the user's ID
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('user_id', user.id) // Filter orders by the current user
      .order('created_at', { ascending: false }); // Display newest orders first
    
    if (error) throw error;
    orders.value = data;
  } catch (error) {
    console.error("Error fetching orders:", error.message);
  } finally {
    isLoading.value = false;
  }
};

// --- ORDER TRACKING UI LOGIC (Computed Classes) ---
/**
 * Determines the CSS class for a specific step in the tracking hierarchy.
 * @param {string} orderStatus - The current status of the order (e.g., 'Shipped').
 * @param {string} stepName - The name of the step to check (e.g., 'Order Processed').
 * @returns {string} - The appropriate CSS class ('step completed', 'step active', or 'step').
 */
const getStepClass = (orderStatus, stepName) => {
  const orderIndex = statusHierarchy.indexOf(orderStatus);
  const stepIndex = statusHierarchy.indexOf(stepName);
  
  if (stepIndex < orderIndex) {
    return 'step completed'; // Step is already passed
  } else if (stepIndex === orderIndex) {
    return 'step active'; // Step is the current status
  } else {
    return 'step'; // Step is yet to come
  }
};

/**
 * Determines the CSS class for the connector line between steps.
 * @param {string} orderStatus - The current status of the order.
 * @param {string} stepName - The name of the preceding step whose connector is being checked.
 * @returns {string} - The appropriate CSS class ('connector completed' or 'connector').
 */
const getConnectorClass = (orderStatus, stepName) => {
  const orderIndex = statusHierarchy.indexOf(orderStatus);
  const stepIndex = statusHierarchy.indexOf(stepName);
  
  if (stepIndex < orderIndex) {
    return 'connector completed'; // Connector should be colored as complete
  } else {
    return 'connector'; // Connector is grey/default
  }
};

// --- NAVIGATION FUNCTION ---
/**
 * Navigates the user back to the main 'ordering system' page.
 */
const goToOrderingSystem = () => {
  router.push({ name: 'ordering system' });
};
// --- LIFECYCLE HOOKS ---

// Call fetchOrders immediately when the component loads
onMounted(fetchOrders);
</script>

<style scoped>@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@500;700&family=Roboto:wght@400&display=swap');

/* 🌈 Aurora Gradient Background (Matches Other Pages) */
.order-tracking-page {
  font-family: 'Roboto', sans-serif;
  min-height: 100vh;
  position: relative;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

/* Animated Aurora Background */
.order-tracking-page::before {
  content: '';
  position: fixed;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background-image:
    radial-gradient(circle at 15% 20%, #5a7dff 10%, transparent 50%),
    radial-gradient(circle at 80% 80%, #d08bff 10%, transparent 40%),
    radial-gradient(circle at 50% 40%, #ff8ed1 10%, transparent 40%),
    linear-gradient(120deg, #0c0a24, #241e4e, #17133d);
  filter: blur(80px);
  opacity: 0.9;
  animation: auroraAnimation 25s ease-in-out infinite;
  z-index: 0;
}

@keyframes auroraAnimation {
  0% { transform: rotate(0deg) translateX(0); }
  50% { transform: rotate(180deg) translateX(10%); }
  100% { transform: rotate(360deg) translateX(0); }
}

/* Keep main content above background */
.container,
.fab {
  position: relative;
  z-index: 2;
}

/* --- Floating Action Button (FAB) --- */
.fab {
  position: fixed;
  bottom: 30px;
  right: 30px;
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background-color: #0d6efd;
  color: white;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  cursor: pointer;
  z-index: 1000;
  transition: transform 0.2s ease-in-out;
}
.fab:hover {
  transform: scale(1.1);
}

/* --- Section Title --- */
.section-title {
  font-family: 'Poppins', sans-serif;
  color: #fff;
  text-shadow: 0 2px 6px rgba(0, 0, 0, 0.4);
}

/* --- Order Card (Glass Effect) --- */
.order-card {
  border: none;
  border-radius: 1rem;
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(15px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}
.order-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 30px rgba(13, 110, 253, 0.25);
}

/* --- Card Header --- */
.card-header h6 {
  font-family: 'Poppins', sans-serif;
  font-weight: 600;
}
.card-header {
  background-color: rgba(255, 255, 255, 0.9) !important;
  border-bottom: 1px solid rgba(255, 255, 255, 0.4);
}

/* --- Status Tracker --- */
.status-tracker {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  overflow-x: auto;
  padding-bottom: 1rem;
}

.step {
  text-align: center;
  min-width: 100px;
  flex-shrink: 0;
}
.step .icon {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: #e9ecef;
  color: #adb5bd;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
  border: 3px solid #e9ecef;
}
.step .label {
  margin-top: 10px;
  font-size: 0.85rem;
  font-weight: 500;
  color: #6c757d;
}
.step.active .icon {
  background-color: #e7f1ff;
  color: #0d6efd;
  border-color: #0d6efd;
}
.step.active .label {
  color: #0d6efd;
}
.step.completed .icon {
  background-color: #198754;
  color: #fff;
  border-color: #198754;
}
.step.completed .label {
  color: #198754;
}

/* --- Connector --- */
.connector {
  flex-grow: 1;
  height: 4px;
  background-color: #e9ecef;
  margin-top: 18px;
}
.connector.completed {
  background-color: #198754;
}

</style>