<template>
  <div class="shopping-cart-page">
    <div class="container py-5">
      <h2 class="fw-bold mb-5 section-title text-center">Shopping Cart</h2>
      <div v-if="cart.length > 0" class="row">
        <div class="col-lg-8">
          <div class="card shadow-sm mb-4">
            <div class="card-header bg-white py-3">
              <h5 class="mb-0 fw-bold">Your Items ({{ cart.length }})</h5>
            </div>
            <div class="card-body">
              <div v-for="(item, index) in cart" :key="item.id">
                <div class="row align-items-center mb-4 cart-item">
                  <div class="col-2 col-md-2">
                    <img :src="item.image_url || '/images/placeholder.png'" class="img-fluid rounded" :alt="item.brand">
                  </div>
                  <div class="col-5 col-md-5">
                    <h6 class="fw-bold mb-1">{{ item.brand }}</h6>
                    <p class="text-muted small mb-0">Size: {{ item.size }}</p>
                  </div>
                  <div class="col-3 col-md-3">
                    <input 
                      type="number" 
                      class="form-control form-control-sm text-center" 
                      :value="item.quantity"
                      @input="updateQuantity(item.id, parseInt($event.target.value))"
                      min="1"
                    >
                  </div>
                  <div class="col-2 col-md-2 text-end">  
                    <h6 class="fw-bold mb-0">₱{{ (item.price * item.quantity).toLocaleString() }}</h6>
                    <a href="#" class="text-danger small" @click.prevent="removeFromCart(item.id)">Remove</a>
                  </div>
                </div>
                <hr v-if="index < cart.length - 1">
              </div>
            </div>
          </div>
        </div>

        <div class="col-lg-4">
          <div class="card shadow-sm">
            <div class="card-header bg-white py-3">
              <h5 class="mb-0 fw-bold">Order Summary</h5>
            </div>
            <div class="card-body p-4">
              <ul class="list-group list-group-flush">
                <li class="list-group-item d-flex justify-content-between align-items-center border-0 px-0 pb-2">
                  <span>Subtotal</span>
                  <span>₱{{ cartTotal.toLocaleString() }}.00</span>
                </li>
                <li class="list-group-item d-flex justify-content-between align-items-center border-0 px-0 pb-2">
                  <span>Shipping</span>
                  <span>₱{{ shippingFee.toLocaleString() }}</span>
                </li>
                <li class="list-group-item d-flex justify-content-between align-items-center px-0 mb-3">
                  <strong class="fw-bold">Total</strong>
                  <strong class="fw-bold fs-5 text-danger">₱{{ grandTotal.toLocaleString() }}.00</strong>
                </li>
              </ul>
              <div class="d-grid">
                <button class="btn btn-primary btn-lg rounded-pill" @click="proceedToAddress">
                  Proceed to Checkout
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div v-else class="text-center py-5">
        <i class="fas fa-shopping-cart fa-4x text-muted mb-3"></i>
        <h4 class="fw-bold">Your cart is empty</h4>
        <p class="text-muted">Looks like you haven't added anything to your cart yet.</p>
        <button class="btn btn-primary rounded-pill mt-3" @click="router.push({ name: 'ordering system' })">
          Start Shopping
        </button>
      </div>
    </div>
  </div>
  <div class="shopping-cart-page">
    <div class="container py-5">
      </div>

    <button @click="goToOrderingSystem" class="fab" title="Continue Shopping">
      <i class="fas fa-shopping-bag"></i>
    </button>
  </div>
</template>

<script setup>
// --- IMPORTS & SETUP ---
import { ref, computed } from 'vue'; // Core Vue functions for state and reactivity
import { useRouter } from 'vue-router'; // Vue Router hook for navigation
import { useCart } from '../composables/useCart'; // Custom composable for managing cart state and actions

// Initialize the router
const router = useRouter();

// Destructure reactive cart state and action functions from the composable
const { cart, removeFromCart, updateQuantity, cartTotal } = useCart();

// --- REACTIVE STATE & CONSTANTS ---

// Placeholder/Example shipping fee
const shippingFee = "Free Shipping"; 

// --- COMPUTED PROPERTIES ---

/**
 * Calculates the grand total for the order. 
 * Since shipping is marked as "Free", this just mirrors the cart subtotal.
 */
const grandTotal = computed(() => {
  return cartTotal.value;
});

// --- NAVIGATION & CONTROL FUNCTIONS ---

/**
 * Navigates the user back to the main product ordering page.
 */
const goToOrderingSystem = () => {
  router.push({ name: 'ordering system' });
};

/**
 * Handles the logic for proceeding from the cart summary.
 * Checks if the cart is empty and navigates to the address selection page if items are present.
 */
const proceedToAddress = () => {
  // Prevent proceeding if the cart has no items
  if (cart.value.length === 0) {
    alert("Your cart is empty!");
    return;
  }
  // Navigate to the component where the user selects or sets their shipping address
  router.push({ name: 'BookOrderAddress' });
};
</script>

<style scoped>@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@500;700&family=Roboto:wght@400&display=swap');

/* 🌈 Aurora Gradient Background (Unified with Other Pages) */
.shopping-cart-page {
  font-family: 'Roboto', sans-serif;
  min-height: 100vh;
  position: relative;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

/* Animated Aurora Effect */
.shopping-cart-page::before {
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

/* Keep content above aurora */
.container,
.fab {
  position: relative;
  z-index: 2;
}

/* --- Section Title --- */
.section-title {
  font-family: 'Poppins', sans-serif;
  color: #fff;
  text-shadow: 0 2px 6px rgba(0, 0, 0, 0.4);
}

/* --- Card Styling (Glassmorphism Effect) --- */
.card {
  border: none;
  border-radius: 1rem;
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(15px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}
.card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 30px rgba(13, 110, 253, 0.25);
}

.card-header {
  background-color: rgba(255, 255, 255, 0.9) !important;
  border-bottom: 1px solid rgba(255, 255, 255, 0.4);
}

/* --- Cart Items --- */
.cart-item img {
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 0.5rem;
  background-color: rgba(255, 255, 255, 0.8);
}
.cart-item h6,
.card-header h5 {
  font-family: 'Poppins', sans-serif;
  font-weight: 600;
  color: #212529;
}

/* --- Form Controls --- */
.form-control-sm {
  max-width: 80px;
  margin: 0 auto;
  border-radius: 50rem;
  text-align: center;
}

/* --- Order Summary --- */
.list-group-item {
  background-color: transparent;
  border: none;
  font-family: 'Poppins', sans-serif;
}
.list-group-item span {
  color: #212529;
}
.text-danger {
  color: #dc3545 !important;
}

/* --- Primary Button --- */
.btn-primary {
  font-family: 'Poppins', sans-serif;
  font-weight: 500;
  padding-top: 0.75rem;
  padding-bottom: 0.75rem;
  border-radius: 50rem;
  transition: all 0.3s ease-in-out;
}
.btn-primary:hover {
  background-color: #0b5ed7;
  box-shadow: 0 4px 12px rgba(13, 110, 253, 0.4);
}

/* --- Empty Cart State --- */
.text-muted {
  color: rgba(255, 255, 255, 0.8) !important;
}
.fa-shopping-cart {
  opacity: 0.9;
  color: #fff !important;
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

</style>