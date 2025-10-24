<template>
  <div class="user-profile-page d-flex align-items-center justify-content-center">
    <div class="profile-container card shadow-sm">
      <div class="card-body p-4 p-md-5">
        <h3 class="text-center fw-bold mb-4">Profile Detail</h3>

        <div class="mb-3">
          <label for="usernameDisplay" class="form-label fw-semibold">Username</label>
          <div v-if="!isEditing" @click="startEditing" class="read-only-input">
            <span>{{ username }}</span>
            <i class="fas fa-pencil-alt text-muted"></i>
          </div>
          <div v-else>
            <input type="text" class="form-control" id="usernameDisplay" v-model="editableUsername" ref="usernameInput">
            <div class="mt-2">
              <button @click="saveUsername" class="btn btn-sm btn-success me-2" :disabled="isLoading">
                <span v-if="isLoading" class="spinner-border spinner-border-sm"></span>
                <span v-else>Save</span>
              </button>
              <button @click="cancelEditing" class="btn btn-sm btn-secondary">Cancel</button>
            </div>
          </div>
        </div>

        <div class="mb-4">
          <label for="email" class="form-label fw-semibold">Email Address</label>
          <input type="email" class="form-control" id="email" :value="email" disabled readonly>
        </div>

        <div class="row g-3">
          <div class="col-6">
            <button class="btn btn-outline-secondary w-100 h-100 p-3" @click="router.push({ name: 'BookOrderAddress' })">
              <i class="fas fa-map-marker-alt d-block mb-1"></i>
              Book Order Address
            </button>
          </div>
          <div class="col-6">
            <button class="btn btn-outline-secondary w-100 h-100 p-3" @click="router.push({ name: 'OrderHistory' })">
              <i class="fas fa-history d-block mb-1"></i>
              Order History
            </button>
          </div>
          <div class="col-6">
            <button class="btn btn-outline-secondary w-100 h-100 p-3" @click="router.push({ name: 'order tracking' })">
              <i class="fas fa-box d-block mb-1"></i>
              Track Recents
            </button>
          </div>
          <div class="col-6">
            <button class="btn btn-outline-danger w-100 h-100 p-3" @click="showLogoutConfirm = true">
              <i class="fas fa-sign-out-alt d-block mb-1"></i>
              Log Out
            </button>
          </div>
        </div>
      </div>
    </div>

    <div class="modal-backdrop" v-if="showLogoutConfirm"></div>
    <div class="modal fade" :class="{ 'show': showLogoutConfirm }" style="display: block;" v-if="showLogoutConfirm">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title fw-bold">Confirm Logout</h5>
            <button type="button" class="btn-close" @click="showLogoutConfirm = false"></button>
          </div>
          <div class="modal-body">
            <p>Are you sure you want to log out?</p>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" @click="showLogoutConfirm = false">Cancel</button>
            <button type="button" class="btn btn-danger" @click="handleLogout">Confirm</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
// --- IMPORTS & SETUP ---
import { ref, onMounted, nextTick } from 'vue'; // Core Vue functions for state and DOM updates
import { useRouter, onBeforeRouteLeave } from 'vue-router'; // Vue Router for navigation and route guards
import { supabase } from '../server/supabase'; // Supabase client for auth and database access

// Initialize the router
const router = useRouter();

// --- REACTIVE STATE ---
const isEditing = ref(false); // Controls the display mode (view vs. edit) for the username
const username = ref('Loading...'); // Displayed username (read-only)
const email = ref('Loading...'); // Displayed email
const editableUsername = ref(''); // Username stored while editing
const usernameInput = ref(null); // Template ref to focus the input field
const isLoading = ref(false); // General loading state for profile operations
const user = ref(null); // Stores the authenticated Supabase user object
const showLogoutConfirm = ref(false); // Controls the visibility of the logout confirmation modal

// --- DATA FETCHING (onMounted) ---

/**
 * Fetches the currently authenticated user's session data and profile information (username).
 */
onMounted(async () => {
  try {
    // 1. Get Authentication User Data
    const { data: { user: authUser }, error: authError } = await supabase.auth.getUser();
    if (authError) throw authError;
    
    if (authUser) {
      user.value = authUser;
      email.value = authUser.email;

      // 2. Fetch the associated username from the 'profiles' table
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('username')
        .eq('id', user.value.id)
        .single();

      // Handle potential no-data error (PGRST116) gracefully
      if (profileError && profileError.code !== 'PGRST116') throw profileError; 
      if (profileData) username.value = profileData.username;
    }
  } catch (error) {
    console.error('Error fetching user profile:', error.message);
    username.value = 'Error loading profile';
  }
});

// --- USERNAME EDITING FUNCTIONS ---

/**
 * Initiates the username editing mode.
 * Copies the current username to the editable state and focuses the input field.
 */
const startEditing = async () => {
  editableUsername.value = username.value;
  isEditing.value = true;
  await nextTick(); // Wait for the DOM to update to show the input field
  usernameInput.value.focus();
};

