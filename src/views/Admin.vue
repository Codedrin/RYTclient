<template>
 <div>
    <!-- ✅ Navbar stays full width -->
    <nav class="navbar navbar-dark bg-primary shadow-sm fixed-top w-100">
      <div class="container-fluid d-flex align-items-center justify-content-between">
        <div class="d-flex align-items-center gap-2">
          <button class="btn text-white border-0 shadow-none" type="button" @click="toggleSidebar">
            <i class="fas fa-bars fa-lg"></i>
          </button>
          <span class="fw-bold text-white d-none d-md-inline">Administrator</span>
        </div>

        <div class="d-flex align-items-center gap-3">
          <a class="nav-link text-white" href="#"><i class="fas fa-bell fa-lg"></i></a>
          <div class="dropdown">
            <a href="#" class="nav-link dropdown-toggle text-white d-flex align-items-center"
               @click.prevent="toggleDesktopAdminMenu">
              <i class="fas fa-user-circle fa-lg me-1"></i>
            </a>
            <ul class="dropdown-menu dropdown-menu-end" v-show="desktopAdminDropdownOpen">
              <li><a class="dropdown-item" href="#" @click.prevent="showProfileModal = true">Profile</a></li>
              <li><hr class="dropdown-divider" /></li>
              <li><a class="dropdown-item" href="#" @click.prevent="logout">Logout</a></li>
            </ul>
          </div>
        </div>
      </div>
    </nav>


    <div id="admin-dashboard" class="d-flex flex-column min-vh-100 bg-light pt-5">
    <div
      :class="[
        'sidebar bg-dark text-white shadow',
        { collapsed: isCollapsed && !isMobile },
        { 'sidebar-visible': isSidebarVisible }
      ]"
    >


        <nav class="h-100 p-3">
          <h5 class="text-center mb-4 text-uppercase" v-if="!isCollapsed || isMobile">RYT-Tyre</h5>
          <ul class="nav flex-column">
            <li
              class="nav-item mt-3 mb-2"
              v-for="item in menuItems"
              :key="item.label"
              :class="{ active: currentView === item.label }"
            >
              <a
                class="nav-link text-white py-2 px-3 d-flex align-items-center"
                href="#"
                @click.prevent="selectView(item.label)"
              >
                <i :class="[item.icon, 'me-2']"></i>
                <span v-if="!isCollapsed || isMobile">{{ item.label }}</span>
              </a>
            </li>
          </ul>
        </nav>
      </div>
      <div
        v-if="isSidebarVisible"
        class="sidebar-overlay"
        @click="closeSidebar"
      ></div>


      <main class="flex-grow-1 p-4">
        <h2 class="text-primary mb-4">{{ currentView }}</h2>
        
        <div v-if="currentView === 'Dashboard'">
          <div class="row">
            <div class="col-md-4 mb-4">
              <div class="card shadow-sm border-0 rounded-lg">
                <div class="card-body text-center">
                  <i class="fas fa-cubes fa-3x text-info mb-3"></i>
                  <h5 class="card-title">Total Products</h5>
                  <p class="card-text fs-4 fw-bold">{{ totalProductsCount }}</p>
                </div>
              </div>
            </div>
            <div class="col-md-4 mb-4">
              <div class="card shadow-sm border-0 rounded-lg">
                <div class="card-body text-center">
                  <i class="fas fa-arrow-alt-circle-down fa-3x text-success mb-3"></i>
                  <h5 class="card-title">Stock In Today</h5>
                  <p class="card-text fs-4 fw-bold">{{ stockInTodayCount }}</p>
                </div>
              </div>
            </div>
            <div class="col-md-4 mb-4">
              <div class="card shadow-sm border-0 rounded-lg">
                <div class="card-body text-center">
                  <i class="fas fa-arrow-alt-circle-up fa-3x text-danger mb-3"></i>
                  <h5 class="card-title">Stock Out Today</h5>
                  <p class="card-text fs-4 fw-bold">{{ stockOutTodayCount }}</p>
                </div>
              </div>
            </div>
          </div>
          <div class="card shadow-sm border-0 rounded-lg mt-4">
            <div class="card-header bg-white text-dark fw-bold">Recent Activities</div>
            <div class="card-body">
              <ul class="list-group list-group-flush">
                <li class="list-group-item" v-for="item in recentActivities" :key="item.barcode_id">
                  <i class="fas fa-arrow-alt-circle-down text-success me-2"></i> {{ item.product_name }} (Qty: {{ item.quantity }}) received.
                </li>
                <li v-if="!recentActivities.length" class="list-group-item text-muted">No recent stock-in activities.</li>
              </ul>
            </div>
          </div>
        </div>
        
        <div v-if="currentView === 'Stock In'">
          <div class="card shadow-sm border-0 rounded-lg mb-4">
            <div class="card-header bg-white text-dark fw-bold">Record New Stock In</div>
            <div class="card-body">
 <form @submit.prevent="addStockIn" class="p-3">
  <div class="row g-3">
    <!-- Left Column -->
    <div class="col-md-6">
      <div class="mb-3">
        <label for="productNameIn" class="form-label fw-semibold">Product (Brand)</label>
        <select class="form-select" id="productNameIn" v-model="stockIn.productName" required>
          <option disabled value="">Please select a product</option>
          <option v-for="product in availableProducts" :key="product.id" :value="product.brand">
            {{ product.brand }} (Current Size: {{ product.size }})
          </option>
        </select>
      </div>

      <div class="mb-3">
        <label for="quantityIn" class="form-label fw-semibold">Quantity to Add</label>
        <input type="number" class="form-control" id="quantityIn" v-model="stockIn.quantity" min="1" required>
      </div>

      <div class="mb-3">
        <label for="dateTimeIn" class="form-label fw-semibold">Date and Time</label>
        <input type="datetime-local" class="form-control" id="dateTimeIn" v-model="stockIn.dateTime" required>
      </div>
    </div>

    <!-- Right Column -->
    <div class="col-md-6">
      <div class="mb-3">
        <label for="sizeIn" class="form-label fw-semibold">New Size</label>
        <input type="text" class="form-control" id="sizeIn" v-model="stockIn.size" required>
      </div>

      <div class="mb-3">
        <label for="supplierIn" class="form-label fw-semibold">Supplier</label>
        <input type="text" class="form-control" id="supplierIn" v-model="stockIn.supplier">
      </div>
    </div>
  </div>

  <div class="text-center mt-3">
    <button type="submit" class="btn btn-success rounded-pill px-5 py-2 fw-bold">
      Record Stock In
    </button>
  </div>
