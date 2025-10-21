<template>
  <div id="admin-dashboard" class="d-flex flex-column min-vh-100 bg-light">
    <nav class="navbar navbar-expand-lg navbar-dark bg-primary shadow-sm">
      <div class="container-fluid">
        <button class="btn btn-primary" @click="toggleSidebar">
          <i class="fas fa-bars"></i>
        </button>
        <a class="navbar-brand fw-bold ms-3" href="#">Administrator</a>
        <div v-if="!isMobile" class="collapse navbar-collapse justify-content-end">
          <ul class="navbar-nav">
            <li class="nav-item">
              <a class="nav-link" href="#"><i class="fas fa-bell me-1"></i> Notifications</a>
            </li>
            <li class="nav-item dropdown">
              <a
                class="nav-link dropdown-toggle"
                href="#"
                ref="adminDropdownToggle"
                @click.prevent="toggleDesktopAdminMenu"
              >
                <i class="fas fa-user-circle me-1"></i> {{ currentUser.username }}
              </a>
              <ul class="dropdown-menu dropdown-menu-end" v-show="desktopAdminDropdownOpen">
                <li><a class="dropdown-item" href="#" @click.prevent="showProfileModal = true">Profile</a></li>
                <li><hr class="dropdown-divider" /></li>
                <li><a class="dropdown-item" href="#" @click.prevent="logout">Logout</a></li>
              </ul>
            </li>
          </ul>
        </div>
      </div>
    </nav>
    <div class="d-flex flex-grow-1">
      <div
        :class="[
          'sidebar bg-dark text-white shadow',
          { collapsed: isCollapsed && !isMobile },
          { 'sidebar-visible': isSidebarVisible && isMobile }
        ]"
      >
        <nav class="h-100 p-3">
          <h5 class="text-center mb-4 text-uppercase" v-if="!isCollapsed || isMobile">RYT-Tyre</h5>
          <ul class="nav flex-column">
            <li v-if="isMobile" class="nav-item mt-2">
              <div class="nav-link text-white py-2 px-3 d-flex align-items-center justify-content-between" @click="toggleAdminMenu" style="cursor: pointer;">
                <div>
                  <i class="fas fa-user-circle me-2"></i>
                  <span>{{ currentUser.username }}</span>
                </div>
                <i :class="adminMenuOpen ? 'fas fa-chevron-up' : 'fas fa-chevron-down'"></i>
              </div>
              <ul v-if="adminMenuOpen" class="ps-4 mt-2">
                <li><a class="text-white d-block py-1" href="#" @click.prevent="showProfileModal = true; closeSidebar();">Profile</a></li>
                <li><a class="text-white d-block py-1" href="#" @click.prevent="logout">Logout</a></li>
              </ul>
            </li>
            <li v-if="isMobile" class="nav-item mt-2">
              <a class="nav-link text-white py-2 px-3 d-flex align-items-center" href="#">
                <i class="fas fa-bell me-2"></i>
                <span>Notifications</span>
              </a>
            </li>
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
        v-if="isMobile && isSidebarVisible"
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
              <form @submit.prevent="addStockIn">
                <div class="mb-3">
                  <label for="productNameIn" class="form-label">Product (Brand)</label>
                  <select class="form-select" id="productNameIn" v-model="stockIn.productName" required>
                    <option disabled value="">Please select a product</option>
                    <option v-for="product in availableProducts" :key="product.id" :value="product.brand">
                      {{ product.brand }} (Current Size: {{ product.size }})
                    </option>
                  </select>
                </div>
                <div class="mb-3">
                  <label for="sizeIn" class="form-label">New Size</label>
                  <input type="text" class="form-control" id="sizeIn" v-model="stockIn.size" required>
                </div>
                <div class="mb-3">
                  <label for="quantityIn" class="form-label">Quantity to Add</label>
                  <input type="number" class="form-control" id="quantityIn" v-model="stockIn.quantity" min="1" required>
                </div>
                <div class="mb-3">
                  <label for="supplierIn" class="form-label">Supplier</label>
                  <input type="text" class="form-control" id="supplierIn" v-model="stockIn.supplier">
                </div>
                <div class="mb-3">
                  <label for="dateTimeIn" class="form-label">Date and Time</label>
                  <input type="datetime-local" class="form-control" id="dateTimeIn" v-model="stockIn.dateTime" required>
                </div>
                <button type="submit" class="btn btn-success rounded-pill px-4">Record Stock In</button>
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
                    {{ order.shipping_addr ? order.shipping_addr.substring(0, 40) : 'Address Missing' }}
                    <span v-if="order.shipping_addr && order.shipping_addr.length > 40">...</span>
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
          <form @submit.prevent="saveProfile">
            <div class="mb-3">
              <label for="profileUsername" class="form-label fw-bold">Username</label>
              <input type="text" class="form-control" id="profileUsername" v-model="editableUser.username" required>
            </div>
            <div class="mb-4">
              <label for="profileEmail" class="form-label fw-bold">Email</label>
              <input type="email" class="form-control" id="profileEmail" :value="currentUser.email" disabled>
              <div class="form-text">Email cannot be changed here.</div>
            </div>
            <div class="d-flex justify-content-end gap-3">
              <button type="button" class="btn btn-secondary" @click="cancelProfileEdit">Cancel</button>
              <button type="submit" class="btn btn-primary">Save Changes</button>
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
export default {
  name: "Sidebar",
  props: {
    isCollapsed: Boolean,
    isSidebarVisible: Boolean,
    isMobile: Boolean,
    adminMenuOpen: Boolean,
    currentView: String,
    menuItems: Array,
    currentUser: Object,
  },
};
</script>