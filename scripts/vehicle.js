/**
 * Rentro Rentals - Vehicle Flow Cards & Filter Engine
 */

// Global State
let currentCategory = "all";
let currentSearchQuery = "";
let currentSort = "recommended";
let pickupLocation = "VIZAG";
let pickupDate = "";
let pickupTime = "10:00";
let dropoffDate = "";
let dropoffTime = "18:00";
let totalHours = 8;

document.addEventListener("DOMContentLoaded", () => {
  // Ensure vehicle seed data is initialized
  if (typeof initSeedData === "function") {
    initSeedData();
  }

  // Parse Query & Session Parameters
  loadTripParameters();

  // Initialize UI Components
  setupHeaderInfo();
  populateLocationDropdown();
  setupFilterTabs();
  setupSearchAndSort();

  // Render Initial Vehicle Flow
  renderVehicleFlow();
});

function loadTripParameters() {
  const urlParams = new URLSearchParams(window.location.search);
  const sessionData = sessionStorage.getItem("vehicleFormData");
  let parsedSession = {};

  if (sessionData) {
    try {
      parsedSession = JSON.parse(sessionData);
    } catch (e) {
      console.warn("Failed to parse vehicleFormData", e);
    }
  }

  // Priority: URL Params -> SessionStorage -> Default
  pickupLocation = urlParams.get("location") || parsedSession.location || getStoredCityName() || "VIZAG";
  pickupDate = urlParams.get("pickupDate") || parsedSession.pickupDate || getDefaultDate(0);
  pickupTime = urlParams.get("pickupTime") || parsedSession.pickupTime || "10:00";
  dropoffDate = urlParams.get("dropoffDate") || parsedSession.dropoffDate || getDefaultDate(1);
  dropoffTime = urlParams.get("dropoffTime") || parsedSession.dropoffTime || "18:00";

  // Calculate total rental hours
  totalHours = calculateRentalHours(pickupDate, pickupTime, dropoffDate, dropoffTime);
}

function getStoredCityName() {
  try {
    const raw = localStorage.getItem("selectedCity");
    if (!raw) return "VIZAG";
    const data = JSON.parse(raw);
    return data.name || "VIZAG";
  } catch (e) {
    return "VIZAG";
  }
}

function getDefaultDate(offsetDays) {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  return d.toISOString().split("T")[0];
}

function calculateRentalHours(startDate, startTime, endDate, endTime) {
  try {
    const start = new Date(`${startDate}T${startTime}`);
    const end = new Date(`${endDate}T${endTime}`);
    if (isNaN(start) || isNaN(end) || end <= start) return 4;
    const diffMs = end - start;
    return Math.max(1, Math.ceil(diffMs / (1000 * 60 * 60)));
  } catch (e) {
    return 4;
  }
}

function formatDisplayDate(dateStr) {
  if (!dateStr) return "";
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    const options = { day: "numeric", month: "short" };
    return d.toLocaleDateString("en-IN", options);
  } catch (e) {
    return dateStr;
  }
}

function setupHeaderInfo() {
  const tripPill = document.getElementById("tripSummaryPill");
  if (tripPill) {
    const days = Math.floor(totalHours / 24);
    const remHours = totalHours % 24;
    let durationText = `${totalHours} hrs`;
    if (days > 0) {
      durationText = `${days}d ${remHours > 0 ? remHours + 'h' : ''}`;
    }

    tripPill.innerHTML = `
      <span>📍 <strong>${pickupLocation.toUpperCase()}</strong></span>
      <span>•</span>
      <span>${formatDisplayDate(pickupDate)} ${pickupTime} &rarr; ${formatDisplayDate(dropoffDate)} ${dropoffTime}</span>
      <span>•</span>
      <span class="badge badge-primary">${durationText}</span>
      <a href="search.html" class="edit-link">Edit</a>
    `;
  }
}

