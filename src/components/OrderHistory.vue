<template>
  <div class="order-history-page">
    <div class="container py-5">
      <h2 class="fw-bold mb-4 section-title text-center">Order History</h2>

      <div class="card shadow-sm">
        <div class="card-header bg-white p-3 d-flex justify-content-end">
          <div class="d-flex align-items-center">
            <label for="yearFilter" class="form-label me-2 mb-0">Filter:</label>
            <select class="form-select form-select-sm" id="yearFilter" style="width: 120px;">
              <option selected>All Time</option>
              <option value="2025">2025</option>
              <option value="2024">2024</option>
            </select>
          </div>
        </div>
        <div class="card-body p-0">
          <div class="table-responsive">
            <table class="table table-hover mb-0">
              <thead>
                <tr>
                  <th scope="col">Order ID</th>
                  <th scope="col">Date Completed</th>
                  <th scope="col">Items</th>
                  <th scope="col">Total</th>
                  <th scope="col">Action</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="order in pastOrders" :key="order.id">
                  <td>{{ order.id }}</td>
                  <td>{{ order.date }}</td>
                  <td>{{ order.items }}</td>
                  <td class="fw-bold">{{ order.total }}</td>
                  <td><a href="#" class="btn btn-sm btn-outline-primary rounded-pill">View Invoice</a></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
        <div class="card-footer bg-white d-flex justify-content-center">
          <nav aria-label="Order history pagination">
            <ul class="pagination pagination-sm mb-0">
              <li class="page-item disabled"><a class="page-link" href="#">Previous</a></li>
              <li class="page-item active"><a class="page-link" href="#">1</a></li>
              <li class="page-item"><a class="page-link" href="#">2</a></li>
              <li class="page-item"><a class="page-link" href="#">3</a></li>
              <li class="page-item"><a class="page-link" href="#">Next</a></li>
            </ul>
          </nav>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';

// Sample data for demonstration
const pastOrders = ref([
  { id: '#RYT-10521', date: '04 Oct 2025', items: 2, total: '₱7,800.00' },
  { id: '#RYT-10498', date: '28 Sep 2025', items: 1, total: '₱1,250.00' },
  { id: '#RYT-10455', date: '15 Sep 2025', items: 4, total: '₱15,200.00' },
  { id: '#RYT-10399', date: '22 Aug 2025', items: 1, total: '₱3,500.00' },
]);
</script>

<style scoped>@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@500;700&family=Roboto:wght@400&display=swap');

/* 🌈 Aurora Gradient Background Style (Matches Other Pages) */
.order-history-page {
  font-family: 'Roboto', sans-serif;
  min-height: 100vh;
  position: relative;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

/* Animated Aurora Effect */
.order-history-page::before {
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
.container {
  position: relative;
  z-index: 2;
}

/* --- Card Styling --- */
.card {
  border: none;
  border-radius: 1rem;
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(15px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
}

.card-header, .card-footer {
  background-color: rgba(255, 255, 255, 0.9) !important;
  border-color: rgba(255, 255, 255, 0.4);
}

/* --- Table Styling --- */
.table thead th {
  background-color: rgba(255, 255, 255, 0.9);
  font-weight: 600;
  font-family: 'Poppins', sans-serif;
  border-bottom: 2px solid rgba(0, 0, 0, 0.05);
}

.table tbody tr:hover {
  background-color: rgba(13, 110, 253, 0.05);
  transition: background 0.3s ease;
}

/* --- Pagination Styling --- */
.page-link {
  border-radius: 50rem !important;
  font-family: 'Poppins', sans-serif;
}

.page-item.active .page-link {
  background-color: #0d6efd;
  border-color: #0d6efd;
  color: #fff;
}

.page-link:hover {
  background-color: rgba(13, 110, 253, 0.1);
}

/* --- Title --- */
.section-title {
  font-family: 'Poppins', sans-serif;
  color: #fff;
  text-shadow: 0 2px 6px rgba(0, 0, 0, 0.3);
}

</style>