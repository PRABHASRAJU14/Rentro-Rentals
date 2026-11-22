/**
 * Rentro Rentals - Provider Dashboard & Fleet Management Controller
 * Handles tab navigation, analytics computation, fleet listings, bookings workflow, and revenue ledgers.
 */

// Global Action Handlers (Always available immediately)
window.switchDashboardTab = function(tabId) {
  const contentSections = document.querySelectorAll('.dashboard-tab-content');
  const sidebarButtons = document.querySelectorAll('.sidebar-btn[data-tab]');

  let targetFound = false;
  contentSections.forEach(sec => {
    if (sec.id === tabId) {
      sec.classList.add('active');
      targetFound = true;
    } else {
      sec.classList.remove('active');
    }
  });

  sidebarButtons.forEach(btn => {
    if (btn.getAttribute('data-tab') === tabId) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
  });

  if (targetFound) {
    if (tabId === 'fleet-tab' && typeof window.renderFleetList === 'function') window.renderFleetList();
    if (tabId === 'bookings-tab' && typeof window.renderBookingsList === 'function') window.renderBookingsList();
    if (tabId === 'earnings-tab' && typeof window.renderEarningsBreakdown === 'function') window.renderEarningsBreakdown();
    
    // Trigger fluid animation scan when switching tabs
    if (window.RentroAnimations && typeof RentroAnimations.scanAndReveal === 'function') {
      setTimeout(() => RentroAnimations.scanAndReveal(), 40);
    }
  }
};

window.handleToggleAvailability = function(id) {
  if (window.RentroVehicles) {
    RentroVehicles.toggleStatus(id);
    RentroUtils.showToast('Vehicle availability toggled.', 'info');
    if (typeof window.refreshDashboard === 'function') window.refreshDashboard();
  }
};

window.handleDeleteVehicle = async function(id, name) {
  if (!window.RentroUtils || !window.RentroVehicles) return;
  const confirmed = await RentroUtils.confirmModal({
    title: 'Delete Vehicle Listing',
    message: `Are you sure you want to permanently remove "${name}" from your fleet? Past booking records will remain safely archived.`,
    confirmText: 'Delete Listing',
    type: 'danger'
  });

  if (confirmed) {
    RentroVehicles.delete(id);
    RentroUtils.showToast('Vehicle removed successfully.', 'success');
    if (typeof window.refreshDashboard === 'function') window.refreshDashboard();
  }
};

window.handleBookingStatusChange = function(bookingId, newStatus) {
  if (window.RentroBookings) {
    RentroBookings.updateStatus(bookingId, newStatus);
    RentroUtils.showToast(`Booking #${bookingId} marked as ${newStatus}.`, 'success');
    if (typeof window.refreshDashboard === 'function') window.refreshDashboard();
  }
};

window.handleEditVehicle = function(vehicleId) {
  window.location.href = `del.html?edit=${vehicleId}`;
};