/**
 * Saves the new username to the database using an RPC (Remote Procedure Call).
 */
const saveUsername = async () => {
  // Exit if the input is empty or unchanged
  if (!editableUsername.value.trim() || editableUsername.value === username.value) {
    isEditing.value = false;
    return;
  }
  
  isLoading.value = true;
  try {
    // Call the Supabase function to update the username
    const { error } = await supabase.rpc('update_my_username', {
      new_username_text: editableUsername.value
    });
    if (error) throw error;
    
    // Update the displayed username on success
    username.value = editableUsername.value;
    alert('Username updated successfully!');
  } catch (error) {
    console.error('An error occurred during saveUsername:', error);
    alert(`Failed to update username. See console for details. Error: ${error.message}`);
  } finally {
    isLoading.value = false;
    isEditing.value = false;
  }
};

/**
 * Cancels editing and reverts the display mode.
 */
const cancelEditing = () => {
  isEditing.value = false;
};

// --- ROUTE GUARD (onBeforeRouteLeave) ---

/**
 * Route guard that fires before navigating away from this component.
 * Allows navigation to known internal pages without warning, but forces a logout
 * and prompts the user for confirmation when attempting to leave to an external route.
 */
onBeforeRouteLeave((to, from, next) => {
  // Define a list of "safe" internal routes that don't trigger the logout warning.
  const safeRoutes = ['ordering system', 'login', 'BookOrderAddress', 'order tracking', 'OrderHistory'];

  // Allow navigation immediately if the destination is a safe internal page.
  if (safeRoutes.includes(to.name)) {
    next();
    return;
  }

  // For external navigation (e.g., browser back/forward or typing a new URL),
  // prompt the user and enforce logout on confirmation.
  const answer = window.confirm('Are you sure you want to leave this page? You will be logged out for security.');
  if (answer) {
    handleLogout(); // Log the user out
    next({ name: 'login' }); // Redirect to login page
  } else {
    next(false); // Cancel the navigation
  }
});

// --- LOGOUT FUNCTION ---

/**
 * Handles the user logout process by calling the Supabase signOut API.
 */
const handleLogout = async () => {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    
    showLogoutConfirm.value = false; // Close modal (if open)
    router.push({ name: 'login' }); // Redirect to login
  } catch (error) {
    alert(error.message);
  }
};
</script>

<style scoped>
/* All existing styles remain the same */
@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@500;700&family=Roboto:wght@400;500&display=swap');
.user-profile-page { font-family: 'Roboto', sans-serif; background-color: #f8f9fa; min-height: calc(100vh - 56px); padding: 2rem 0; }
.profile-container { width: 100%; max-width: 500px; border: none; border-radius: 0.75rem; }
.card-body h3, .modal-title { font-family: 'Poppins', sans-serif; }
.form-label { font-family: 'Poppins', sans-serif; font-size: 0.9rem; }
.read-only-input { display: flex; justify-content: space-between; align-items: center; padding: 0.375rem 0.75rem; font-size: 1rem; font-weight: 400; line-height: 1.5; color: #212529; background-color: #fff; border: 1px solid #ced4da; border-radius: 0.375rem; cursor: pointer; min-height: 38px; }
.read-only-input:hover { border-color: #86b7fe; }
input:disabled { background-color: #e9ecef; cursor: not-allowed; }
.btn { font-family: 'Poppins', sans-serif; font-size: 0.9rem; transition: all 0.2s ease-in-out; }
.btn i { font-size: 1.2rem; }

/* Modal Styles */
.modal.show { display: block; }
.modal-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  z-index: 1050;
  width: 100vw;
  height: 100vh;
  background-color: #000;
  opacity: 0.5;
}

.user-profile-page {
  font-family: 'Roboto', sans-serif;
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  position: relative;
  overflow: hidden;
}

/* Aurora-style animated gradient */
.user-profile-page::before {
  content: '';
  position: fixed;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background-image:
    radial-gradient(circle at 10% 20%, #6e86ff 10%, transparent 40%),
    radial-gradient(circle at 80% 90%, #d8b4fe 15%, transparent 50%),
    radial-gradient(circle at 50% 50%, #f7c2d8 12%, transparent 45%),
    radial-gradient(circle at 90% 10%, #63a4ff 20%, transparent 60%);
  filter: blur(100px);
  animation: moveAurora 20s linear infinite;
  z-index: 0;
}

@keyframes moveAurora {
  0% { transform: rotate(0deg) translate(0, 0); }
  50% { transform: rotate(180deg) translate(10%, 10%); }
  100% { transform: rotate(360deg) translate(0, 0); }
}

/* Keep the card visible above the aurora */
.profile-container {
  position: relative;
  z-index: 1;
  width: 100%;
  max-width: 500px;
  border-radius: 1rem;
  background-color: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(20px);
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
}

</style>