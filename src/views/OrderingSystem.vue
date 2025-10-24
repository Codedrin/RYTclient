<template>
  <div class="ordering-page">
<nav class="navbar navbar-expand-md navbar-light py-3 border-bottom shadow-sm">

      <div class="container">
        <a class="navbar-brand d-flex align-items-center" href="#">
          <img src="../assets/background.jpg" alt="RYT-Tyre Logo" height="40" class="me-2 rounded-circle" />
          <strong class="text-dark fs-5">RYT-Tyre</strong>
        </a>

        <form class="d-none d-md-flex mx-auto" style="max-width: 500px;" @submit.prevent>
          <div class="input-group">
            <span class="input-group-text bg-light border-end-0"><i class="fas fa-search"></i></span>
            <input class="form-control rounded-pill rounded-start-0 border-start-0" type="search" placeholder="Search for tires and parts..." aria-label="Search" />
          </div>
        </form>

        <button class="navbar-toggler d-md-none" type="button" @click="isMobileMenuOpen = !isMobileMenuOpen">
          <span class="navbar-toggler-icon"></span>
        </button>

          <div class="d-none d-md-flex align-items-center gap-4">
            <a href="#" class="nav-icon-link" @click.prevent="router.push({ name: 'profile' })" title="My Account">
              <i class="fas fa-user-circle"></i>
            </a>
            <a href="#" class="nav-icon-link" @click.prevent="router.push({ name: 'order tracking' })" title="Track Order">
              <i class="fas fa-truck"></i>
            </a>
            <a href="#" class="nav-icon-link" @click.prevent="router.push({ name: 'cart' })" title="Shopping Cart">
              <i class="fas fa-shopping-bag"></i>
            </a>
          </div>

      </div>
    </nav>

      <div class="mobile-search d-md-none px-3 py-2">
        <form @submit.prevent>
          <div class="input-group shadow-sm">
            <span class="input-group-text bg-white border-end-0">
              <i class="bi bi-search text-secondary"></i>
            </span>
            <input class="form-control border-start-0 rounded-pill rounded-start-0" 
                  type="search" placeholder="Search..." aria-label="Search" />
          </div>
        </form>
      </div>

  <Transition name="slide-right">
  <div v-if="isMobileMenuOpen" class="mobile-fullscreen-panel">
      <button class="close-btn" @click="isMobileMenuOpen = false">
        <i class="fas fa-times"></i>
      </button>


    <ul class="list-unstyled text-center mt-5">
      <li class="mb-4">
        <a href="#" class="panel-link" @click.prevent="navigateAndCloseMenu('profile')">
          <i class="bi bi-person-circle me-2"></i>
          My Account
        </a>
      </li>
      <li class="mb-4">
        <a href="#" class="panel-link" @click.prevent="navigateAndCloseMenu('order tracking')">
          <i class="bi bi-truck me-2"></i>
          Track Order
        </a>
      </li>
      <li class="mb-4">
        <a href="#" class="panel-link" @click.prevent="navigateAndCloseMenu('cart')">
          <i class="bi bi-bag-check me-2"></i>
          Shopping Cart
        </a>
      </li>
    </ul>
  </div>