</form>

            </div>
          </div>
          <div class="card shadow-sm border-0 rounded-lg">
            <div class="card-header bg-white text-dark fw-bold">Stock In History</div>
            <div class="card-body">
              <div class="table-responsive">
                <table class="table table-hover">
                  <thead>
                    <tr>
                      <th>Product Name</th>
                      <th>Size</th>
                      <th>Quantity</th>
                      <th>Supplier</th>
                      <th>Date and Time</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="item in stockInHistory" :key="item.barcode_id">
                      <td>{{ item.product_name }}</td>
                      <td>{{ item.size }}</td>
                      <td>{{ item.quantity }}</td>
                      <td>{{ item.supplier }}</td>
                      <td>{{ new Date(item.date_and_time).toLocaleString() }}</td>
                    </tr>
                    <tr v-if="!stockInHistory.length"><td colspan="5" class="text-center text-muted">No records yet.</td></tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        <div v-if="currentView === 'Stock Out'">
          <div class="alert alert-info" role="alert">
            Fulfill orders by scanning the product's barcode to confirm shipment.
          </div>
          <div v-if="activeOrders.length === 0 && !isStockOutLoading" class="card text-center p-5 bg-light">
            <i class="fas fa-check-circle fa-3x text-success mb-3"></i>
            <h4 class="fw-bold">No Processed Orders Awaiting Shipment</h4>
            <p class="text-muted">Orders with 'Order Processed' status will appear here.</p>
          </div>
          
          <div v-if="isStockOutLoading" class="text-center p-5">
            <div class="spinner-border text-primary" role="status"><span class="visually-hidden">Loading...</span></div>
          </div>

          <div v-else class="row">
            <div class="col-md-6 col-lg-4 mb-4" v-for="order in activeOrders" :key="order.order_id">
              <div class="card h-100 shadow-sm border-warning">
                <div class="card-header bg-warning text-dark fw-bold">
                  Order #{{ order.order_id.slice(0, 8) }}
                </div>
                <div class="card-body">
                  <h5 class="card-title fw-bold text-primary">{{ order.product_name }} (x{{ order.quantity }})</h5>
                  <p class="card-text mb-1">
                    <i class="fas fa-user me-2 text-muted"></i>{{ order.username }}
                  </p>
                  <p class="card-text mb-1 small text-muted">
                    <i class="fas fa-map-marker-alt me-2"></i>
                    {{ order.shipping_address ? order.shipping_address.substring(0, 40) : 'Address Missing' }}
                    <span v-if="order.shipping_address && order.shipping_address.length > 40">...</span>
                  </p>
                  <p class="card-text mb-2">
                    <i class="fas fa-tag me-2 text-muted"></i>Size: {{ order.size }}
                  </p>
                  <button class="btn btn-primary w-100 mt-2" 
                          @click="startScanForOrder(order)">
                    <i class="fas fa-barcode me-2"></i>Take Order & Scan
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
        </main>
    </div>
    
    <div v-if="showProfileModal" class="custom-modal-overlay">
      <div class="custom-modal-card card shadow-lg">
        <div class="card-header bg-primary text-white text-center">
          <h5 class="mb-0"><i class="fas fa-user-circle me-2"></i> User Profile</h5>
        </div>
        <div class="card-body">
            <form @submit.prevent="addStockIn">
              <div class="row">
                <div class="col-md-6 mb-3">
                  <label for="productNameIn" class="form-label">Product (Brand)</label>
                  <select class="form-select" id="productNameIn" v-model="stockIn.productName" required>
                    <option disabled value="">Please select a product</option>
                    <option v-for="product in availableProducts" :key="product.id" :value="product.brand">
                      {{ product.brand }} (Current Size: {{ product.size }})
                    </option>
                  </select>
                </div>

                <div class="col-md-6 mb-3">
                  <label for="sizeIn" class="form-label">New Size</label>
                  <input type="text" class="form-control" id="sizeIn" v-model="stockIn.size" required>
                </div>

                <div class="col-md-6 mb-3">
                  <label for="quantityIn" class="form-label">Quantity to Add</label>
                  <input type="number" class="form-control" id="quantityIn" v-model="stockIn.quantity" min="1" required>
                </div>

                <div class="col-md-6 mb-3">
                  <label for="supplierIn" class="form-label">Supplier</label>
                  <input type="text" class="form-control" id="supplierIn" v-model="stockIn.supplier">
                </div>

                <div class="col-md-6 mb-3">
                  <label for="dateTimeIn" class="form-label">Date and Time</label>
                  <input type="datetime-local" class="form-control" id="dateTimeIn" v-model="stockIn.dateTime" required>
                </div>
              </div>

              <div class="text-center mt-4">
                <button type="submit" class="btn btn-success rounded-pill px-5">
                  Record Stock In
                </button>
              </div>
            </form>

        </div>
      </div>
    </div>
    <div v-if="showLogoutModal" class="custom-modal-overlay">
      <div class="custom-modal-card card shadow-lg">
        <div class="card-header bg-primary text-white text-center">
          <h5 class="mb-0"><i class="fas fa-sign-out-alt me-2"></i> Confirm Logout</h5>
        </div>
        <div class="card-body text-center">
          <p class="lead">Are you sure you want to log out?</p>
          <div class="d-flex justify-content-center gap-3 mt-4">
            <button class="btn btn-secondary" @click="cancelLogout">Cancel</button>
            <button class="btn btn-primary" @click="confirmLogout">Logout</button>
          </div>
        </div>
      </div>
    </div>
    <div v-if="showBarcodeModal" class="custom-modal-overlay">
        <div class="custom-modal-card card shadow-lg" style="max-width: 400px;">
            <div class="card-header bg-primary text-white text-center">
                <h5 class="mb-0"><i class="fas fa-barcode me-2"></i> Print Labels</h5>
            </div>
            <div class="card-body text-center">
              <p>Ready to print <strong>{{ itemToPrint.quantity }}</strong> labels for <strong>{{ itemToPrint.productName }}</strong>.</p>
              <div class="d-flex justify-content-center gap-3 mt-4">
                  <button class="btn btn-secondary" @click="closeBarcodePrintModal">Cancel</button>
                  <button class="btn btn-primary" @click="printLabel">
                      <i class="fas fa-print me-2"></i> Print All Labels
                  </button>
              </div>
            </div>
        </div>
    </div>
    <div v-if="showScanModal" class="custom-modal-overlay">
        <div class="custom-modal-card card shadow-lg" style="max-width: 600px;">
            <div class="card-header bg-primary text-white text-center">
                <h5 class="mb-0"><i class="fas fa-qrcode me-2"></i> Scan Product Barcode</h5>
            </div>
            <div class="card-body">
              <p class="text-center text-muted">Scan **{{ orderToFulfill.product_name }} (x{{ orderToFulfill.quantity }})** for Order #{{ orderToFulfill.order_id.slice(0, 8) }}.</p>
              
              <div id="scanner-container" class="mb-3">
                <video id="scanner-video" style="width: 100%; height: 100%; object-fit: cover;"></video>
              </div>
              <div class="alert alert-warning" v-if="scanStatusMessage">{{ scanStatusMessage }}</div>
              
              <div class="d-flex justify-content-center gap-3 mt-4">
                <button class="btn btn-secondary" @click="closeScanModal">
                    <i class="fas fa-times me-2"></i> Cancel Scan
                </button>
                <button class="btn btn-warning" @click="captureBarcode" :disabled="isProductScanned">
                    <i class="fas fa-camera me-2"></i> Capture Barcode
                </button>
              </div>
            </div>
        </div>
    </div>
    <div v-if="isProductScanned && orderToFulfill && !showScanModal" class="custom-modal-overlay">
        <div class="custom-modal-card card shadow-lg" style="max-width: 450px;">
            <div class="card-header bg-success text-white text-center">
                <h5 class="mb-0"><i class="fas fa-check-circle me-2"></i> Confirm Order Details</h5>
            </div>
            <div class="card-body text-center">
                <p class="lead">Barcode successfully matched!</p>
                <p>Ready to ship **{{ orderToFulfill.product_name }} (x{{ orderToFulfill.quantity }})** for Order #{{ orderToFulfill.order_id.slice(0, 8) }}.</p>
                <div class="d-flex justify-content-center gap-3 mt-4">
                    <button class="btn btn-secondary" @click="closeScanModal">Cancel</button>
                    <button class="btn btn-success" @click="updateStockOut">
                        <i class="fas fa-shipping-fast me-2"></i> Confirm Shipment
                    </button>
                </div>
            </div>
        </div>
    </div>
  </div>
