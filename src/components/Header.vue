<template>
  <header class="app-header" v-if="showHeader">
    <div class="header-container">
      <!-- Logo Section -->
      <div class="logo-section" @click="navigateToHome">
        <img src="@/assets/doner_logo.png" alt="Logo" class="logo-image" style="margin-right: -0px;"/>
        <div class="logo-text">
          <span class="ministry-label">MINISTRY OF DEVELOPMENT OF</span>
          <span class="ministry-title">
            <span class="north">NORTH</span> <span class="eastern">EASTERN</span> REGION
          </span>
        </div>
      </div>

      <!-- Navigation Section -->
      <nav class="nav-section">
        <button 
          class="nav-item" 
          :class="{ active: isActiveRoute('/files') }"
          @click="navigateTo('/files')"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
            <polyline points="14,2 14,8 20,8"/>
            <line x1="16" y1="13" x2="8" y2="13"/>
            <line x1="16" y1="17" x2="8" y2="17"/>
            <polyline points="10,9 9,9 8,9"/>
          </svg>
          <span class="nav-label">Files</span>
        </button>

        <button 
          class="nav-item" 
          :class="{ active: isActiveRoute('/evaluations') }"
          @click="navigateTo('/evaluations')"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M9 11l3 3L22 4"/>
            <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
          </svg>
          <span class="nav-label">Evaluations</span>
        </button>

        <button 
          class="nav-item" 
          :class="{ active: isActiveRoute('/settings') }"
          @click="navigateTo('/settings')"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="3"/>
            <path d="M12 1v6m0 6v6M5.64 5.64l4.24 4.24m4.24 4.24l4.24 4.24M1 12h6m6 0h6M5.64 18.36l4.24-4.24m4.24-4.24l4.24-4.24"/>
          </svg>
          <span class="nav-label">Settings</span>
        </button>

        <button 
          class="nav-item logout-btn" 
          @click="handleLogout"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
            <polyline points="16,17 21,12 16,7"/>
            <line x1="21" y1="12" x2="9" y2="12"/>
          </svg>
          <span class="nav-label">Logout</span>
        </button>
      </nav>

      <!-- Mobile Menu Toggle -->
      <button class="mobile-menu-toggle" @click="toggleMobileMenu" v-if="isMobile">
        <svg v-if="!mobileMenuOpen" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="3" y1="6" x2="21" y2="6"/>
          <line x1="3" y1="12" x2="21" y2="12"/>
          <line x1="3" y1="18" x2="21" y2="18"/>
        </svg>
        <svg v-else width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="18" y1="6" x2="6" y2="18"/>
          <line x1="6" y1="6" x2="18" y2="18"/>
        </svg>
      </button>
    </div>

    <!-- Mobile Menu -->
    <div class="mobile-menu" v-if="isMobile && mobileMenuOpen">
      <button 
        class="mobile-nav-item" 
        :class="{ active: isActiveRoute('/files') }"
        @click="navigateTo('/files')"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
          <polyline points="14,2 14,8 20,8"/>
        </svg>
        <span>Files</span>
      </button>

      <button 
        class="mobile-nav-item" 
        :class="{ active: isActiveRoute('/evaluations') }"
        @click="navigateTo('/evaluations')"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M9 11l3 3L22 4"/>
          <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
        </svg>
        <span>Evaluations</span>
      </button>

      <button 
        class="mobile-nav-item" 
        :class="{ active: isActiveRoute('/settings') }"
        @click="navigateTo('/settings')"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="3"/>
          <path d="M12 1v6m0 6v6M5.64 5.64l4.24 4.24m4.24 4.24l4.24 4.24M1 12h6m6 0h6M5.64 18.36l4.24-4.24m4.24-4.24l4.24-4.24"/>
        </svg>
        <span>Settings</span>
      </button>

      <button 
        class="mobile-nav-item logout-btn" 
        @click="handleLogout"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
          <polyline points="16,17 21,12 16,7"/>
          <line x1="21" y1="12" x2="9" y2="12"/>
        </svg>
        <span>Logout</span>
      </button>
    </div>
  </header>
</template>

<script>
export default {
  name: 'Header',
  data() {
    return {
      mobileMenuOpen: false,
      isMobile: false
    }
  },
  computed: {
    showHeader() {
      return this.$route.name !== 'Signin'
    }
  },
  mounted() {
    this.checkMobile()
    window.addEventListener('resize', this.checkMobile)
  },
  beforeDestroy() {
    window.removeEventListener('resize', this.checkMobile)
  },
  methods: {
    checkMobile() {
      this.isMobile = window.innerWidth < 768
      if (!this.isMobile) {
        this.mobileMenuOpen = false
      }
    },
    isActiveRoute(path) {
      return this.$route.path.startsWith(path)
    },
    navigateTo(path) {
      this.$router.push(path)
      this.mobileMenuOpen = false
    },
    navigateToHome() {
      this.$router.push('/dashboard')
    },
    toggleMobileMenu() {
      this.mobileMenuOpen = !this.mobileMenuOpen
    },
    handleLogout() {
      localStorage.removeItem('jwt_access')
      localStorage.removeItem('user')
      this.$router.push('/login')
      this.mobileMenuOpen = false
    }
  }
}
</script>

