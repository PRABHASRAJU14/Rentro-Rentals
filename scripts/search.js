/**
 * Rentro Rentals - Vehicle Search & Filtering Controller
 */

document.addEventListener('DOMContentLoaded', () => {
  // Ensure seed data initialized
  RentroStorage.init();

  const urlParams = new URLSearchParams(window.location.search);
  const storedSearch = RentroStorage.get(RentroStorage.KEYS.ACTIVE_SEARCH) || {};

  // Initial Filter State
  const state = {
    city: urlParams.get('city') || storedSearch.city || 'all',
    category: urlParams.get('category') || 'all',
    searchQuery: urlParams.get('q') || '',
    minPrice: urlParams.get('minPrice') || '',
    maxPrice: urlParams.get('maxPrice') || '',
    brand: urlParams.get('brand') || 'all',
    fuelType: urlParams.get('fuelType') || 'all',
    transmission: urlParams.get('transmission') || 'all',
    availabilityOnly: false,
    sort: 'recommended',
    pickupDate: urlParams.get('pickupDate') || storedSearch.pickupDate || RentroUtils.getTodayDateString(0),
    pickupTime: urlParams.get('pickupTime') || storedSearch.pickupTime || '10:00',
    returnDate: urlParams.get('returnDate') || storedSearch.returnDate || RentroUtils.getTodayDateString(1),
    returnTime: urlParams.get('returnTime') || storedSearch.returnTime || '18:00'
  };

  // Sync back to storedSearch
  RentroStorage.set(RentroStorage.KEYS.ACTIVE_SEARCH, {
    city: state.city,
    pickupDate: state.pickupDate,
    pickupTime: state.pickupTime,
    returnDate: state.returnDate,
    returnTime: state.returnTime
  });

  // Render navigation user state
  RentroAuth.renderNavUser('nav-user-container');

  // DOM Elements
  const citySelect = document.getElementById('searchCitySelect');
  const pickupDateInput = document.getElementById('pickupDate');
  const returnDateInput = document.getElementById('returnDate');
  const searchVehiclesGrid = document.getElementById('searchVehiclesGrid');
  const resultsCountText = document.getElementById('resultsCountText');
  const sortSelect = document.getElementById('sortSelect');
  const categoryChips = document.querySelectorAll('.chip-btn');
  const minPriceInput = document.getElementById('minPriceInput');
  const maxPriceInput = document.getElementById('maxPriceInput');
  const clearFiltersBtn = document.getElementById('clearFiltersBtn');
  const brandCheckboxes = document.querySelectorAll('input[name="brandFilter"]');
  const fuelCheckboxes = document.querySelectorAll('input[name="fuelFilter"]');
  const transmissionCheckboxes = document.querySelectorAll('input[name="transFilter"]');
  const availabilityCheckbox = document.getElementById('availFilter');
  const searchKeywordsInput = document.getElementById('searchKeywords');

  // Populate Cities
  if (citySelect) {
    const cities = RentroStorage.get(RentroStorage.KEYS.CITIES) || [];
    citySelect.innerHTML = `<option value="all">All Locations (Pan-India)</option>` + 
      cities.map(c => `<option value="${c.name}" ${state.city.toLowerCase() === c.name.toLowerCase() ? 'selected' : ''}>${c.name}</option>`).join('');

    citySelect.addEventListener('change', (e) => {
      state.city = e.target.value;
      updateSearchStorage();
      renderResults();
    });
  }

  // Populate Dates
  if (pickupDateInput) {
    pickupDateInput.value = state.pickupDate;
    pickupDateInput.min = RentroUtils.getTodayDateString(0);
    pickupDateInput.addEventListener('change', (e) => {
      state.pickupDate = e.target.value;
      if (returnDateInput && returnDateInput.value < state.pickupDate) {
        returnDateInput.value = state.pickupDate;
        state.returnDate = state.pickupDate;
      }
      updateSearchStorage();
      renderResults();
    });
  }

  if (returnDateInput) {
    returnDateInput.value = state.returnDate;
    returnDateInput.min = state.pickupDate;
    returnDateInput.addEventListener('change', (e) => {
      state.returnDate = e.target.value;
      updateSearchStorage();
      renderResults();
    });
  }

  function updateSearchStorage() {
    RentroStorage.set(RentroStorage.KEYS.ACTIVE_SEARCH, {
      city: state.city,
      pickupDate: state.pickupDate,
      pickupTime: state.pickupTime,
      returnDate: state.returnDate,
      returnTime: state.returnTime
    });
  }

  // Keyword search input
  if (searchKeywordsInput) {
    searchKeywordsInput.value = state.searchQuery;
    searchKeywordsInput.addEventListener('input', (e) => {
      state.searchQuery = e.target.value;
      renderResults();
    });
  }

  // Category chips
  categoryChips.forEach(chip => {
    chip.addEventListener('click', () => {
      categoryChips.forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      state.category = chip.getAttribute('data-category');
      renderResults();
    });
  });

  // Sort
  if (sortSelect) {
    sortSelect.addEventListener('change', (e) => {
      state.sort = e.target.value;
      renderResults();
    });
  }

  // Price inputs
  if (minPriceInput) {
    minPriceInput.addEventListener('input', (e) => {
      state.minPrice = e.target.value;
      renderResults();
    });
  }
  if (maxPriceInput) {
    maxPriceInput.addEventListener('input', (e) => {
      state.maxPrice = e.target.value;
      renderResults();
    });
  }

  // Brand checkboxes
  brandCheckboxes.forEach(cb => {
    cb.addEventListener('change', () => {
      const checked = Array.from(brandCheckboxes).filter(c => c.checked).map(c => c.value);
      state.brand = checked.length === 1 ? checked[0] : (checked.length > 1 ? checked : 'all');
      renderResults();
    });
  });

  // Fuel checkboxes
  fuelCheckboxes.forEach(cb => {
    cb.addEventListener('change', () => {
      const checked = Array.from(fuelCheckboxes).filter(c => c.checked).map(c => c.value);
      state.fuelType = checked.length === 1 ? checked[0] : 'all';
      renderResults();
    });
  });

  // Transmission checkboxes
  transmissionCheckboxes.forEach(cb => {
    cb.addEventListener('change', () => {
      const checked = Array.from(transmissionCheckboxes).filter(c => c.checked).map(c => c.value);
      state.transmission = checked.length === 1 ? checked[0] : 'all';
      renderResults();
    });
  });

  // Availability checkbox
  if (availabilityCheckbox) {
    availabilityCheckbox.addEventListener('change', (e) => {
      state.availabilityOnly = e.target.checked;
      renderResults();
    });
  }

  // Clear filters
  if (clearFiltersBtn) {
    clearFiltersBtn.addEventListener('click', () => {
      state.category = 'all';
      state.brand = 'all';
      state.fuelType = 'all';
      state.transmission = 'all';
      state.minPrice = '';
      state.maxPrice = '';
      state.searchQuery = '';
      state.availabilityOnly = false;
      state.sort = 'recommended';

      if (minPriceInput) minPriceInput.value = '';
      if (maxPriceInput) maxPriceInput.value = '';
      if (searchKeywordsInput) searchKeywordsInput.value = '';
      if (availabilityCheckbox) availabilityCheckbox.checked = false;
      brandCheckboxes.forEach(c => c.checked = false);
      fuelCheckboxes.forEach(c => c.checked = false);
      transmissionCheckboxes.forEach(c => c.checked = false);
      categoryChips.forEach(c => c.classList.toggle('active', c.getAttribute('data-category') === 'all'));

      renderResults();
      RentroUtils.showToast('Filters cleared', 'info');
    });
  }

  // Main Render Function
  function renderResults() {
    let vehicles = RentroVehicles.filterAndSort({
      city: state.city,
      category: state.category,
      brand: Array.isArray(state.brand) ? null : state.brand,
      transmission: state.transmission,
      fuelType: state.fuelType,
      minPrice: state.minPrice,
      maxPrice: state.maxPrice,
      availabilityOnly: state.availabilityOnly,
      searchQuery: state.searchQuery,
      sort: state.sort
    });

    // If multiple brands selected
    if (Array.isArray(state.brand)) {
      vehicles = vehicles.filter(v => state.brand.includes(v.brand));
    }

    if (resultsCountText) {
      resultsCountText.innerHTML = `Showing <strong>${vehicles.length}</strong> available vehicle${vehicles.length === 1 ? '' : 's'}`;
    }

    if (!searchVehiclesGrid) return;

    if (vehicles.length === 0) {
      searchVehiclesGrid.innerHTML = `
        <div class="search-empty-state" style="grid-column: 1 / -1;">
          <div class="empty-icon-wrap">
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line><line x1="8" y1="11" x2="14" y2="11"></line></svg>
          </div>
          <h3 class="empty-state-title">No matching vehicles found</h3>
          <p class="empty-state-desc">We couldn't find any vehicles matching your exact filter criteria. Try adjusting your city, price range, or categories.</p>
          <button class="btn btn-primary" onclick="document.getElementById('clearFiltersBtn').click()">Reset All Filters</button>
        </div>
      `;
      return;
    }

    searchVehiclesGrid.innerHTML = vehicles.map(v => {
      // Check date availability
      const availability = RentroVehicles.checkAvailability(v.id, state.pickupDate, state.pickupTime, state.returnDate, state.returnTime);
      const isAvailable = availability.available;
      const detailLink = `vehicle.html?id=${v.id}`;
      const imgPath = RentroUtils.resolvePath(v.images[0] || 'images/honda activa 6g.png');

      return `
        <div class="vehicle-card">
          <div class="vehicle-card-img-wrap">
            <span class="vehicle-status-badge ${isAvailable ? 'badge-success' : 'badge-danger'}">
              ${isAvailable ? 'Available Now' : 'Reserved for Dates'}
            </span>
            <div class="vehicle-rating-pill">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="#f59e0b" stroke="#f59e0b"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
              <span>${v.rating.toFixed(1)}</span>
            </div>
            <img src="${imgPath}" alt="${v.name}" class="vehicle-card-img" onerror="this.src='${RentroUtils.resolvePath('images/honda activa 6g.png')}'" />
          </div>

          <div class="vehicle-card-body">
            <span class="vehicle-category-tag">${v.category} &bull; ${v.city}</span>
            <h3 class="vehicle-title">${v.name}</h3>
            <div class="vehicle-location-row">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
              <span>${v.location}</span>
            </div>

            <div class="vehicle-specs-row">
              <div class="vehicle-spec-pill">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>
                <span>${v.transmission}</span>
              </div>
              <div class="vehicle-spec-pill">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 11l19-9-9 19-2-8-8-2z"></path></svg>
                <span>${v.fuelType}</span>
              </div>
              <div class="vehicle-spec-pill">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle></svg>
                <span>${v.seatingCapacity} Seats</span>
              </div>
            </div>

            <div class="vehicle-card-footer">
              <div class="vehicle-price-box">
                <span class="vehicle-price-amount">${RentroUtils.formatCurrency(v.pricePerDay)}</span>
                <span class="vehicle-price-unit">per day (&bull; ${RentroUtils.formatCurrency(v.pricePerHour)}/hr)</span>
              </div>
              <a href="${detailLink}" class="btn btn-sm btn-primary">
                ${isAvailable ? 'Book Ride' : 'View Details'}
              </a>
            </div>
          </div>
        </div>
      `;
    }).join('');
  }

  // Initial render
  renderResults();
});