function populateLocationDropdown() {
  const select = document.getElementById("locationSelect");
  if (!select) return;

  const storedVehicles = JSON.parse(localStorage.getItem("vehicles")) || [];
  const uniqueCities = [...new Set(storedVehicles.map(v => (v.location || "").toUpperCase()).filter(Boolean))];

  // If current location is not in list, add it
  if (!uniqueCities.includes(pickupLocation.toUpperCase())) {
    uniqueCities.unshift(pickupLocation.toUpperCase());
  }

  select.innerHTML = uniqueCities.map(city => 
    `<option value="${city}" ${city === pickupLocation.toUpperCase() ? "selected" : ""}>📍 ${city}</option>`
  ).join("");

  select.addEventListener("change", (e) => {
    pickupLocation = e.target.value;
    setupHeaderInfo();
    renderVehicleFlow();
  });
}

function setupFilterTabs() {
  const tabs = document.querySelectorAll(".flow-tab");
  tabs.forEach(tab => {
    tab.addEventListener("click", () => {
      tabs.forEach(t => t.classList.remove("active"));
      tab.classList.add("active");
      currentCategory = tab.dataset.category || "all";
      renderVehicleFlow();
    });
  });
}

function setupSearchAndSort() {
  const searchInput = document.getElementById("vehicleSearchInput");
  if (searchInput) {
    searchInput.addEventListener("input", (e) => {
      currentSearchQuery = e.target.value.toLowerCase().trim();
      renderVehicleFlow();
    });
  }

  const sortSelect = document.getElementById("vehicleSortSelect");
  if (sortSelect) {
    sortSelect.addEventListener("change", (e) => {
      currentSort = e.target.value;
      renderVehicleFlow();
    });
  }
}

function getFilteredVehicles() {
  const stored = JSON.parse(localStorage.getItem("vehicles")) || [];
  
  // Filter by location
  let filtered = stored.filter(v => 
    (v.location || "").toUpperCase() === pickupLocation.toUpperCase()
  );

  // Fallback: If no vehicles in this exact city, show all vehicles to prevent empty state
  if (filtered.length === 0 && stored.length > 0) {
    filtered = stored;
  }

  // Filter by category
  if (currentCategory !== "all") {
    filtered = filtered.filter(v => 
      (v.type || "").toLowerCase() === currentCategory.toLowerCase()
    );
  }

  // Filter by search query
  if (currentSearchQuery) {
    filtered = filtered.filter(v => 
      (v.name || "").toLowerCase().includes(currentSearchQuery) ||
      (v.type || "").toLowerCase().includes(currentSearchQuery) ||
      (v.badge || "").toLowerCase().includes(currentSearchQuery)
    );
  }

  // Sort
  if (currentSort === "price-low") {
    filtered.sort((a, b) => Number(a.price) - Number(b.price));
  } else if (currentSort === "price-high") {
    filtered.sort((a, b) => Number(b.price) - Number(a.price));
  } else if (currentSort === "rating") {
    filtered.sort((a, b) => (b.rating || 4.5) - (a.rating || 4.5));
  }

  return filtered;
}

function updateCategoryCounts() {
  const stored = JSON.parse(localStorage.getItem("vehicles")) || [];
  const locationFleet = stored.filter(v => (v.location || "").toUpperCase() === pickupLocation.toUpperCase());
  const fleetToCount = locationFleet.length > 0 ? locationFleet : stored;

  const counts = {
    all: fleetToCount.length,
    scooter: fleetToCount.filter(v => (v.type || "").toLowerCase() === "scooter").length,
    bike: fleetToCount.filter(v => (v.type || "").toLowerCase() === "bike").length,
    bicycle: fleetToCount.filter(v => (v.type || "").toLowerCase() === "bicycle").length,
    car: fleetToCount.filter(v => (v.type || "").toLowerCase() === "car").length
  };

  document.querySelectorAll(".flow-tab").forEach(tab => {
    const cat = tab.dataset.category;
    const badge = tab.querySelector(".count-badge");
    if (badge && counts[cat] !== undefined) {
      badge.textContent = counts[cat];
    }
  });
}