<style scoped>
.app-header {
  background: linear-gradient(135deg, #F97B22, #FF8C42, #FFB366, #FFD93D);
  background-size: 400% 400%;
  animation: gradientShift 8s ease infinite;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  position: sticky;
  top: 0;
  z-index: 1000;
  border-bottom: 2px solid rgba(255, 255, 255, 0.2);
}

@keyframes gradientShift {
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}

.header-container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0.75rem 2rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  width: 100%;
  box-sizing: border-box;
  overflow: hidden;
}

/* Logo Section */
.logo-section {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  cursor: pointer;
  transition: transform 0.3s ease;
  flex: 1;
  min-width: 0;
  overflow: hidden;
}

.logo-section:hover {
  transform: scale(1.02);
}

.logo-image {
  width: 50px;
  height: 50px;
  object-fit: contain;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1));
}

.logo-text {
  display: flex;
  flex-direction: column;
  color: white;
  min-width: 0;
  flex-shrink: 1;
}

.ministry-label {
  font-size: 0.7rem;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  opacity: 0.95;
  font-weight: 600;
  line-height: 1.2;
}

.ministry-title {
  font-size: 1.1rem;
  font-weight: 700;
  line-height: 1.2;
}

.north {
  color: #3B82F6;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
}

.eastern {
  color: #10B981;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
}

/* Navigation Section */
.nav-section {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex: 1;
  justify-content: flex-end;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.625rem 1.25rem;
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 0.75rem;
  color: white;
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  white-space: nowrap;
}

.nav-item:hover {
  background: rgba(255, 255, 255, 0.25);
  border-color: rgba(255, 255, 255, 0.5);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.nav-item.active {
  background: rgba(255, 255, 255, 0.3);
  border-color: rgba(255, 255, 255, 0.6);
  box-shadow: 0 0 0 2px rgba(255, 255, 255, 0.3);
}

.nav-item svg {
  flex-shrink: 0;
}

.nav-label {
  display: inline-block;
}

.nav-item.logout-btn {
  background: rgba(239, 68, 68, 0.2);
  border-color: rgba(239, 68, 68, 0.4);
}

.nav-item.logout-btn:hover {
  background: rgba(239, 68, 68, 0.3);
  border-color: rgba(239, 68, 68, 0.6);
}

/* Mobile Menu Toggle */
.mobile-menu-toggle {
  display: none;
  background: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 0.5rem;
  padding: 0.5rem;
  color: white;
  cursor: pointer;
  transition: all 0.3s ease;
  flex-shrink: 0;
  margin-left: 0.5rem;
}

.mobile-menu-toggle:hover {
  background: rgba(255, 255, 255, 0.3);
}

/* Mobile Menu */
.mobile-menu {
  display: none;
  flex-direction: column;
  gap: 0.5rem;
  padding: 1rem 2rem;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border-top: 1px solid rgba(255, 255, 255, 0.2);
}

.mobile-nav-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 0.75rem;
  color: white;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  width: 100%;
  text-align: left;
}

.mobile-nav-item:hover {
  background: rgba(255, 255, 255, 0.25);
  transform: translateX(4px);
}

.mobile-nav-item.active {
  background: rgba(255, 255, 255, 0.3);
  border-color: rgba(255, 255, 255, 0.6);
}

.mobile-nav-item.logout-btn {
  background: rgba(239, 68, 68, 0.2);
  border-color: rgba(239, 68, 68, 0.4);
}

.mobile-nav-item.logout-btn:hover {
  background: rgba(239, 68, 68, 0.3);
}

/* Responsive Design */
@media (max-width: 768px) {
  .header-container {
    padding: 0.75rem 1rem;
    gap: 0.75rem;
  }

  .logo-section {
    gap: 0.5rem;
    flex: 1;
    min-width: 0;
  }

  .logo-image {
    width: 40px;
    height: 40px;
    flex-shrink: 0;
  }

  .logo-text {
    display: flex;
    flex-direction: column;
    min-width: 0;
    overflow: hidden;
  }

  .ministry-label {
    font-size: 0.5rem;
    line-height: 1.1;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .ministry-title {
    font-size: 0.75rem;
    line-height: 1.1;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .nav-section {
    display: none;
  }

  .mobile-menu-toggle {
    display: block;
    flex-shrink: 0;
  }

  .mobile-menu {
    display: flex;
  }

  .nav-label {
    display: none;
  }

  .nav-item {
    padding: 0.625rem;
  }
}

@media (max-width: 480px) {
  .header-container {
    padding: 0.625rem 0.75rem;
    gap: 0.5rem;
  }

  .logo-section {
    gap: 0.5rem;
  }

  .logo-image {
    width: 35px;
    height: 35px;
  }

  .ministry-label {
    font-size: 0.45rem;
  }

  .ministry-title {
    font-size: 0.65rem;
  }

  .mobile-menu-toggle {
    padding: 0.4rem;
  }

  .mobile-menu {
    padding: 0.75rem 1rem;
  }
}

@media (max-width: 360px) {
  .ministry-label {
    font-size: 0.4rem;
  }

  .ministry-title {
    font-size: 0.6rem;
  }

  .logo-image {
    width: 30px;
    height: 30px;
  }
}

/* Dark theme support */
@media (prefers-color-scheme: dark) {
  .app-header {
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
  }
}
</style>

