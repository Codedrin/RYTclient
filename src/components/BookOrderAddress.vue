<template>
  <div class="address-book-page">
    <div class="container py-5">
      <div class="d-flex justify-content-between align-items-center mb-5">
        <h2 class="fw-bold section-title text-center mb-0 text-light">Book Order Address</h2>
        <button class="btn btn-primary rounded-pill px-4" @click="openAddModal">
          <i class="fas fa-plus me-2"></i>Add New Address
        </button>
      </div>

      <div v-if="isLoading" class="text-center">
        <div class="spinner-border text-primary" role="status">
          <span class="visually-hidden">Loading...</span>
        </div>
      </div>

      <div v-else class="row">
        <div class="col-md-6 mb-4" v-for="address in addresses" :key="address.id">
          <div class="card shadow-sm h-100 address-card" :class="{ 'default-address': address.is_default }">
            <div class="card-body p-4">
              <div class="d-flex justify-content-between align-items-start">
                <div>
                  <h5 class="card-title fw-bold">{{ address.name }}</h5>
                  <p class="card-text text-muted mb-1">{{ address.phone }}</p>
                  <p class="card-text text-muted">{{ address.full_address }}</p>
                </div>
                <span v-if="address.is_default" class="badge bg-success">Default</span>
              </div>
            </div>
            <div class="card-footer bg-white d-flex justify-content-between align-items-center">
              <button
                v-if="!address.is_default"
                class="btn btn-sm btn-link text-success"
                @click="handleSetDefault(address.id)"
                :disabled="isSettingDefault === address.id"
              >
                <span v-if="isSettingDefault === address.id" class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                <span v-else>Set as Default</span>
              </button>
              <div class="ms-auto">
                <button class="btn btn-sm btn-light border me-2" @click="openEditModal(address)">Edit</button>
                <button class="btn btn-sm btn-outline-danger" @click="handleDeleteAddress(address.id)">Delete</button>
              </div>
            </div>
          </div>
        </div>

        <div v-if="!isLoading && addresses.length === 0" class="col-12">
          <div class="text-center p-5 bg-light rounded">
            <i class="fas fa-map-marked-alt fa-3x text-muted mb-3"></i>
            <h4 class="fw-bold">No Addresses Found</h4>
            <p class="text-muted">Add a new address to get started.</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal -->
    <div class="modal-backdrop" v-if="showModal"></div>
    <div class="modal fade" :class="{ 'show': showModal }" style="display: block;" v-if="showModal">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title fw-bold">{{ isEditing ? 'Edit Address' : 'Add New Address' }}</h5>
            <button type="button" class="btn-close" @click="closeModal"></button>
          </div>
          <div class="modal-body">
            <form @submit.prevent="handleSaveAddress">
              <div class="mb-3">
                <label for="name" class="form-label">Recipient Name</label>
                <input type="text" class="form-control" id="name" v-model="currentAddress.name" required />
              </div>
              <div class="mb-3">
                <label for="phone" class="form-label">Phone Number</label>
                <input type="tel" class="form-control" id="phone" v-model="currentAddress.phone" required />
              </div>
              <div class="mb-3">
                <label for="full_address" class="form-label">Full Address</label>
                <textarea class="form-control" id="full_address" rows="3" v-model="currentAddress.full_address" required></textarea>
              </div>
            </form>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" @click="closeModal">Cancel</button>
            <button type="button" class="btn btn-primary" @click="handleSaveAddress">
              <span v-if="isSaving" class="spinner-border spinner-border-sm"></span>
              <span v-else>Save Address</span>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Floating Button -->
    <button @click="goToOrderingSystem" class="fab" title="Continue Shopping">
      <i class="fas fa-shopping-bag"></i>
    </button>
  </div>
</template>


<script setup>
// --- IMPORTS ---
import { ref, onMounted } from 'vue';
import { supabase } from '../server/supabase';
import { useRouter } from 'vue-router';

// --- SETUP ---
// Initialize the router for navigation
const router = useRouter();

// --- STATE MANAGEMENT (Reactive Variables) ---
const addresses = ref([]); // Array to store the list of fetched user addresses
const isLoading = ref(true); // Boolean to show a loading state while fetching addresses
const isSaving = ref(false); // Boolean to show a loading/saving state for address create/update operations
const showModal = ref(false); // Boolean to control the visibility of the Add/Edit Address modal
const isEditing = ref(false); // Boolean to determine if the modal is for editing (true) or adding (false)
const currentAddress = ref({ // Object to hold the data of the address being added or edited
  id: null,
  name: '',
  phone: '',
  full_address: ''
});
const user = ref(null); // Object to store the currently authenticated user's data
// Tracks the ID of the address currently being set as default to show a loading state on its button
const isSettingDefault = ref(null); 

// --- NAVIGATION & UTILITY FUNCTIONS ---

/**
 * Navigates the user to the 'ordering system' page.
 */
const goToOrderingSystem = () => {
  router.push({ name: 'ordering system' });
};

// --- MODAL CONTROL FUNCTIONS ---

/**
 * Opens the modal for adding a new address.
 * Resets the currentAddress and sets isEditing to false.
 */
const openAddModal = () => {
  isEditing.value = false;
  currentAddress.value = { id: null, name: '', phone: '', full_address: '' };
  showModal.value = true;
};