function renderVehicleFlow() {
  const container = document.getElementById("vehicleFlowContainer");
  const resultCount = document.getElementById("resultCount");
  if (!container) return;

  updateCategoryCounts();
  const vehicles = getFilteredVehicles();

  if (resultCount) {
    resultCount.textContent = `Showing ${vehicles.length} ride${vehicles.length !== 1 ? 's' : ''}`;
  }

  if (vehicles.length === 0) {
    container.innerHTML = `
      <div class="empty-catalog-state" style="grid-column: 1 / -1;">
        <div class="empty-icon">🛵</div>
        <h3>No rides found in ${pickupLocation}</h3>
        <p>Try switching to another category, clear your search filter, or check another city hub.</p>
        <button class="btn-primary" onclick="resetFilters()">Reset All Filters</button>
      </div>
    `;
    return;
  }

  container.innerHTML = vehicles.map((v, index) => {
    const hourlyRate = Number(v.price) || 40;
    const tripTotal = hourlyRate * totalHours;
    const rating = v.rating || 4.8;
    const trips = v.trips || Math.floor(Math.random() * 120 + 30);
    const badge = v.badge || "Instant Unlock";
    const mileage = v.mileage || (v.type === "Scooter" ? "55 km/l" : v.type === "Bike" ? "35 km/l" : "Eco-friendly");
    const speed = v.speed || (v.type === "Scooter" ? "85 km/h" : v.type === "Bike" ? "120 km/h" : "25 km/h");
    const transmission = v.transmission || (v.type === "Scooter" ? "Automatic" : "Manual");

    // Booking URL construction
    const bookingParams = new URLSearchParams({
      name: v.name,
      brand: v.type || "Rentro",
      image: v.image,
      price: hourlyRate,
      location: pickupLocation,
      pickupDate: pickupDate,
      pickupTime: pickupTime,
      dropoffDate: dropoffDate,
      dropoffTime: dropoffTime,
      total: tripTotal
    });

    return `
      <div class="bike-flow-card fade-in" style="animation-delay: ${index * 0.05}s;">
        <!-- Top Status Row -->
        <div class="card-top-row">
          <span class="highlight-badge">⚡ ${badge}</span>
          <span class="rating-badge">★ ${rating.toFixed(1)} (${trips})</span>
        </div>

        <!-- Vehicle Image Showcase -->
        <div class="vehicle-showcase">
          <img src="${v.image}" alt="${v.name}" onerror="this.src='../images/bike.png'" />
        </div>

        <!-- Card Body -->
        <div class="card-body">
          <div class="vehicle-title-wrap">
            <span class="vehicle-type-tag">${v.type} • 2-Wheeler Hub</span>
            <h3 class="vehicle-model-name">${v.name}</h3>
          </div>

          <!-- Specs Flow Ribbon -->
          <div class="specs-flow-ribbon">
            <span class="spec-chip">⛽ ${mileage}</span>
            <span class="spec-chip">⚡ ${speed}</span>
            <span class="spec-chip">⚙️ ${transmission}</span>
            <span class="spec-chip">🪖 2 Helmets Free</span>
          </div>

          <!-- Timing Strip -->
          <div class="timing-strip">
            <span>📅 ${formatDisplayDate(pickupDate)} ${pickupTime}</span>
            <span>&rarr;</span>
            <span>${formatDisplayDate(dropoffDate)} ${dropoffTime}</span>
            <span class="badge badge-success">Zero Deposit</span>
          </div>

          <!-- Card Footer & Price Flow -->
          <div class="card-footer">
            <div class="price-flow-col">
              <div class="hourly-rate">₹${hourlyRate.toFixed(0)} <small>/ hr</small></div>
              <div class="total-trip-chip">₹${tripTotal.toFixed(0)} total for ${totalHours} hrs</div>
            </div>
            <a href="del.html?${bookingParams.toString()}" class="book-flow-btn">
              Book Ride <i>&rarr;</i>
            </a>
          </div>
        </div>
      </div>
    `;
  }).join("");
}

function resetFilters() {
  currentCategory = "all";
  currentSearchQuery = "";
  const searchInput = document.getElementById("vehicleSearchInput");
  if (searchInput) searchInput.value = "";
  document.querySelectorAll(".flow-tab").forEach(t => {
    t.classList.toggle("active", t.dataset.category === "all");
  });
  renderVehicleFlow();
}