document.addEventListener('DOMContentLoaded', () => {
  // Ensure seed data initialized
  if (window.RentroStorage) {
    RentroStorage.init();
  }

  // Route guard with graceful fallback for provider
  let currentProvider = window.RentroAuth ? RentroAuth.getCurrentUser() : null;
  if (!currentProvider || currentProvider.role !== 'provider') {
    // If authenticated user is not provider or missing, fallback to Kiran Kumar (PROV001) for seamless demo
    const allUsers = RentroStorage.get(RentroStorage.KEYS.USERS) || [];
    const providerUser = allUsers.find(u => u.role === 'provider') || {
      id: 'PROV001',
      name: 'Kiran Kumar',
      email: 'kiran@coastalwheels.com',
      role: 'provider',
      businessName: 'Coastal Wheels Fleet',
      avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=150&q=80'
    };
    currentProvider = providerUser;
    if (window.RentroStorage) {
      localStorage.setItem(RentroStorage.KEYS.CURRENT_USER, JSON.stringify(currentProvider));
    }
  }

  // Set provider profile information
  const providerNameElem = document.getElementById('dashProviderName');
  const providerBusinessElem = document.getElementById('dashBusinessName');
  const providerAvatarElem = document.getElementById('dashProviderAvatar');

  if (providerNameElem) providerNameElem.textContent = currentProvider.name;
  if (providerBusinessElem) providerBusinessElem.textContent = currentProvider.businessName || 'Fleet Partner';
  if (providerAvatarElem) providerAvatarElem.src = currentProvider.avatar || 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=150&q=80';

  // Render navigation user state
  if (window.RentroAuth) {
    RentroAuth.renderNavUser('nav-user-container');
  }

  // Sidebar Tab Navigation - attach only to buttons with data-tab
  const sidebarTabButtons = document.querySelectorAll('.sidebar-btn[data-tab]');
  sidebarTabButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const target = btn.getAttribute('data-tab');
      if (target) {
        window.switchDashboardTab(target);
      }
    });
  });

  // Renderers and Dashboard Data
  window.refreshDashboard = function() {
    if (!window.RentroBookings || !window.RentroVehicles) return;
    const stats = RentroBookings.getProviderAnalytics(currentProvider.id);

    // Update Metric Cards
    const statTotalVehicles = document.getElementById('statTotalVehicles');
    const statActiveVehicles = document.getElementById('statActiveVehicles');
    const statTotalBookings = document.getElementById('statTotalBookings');
    const statPendingBookings = document.getElementById('statPendingBookings');
    const statTotalEarnings = document.getElementById('statTotalEarnings');
    const statMonthlyEarnings = document.getElementById('statMonthlyEarnings');
    const bannerTotalPayout = document.getElementById('bannerTotalPayout');

    if (statTotalVehicles) statTotalVehicles.textContent = stats.totalVehicles;
    if (statActiveVehicles) statActiveVehicles.textContent = `${stats.activeVehicles} Online`;
    if (statTotalBookings) statTotalBookings.textContent = stats.totalBookings;
    if (statPendingBookings) statPendingBookings.textContent = `${stats.pendingBookings} Pending`;
    if (statTotalEarnings) statTotalEarnings.textContent = RentroUtils.formatCurrency(stats.totalEarnings);
    if (bannerTotalPayout) bannerTotalPayout.textContent = RentroUtils.formatCurrency(stats.totalEarnings);
    if (statMonthlyEarnings) statMonthlyEarnings.textContent = `+ ${RentroUtils.formatCurrency(stats.monthlyEarnings)} this month`;

    // Render Recent Bookings on Overview
    renderOverviewBookings(stats.recentBookings);

    // Render Fleet List
    window.renderFleetList();

    // Render Bookings List
    window.renderBookingsList();

    // Render Earnings Breakdown
    window.renderEarningsBreakdown();

    // Trigger fluid animation scan
    if (window.RentroAnimations && typeof RentroAnimations.scanAndReveal === 'function') {
      setTimeout(() => RentroAnimations.scanAndReveal(), 50);
    }
  };

  // 1. Overview Recent Bookings Table
  function renderOverviewBookings(recentBookings) {
    const tableBody = document.getElementById('recentBookingsTableBody');
    if (!tableBody) return;

    if (!recentBookings || recentBookings.length === 0) {
      tableBody.innerHTML = `
        <tr>
          <td colspan="6" class="table-empty-state-cell">
            <div class="dashboard-empty-state">
              <div class="dashboard-empty-icon">
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
              </div>
              <h4>No Active Bookings Yet</h4>
              <p>Customer reservations booked for your two-wheelers will appear here in real-time.</p>
            </div>
          </td>
        </tr>
      `;
      return;
    }

    tableBody.innerHTML = recentBookings.slice(0, 5).map(b => `
      <tr>
        <td><strong>#${b.id}</strong></td>
        <td>
          <div class="table-vehicle-cell">
            <img src="${RentroUtils.resolvePath(b.vehicleImage || 'images/honda activa 6g.png')}" alt="${b.vehicleName}" class="table-vehicle-thumb" />
            <span><strong>${b.vehicleName}</strong></span>
          </div>
        </td>
        <td>${b.customerName}<br><small style="color:var(--text-muted);">${b.customerPhone}</small></td>
        <td>${RentroUtils.formatDateTime(b.pickupDate, b.pickupTime)}</td>
        <td><strong>${RentroUtils.formatCurrency(b.totalAmount)}</strong></td>
        <td><span class="badge ${getStatusBadgeClass(b.bookingStatus)}"><span class="badge-dot"></span>${b.bookingStatus}</span></td>
      </tr>
    `).join('');
  }

  // 2. Complete Fleet Management Table
  window.renderFleetList = function() {
    const fleetTableBody = document.getElementById('fleetTableBody');
    if (!fleetTableBody || !window.RentroVehicles) return;

    const vehicles = RentroVehicles.getByProvider(currentProvider.id);

    if (vehicles.length === 0) {
      fleetTableBody.innerHTML = `
        <tr>
          <td colspan="6" class="table-empty-state-cell">
            <div class="dashboard-empty-state">
              <div class="dashboard-empty-icon">
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="5" cy="18" r="3"></circle><circle cx="19" cy="18" r="3"></circle><path d="M12 18V8a2 2 0 0 1 2-2h4"></path><polyline points="15 3 18 6 15 9"></polyline><path d="M5 18h14"></path></svg>
              </div>
              <h4>No Vehicles in Your Fleet</h4>
              <p>Start earning daily income with zero platform listing fees by publishing your first vehicle.</p>
              <a href="create.html" class="btn btn-primary btn-sm">+ Add Your First Vehicle</a>
            </div>
          </td>
        </tr>
      `;
      return;
    }

    fleetTableBody.innerHTML = vehicles.map(v => `
      <tr>
        <td>
          <div class="table-vehicle-cell">
            <img src="${RentroUtils.resolvePath(v.images[0] || 'images/honda activa 6g.png')}" alt="${v.name}" class="table-vehicle-thumb" />
            <div>
              <strong>${v.name}</strong>
              <div style="font-size:0.75rem; color:var(--text-muted); font-weight:600;">${v.regNumber} &bull; ${v.category}</div>
            </div>
          </div>
        </td>
        <td>${v.city}<br><small style="color:var(--text-muted);">${v.location}</small></td>
        <td><strong>${RentroUtils.formatCurrency(v.pricePerDay)}</strong>/day<br><small style="color:var(--text-muted);">${RentroUtils.formatCurrency(v.pricePerHour)}/hr</small></td>
        <td>
          <button class="btn btn-sm ${v.available ? 'btn-outline-primary' : 'btn-ghost'}" onclick="handleToggleAvailability('${v.id}')">
            ${v.available ? '🟢 Active' : '⚪ Offline'}
          </button>
        </td>
        <td>⭐ ${v.rating.toFixed(1)} <small style="color:var(--text-muted);">(${v.reviewCount})</small></td>
        <td>
          <div class="action-btn-group">
            <button class="btn btn-sm btn-ghost" onclick="handleEditVehicle('${v.id}')" title="Edit Vehicle">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
            </button>
            <button class="btn btn-sm btn-ghost text-danger" onclick="handleDeleteVehicle('${v.id}', '${v.name.replace(/'/g, "\\'")}')" title="Delete Vehicle">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
            </button>
          </div>
        </td>
      </tr>
    `).join('');
  };

  // 3. Complete Bookings List with Actions
  window.renderBookingsList = function() {
    const bookingsTableBody = document.getElementById('bookingsTableBody');
    if (!bookingsTableBody || !window.RentroBookings) return;

    const bookings = RentroBookings.getByProvider(currentProvider.id);

    if (bookings.length === 0) {
      bookingsTableBody.innerHTML = `
        <tr>
          <td colspan="7" class="table-empty-state-cell">
            <div class="dashboard-empty-state">
              <div class="dashboard-empty-icon">
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line></svg>
              </div>
              <h4>No Booking Requests Yet</h4>
              <p>When customers reserve rides from your fleet, requests and schedules will be listed here.</p>
            </div>
          </td>
        </tr>
      `;
      return;
    }

    bookingsTableBody.innerHTML = bookings.map(b => `
      <tr>
        <td><strong>#${b.id}</strong></td>
        <td>
          <div class="table-vehicle-cell">
            <img src="${RentroUtils.resolvePath(b.vehicleImage || 'images/honda activa 6g.png')}" alt="${b.vehicleName}" class="table-vehicle-thumb" />
            <div>
              <strong>${b.vehicleName}</strong>
              <div style="font-size:0.75rem; color:var(--text-muted);">${b.vehicleCity}</div>
            </div>
          </div>
        </td>
        <td>
          <strong>${b.customerName}</strong>
          <div style="font-size:0.78rem; color:var(--text-muted);">${b.customerPhone} &bull; ${b.customerEmail}</div>
        </td>
        <td>
          <div>${RentroUtils.formatDateTime(b.pickupDate, b.pickupTime)}</div>
          <div style="font-size:0.78rem; color:var(--text-muted);">to ${RentroUtils.formatDateTime(b.returnDate, b.returnTime)} (${b.durationText})</div>
        </td>
        <td>
          <strong>${RentroUtils.formatCurrency(b.totalAmount)}</strong>
          <div style="font-size:0.75rem; color:var(--text-muted);">${b.paymentMethod}</div>
        </td>
        <td><span class="badge ${getStatusBadgeClass(b.bookingStatus)}"><span class="badge-dot"></span>${b.bookingStatus}</span></td>
        <td>
          <div class="action-btn-group">
            ${b.bookingStatus === 'Pending' ? `
              <button class="btn btn-sm btn-primary" onclick="handleBookingStatusChange('${b.id}', 'Confirmed')">Accept</button>
              <button class="btn btn-sm btn-ghost text-danger" onclick="handleBookingStatusChange('${b.id}', 'Rejected')">Reject</button>
            ` : ''}
            ${b.bookingStatus === 'Confirmed' || b.bookingStatus === 'Active' ? `
              <button class="btn btn-sm btn-secondary" onclick="handleBookingStatusChange('${b.id}', 'Completed')">Mark Completed</button>
            ` : ''}
          </div>
        </td>
      </tr>
    `).join('');
  };

  // 4. Earnings Breakdown
  window.renderEarningsBreakdown = function() {
    const earningsListBody = document.getElementById('earningsHistoryTableBody');
    if (!earningsListBody || !window.RentroBookings) return;

    const bookings = RentroBookings.getByProvider(currentProvider.id);
    const completedOrActive = bookings.filter(b => b.bookingStatus === 'Completed' || b.bookingStatus === 'Active' || b.bookingStatus === 'Confirmed');

    if (completedOrActive.length === 0) {
      earningsListBody.innerHTML = `
        <tr>
          <td colspan="5" class="table-empty-state-cell">
            <div class="dashboard-empty-state">
              <div class="dashboard-empty-icon">
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="1" x2="12" y2="23"></line><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>
              </div>
              <h4>No Settlements Logged</h4>
              <p>Past completed customer trips and payout credits will appear here automatically.</p>
            </div>
          </td>
        </tr>
      `;
      return;
    }

    earningsListBody.innerHTML = completedOrActive.map(b => `
      <tr>
        <td>${RentroUtils.formatDateOnly(b.createdAt)}</td>
        <td><strong>#${b.id}</strong></td>
        <td>${b.vehicleName}</td>
        <td>${b.paymentMethod}</td>
        <td style="color: var(--success); font-weight: 800;">+ ${RentroUtils.formatCurrency(b.basePrice)}</td>
      </tr>
    `).join('');
  };

  function getStatusBadgeClass(status) {
    switch (status) {
      case 'Confirmed':
      case 'Active':
      case 'Completed':
        return 'badge-success';
      case 'Pending':
        return 'badge-warning';
      case 'Rejected':
      case 'Cancelled':
        return 'badge-danger';
      default:
        return 'badge-info';
    }
  }

  // Load Dashboard Data initially
  window.refreshDashboard();

  // Support Tab selection via query parameter ?tab=fleet-tab or URL hash #fleet-tab
  const urlTab = new URLSearchParams(window.location.search).get('tab') || window.location.hash.replace('#', '');
  if (urlTab) {
    const validTabs = ['overview-tab', 'fleet-tab', 'bookings-tab', 'earnings-tab'];
    const matched = validTabs.find(t => t === urlTab || t === `${urlTab}-tab`);
    if (matched) {
      window.switchDashboardTab(matched);
    }
  }
});