</template>

<script>
/* ============================================================
   Admin Dashboard Vue Component
   Features:
   - User Profile Management
   - Stock In / Stock Out Handling
   - Barcode Generation & Scanning (Quagga2 & JsBarcode)
   - Dashboard Statistics & Recent Activities
   - Responsive UI and Sidebar Navigation
============================================================ */

import { supabase } from '../server/supabase';
import { nextTick } from 'vue';
import JsBarcode from 'jsbarcode';
import Quagga from '@ericblade/quagga2'; // Barcode scanning library
import { useRouter, onBeforeRouteLeave } from 'vue-router';

const router = useRouter();

export default {
  name: 'AdminDashboard',

  /* ============================================================
     ROUTE GUARD
     Warns user before leaving admin routes (e.g., via browser back button)
  ============================================================ */
  beforeRouteLeave(to, from, next) {
    const allowedExitRoutes = ['login', 'signup'];

    if (allowedExitRoutes.includes(to.name)) {
      next(); // Allowed route, no warning
      return;
    }

    const answer = window.confirm(
      'Are you sure you want to leave? This will end your session for security.'
    );

    if (answer) {
      supabase.auth.signOut().then(() => {
        next(false);
        window.location.href = '/login';
      });
    } else {
      next(false); // Cancel navigation
    }
  },

  /* ============================================================
     DATA PROPERTIES
  ============================================================ */
  data() {
    return {
      // --- UI State ---
      isCollapsed: false,
      isSidebarVisible: false,
      isMobile: false,
      adminMenuOpen: false,
      desktopAdminDropdownOpen: false,
      lastDetectedCode: null,
      autoDetect: true,
      showLogoutModal: false,
      showProfileModal: false,
      showBarcodeModal: false,
      showScanModal: false,

      // --- Loading / Scan State ---
      isStockOutLoading: false,
      isProductScanned: false,
      scanStatusMessage: 'Awaiting camera initialization...',

      // --- Dashboard / Views ---
      currentView: 'Dashboard',
      totalProductsCount: 0,
      stockInTodayCount: 0,
      stockOutTodayCount: 0,
      recentActivities: [],
      availableProducts: [],
      activeOrders: [],
      menuItems: [
        { icon: 'fas fa-tachometer-alt', label: 'Dashboard' },
        { icon: 'fas fa-boxes', label: 'Stock In' },
        { icon: 'fas fa-truck-loading', label: 'Stock Out' }
      ],

      // --- User Info ---
      currentUser: { username: 'Loading...', email: 'loading@app.com', id: null },
      editableUser: { username: 'Loading...' },

      // --- Stock In Form ---
      stockIn: {
        productName: '',
        size: '',
        quantity: 1,
        supplier: '',
        dateTime: new Date(new Date().getTime() - (new Date().getTimezoneOffset() * 60000))
          .toISOString()
          .slice(0, 16)
      },
      stockInHistory: [],
      itemToPrint: null,
      orderToFulfill: null
    };
  },

  /* ============================================================
     METHODS
  ============================================================ */
  methods: {

    /* ============================
       --- QUAGGA BARCODE SCANNER ---
       ============================ */
initQuagga() {
  if (typeof Quagga === 'undefined' || !Quagga.init) {
    this.scanStatusMessage = 'Error: Barcode scanner library not loaded.';
    return;
  }

  Quagga.init({
  inputStream: {
    name: "Live",
    type: "LiveStream",
    target: document.querySelector('#scanner-container'),
    constraints: {
      width: 640,
      height: 480,
      facingMode: "environment"
    }
  },
  decoder: { readers: ['code_128_reader'] },
  locator: {
    halfSample: false,
    patchSize: "medium"
  },
  locate: true
}, (err) => {
  if (err) {
    console.error("Quagga init failed:", err);
    return;
  }

  Quagga.start();
  this.scanStatusMessage = "Camera ready. Align barcode clearly in view.";

  Quagga.onDetected((result) => {
    const code = result.codeResult.code;
    console.log("Detected:", code);
    this.handleBarcodeScanned(code);
  });
});
},


stopQuagga() {
  try {
    if (Quagga && Quagga.stop) {
      Quagga.stop();
      Quagga.offDetected && Quagga.offDetected();
    }
  } catch (err) {
    console.warn('Error stopping Quagga:', err);
  }
},


    startScanForOrder(order) {
      this.orderToFulfill = order;
      this.isProductScanned = false;
      this.scanStatusMessage = 'Awaiting camera initialization...';
      this.showScanModal = true;

      nextTick(() => this.initQuagga());
    },


async handleBarcodeScanned(scannedCode) {
  if (!scannedCode) {
    this.scanStatusMessage = 'No barcode captured.';
    return;
  }

  // ✅ Normalize scanned value
  let raw = String(scannedCode).trim().replace(/\s+/g, '');
  const rawUpper = raw.toUpperCase();

  // ⚙️ If numeric-only (UPC/EAN), it's not one of your generated codes
  if (/^\d+$/.test(rawUpper)) {
    this.scanStatusMessage = `⚠️ Barcode [${rawUpper}] looks like a UPC/EAN, not your system code.`;
    alert(`⚠️ Invalid barcode format detected.\n\nDetected: ${rawUpper}\nYour system uses codes like ADVE-1234567890`);
    return;
  }

  // ✅ Extract base code (PREFIX-<timestamp>)
  let baseCode = rawUpper;
  const parts = rawUpper.split('-');
  if (parts.length >= 2) baseCode = parts.slice(0, 2).join('-');
  console.log('🔎 Scanned raw:', raw, '| Base:', baseCode);

  this.scanStatusMessage = `Scanning: ${raw} — trying base: ${baseCode}`;

  try {
    // ✅ Step 1: Lookup item in stock_in
    const { data: item, error } = await supabase
      .from('stock_in')
      .select('barcode_id, product_name, size, quantity')
      .ilike('barcode_id', `%${baseCode}%`)
      .maybeSingle();

    if (error) throw error;

    if (!item) {
      this.scanStatusMessage = '❌ Barcode not found in stock.';
      alert(`❌ Barcode not found in stock.\n\nScanned: ${raw}\nTried: ${baseCode}`);
      return;
    }

    // ✅ Step 2: Validate product fields
    if (!item.product_name || !item.size) {
      alert('⚠️ Product record incomplete for barcode: ' + item.barcode_id);
      return;
    }

    // ✅ Step 3: Handle quantity
    const currentQty = Number(item.quantity) || 0;
    if (currentQty <= 0) {
      alert(`⚠️ Out of stock!\n\nProduct: ${item.product_name}\nSize: ${item.size}`);
      return;
    }

    const newQty = Math.max(currentQty - 1, 0);

    const { error: updateError } = await supabase
      .from('stock_in')
      .update({ quantity: newQty })
      .eq('barcode_id', item.barcode_id);

    if (updateError) throw updateError;

    // ✅ Step 4: Update UI
    this.stockInHistory = this.stockInHistory.map(row =>
      row.barcode_id === item.barcode_id ? { ...row, quantity: newQty } : row
    );

    this.stopQuagga();
    this.isProductScanned = true;
    this.scanStatusMessage = `✅ ${item.product_name} updated. Remaining: ${newQty}`;
    alert(
      `✅ Scanned Successfully!\n\nProduct: ${item.product_name}\nSize: ${item.size}\nRemaining: ${newQty}`
    );
  } catch (err) {
    console.error('Scan error:', err);
    alert('⚠️ Failed to process scan: ' + (err.message || err));
  }
},


    closeScanModal() {
      this.stopQuagga();
      this.showScanModal = false;
      this.orderToFulfill = null;
      this.isProductScanned = false;
    },
      captureBarcode() {
        if (!this.lastDetectedCode) {
          alert('Barcode Note detected Please Try Again!');
          return;
        }
        this.handleBarcodeScanned(this.lastDetectedCode);
      },

    /* ============================
       --- USER PROFILE METHODS ---
       ============================ */
    async fetchCurrentUserProfile() {
      try {
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError) throw authError;

        if (user) {
          const { data: profileData, error: profileError } = await supabase
            .from('profiles')
            .select('username')
            .eq('id', user.id)
            .single();

          if (profileError) throw profileError;

          this.currentUser.id = user.id;
          this.currentUser.email = user.email || 'N/A';
          this.currentUser.username = profileData.username || 'Admin User';
          this.editableUser.username = this.currentUser.username;
        }
      } catch (error) {
        console.error('Error fetching user profile:', error.message);
        this.currentUser.username = 'Admin User';
        this.currentUser.email = 'admin@ryttire.com';
        this.editableUser.username = 'Admin User';
      }
    },

    async saveProfile() {
      try {
        const { error: updateProfileError } = await supabase
          .from('profiles')
          .update({ username: this.editableUser.username })
          .eq('id', this.currentUser.id);

        if (updateProfileError) throw updateProfileError;

        this.currentUser.username = this.editableUser.username;
        this.showProfileModal = false;
        alert('Profile updated successfully!');
      } catch (error) {
        console.error('Error saving profile:', error.message);
        alert('Failed to save profile changes. Error: ' + error.message);
      }
    },

    cancelProfileEdit() {
      this.editableUser.username = this.currentUser.username;
      this.showProfileModal = false;
    },

    /* ============================
       --- DASHBOARD & DATA FETCHING ---
       ============================ */
    async fetchInitialData() {
      this.fetchCurrentUserProfile();
      const { data: products, error: productsError } = await supabase.from('products').select('id, brand, size');
      if (productsError) console.error('Error fetching products:', productsError);
      else this.availableProducts = products;

      this.fetchDashboardData();
      this.fetchStockInHistory();
      this.fetchProcessedOrders();
    },

    async fetchDashboardData() {
      const { count: productsCount } = await supabase.from('products').select('*', { count: 'exact', head: true });
      this.totalProductsCount = productsCount;

      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      const { count: stockInCount } = await supabase
        .from('stock_in')
        .select('*', { count: 'exact', head: true })
        .gte('date_and_time', today.toISOString())
        .lt('date_and_time', tomorrow.toISOString());
      this.stockInTodayCount = stockInCount;

      const { data: activities } = await supabase.from('stock_in')
        .select('*')
        .order('date_and_time', { ascending: false })
        .limit(4);
      this.recentActivities = activities;
    },

    async fetchStockInHistory() {
      const { data, error } = await supabase.from('stock_in').select('*').order('date_and_time', { ascending: false });
      if (error) console.error('Error fetching stock in history:', error);
      else this.stockInHistory = data;
    },

    async fetchProcessedOrders() {
      this.isStockOutLoading = true;
      try {
        const { data, error } = await supabase
          .from('orders')
          .select('*')
          .eq('status', 'Order Processed')
          .order('created_at', { ascending: true });

        if (error) throw error;
        this.activeOrders = data;
      } catch (error) {
        console.error('Error fetching processed orders:', error.message);
        this.activeOrders = [];
      } finally {
        this.isStockOutLoading = false;
      }
    },

    /* ============================
       --- STOCK OUT METHODS ---
       ============================ */
  async updateStockOut() {
  if (!this.orderToFulfill || !this.isProductScanned) {
    alert('Cannot confirm shipment: Scan required or order data missing.');
    return;
  }

  const orderId = this.orderToFulfill.order_id;
  let productId = this.orderToFulfill.product_id;
  const quantityToShip = this.orderToFulfill.quantity;

  try {
    // find product by ID or name
    if (!productId) {
      const { data: found, error: findErr } = await supabase
        .from('products')
        .select('id, quantity')
        .ilike('brand', this.orderToFulfill.product_name)
        .limit(1)
        .single();

      if (findErr || !found) {
        throw new Error('Product not linked in order and cannot be found by name.');
      }
      productId = found.id;
    }

    const { data: currentProduct, error: prodErr } = await supabase
      .from('products')
      .select('quantity')
      .eq('id', productId)
      .single();

    if (prodErr || !currentProduct) throw new Error('Could not retrieve product stock.');

    const newQuantity = currentProduct.quantity - quantityToShip;
    if (newQuantity < 0) {
      alert('Error: Not enough stock to fulfill this order.');
      return;
    }

    let newStatus = '';
    if (newQuantity >= 12) newStatus = 'In Stock';
    else if (newQuantity >= 1) newStatus = 'Low Stock';
    else newStatus = 'Out of Stock';

    const { error: updateProductError } = await supabase
      .from('products')
      .update({ quantity: newQuantity, status: newStatus })
      .eq('id', productId);
    if (updateProductError) throw updateProductError;

    const { error: updateOrderError } = await supabase
      .from('orders')
      .update({ status: 'Shipped', date_shipped: new Date().toISOString() })
      .eq('order_id', orderId);
    if (updateOrderError) throw updateOrderError;

    const { error: logError } = await supabase.from('stock_out').insert({
      order_id: orderId,
      product_id: productId,
      product_name: this.orderToFulfill.product_name,
      quantity: quantityToShip,
      date_and_time: new Date().toISOString()
    });
    if (logError) console.warn('Failed to log stock-out:', logError);

    alert(`✅ Order #${orderId.slice(0    , 8)} shipped — stock updated.`);
    this.isProductScanned = false;
    this.orderToFulfill = null;
    this.fetchProcessedOrders();
    this.fetchDashboardData();

  } catch (error) {
    console.error('Stock Out/Shipping Error:', error);
    alert('⚠️ Failed to confirm shipment: ' + (error.message || error));
  }
},


    /* ============================
       --- STOCK IN METHODS ---
       ============================ */
    async addStockIn() {
      if (!this.stockIn.productName) {
        alert('Please select a product from the dropdown.');
        return;
      }

      const product = this.availableProducts.find(p => p.brand === this.stockIn.productName);
      if (!product) { alert('Could not find selected product.'); return; }

      const { data: currentProduct, error: findError } = await supabase.from('products')
        .select('quantity').eq('id', product.id).single();
      if (findError) { alert('Could not retrieve current stock.'); return; }

      const newQuantity = currentProduct.quantity + this.stockIn.quantity;
      let newStatus = '';
      if (newQuantity >= 12) newStatus = 'In Stock';
      else if (newQuantity >= 1) newStatus = 'Low Stock';
      else newStatus = 'Out of Stock';

      const { error: updateError } = await supabase.from('products')
        .update({ size: this.stockIn.size, quantity: newQuantity, status: newStatus })
        .eq('id', product.id);
      if (updateError) { alert('Error updating product: ' + updateError.message); return; }

      const barcodeBase = `${this.stockIn.productName.slice(0, 4).toUpperCase()}-${Date.now()}`;
            const { data: insertedStock, error: logError } = await supabase.from('stock_in').insert({
              barcode_id: barcodeBase,
              product_name: this.stockIn.productName,
              size: this.stockIn.size,
              quantity: this.stockIn.quantity,
              supplier: this.stockIn.supplier,
              date_and_time: this.stockIn.dateTime
          }).select().single();

                      if (logError) {
                  alert('Warning: Failed to log transaction. ' + logError.message);
                } else {
                  console.log('✅ Stock-In Logged:', insertedStock);
                  this.scanStatusMessage = `Stock In added for ${this.stockIn.productName}`;
                }



      this.itemToPrint = { barcodeBase, productName: this.stockIn.productName, size: this.stockIn.size, quantity: this.stockIn.quantity };
      this.openBarcodePrintModal();

      // Reset stockIn form
      this.stockIn = {
        productName: '', size: '', quantity: 1, supplier: '',
        dateTime: new Date(new Date().getTime() - (new Date().getTimezoneOffset() * 60000)).toISOString().slice(0, 16)
      };

      this.fetchInitialData();
    },

    printLabel() {
      const { productName, size, quantity, barcodeBase } = this.itemToPrint;
      if (!quantity || quantity < 1) return;

      const printWindow = window.open('', '_blank');
      printWindow.document.write('<html><head><title>Print Labels</title>');
      printWindow.document.write('<style>@media print{@page{size:auto;margin:0.1in}body{margin:0}.label{page-break-after:always;text-align:center;font-family:sans-serif}.product-name{font-size:1.1em;font-weight:700;margin-bottom:5px}svg{margin:0 auto}.size,.barcode-id{margin-top:5px}}</style>');
      printWindow.document.write('</head><body>');

      for (let i = 1; i <= quantity; i++) {
        const uniqueBarcodeId = `${barcodeBase}-${String(i).padStart(3, '0')}`;
        const svgId = `barcode-${i}`;
        printWindow.document.body.innerHTML += `<div class="label"><p class="product-name">${productName}</p><svg id="${svgId}"></svg><p class="size">SIZE: ${size}</p><p class="barcode-id">ID: ${uniqueBarcodeId}</p></div>`;
      }

      printWindow.document.write('</body></html>');
      printWindow.document.close();

      printWindow.onload = function () {
        for (let i = 1; i <= quantity; i++) {
          const uniqueBarcodeId = `${barcodeBase}-${String(i).padStart(3, '0')}`;
          const svgId = `barcode-${i}`;
          const svgElement = printWindow.document.getElementById(svgId);
          if (svgElement) {
            JsBarcode(svgElement, uniqueBarcodeId, { 
              format: "CODE128", 
              displayValue: true, 
              textMargin: 2,
              fontSize: 12,
              height: 60,
              margin: 8,
              width: 2.5, 
              lineColor: '#000'
            });

          }
        }
        printWindow.focus();
        printWindow.print();
      };

      this.closeBarcodePrintModal();
    },

    openBarcodePrintModal() { this.showBarcodeModal = true; },
    closeBarcodePrintModal() { this.showBarcodeModal = false; this.itemToPrint = null; },

    /* ============================
       --- UI & NAVIGATION METHODS ---
       ============================ */
    selectView(label) {
      this.currentView = label;
      if (label === 'Stock Out') this.fetchProcessedOrders();
      if (this.isMobile) this.closeSidebar();
    },

      checkMobile() {
        const isNowMobile = window.innerWidth < 992;

        if (isNowMobile && !this.isMobile) {
          this.isSidebarVisible = false;
        }

        this.isMobile = isNowMobile;
      },

      toggleSidebar() {
        this.isSidebarVisible = !this.isSidebarVisible;
      },


    closeSidebar() { this.isSidebarVisible = false; this.adminMenuOpen = false; },
    toggleAdminMenu() { this.adminMenuOpen = !this.adminMenuOpen; },
    toggleDesktopAdminMenu() { this.desktopAdminDropdownOpen = !this.desktopAdminDropdownOpen; },

    logout() { this.showLogoutModal = true; },

    async confirmLogout() {
      this.showLogoutModal = false;
      try {
        const { error } = await supabase.auth.signOut();
        if (error) { alert(`Logout failed: ${error.message}`); return; }

        await this.$router.push('/');
        window.location.reload();
      } catch (e) {
        console.error('Unexpected logout error:', e);
        alert('An unexpected error occurred. Check console.');
      }
    },

    cancelLogout() { this.showLogoutModal = false; }
  },

  /* ============================================================
     LIFECYCLE HOOKS
  ============================================================ */
  mounted() {
    this.checkMobile();
    window.addEventListener('resize', this.checkMobile);
    this.fetchInitialData();
  },

  beforeUnmount() {
    window.removeEventListener('resize', this.checkMobile);
    this.stopQuagga();
  }
};
</script>