</Transition>

    <main class="container py-4">
      
      <section class="py-5">
        <div class="container">
          <h3 class="fw-bold mb-4 text-center section-title">BROWSE BY CATEGORY</h3>
          <div class="d-flex justify-content-center flex-wrap gap-3">
            <button @click="selectCategory('All')" :class="['btn-glass', { 'active': selectedCategory === 'All' }]">All</button>
            <button @click="selectCategory('Tires')" :class="['btn-glass', { 'active': selectedCategory === 'Tires' }]">Tires</button>
            <button @click="selectCategory('Non-Tires')" :class="['btn-glass', { 'active': selectedCategory === 'Non-Tires' }]">Non-Tires</button>
          </div>
        </div>
      </section>

      <section class="py-5">
        <div class="container">
          <div v-if="loading" class="text-center py-5">
            <div class="spinner-border text-primary" role="status">
              <span class="visually-hidden">Loading...</span>
            </div>
            <p class="fs-5 mt-3">Loading products...</p>
          </div>
          <div v-else-if="error" class="text-center py-5 text-danger">
            <p class="fs-5">Could not load products at this time.</p>
          </div>
          <div v-else-if="filteredProducts.length > 0" class="row g-4 justify-content-center">
            <div class="col-6 col-md-4 col-lg-3" v-for="product in filteredProducts" :key="product.id">
              <div class="card h-100 product-card">
                <div class="card-img-container">
                  <img :src="product.image_url || '/images/placeholder.png'" class="card-img-top p-3" :alt="product.brand">
                </div>
                <div class="card-body text-center d-flex flex-column">
                  <h6 class="fw-semibold mb-2 product-name">{{ product.brand }} - {{ product.size }}</h6>
                  <p class="text-danger fw-bold fs-5 mb-3">₱{{ product.price.toLocaleString() }}</p>
                  
                  <span v-if="product.status !== 'In Stock'" 
                    :class="['badge', 'mb-3', 'align-self-center', 'stock-badge', product.status === 'Out of Stock' ? 'bg-danger' : 'bg-warning text-dark']">
                    {{ product.status }}
                  </span>

                  <button 
                    v-if="product.status === 'In Stock' || product.status === 'Low Stock'"
                    class="btn btn-sm btn-primary mt-auto rounded-pill px-4" 
                    @click="handleAddToCart(product)"
                  >
                    Add to Cart
                  </button>
                </div>
              </div>
            </div>
          </div>
          <div v-else class="text-center py-5">
            <p class="text-muted fs-5">No products found in this category.</p>
          </div>
        </div>
      </section>
    </main>
      <div class="mb-5">
        <AdScroller />
      </div>
    <footer class="bg-dark text-white pt-5 pb-3 footer-section">
      <div class="container">
        <div class="row text-center text-md-start">
          <div class="col-md-4 mb-4 mb-md-0">
            <h5 class="fw-bold text-uppercase mb-3 d-flex align-items-center justify-content-center justify-content-md-start">
              <img src="../assets/background.jpg" alt="RYT-Tyre Logo" height="30" class="me-2 rounded-circle" />
              RYT-Tyre
            </h5>
            <p class="text-white-50">
              Your trusted one-stop shop for high-quality tires and automotive parts in the Philippines.
            </p>
          </div>
          <div class="col-md-4 mb-4 mb-md-0">
            <h5 class="fw-bold text-uppercase mb-3">Contact Us</h5>
            <ul class="list-unstyled">
              <li class="mb-2">
                <i class="fas fa-envelope me-2"></i>
                <a href="mailto:ryttyre2024@gmail.com" class="footer-link">ryttyre2024@gmail.com</a>
              </li>
              <li class="mb-2">
                <i class="fas fa-phone-alt me-2"></i>
                <a href="tel:09479931979" class="footer-link">0947 993 1979</a>
              </li>
              <li>
                <i class="fas fa-file-contract me-2"></i>
                <a href="#" class="footer-link">Privacy Policy</a>
              </li>
            </ul>
          </div>
          <div class="col-md-4">
            <h5 class="fw-bold text-uppercase mb-3">Follow Us</h5>
            <div>
              <a href="https://www.facebook.com/profile.php?id=61561174944710" class="social-icon me-3" title="Facebook">
                <img src="../assets/facebook.png" alt="Facebook Icon" />
              </a>
              <a href="https://www.instagram.com/ryttyre" class="social-icon me-3" title="Instagram">
                <img src="../assets/instagram.png" alt="Instagram Icon" />
              </a>
              <a href="https://www.tiktok.com/@ryt.tyre" class="social-icon" title="TikTok">
                <img src="../assets/tiktok.png" alt="TikTok Icon" />
              </a>
            </div>
          </div>
        </div>
        
        <hr class="my-4 bg-white-50">
        <div class="text-center text-white-50">
          <p>&copy; 2025 RYT-Tyre. All Rights Reserved.</p>
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup>
/* ============================================================
   Customer Product Listing Page
   Features:
   - Exit Guard (Warn before leaving page)
   - Product Fetching & Filtering
   - Cart Management
   - Responsive Mobile Menu
   - Category Filtering
============================================================ */

import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useRouter, onBeforeRouteLeave } from 'vue-router';
import { getProducts, getProductImageURL } from '../services/apiService';
import { useCart } from '../composables/useCart';
import { supabase } from '../server/supabase';
import AdScroller from '../components/AdScroller.vue'; // Optional component for ads

