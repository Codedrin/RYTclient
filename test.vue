<script>
/* ============================================================
   Admin Dashboard Vue Component
   Features:
   - User Profile Management
   - Stock In / Stock Out Handling
   - Barcode Generation & Scanning (Html5Qrcode & JsBarcode)
   - Dashboard Statistics & Recent Activities
   - Responsive UI and Sidebar Navigation
============================================================ */

import { supabase } from '../server/supabase';
import { nextTick } from 'vue';
import JsBarcode from 'jsbarcode';
import { Html5Qrcode } from "html5-qrcode";
import { useRouter } from 'vue-router';
const router = useRouter();

export default {
  name: 'AdminDashboard',

  /* ============================================================
     ROUTE GUARD: Confirm before leaving admin area
  ============================================================ */
  beforeRouteLeave(to, from, next) {
    const allowedExitRoutes = ['login', 'signup'];

    if (allowedExitRoutes.includes(to.name)) {
      next();
      return;
    }

    const confirmExit = window.confirm(
      'Are you sure you want to leave? This will end your session for security.'
    );

    if (confirmExit) {
      supabase.auth.signOut().then(() => {
        next(false);
        window.location.href = '/login';
      });
    } else next(false);
  },

  /* ============================================================
     DATA
  ============================================================ */
  data() {
    return {
      // UI State
      isCollapsed: false,
      isSidebarVisible: false,
      isMobile: false,
      adminMenuOpen: false,
      desktopAdminDropdownOpen: false,
      showLogoutModal: false,
      showProfileModal: false,
      showBarcodeModal: false,
      showScanModal: false,

      // Scan State
      isStockOutLoading: false,
      isProductScanned: false,
      scanStatusMessage: 'Awaiting camera initialization...',

      // Dashboard
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

      // User Info
      currentUser: { username: 'Loading...', email: 'loading@app.com', id: null },
      editableUser: { username: 'Loading...' },

      // Stock In Form
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
    /* ==========================
       BARCODE SCANNER SECTION
    ========================== */
    async startScanForOrder(order) {
      this.orderToFulfill = order;
      this.isProductScanned = false;
      this.scanStatusMessage = "📷 Initializing camera...";
      this.showScanModal = true;

      await nextTick(() => this.initScanner());
    },

    async initScanner() {
      const containerId = "scanner-container";
      const videoContainer = document.getElementById(containerId);
      if (!videoContainer) return;

      this.scanStatusMessage = "📷 Starting camera...";

      try {
        // Stop any running scanner
        if (this.html5QrcodeScanner) {
          await this.html5QrcodeScanner.stop();
          this.html5QrcodeScanner.clear();
        }

        await new Promise((r) => setTimeout(r, 500)); // let modal render

        this.html5QrcodeScanner = new Html5Qrcode(containerId, { verbose: false });
        const cameras = await Html5Qrcode.getCameras();
        if (!cameras.length) throw new Error("No camera found");

        const cameraId =
          cameras.find(cam => cam.label.toLowerCase().includes("back"))?.id ||
          cameras[0].id;

        await this.html5QrcodeScanner.start(
          cameraId,
          {
            fps: 10,
            aspectRatio: 1.7,
            facingMode: "environment",
            // ✅ removed qrbox (no green frame)
          },
          (decodedText) => {
            console.log("✅ Detected:", decodedText);
            this.handleBarcodeScanned(decodedText);
            this.html5QrcodeScanner.stop();
          },
          () => {} // ignore errors
        );

        this.scanStatusMessage = "📸 Ready — point your camera at the barcode.";

      } catch (error) {
        console.error("Scanner initialization failed:", error);
        this.scanStatusMessage = "⚠️ Camera not ready. Check browser permissions.";
      }
    },

    async stopScanner() {
      try {
        if (this.html5QrcodeScanner) {
          await this.html5QrcodeScanner.stop();
          this.html5QrcodeScanner.clear();
          this.html5QrcodeScanner = null;
        }
      } catch (err) {
        console.warn("Error stopping scanner:", err);
      }
    },

    handleBarcodeScanned(scannedCode) {
      if (!this.orderToFulfill) return;

      console.log("📦 Scanned code:", scannedCode);

      const productPrefix = this.orderToFulfill.product_name.slice(0, 4).toUpperCase();
      if (scannedCode.includes(productPrefix)) {
        this.isProductScanned = true;
        this.scanStatusMessage = `✅ Matched ${this.orderToFulfill.product_name}`;
        this.showScanModal = false;
        this.updateStockOut(); // auto deduct
      } else {
        this.scanStatusMessage = "❌ Mismatch. Please scan the correct label.";
      }
    },

    closeScanModal() {
      this.stopScanner();
      this.showScanModal = false;
      this.orderToFulfill = null;
      this.isProductScanned = false;
    },

    /* ==========================
       USER PROFILE METHODS
    ========================== */
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

          this.currentUser = {
            id: user.id,
            email: user.email || 'N/A',
            username: profileData.username || 'Admin User'
          };
          this.editableUser.username = this.currentUser.username;
        }
      } catch (error) {
        console.error('Error fetching user profile:', error.message);
        this.currentUser.username = 'Admin User';
        this.currentUser.email = 'admin@ryttire.com';
      }
    },

    async saveProfile() {
      try {
        const { error } = await supabase
          .from('profiles')
          .update({ username: this.editableUser.username })
          .eq('id', this.currentUser.id);
        if (error) throw error;

        this.currentUser.username = this.editableUser.username;
        this.showProfileModal = false;
        alert('Profile updated successfully!');
      } catch (error) {
        console.error('Error saving profile:', error.message);
        alert('Failed to save profile: ' + error.message);
      }
    },

    cancelProfileEdit() {
      this.editableUser.username = this.currentUser.username;
      this.showProfileModal = false;
    },

    /* ==========================
       DASHBOARD & DATA FETCH
    ========================== */
    async fetchInitialData() {
      this.fetchCurrentUserProfile();
      const { data: products, error } = await supabase.from('products').select('id, brand, size');
      if (!error) this.availableProducts = products;

      this.fetchDashboardData();
      this.fetchStockInHistory();
      this.fetchProcessedOrders();
    },

    async fetchDashboardData() {
      const { count: total } = await supabase.from('products').select('*', { count: 'exact', head: true });
      this.totalProductsCount = total;

      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(today.getDate() + 1);

      const { count: stockInToday } = await supabase
        .from('stock_in')
        .select('*', { count: 'exact', head: true })
        .gte('date_and_time', today.toISOString())
        .lt('date_and_time', tomorrow.toISOString());

      this.stockInTodayCount = stockInToday;

      const { data: activities } = await supabase
        .from('stock_in')
        .select('*')
        .order('date_and_time', { ascending: false })
        .limit(4);

      this.recentActivities = activities;
    },

    async fetchStockInHistory() {
      const { data, error } = await supabase.from('stock_in').select('*').order('date_and_time', { ascending: false });
      if (!error) this.stockInHistory = data;
    },

    async fetchProcessedOrders() {
      this.isStockOutLoading = true;
      try {
        const { data, error } = await supabase
          .from('orders')
          .select('*')
          .eq('status', 'Order Processed')
          .order('created_at', { ascending: true });
        if (!error) this.activeOrders = data;
      } finally {
        this.isStockOutLoading = false;
      }
    },

    /* ==========================
       STOCK OUT
    ========================== */
    async updateStockOut() {
      if (!this.orderToFulfill || !this.isProductScanned) {
        alert('Scan required before confirming shipment.');
        return;
      }

      const orderId = this.orderToFulfill.order_id;
      const productId = this.orderToFulfill.product_id;
      const quantity = this.orderToFulfill.quantity;

      try {
        // Get current quantity
        const { data: current, error: findError } = await supabase
          .from('products')
          .select('quantity')
          .eq('id', productId)
          .single();
        if (findError) throw findError;

        const newQty = current.quantity - quantity;
        if (newQty < 0) return alert('Not enough stock.');

        const status =
          newQty >= 12 ? 'In Stock' :
          newQty >= 1 ? 'Low Stock' : 'Out of Stock';

        await supabase.from('products').update({ quantity: newQty, status }).eq('id', productId);
        await supabase.from('orders').update({ status: 'Shipped', date_shipped: new Date().toISOString() }).eq('order_id', orderId);

        await supabase.from('stock_out').insert({
          order_id: orderId,
          product_id: productId,
          product_name: this.orderToFulfill.product_name,
          quantity,
          date_and_time: new Date().toISOString()
        });

        alert(`✅ Order #${orderId.slice(0, 8)} shipped successfully!`);
        this.closeScanModal();
        this.fetchProcessedOrders();
        this.fetchDashboardData();

      } catch (e) {
        alert('⚠️ Shipment failed: ' + e.message);
      }
    },

    /* ==========================
       STOCK IN
    ========================== */
    async addStockIn() {
      if (!this.stockIn.productName) return alert('Select a product first.');

      const product = this.availableProducts.find(p => p.brand === this.stockIn.productName);
      if (!product) return alert('Product not found.');

      const { data: current, error } = await supabase
        .from('products')
        .select('quantity')
        .eq('id', product.id)
        .single();
      if (error) return alert('Could not fetch product stock.');

      const newQty = current.quantity + this.stockIn.quantity;
      const status =
        newQty >= 12 ? 'In Stock' :
        newQty >= 1 ? 'Low Stock' : 'Out of Stock';

      await supabase.from('products')
        .update({ size: this.stockIn.size, quantity: newQty, status })
        .eq('id', product.id);

      const barcodeBase = `${this.stockIn.productName.slice(0, 4).toUpperCase()}-${Date.now()}`;
      await supabase.from('stock_in').insert({
        barcode_id: barcodeBase,
        product_name: this.stockIn.productName,
        size: this.stockIn.size,
        quantity: this.stockIn.quantity,
        supplier: this.stockIn.supplier,
        date_and_time: this.stockIn.dateTime
      });

      this.itemToPrint = {
        barcodeBase,
        productName: this.stockIn.productName,
        size: this.stockIn.size,
        quantity: this.stockIn.quantity
      };
      this.openBarcodePrintModal();

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
      printWindow.document.write(`
        <html>
        <head><title>Print Labels</title>
        <style>
          @media print { @page { margin: 0.1in; } }
          body { margin: 0; font-family: sans-serif; text-align: center; }
          .label { page-break-after: always; padding: 5px; }
          .product-name { font-weight: 700; font-size: 1.1em; }
        </style></head><body>
      `);

      for (let i = 1; i <= quantity; i++) {
        const uniqueId = `${barcodeBase}-${String(i).padStart(3, '0')}`;
        printWindow.document.write(`
          <div class="label">
            <p class="product-name">${productName}</p>
            <svg id="barcode-${i}"></svg>
            <p>SIZE: ${size}</p>
            <p>ID: ${uniqueId}</p>
          </div>
        `);
      }

      printWindow.document.write('</body></html>');
      printWindow.document.close();

      printWindow.onload = function () {
        for (let i = 1; i <= quantity; i++) {
          const uniqueId = `${barcodeBase}-${String(i).padStart(3, '0')}`;
          JsBarcode(`#barcode-${i}`, uniqueId, { format: "CODE128", displayValue: false, height: 40, width: 2 });
        }
        printWindow.print();
      };
      this.closeBarcodePrintModal();
    },

    openBarcodePrintModal() { this.showBarcodeModal = true; },
    closeBarcodePrintModal() { this.showBarcodeModal = false; this.itemToPrint = null; },

    /* ==========================
       UI / NAVIGATION
    ========================== */
    selectView(label) {
      this.currentView = label;
      if (label === 'Stock Out') this.fetchProcessedOrders();
      if (this.isMobile) this.closeSidebar();
    },

    checkMobile() { this.isMobile = window.innerWidth < 992; },
    toggleSidebar() { this.isMobile ? (this.isSidebarVisible = !this.isSidebarVisible) : (this.isCollapsed = !this.isCollapsed); },
    closeSidebar() { this.isSidebarVisible = false; this.adminMenuOpen = false; },
    toggleAdminMenu() { this.adminMenuOpen = !this.adminMenuOpen; },
    toggleDesktopAdminMenu() { this.desktopAdminDropdownOpen = !this.desktopAdminDropdownOpen; },

    logout() { this.showLogoutModal = true; },
    async confirmLogout() {
      this.showLogoutModal = false;
      const { error } = await supabase.auth.signOut();
      if (!error) {
        await this.$router.push('/');
        window.location.reload();
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
    this.stopScanner();
  }
};
</script>
