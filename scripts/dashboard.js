/**
 * Rentro Rentals - Provider Dashboard & Fleet Management Controller
 */

document.addEventListener('DOMContentLoaded', () => {
  // Ensure seed data initialized
  RentroStorage.init();

  // Route guard: Provider only
  const hasAuth = RentroAuth.requireAuth('provider');
  if (!hasAuth) return;

  const currentProvider = RentroAuth.getCurrentUser();

  // Set provider profile information
  const providerNameElem = document.getElementById('dashProviderName');
  const providerBusinessElem = document.getElementById('dashBusinessName');
  const providerAvatarElem = document.getElementById('dashProviderAvatar');

  if (providerNameElem) providerNameElem.textContent = currentProvider.name;
  if (providerBusinessElem) providerBusinessElem.textContent = currentProvider.businessName || 'Fleet Partner';
  if (providerAvatarElem) providerAvatarElem.src = currentProvider.avatar || 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=150&q=80';

  // Render navigation user state
  RentroAuth.renderNavUser('nav-user-container');

  // Sidebar Tab Navigation
  const sidebarButtons = document.querySelectorAll('.sidebar-btn');
  const contentSections = document.querySelectorAll('.dashboard-tab-content');

  sidebarButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const target = btn.getAttribute('data-tab');
      sidebarButtons.forEach(b => b.classList.remove('active'));
      contentSections.forEach(s => s.classList.remove('active'));

      btn.classList.add('active');
      const targetSection = document.getElementById(target);
      if (targetSection) targetSection.classList.add('active');

      if (target === 'fleet-tab') renderFleetList();
      if (target === 'bookings-tab') renderBookingsList();
      if (target === 'earnings-tab') renderEarningsBreakdown();
    });
  });

  // Load Dashboard Data
  refreshDashboard();

  function refreshDashboard() {
    const stats = RentroBookings.getProviderAnalytics(currentProvider.id);

    // Update Metric Cards
    const statTotalVehicles = document.getElementById('statTotalVehicles');
    const statActiveVehicles = document.getElementById('statActiveVehicles');
    const statTotalBookings = document.getElementById('statTotalBookings');
    const statPendingBookings = document.getElementById('statPendingBookings');
    const statTotalEarnings = document.getElementById('statTotalEarnings');
    const statMonthlyEarnings = document.getElementById('statMonthlyEarnings');

    if (statTotalVehicles) statTotalVehicles.textContent = stats.totalVehicles;
    if (statActiveVehicles) statActiveVehicles.textContent = `${stats.activeVehicles} Online`;
    if (statTotalBookings) statTotalBookings.textContent = stats.totalBookings;
    if (statPendingBookings) statPendingBookings.textContent = `${stats.pendingBookings} Pending`;
    if (statTotalEarnings) statTotalEarnings.textContent = RentroUtils.formatCurrency(stats.totalEarnings);
    if (statMonthlyEarnings) statMonthlyEarnings.textContent = RentroUtils.formatCurrency(stats.monthlyEarnings);

    // Render Recent Bookings on Overview
    renderOverviewBookings(stats.recentBookings);

    // Render Fleet List
    renderFleetList();

    // Render Bookings List
    renderBookingsList();

    // Render Earnings Breakdown
    renderEarningsBreakdown();
  }

  // 1. Overview Recent Bookings Table
  function renderOverviewBookings(recentBookings) {
    const tableBody = document.getElementById('recentBookingsTableBody');
    if (!tableBody) return;

    if (!recentBookings || recentBookings.length === 0) {
      tableBody.innerHTML = `<tr><td colspan="6" style="text-align:center; padding: 24px; color: var(--text-muted);">No bookings received yet.</td></tr>`;
      return;
    }

    tableBody.innerHTML = recentBookings.slice(0, 5).map(b => `
      <tr>
        <td><strong>#${b.id}</strong></td>
        <td>
          <div class="table-vehicle-cell">
            <img src="${RentroUtils.resolvePath(b.vehicleImage || 'images/honda activa 6g.png')}" alt="${b.vehicleName}" class="table-vehicle-thumb" />
            <span>${b.vehicleName}</span>
          </div>
        </td>
        <td>${b.customerName}<br><small style="color:var(--text-muted);">${b.customerPhone}</small></td>
        <td>${RentroUtils.formatDateTime(b.pickupDate, b.pickupTime)}</td>
        <td><strong>${RentroUtils.formatCurrency(b.totalAmount)}</strong></td>
        <td><span class="badge ${getStatusBadgeClass(b.bookingStatus)}">${b.bookingStatus}</span></td>
      </tr>
    `).join('');
  }

  // 2. Complete Fleet Management Table
  function renderFleetList() {
    const fleetTableBody = document.getElementById('fleetTableBody');
    if (!fleetTableBody) return;

    const vehicles = RentroVehicles.getByProvider(currentProvider.id);

    if (vehicles.length === 0) {
      fleetTableBody.innerHTML = `
        <tr>
          <td colspan="7" style="text-align:center; padding: 36px;">
            <p style="color: var(--text-muted); margin-bottom: 12px;">No vehicles listed under your account yet.</p>
            <a href="create.html" class="btn btn-primary btn-sm">+ Add Your First Vehicle</a>
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
              <div style="font-size:0.75rem; color:var(--text-muted);">${v.regNumber} &bull; ${v.category}</div>
            </div>
          </div>
        </td>
        <td>${v.city}<br><small style="color:var(--text-muted);">${v.location}</small></td>
        <td>${RentroUtils.formatCurrency(v.pricePerDay)}/day<br><small style="color:var(--text-muted);">${RentroUtils.formatCurrency(v.pricePerHour)}/hr</small></td>
        <td>
          <button class="btn btn-sm ${v.available ? 'btn-outline-primary' : 'btn-ghost'}" onclick="handleToggleAvailability('${v.id}')">
            ${v.available ? '🟢 Active' : '⚪ Offline'}
          </button>
        </td>
        <td>⭐ ${v.rating.toFixed(1)} (${v.reviewCount})</td>
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
  }

  // 3. Complete Bookings List with Actions
  function renderBookingsList() {
    const bookingsTableBody = document.getElementById('bookingsTableBody');
    if (!bookingsTableBody) return;

    const bookings = RentroBookings.getByProvider(currentProvider.id);

    if (bookings.length === 0) {
      bookingsTableBody.innerHTML = `<tr><td colspan="7" style="text-align:center; padding: 36px; color: var(--text-muted);">No booking requests found.</td></tr>`;
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
        <td><span class="badge ${getStatusBadgeClass(b.bookingStatus)}">${b.bookingStatus}</span></td>
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
  }

  // 4. Earnings Breakdown
  function renderEarningsBreakdown() {
    const earningsListBody = document.getElementById('earningsHistoryTableBody');
    if (!earningsListBody) return;

    const bookings = RentroBookings.getByProvider(currentProvider.id);
    const completedOrActive = bookings.filter(b => b.bookingStatus === 'Completed' || b.bookingStatus === 'Active' || b.bookingStatus === 'Confirmed');

    if (completedOrActive.length === 0) {
      earningsListBody.innerHTML = `<tr><td colspan="5" style="text-align:center; padding: 24px; color: var(--text-muted);">No earnings transactions logged yet.</td></tr>`;
      return;
    }

    earningsListBody.innerHTML = completedOrActive.map(b => `
      <tr>
        <td>${RentroUtils.formatDateOnly(b.createdAt)}</td>
        <td><strong>#${b.id}</strong></td>
        <td>${b.vehicleName}</td>
        <td>${b.paymentMethod}</td>
        <td style="color: var(--success); font-weight: 700;">+ ${RentroUtils.formatCurrency(b.basePrice)}</td>
      </tr>
    `).join('');
  }

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

  // Window global handlers for inline click events
  window.handleToggleAvailability = (id) => {
    RentroVehicles.toggleStatus(id);
    RentroUtils.showToast('Vehicle availability toggled.', 'info');
    refreshDashboard();
  };

  window.handleDeleteVehicle = async (id, name) => {
    const confirmed = await RentroUtils.confirmModal({
      title: 'Delete Vehicle Listing',
      message: `Are you sure you want to permanently remove "${name}" from your fleet? Past booking records will remain safely archived.`,
      confirmText: 'Delete Listing',
      type: 'danger'
    });

    if (confirmed) {
      RentroVehicles.delete(id);
      RentroUtils.showToast('Vehicle removed successfully.', 'success');
      refreshDashboard();
    }
  };

  window.handleBookingStatusChange = (bookingId, newStatus) => {
    RentroBookings.updateStatus(bookingId, newStatus);
    RentroUtils.showToast(`Booking #${bookingId} marked as ${newStatus}.`, 'success');
    refreshDashboard();
  };

  window.handleEditVehicle = (vehicleId) => {
    window.location.href = `del.html?edit=${vehicleId}`;
  };
});