/**
 * Opens the modal for editing an existing address.
 * Populates currentAddress with the data of the passed-in address object.
 * @param {Object} address - The address object to be edited.
 */
const openEditModal = (address) => {
  isEditing.value = true;
  // Use spread to create a copy, avoiding direct mutation of the array item
  currentAddress.value = { ...address }; 
  showModal.value = true;
};

/**
 * Closes the Add/Edit Address modal.
 */
const closeModal = () => {
  showModal.value = false;
};

// --- DATABASE INTERACTION FUNCTIONS ---

/**
 * Fetches all addresses for the current user from the 'addresses' table.
 * Orders them with the default address first, then by creation date.
 */
const fetchAddresses = async () => {
  isLoading.value = true;
  try {
    const { data, error } = await supabase
      .from('addresses')
      .select('*')
      // Ensure the default address is shown first
      .order('is_default', { ascending: false }) 
      .order('created_at', { ascending: false }); // Then by newest first
    
    if (error) throw error;
    addresses.value = data;
  } catch (error) {
    console.error('Error fetching addresses:', error.message);
  } finally {
    isLoading.value = false;
  }
};

/**
 * Handles the saving (either creation or update) of an address.
 * Determines action based on the value of isEditing.
 */
const handleSaveAddress = async () => {
  isSaving.value = true;
  try {
    // Data payload for the database operation
    const addressData = {
      name: currentAddress.value.name,
      phone: currentAddress.value.phone,
      full_address: currentAddress.value.full_address,
      user_id: user.value.id // Link the address to the logged-in user
    };

    if (isEditing.value) {
      // Update existing address
      const { error } = await supabase
        .from('addresses')
        .update(addressData)
        .eq('id', currentAddress.value.id);
      if (error) throw error;
    } else {
      // Insert new address
      const { error } = await supabase.from('addresses').insert([addressData]);
      if (error) throw error;
    }
    
    closeModal(); // Close the modal on success
    await fetchAddresses(); // Refresh the list of addresses
  } catch (error) {
    console.error('Error saving address:', error.message);
  } finally {
    isSaving.value = false;
  }
};

/**
 * Deletes a specified address after a confirmation prompt.
 * @param {number} addressId - The ID of the address to delete.
 */
const handleDeleteAddress = async (addressId) => {
  if (window.confirm('Are you sure you want to delete this address?')) {
    try {
      const { error } = await supabase
        .from('addresses')
        .delete()
        .eq('id', addressId);
      if (error) throw error;
      await fetchAddresses(); // Refresh the list after deletion
    } catch (error) {
      console.error('Error deleting address:', error.message);
    }
  }
};

/**
 * Calls a stored procedure (RPC) to set a specific address as the default 
 * and unsets the previous default address.
 * On success, redirects the user to the payment system.
 * @param {number} addressId - The ID of the address to set as default.
 */
const handleSetDefault = async (addressId) => {
  isSettingDefault.value = addressId; // Start loading state for the specific button
  try {
    // Call the Supabase function (RPC)
    const { error } = await supabase.rpc('set_default_address', {
      address_id_to_set: addressId
    });

    if (error) {
      throw error;
    }
    
    // On successful update, proceed to the payment system
    router.push({ name: 'payment system' });

  } catch (error) {
    console.error('Error setting default address:', error.message);
    alert('Failed to set default address. Check the console for more details.');
  } finally {
    isSettingDefault.value = null; // Reset loading state
  }
};

// --- LIFECYCLE HOOKS ---

// Executed when the component is mounted to the DOM
onMounted(async () => {
  // 1. Get the current authenticated user's session data
  const { data } = await supabase.auth.getUser();
  user.value = data.user;
  
  // 2. Fetch the user's addresses
  await fetchAddresses();
});
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@500;700&family=Roboto:wght@400&display=swap');
/* ADDED STYLES FOR FAB */
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
.address-book-page { font-family: 'Roboto', sans-serif; background-color: #f8f9fa; min-height: 100vh; }
.section-title, .modal-title { font-family: 'Poppins', sans-serif; }
.card { border: none; }
.btn-primary { font-family: 'Poppins', sans-serif; }
.address-card { transition: all 0.2s ease-in-out; border: 1px solid #dee2e6; }
.address-card:hover { transform: translateY(-5px); box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1) !important; }
.address-card.default-address { border-color: #198754; border-width: 2px; }
.card-footer { border-top: 1px solid #f0f0f0; }
.modal.show { display: block; }
.modal-backdrop { position: fixed; top: 0; left: 0; z-index: 1050; width: 100vw; height: 100vh; background-color: #000; opacity: 0.5; }
.btn-link { font-weight: 600; text-decoration: none; }

.address-book-page {
  font-family: 'Roboto', sans-serif;
  min-height: 100vh;
  position: relative;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

/* 🌈 Animated Aurora Gradient Background */
.address-book-page::before {
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

/* Keep content above background */
.container, .fab, .modal {
  position: relative;
  z-index: 2;
}

/* Card and button polish */
.address-card {
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(15px);
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 1rem;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
  transition: all 0.3s ease;
}
.address-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 30px rgba(13, 110, 253, 0.2);
}
.address-card.default-address {
  border-color: #198754;
  border-width: 2px;
}

/* Floating Button (FAB) */
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