/* ============================================================
   ROUTE GUARD
   Warns user before leaving pages that may cause logout/session end
============================================================ */
onBeforeRouteLeave(async (to, from, next) => {
  const safeRoutes = ['profile', 'order tracking', 'cart'];

  // Allow navigation for safe routes
  if (safeRoutes.includes(to.name)) {
    next();
    return;
  }

  const answer = window.confirm(
    'Are you sure you want to leave this page? You will be logged out for security.'
  );

  if (answer) {
    await supabase.auth.signOut();
    next(false); // Cancel current navigation
    window.location.href = '/login'; // Force redirect to login page
  } else {
    next(false); // Cancel navigation
  }
});

/* ============================================================
   ROUTER & UI STATE
============================================================ */
const router = useRouter();
const isMobileMenuOpen = ref(false); // Controls mobile menu visibility
const selectedCategory = ref('All'); // Default category filter

// Navigate to a route and close the mobile menu
const navigateAndCloseMenu = (routeName) => {
  isMobileMenuOpen.value = false;
  router.push({ name: routeName });
};

// Select a product category for filtering
const selectCategory = (category) => {
  selectedCategory.value = category;
};

/* ============================================================
   PRODUCT DATA FETCHING
============================================================ */
const allProducts = ref([]);
const loading = ref(true);
const error = ref(null);

// Filtered products based on selected category
const filteredProducts = computed(() => {
  if (selectedCategory.value === 'All') return allProducts.value;
  return allProducts.value.filter(product => product.product_type === selectedCategory.value);
});

// Fetch products on component mount
onMounted(async () => {
  loading.value = true;
  error.value = null;

  try {
    const { data, error: fetchError } = await getProducts();
    if (fetchError) throw fetchError;

    if (data) {
      allProducts.value = data.map(product => ({
        ...product,
        image_url: getProductImageURL(product.image_url) // Full image URL
      }));
    }
  } catch (err) {
    error.value = err.message;
    console.error("Failed to fetch products:", err);
  } finally {
    loading.value = false;
  }
});

const handleScroll = () => {
  const navbar = document.querySelector('.navbar');
  if (navbar) {
    if (window.scrollY > 50) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  }
};

onMounted(() => {
  window.addEventListener('scroll', handleScroll);
});

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll);
});


/* ============================================================
   CART MANAGEMENT
============================================================ */
const { addToCart } = useCart();

// Add selected product to cart and redirect to cart page
const handleAddToCart = (product) => {
  addToCart(product);
  router.push({ name: 'cart' });
};
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&family=Roboto:wght@300;400;500;700&display=swap');
@import url('https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css');

@keyframes auroraAnimation {
    0% { transform: rotate(0deg) translateX(10%); }
    50% { transform: rotate(180deg) translateX(10%); }
    100% { transform: rotate(360deg) translateX(10%); }
}

/* Add this new rule to style the image icons */
.social-icon img {
  width: 20px;  /* Adjust size as needed */
  height: 20px; /* Adjust size as needed */
}

.ordering-page { 
  font-family: 'Roboto', sans-serif; 
  position: relative;
  background-color: #0c0a24;
  overflow-x: hidden;
}

