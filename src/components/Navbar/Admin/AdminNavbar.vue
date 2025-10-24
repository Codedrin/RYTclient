<template>
  <nav class="navbar navbar-expand-lg navbar-dark bg-primary shadow-sm">
    <div class="container-fluid">
      <button class="btn btn-primary" @click="$emit('toggleSidebar')">
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
              @click.prevent="toggleDesktopAdminMenu"
            >
              <i class="fas fa-user-circle me-1"></i> {{ currentUser.username }}
            </a>
            <ul class="dropdown-menu dropdown-menu-end" v-show="desktopAdminDropdownOpen">
              <li><a class="dropdown-item" href="#" @click.prevent="$emit('showProfile')">Profile</a></li>
              <li><hr class="dropdown-divider" /></li>
              <li><a class="dropdown-item" href="#" @click.prevent="$emit('logout')">Logout</a></li>
            </ul>
          </li>
        </ul>
      </div>
    </div>
  </nav>
</template>

<script>
export default {
  name: "AdminNavbar",
  props: {
    isMobile: Boolean,
    currentUser: Object
  },
  data() {
    return {
      desktopAdminDropdownOpen: false
    };
  },
  methods: {
    toggleDesktopAdminMenu() {
      this.desktopAdminDropdownOpen = !this.desktopAdminDropdownOpen;
    }
  }
};
</script>
