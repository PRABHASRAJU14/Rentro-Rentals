/**
 * Rentro Rentals - Authentication & Session Management
 * Handles login, registration, roles, password visibility, and route protection.
 */

const RentroAuth = {
  getCurrentUser() {
    return RentroStorage.get(RentroStorage.KEYS.CURRENT_USER);
  },

  getAllUsers() {
    return RentroStorage.get(RentroStorage.KEYS.USERS) || [];
  },

  login(email, password, role = 'consumer') {
    const users = this.getAllUsers();
    const cleanEmail = (email || '').trim().toLowerCase();

    const user = users.find(u => u.email.toLowerCase() === cleanEmail && u.role === role);

    if (!user) {
      return { success: false, message: `No registered ${role} account found with this email.` };
    }

    if (user.password !== password) {
      return { success: false, message: 'Invalid password. Please check your credentials.' };
    }

    // Set current active session
    RentroStorage.set(RentroStorage.KEYS.CURRENT_USER, user);
    return { success: true, user: user };
  },

  register(userData) {
    const users = this.getAllUsers();
    const cleanEmail = (userData.email || '').trim().toLowerCase();

    // Check if email already exists for this role
    const existing = users.find(u => u.email.toLowerCase() === cleanEmail && u.role === userData.role);
    if (existing) {
      return { success: false, message: `An account with this email already exists as a ${userData.role}.` };
    }

    const newUser = {
      id: userData.role === 'provider' ? RentroUtils.generateId('PROV') : RentroUtils.generateId('USER'),
      name: userData.name.trim(),
      email: cleanEmail,
      password: userData.password,
      phone: userData.phone.trim(),
      role: userData.role,
      city: userData.city || 'Visakhapatnam',
      avatar: userData.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80',
      joinedDate: new Date().toISOString().split('T')[0],
      // Provider-specific details if applicable
      businessName: userData.businessName || `${userData.name}'s Fleet`,
      verified: userData.role === 'provider' ? false : true,
      bankAccount: userData.bankAccount || '',
      ifscCode: userData.ifscCode || '',
      panNumber: userData.panNumber || ''
    };

    users.push(newUser);
    RentroStorage.set(RentroStorage.KEYS.USERS, users);
    RentroStorage.set(RentroStorage.KEYS.CURRENT_USER, newUser);

    return { success: true, user: newUser };
  },

  updateCurrentUser(updatedFields) {
    const currentUser = this.getCurrentUser();
    if (!currentUser) return false;

    const merged = { ...currentUser, ...updatedFields };
    RentroStorage.set(RentroStorage.KEYS.CURRENT_USER, merged);

    // Also update in all users array
    const users = this.getAllUsers();
    const index = users.findIndex(u => u.id === merged.id);
    if (index !== -1) {
      users[index] = merged;
      RentroStorage.set(RentroStorage.KEYS.USERS, users);
    }
    return true;
  },

  logout() {
    localStorage.removeItem(RentroStorage.KEYS.CURRENT_USER);
    RentroUtils.showToast('You have been logged out.', 'info');
    setTimeout(() => {
      window.location.href = RentroUtils.resolvePath('index.html');
    }, 500);
  },

  // Route Guard: Call on pages requiring authentication
  requireAuth(requiredRole = null) {
    const user = this.getCurrentUser();
    if (!user) {
      RentroUtils.showToast('Please login to access this page.', 'warning');
      const redirectUrl = encodeURIComponent(window.location.pathname + window.location.search);
      const roleParam = requiredRole ? `&role=${requiredRole}` : '';
      window.location.href = RentroUtils.resolvePath(`html/login.html?redirect=${redirectUrl}${roleParam}`);
      return false;
    }

    if (requiredRole && user.role !== requiredRole) {
      RentroUtils.showToast(`This page requires a ${requiredRole} account.`, 'error');
      setTimeout(() => {
        if (user.role === 'provider') {
          window.location.href = RentroUtils.resolvePath('html/dashboard.html');
        } else {
          window.location.href = RentroUtils.resolvePath('index.html');
        }
      }, 1000);
      return false;
    }

    return true;
  },

  // Dynamic Navigation Bar User State Renderer
  renderNavUser(containerId = 'nav-user-container') {
    const container = document.getElementById(containerId);
    if (!container) return;

    const user = this.getCurrentUser();

    if (user) {
      const isProvider = user.role === 'provider';
      const dashboardLink = RentroUtils.resolvePath('html/dashboard.html');
      const createListingLink = RentroUtils.resolvePath('html/create.html');
      const manageListingLink = RentroUtils.resolvePath('html/del.html');

      container.innerHTML = `
        <div class="user-nav-dropdown">
          <button class="user-nav-btn" id="userMenuBtn">
            <img src="${user.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80'}" alt="${user.name}" class="nav-avatar" />
            <div class="nav-user-text">
              <span class="nav-user-name">${user.name.split(' ')[0]}</span>
              <span class="nav-user-badge ${isProvider ? 'badge-provider' : 'badge-consumer'}">${isProvider ? 'Provider' : 'Customer'}</span>
            </div>
            <svg class="chevron-down" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"></polyline></svg>
          </button>
          <div class="user-dropdown-menu" id="userMenuDropdown">
            <div class="dropdown-header">
              <p class="dropdown-user-name">${user.name}</p>
              <p class="dropdown-user-email">${user.email}</p>
            </div>
            <div class="dropdown-divider"></div>
            ${isProvider ? `
              <a href="${dashboardLink}" class="dropdown-item">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="9"></rect><rect x="14" y="3" width="7" height="5"></rect><rect x="14" y="12" width="7" height="9"></rect><rect x="3" y="16" width="7" height="5"></rect></svg>
                Provider Dashboard
              </a>
              <a href="${createListingLink}" class="dropdown-item">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="16"></line><line x1="8" y1="12" x2="16" y2="12"></line></svg>
                List a Vehicle
              </a>
              <a href="${manageListingLink}" class="dropdown-item">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
                Manage Vehicles
              </a>
            ` : `
              <a href="${RentroUtils.resolvePath('html/city.html')}" class="dropdown-item">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                Browse Cities
              </a>
              <a href="${RentroUtils.resolvePath('html/search.html')}" class="dropdown-item">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                Find Vehicles
              </a>
            `}
            <a href="${RentroUtils.resolvePath('html/profile-collection.html')}" class="dropdown-item">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
              ${isProvider ? 'Business Profile' : 'My Profile'}
            </a>
            <div class="dropdown-divider"></div>
            <button class="dropdown-item text-danger" id="navLogoutBtn">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
              Sign Out
            </button>
          </div>
        </div>
      `;

      // Event listener for toggle dropdown
      const btn = document.getElementById('userMenuBtn');
      const dropdown = document.getElementById('userMenuDropdown');
      if (btn && dropdown) {
        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          dropdown.classList.toggle('show');
        });
        document.addEventListener('click', () => dropdown.classList.remove('show'));
      }

      // Logout handler
      const logoutBtn = document.getElementById('navLogoutBtn');
      if (logoutBtn) {
        logoutBtn.addEventListener('click', () => RentroAuth.logout());
      }
    } else {
      // Not logged in: Show Login & Sign Up buttons
      const loginUrl = RentroUtils.resolvePath('html/login.html');
      const signupUrl = RentroUtils.resolvePath('html/signup.html');
      const providerOnboardUrl = RentroUtils.resolvePath('html/signup.html?role=provider');

      container.innerHTML = `
        <div class="auth-btn-group">
          <a href="${providerOnboardUrl}" class="btn btn-outline-primary btn-sm hide-on-mobile">Become a Provider</a>
          <a href="${loginUrl}" class="btn btn-ghost btn-sm">Log In</a>
          <a href="${signupUrl}" class="btn btn-primary btn-sm">Sign Up</a>
        </div>
      `;
    }
  }
};

window.RentroAuth = RentroAuth;