.ordering-page::before {
  content: '';
  position: fixed;
  top: -50%; left: -50%; right: -50%; bottom: -50%;
  z-index: 0;
  background-image: 
    radial-gradient(circle at 10% 20%, #6e86ff 10%, transparent 40%),
    radial-gradient(circle at 80% 90%, #d8b4fe 15%, transparent 50%),
    radial-gradient(circle at 50% 50%, #f7c2d8 12%, transparent 45%),
    radial-gradient(circle at 90% 10%, #63a4ff 20%, transparent 60%);
  filter: blur(100px);
  animation: auroraAnimation 20s ease-in-out infinite;
}

.navbar, section, footer {
  position: relative;
  z-index: 1;
}

section {
  background-color: transparent !important;
}

.section-title { 
  font-family: 'Poppins', sans-serif; 
  color: #fff;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
  position: relative; 
  padding-bottom: 10px; 
}
.section-title::after { 
  content: ''; 
  position: absolute; 
  left: 50%; bottom: 0; 
  transform: translateX(-50%); 
  width: 60px; height: 3px; 
  background-color: #0d6efd; 
  border-radius: 2px; 
}

.product-card { 
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 1rem; 
  box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.2); 
}
.card-img-container { 
  background-color: rgba(255, 255, 255, 0.7);
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
  height: 160px; 
}

/* --- NAVBAR STYLES --- */
.navbar-brand strong { font-family: 'Poppins', sans-serif; font-weight: 600; color: #212529 !important; }
.input-group-text { border-radius: 50rem 0 0 50rem; background-color: #f8f9fa; }
.form-control:focus { box-shadow: none; border-color: #ced4da; }
.navbar-toggler { border: none; }
.navbar-toggler:focus { box-shadow: none; }
.nav-icon-link { 
    margin-left: 1rem; 
}

/* --- MOBILE SIDE PANEL STYLES --- */
.mobile-side-panel {
  position: fixed;
  top: 80px;
  right: 0;
  width: auto;
  background-color: #343a40; /* Simple solid dark color */
  border-radius: 1rem 0 0 1rem; /* Rounded on the left side */
  box-shadow: -5px 5px 20px rgba(0, 0, 0, 0.3);
  z-index: 1050;
  padding: 0.5rem;
  padding-left: 2rem; /* Make space for the handle */
}
/* This creates the "handle" from your sketch */
.mobile-side-panel::before {
  content: '';
  position: absolute;
  left: -10px;
  top: 50%;
  transform: translateY(-50%);
  width: 20px;
  height: 60px;
  background-color: #343a40;
  border-radius: 10px 0 0 10px;
}
.panel-link {
  display: flex;
  align-items: center;
  padding: 0.75rem;
  color: #f8f9fa;
  text-decoration: none;
  border-radius: 0.5rem;
  transition: background-color 0.2s ease;
  white-space: nowrap; /* Prevent text from wrapping */
}
.panel-link:hover {
  background-color: rgba(255, 255, 255, 0.1);
}
.panel-link img {
  filter: invert(1);
  margin-right: 0.75rem;
}

/* --- TRANSITION FOR THE PANEL --- */
.slide-right-enter-active,
.slide-right-leave-active {
  transition: transform 0.4s ease;
}
.slide-right-enter-from,
.slide-right-leave-to {
  transform: translateX(100%);
}

.advertisement-banner img { width: 100%; height: auto; display: block; }

.card-img-top { max-height: 100%; max-width: 100%; object-fit: contain; padding: 10px; }
.product-name { min-height: 40px; display: flex; align-items: center; justify-content: center; font-family: 'Poppins', sans-serif; color: #212529; }
.product-card .card-body { padding: 1rem; }
.btn { font-family: 'Poppins', sans-serif; font-weight: 500; }
footer { background-color: rgba(12, 10, 36, 0.8) !important; backdrop-filter: blur(5px); }

.btn-glass {
  padding: 0.5rem 1.5rem;
  font-family: 'Poppins', sans-serif;
  border-radius: 50rem;
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(5px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: #fff;
}
.btn-glass.active {
  background: #0d6efd;
  border-color: #0d6efd;
  box-shadow: 0 4px 12px rgba(13, 110, 253, 0.3);
}

@media (max-width: 767.98px) {
  h3.section-title { font-size: 1.5rem; }
  section.py-5 { padding-top: 3rem !important; padding-bottom: 3rem !important; }
  .card-img-container { height: 120px; }
  .product-name { font-size: 0.9rem; }
}

/* --- FOOTER STYLES --- */
.footer-section {
  background-color: rgba(12, 10, 36, 0.8) !important;
  backdrop-filter: blur(10px);
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.footer-link {
  color: #adb5bd; /* Lighter gray for better readability */
  text-decoration: none;
  transition: color 0.3s ease;
}

.footer-link:hover {
  color: #ffffff;
  text-decoration: underline;
}

.social-icon {
  display: inline-flex;
  justify-content: center;
  align-items: center;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: rgba(255, 255, 255, 0.1);
  color: #fff;
  font-size: 1rem;
  transition: background-color 0.3s ease, transform 0.3s ease;
}

.social-icon:hover {
  background-color: #0d6efd; /* Primary blue on hover */
  transform: translateY(-3px);
  color: #fff;
}


.navbar {
  position: fixed !important;
  top: 0;
  left: 0;
  width: 100%;
  z-index: 1055;
  background: rgba(255, 255, 255, 0.08) !important;
  backdrop-filter: blur(15px);
  -webkit-backdrop-filter: blur(15px);
  box-shadow: 0 4px 30px rgba(0, 0, 0, 0.2);
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
  transition: background 0.3s ease, box-shadow 0.3s ease;
}

/* When scrolled */
.navbar.scrolled {
  background: rgba(12, 10, 36, 0.7) !important;
  box-shadow: 0 4px 25px rgba(0, 0, 0, 0.4);
}


body,
.ordering-page {
  padding-top: 90px;
}


.navbar-brand strong {
  font-family: 'Poppins', sans-serif;
  font-weight: 700;
  background: linear-gradient(45deg, #0066ff, #8a2be2);
  -webkit-background-clip: text;
  color: transparent;
}
.ordering-page::before {
  background-image:
    radial-gradient(circle at 15% 20%, #5a7dff 10%, transparent 50%),
    radial-gradient(circle at 80% 80%, #d08bff 10%, transparent 40%),
    radial-gradient(circle at 50% 40%, #ff8ed1 10%, transparent 40%),
    linear-gradient(120deg, #0c0a24, #241e4e, #17133d);
  filter: blur(80px);
  opacity: 0.9;
}
.product-card {
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.product-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 12px 30px rgba(13,110,253,0.25);
}

.card-img-container {
  background: linear-gradient(to bottom, rgba(255,255,255,0.9), rgba(240,240,255,0.7));
  border-bottom: 2px solid rgba(255,255,255,0.2);
}
.nav-icon-link {
  color: rgba(255, 255, 255, 0.9);
  font-size: 1.6rem;
  transition: all 0.3s ease;
}

.nav-icon-link:hover {
  color: #0d6efd; 
  transform: scale(1.15);
}

.nav-icon-link i {
  vertical-align: middle;
}

/* Overriding CSS classes */
.navbar-toggler {
  border: none;
}

.navbar-toggler-icon {
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 30 30'%3E%3Cpath stroke='rgba(255,255,255,0.9)' stroke-width='2' stroke-linecap='round' stroke-miterlimit='10' d='M4 7h22M4 15h22M4 23h22'/%3E%3C/svg%3E");
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3));
}

.mobile-search {
  background: transparent; 
  backdrop-filter: none;  
  padding-left: 1rem;
  padding-right: 1rem;
}

.mobile-search .input-group {
  width: 100%;
}

.mobile-search .form-control {
  background-color: #f8f9fa; 
  border: none;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
}

.mobile-search .input-group-text {
  background-color: #f8f9fa;
  border: none;
}



.mobile-search .form-control {
  background-color: rgba(255, 255, 255, 0.9);
}

.mobile-search .input-group-text {
  background-color: rgba(255, 255, 255, 0.9);
  border-radius: 50rem 0 0 50rem;
}

@media (max-width: 767.98px) {
  .navbar-brand strong {
    font-size: 1rem;
  }

  .navbar img {
    height: 32px !important;
  }

  .navbar {
    padding: 0.5rem 1rem !important;
  }
}

/* 🌈 Full-Screen Mobile Panel */
.mobile-fullscreen-panel {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, rgba(13, 110, 253, 0.9), rgba(111, 66, 193, 0.9));
  backdrop-filter: blur(12px);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  z-index: 1100;
  animation: fadeIn 0.4s ease;
}

/* Close button — more visible and larger tap area */
.close-btn {
  position: absolute;
  top: 25px;
  right: 25px;
  width: 45px;
  height: 45px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.15);
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  color: #fff;
  font-size: 1.6rem;
  cursor: pointer;
  z-index: 1200;
  backdrop-filter: blur(10px);
  transition: all 0.25s ease;
}

.close-btn:hover {
  background: rgba(255, 255, 255, 0.3);
  color: #ffc107;
  transform: rotate(90deg) scale(1.1);
}

.close-btn i {
  pointer-events: none; /* Make sure icon doesn't block clicks */
}

/* Menu links */
.panel-link {
  color: #fff;
  font-family: 'Poppins', sans-serif;
  font-size: 1.3rem;
  text-decoration: none;
  font-weight: 500;
  transition: color 0.3s ease, transform 0.2s ease;
}
.panel-link:hover {
  color: #ffc107;
  transform: scale(1.1);
}
.panel-link i {
  font-size: 1.5rem;
  vertical-align: middle;
}

/* Transition effect */
.slide-right-enter-active,
.slide-right-leave-active {
  transition: all 0.4s ease;
}
.slide-right-enter-from,
.slide-right-leave-to {
  opacity: 0;
  transform: translateY(-100%);
}

/* Simple fade */
@keyframes fadeIn {
  from { opacity: 0; transform: scale(0.95); }
  to { opacity: 1; transform: scale(1); }
}



</style>