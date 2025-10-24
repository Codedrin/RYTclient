<template>
  <div class="login-page">
    <div class="background-overlay"></div>

    <div class="container-fluid">
      <div class="row min-vh-100 align-items-center">
        <div
          class="col-lg-6 d-none d-lg-flex flex-column justify-content-center align-items-center bg-primary-gradient text-white position-relative"
        >
          <div class="text-center z-index-2 px-4">
            <div class="mb-4">
              <i class="fas fa-user fa-5x mb-3 text-white-50"></i>
            </div>
            <h1 class="display-4 fw-bold mb-3">RYT-Tyre</h1>
            <h2 class="h3 fw-light mb-4">Customer Log In</h2>
            <p class="lead mb-0">Access your account to manage your orders and track activity.</p>
          </div>

          <div class="position-absolute top-0 start-0 w-100 h-100 opacity-10">
            <div class="floating-shapes">
              <div class="shape shape-1"></div>
              <div class="shape shape-2"></div>
              <div class="shape shape-3"></div>
            </div>
          </div>
        </div>

        <div class="col-12 col-lg-6 d-flex flex-column justify-content-center py-5">
          <div class="login-form-container mx-auto w-100 px-3 px-sm-4 px-md-5">
            <div class="card shadow-lg border-0 rounded-4">
              <div class="card-body p-4 p-sm-5">
                <div class="text-center mb-4">
                  <div class="avatar-wrapper mx-auto mb-3">
                    <div class="avatar bg-primary-subtle rounded-circle d-flex align-items-center justify-content-center">
                      <i class="fas fa-user fa-2x text-primary"></i>
                    </div>
                  </div>
                  <h3 class="card-title fw-bold text-dark mb-2">Welcome Back!</h3>
                  <p class="text-muted mb-0">Please log in to your account</p>
                </div>

                <form @submit.prevent="handleLogin" novalidate>
                  <div class="mb-3">
                    <label for="email" class="form-label fw-semibold">
                      <i class="fas fa-envelope me-2 text-muted"></i>Email
                    </label>
                    <input
                      type="email"
                      class="form-control form-control-lg rounded-3"
                      id="email"
                      v-model="loginForm.email"
                      placeholder="Enter your email"
                      required
                      :class="{ 'is-invalid': errors.email }"
                    />
                    <div v-if="errors.email" class="invalid-feedback">
                      <i class="fas fa-exclamation-circle me-1"></i>{{ errors.email }}
                    </div>
                  </div>

                  <div class="mb-3">
                    <label for="password" class="form-label fw-semibold">
                      <i class="fas fa-lock me-2 text-muted"></i>Password
                    </label>
                    <div class="password-wrapper">
                      <input
                        :type="passwordFieldType"
                        class="form-control form-control-lg rounded-3"
                        id="password"
                        v-model="loginForm.password"
                        placeholder="Enter your password"
                        required
                        :class="{ 'is-invalid': errors.password }"
                      />
                      <img
                        :src="passwordIcon"
                        @click="togglePasswordVisibility"
                        alt="Toggle password visibility"
                        class="password-toggle-icon"
                      />
                    </div>
                    <div v-if="errors.password" class="invalid-feedback">
                      <i class="fas fa-exclamation-circle me-1"></i>{{ errors.password }}
                    </div>
                  </div>

                  <div class="d-flex justify-content-end mb-4">
                    <a
                      href="#"
                      @click.prevent="goToForgotPassword"
                      class="text-primary text-decoration-none small"
                    >
                      Forgot Password?
                    </a>
                  </div>
                  <div class="d-grid mb-4">
                    <button
                      type="submit"
                      class="btn btn-primary btn-lg rounded-3 fw-semibold"
                      :disabled="isLoading"
                    >
                      <span v-if="isLoading" class="spinner-border spinner-border-sm me-2"></span>
                      <i v-else class="fas fa-sign-in-alt me-2"></i>
                      {{ isLoading ? 'Logging in...' : 'Log In' }}
                    </button>
                  </div>
                </form>

                <div class="text-center">
                  <p class="text-muted mb-2">Don't have an account?</p>
                  <button
                    type="button"
                    class="btn btn-outline-primary rounded-3"
                    @click="$router.push({ path: '/' })"
                  >
                    <i class="fas fa-user-plus me-2"></i>Sign Up
                  </button>
                </div>
              </div>
            </div>

            <div class="text-center mt-4 ">
              <p class="text-muted small mb-0">© 2024 RYT-Tyre. All rights reserved.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
// --- IMPORTS & SETUP ---
import { reactive, ref, computed } from 'vue' // Core Vue functions for state and reactivity
import { useRouter } from 'vue-router' // Vue Router hook for navigation
import { supabase } from '../server/supabase' // Supabase client for authentication and database calls

// Initialize the router
const router = useRouter()

// --- REACTIVE STATE ---