<style scoped>
@import url('https://cdnjs.cloudflare.com/ajax/libs/bootstrap/5.3.0/css/bootstrap.min.css');
@import url('https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css');

/* UPDATED Styles for Scanner (Crucial for video feed) */
#scanner-container {
  position: relative;
  width: 100%;
  height: 320px;
  overflow: hidden;
  background-color: #000; /* Add a black background */
}
#scanner-video {
  /* Let the video determine its own size to maintain aspect ratio */
  max-width: 100%;
  max-height: 100%;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%); /* Center the video */
}
#scanner-container::after {
  content: '';
  position: absolute;
  top: 10%;
  left: 10%;
  right: 10%;
  bottom: 10%;
  box-shadow: 0 0 0 9999px rgba(0, 0, 0, 0.5);
  border: 2px solid white;
  border-radius: 8px;
}

/* Custom Modal Styles (for Logout and Profile) */
.custom-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.6);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999; 
  transition: opacity 0.3s ease;
}

.custom-modal-card {
  max-width: 450px;
  width: 90%;
  border-radius: 1rem;
  overflow: hidden;
  animation: scaleIn 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

@keyframes scaleIn {
  from {
    transform: scale(0.7);
    opacity: 0;
  }
  to {
    transform: scale(1);
    opacity: 1;
  }
}

.custom-modal-card .card-header {
  border-bottom: none;
  font-weight: bold;
  padding: 1.5rem;
}

.custom-modal-card .card-body {
  padding: 2rem;
}

/* Existing styles for the rest of the dashboard components */
/* --- SIDEBAR STYLES --- */
.sidebar {
  position: fixed;
  top: 0;
  left: 0;
  width: 250px;
  height: 100%;
  background-color: #0d6efd; 
  color: white;
  overflow-y: auto;
  transform: translateX(-100%);
  transition: transform 0.3s ease-in-out;
  z-index: 1050;
}

.sidebar.sidebar-visible {
  transform: translateX(0);
}

.sidebar.collapsed {
  width: 70px;
}

.sidebar.collapsed .nav-link {
  justify-content: center;
}

.sidebar.collapsed .nav-link span {
  display: none;
}

/* --- SIDEBAR OVERLAY --- */
.sidebar-overlay {
  position: fixed;
  top: 0;
  left: 0;
  z-index: 1040;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(2px);
  transition: opacity 0.3s ease;
}

/* Sidebar on mobile takes full height */
@media (max-width: 991.98px) {
  .sidebar {
    width: 250px;
  }
}
.sidebar-overlay {
  opacity: 0;
  animation: fadeIn 0.3s forwards;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}


.nav-item.active > .nav-link {
  background-color: #0d6efd;
  font-weight: bold;
}

@media (max-width: 991.98px) {
  .sidebar {
    position: fixed;
    left: 0;
    top: 0;
    transform: translateX(-100%);
    z-index: 1050;
    height: 100%;
  }

  .sidebar.sidebar-visible {
    transform: translateX(0);
  }

  .sidebar.collapsed {
    width: 250px;
  }

  .sidebar.collapsed .nav-link span {
    display: inline;
  }

  .sidebar.collapsed .nav-link {
    justify-content: flex-start;
  }
}

ul.ps-4 li a {
  text-decoration: none;
  font-size: 0.95rem;
}

/* Updated dropdown z-index for better layering */
.nav-item.dropdown {
    position: relative;
}
.dropdown-menu {
  z-index: 2000;
  display: block;
  position: absolute;
  top: 100%;
  left: auto;
  right: 0;
  min-width: 10rem;
}

.card {
  border-radius: 0.75rem;
  overflow: hidden;
}

.card-header {
  border-bottom: 1px solid rgba(0,0,0,.125);
  padding: 1rem 1.5rem;
  font-size: 1.1rem;
}

.btn-success, .btn-danger {
  padding: 0.75rem 1.5rem;
  font-weight: bold;
}

.form-control {
  border-radius: 0.5rem;
}

.table thead th {
  background-color: #f8f9fa;
  color: #495057;
  border-bottom: 2px solid #dee2e6;
}

.table-hover tbody tr:hover {
  background-color: #f2f2f2;
}

.list-group-item {
  border: none;
  padding-left: 0;
  padding-right: 0;
}

/* FIX for Barcode Overlapping */
.barcode-label-area svg {
  /* Ensure SVG takes up vertical space */
  height: 60px; /* Give it a definite height */
  width: 100%; /* Ensure it spans the container */
  display: block; 
  margin: 0 auto;
}

.barcode-label-area {
  /* Increase padding/margin to separate text blocks */
  padding: 10px 5px !important;
}

.barcode-label-area p {
    /* Set explicit margins for separation */
    margin: 5px 0 !important; 
    line-height: 1.2;
}

.navbar .nav-link i {
  font-size: 1.4rem;
  margin-right: 8px;
  vertical-align: middle;
}

.sidebar .nav-link i {
  font-size: 1.3rem;
  width: 26px;
  text-align: center;
}

.card-body i.fa-3x {
  font-size: 3.5rem !important;
}

.custom-modal-card .card-header i {
  font-size: 1.6rem;
  margin-right: 10px;
  vertical-align: middle;
}

.btn i {
  font-size: 1.2rem;
  vertical-align: middle;
}

i.fas, i.far {
  color: inherit;
  line-height: 1;
}

i.fas {
  font-weight: 600;
}

/* Navbar layout fix for mobile */
@media (max-width: 991.98px) {
  .navbar .container-fluid {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .navbar .btn {
    order: 1;
  }

  .navbar .navbar-brand {
    order: 2;
    margin-left: 0;
  }

  .navbar .collapse {
    order: 3;
  }

  .navbar-nav {
    flex-direction: row;
    gap: 10px;
  }

  .navbar .nav-link {
    padding: 0.5rem;
  }

  /* Hide Administrator text on small screens */
@media (max-width: 767.98px) {
  .navbar .navbar-brand {
    display: none !important;
  }
}

/* Hide "Administrator" on small screens */
@media (max-width: 767.98px) {
  .navbar-brand {
    display: none !important;
  }
}

/* Align icons perfectly and balance spacing */
.navbar .d-flex.align-items-center.gap-3 {
  gap: 1rem;
}

.navbar .nav-link i {
  font-size: 1.4rem;
  vertical-align: middle;
}

.navbar .btn i {
  font-size: 1.6rem;
  vertical-align: middle;
}

/* Make Stock In form responsive and tidy */
@media (min-width: 768px) {
  form .row {
    display: flex;
    flex-wrap: wrap;
    gap: 1rem;
  }
}

form .form-label {
  font-weight: 500;
}

form .btn-success {
  font-weight: bold;
  font-size: 1rem;
  padding: 0.75rem 2rem;
}


}



</style>