// Reactive object for binding to the login form inputs
const loginForm = reactive({
  email: '',
  password: ''
})

// Reactive object to store and display validation errors
const errors = reactive({
  email: '',
  password: ''
})

// Loading state for the login button
const isLoading = ref(false)

// --- PASSWORD VISIBILITY LOGIC ---

// State to track if the password input should be visible
const isPasswordVisible = ref(false)

// Computed property to dynamically set the input type ('text' or 'password')
const passwordFieldType = computed(() => {
  return isPasswordVisible.value ? 'text' : 'password'
})

// Computed property to dynamically set the icon image path
const passwordIcon = computed(() => {
  return isPasswordVisible.value ? '/images/passHide.png' : '/images/passShow.png'
})

/**
 * Toggles the visibility state of the password field.
 */
const togglePasswordVisibility = () => {
  isPasswordVisible.value = !isPasswordVisible.value
}

// --- NAVIGATION FUNCTIONS ---

/**
 * Navigates the user to the 'forgot-password' page.
 */
const goToForgotPassword = () => {
  router.push({ name: 'forgot-password' });
};

// --- MAIN LOGIN FUNCTION ---

/**
 * Handles the user login process:
 * 1. Validates input fields.
 * 2. Signs the user in using Supabase.
 * 3. Fetches the user's role from the 'profiles' table.
 * 4. Redirects the user to the appropriate dashboard based on their role.
 */
const handleLogin = async () => {
  // Reset previous errors
  errors.email = ''
  errors.password = ''

  // Input Validation
  if (!loginForm.email.trim()) {
    errors.email = 'Email is required'
    return
  }
  if (loginForm.password.length < 6) {
    errors.password = 'Password must be at least 6 characters'
    return
  }

  isLoading.value = true
  try {
    // Step 1: Sign in the user with email and password
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: loginForm.email,
      password: loginForm.password,
    })

    if (authError) throw authError
    if (!authData.user) throw new Error("User not found after login.");

    // Step 2: Fetch the user's role from the linked profile table
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', authData.user.id)
      .single()

    if (profileError) throw profileError
    
    // Step 3: Redirect based on the determined role
    const role = profileData?.role;

    if (role === 'Super Admin') {
      router.push({ name: 'super admin' }) 
    } else if (role === 'Admin') {
      router.push({ name: 'admin' }) 
    } else {
      // Default route for regular users
      router.push({ name: 'ordering system' }) 
    }

  } catch (error) {
    console.error('Login failed:', error.message)
    // Display a generic error message to the user
    alert('Login failed. Please check your credentials and try again.')
  } finally {
    isLoading.value = false // Reset loading state
  }
}
</script>

<style scoped>
/* All existing styles remain the same */
.login-page {
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  position: relative;
}

.background-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: url('/images/background.jpg') no-repeat center center;
  background-size: cover;
  opacity: 0.1;
  z-index: 1;
}

.bg-primary-gradient {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  position: relative;
  overflow: hidden;
}

.login-form-container {
  max-width: 480px;
  width: 100%;
  position: relative;
  z-index: 2;
}

.avatar-wrapper,
.avatar {
  width: 80px;
  height: 80px;
}

.card {
  backdrop-filter: blur(10px);
  background: rgba(255, 255, 255, 0.95);
}

.form-control:focus {
  border-color: #667eea;
  box-shadow: 0 0 0 0.2rem rgba(102, 126, 234, 0.25);
}

.btn-primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
  transition: all 0.3s ease;
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(102, 126, 234, 0.3);
}

.floating-shapes {
  position: relative;
  width: 100%;
  height: 100%;
}

.shape {
  position: absolute;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 50%;
  animation: float 6s ease-in-out infinite;
}

.shape-1 {
  width: 100px;
  height: 100px;
  top: 20%;
  left: 10%;
}

.shape-2 {
  width: 150px;
  height: 150px;
  top: 60%;
  right: 15%;
  animation-delay: 2s;
}

.shape-3 {
  width: 80px;
  height: 80px;
  bottom: 20%;
  left: 60%;
  animation-delay: 4s;
}

@keyframes float {
  0%, 100% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-20px);
  }
}

@media (max-width: 767.98px) {
  .floating-shapes {
    display: none;
  }
}

@media (max-width: 991.98px) {
  .login-form-container {
    padding: 1rem;
  }
}

@media (max-width: 575.98px) {
  .card-body {
    padding: 2rem !important;
  }

  .login-form-container {
    padding: 0.5rem;
  }
}

.password-wrapper {
  position: relative;
}

.password-wrapper .form-control {
  padding-right: 45px;
}

.password-toggle-icon {
  position: absolute;
  top: 50%;
  right: 15px;
  transform: translateY(-50%);
  width: 18px;
  height: auto;
  cursor: pointer;
  z-index: 3;
}
</style>