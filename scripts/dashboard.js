// Utility functions
function getVehicles() {
  return JSON.parse(localStorage.getItem('vehicles') || '[]');
}

function saveVehicles(vehicles) {
  localStorage.setItem('vehicles', JSON.stringify(vehicles));
}

function getBookings() {
  return JSON.parse(localStorage.getItem('bookings') || '[]');
}

// Navigation logic
const navButtons = document.querySelectorAll('.nav-btn');
const sections = document.querySelectorAll('.content-section');

navButtons.forEach(btn => {
  btn.addEventListener('click', () => {
    navButtons.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');

    const target = btn.getAttribute('data-section');
    sections.forEach(section => {
      section.classList.toggle('active', section.id === target);
    });

    if (target === 'vehicles') loadVehicles();
    else if (target === 'bookings') loadBookings();
    else if (target === 'earnings') loadEarnings();
  });
});

// Add Vehicle logic
const addVehicleForm = document.getElementById('addVehicleForm');
const addVehicleMessage = document.getElementById('addVehicleMessage');

function clearAddVehicleInputs() {
  document.getElementById('vehicleName').value = '';
  document.getElementById('vehicleType').value = '';
  document.getElementById('vehiclePrice').value = '';
  document.getElementById('vehicleImage').value = '';
  document.getElementById('vehicleLocation').value = '';
}

let editingVehicleId = null; // Track if editing

function handleAddVehicleSubmit(e) {
  if (e) e.preventDefault();

  const name = document.getElementById('vehicleName').value.trim();
  let type = document.getElementById('vehicleType').value.trim();
  const price = parseFloat(document.getElementById('vehiclePrice').value);
  const image = document.getElementById('vehicleImage').value.trim();
  const location = document.getElementById('vehicleLocation').value.trim();
  const message = document.getElementById('addVehicleMessage');

  // Normalize type (capitalize first letter)
  type = type.charAt(0).toUpperCase() + type.slice(1).toLowerCase();

  if (!name || !type || isNaN(price) || price < 0 || !location) {
    message.textContent = 'Please fill all fields correctly.';
    message.style.color = 'red';
    return;
  }

  const vehicles = getVehicles();

  if (editingVehicleId) {
    const index = vehicles.findIndex(v => v.id === editingVehicleId);
    if (index !== -1) {
      vehicles[index] = { id: editingVehicleId, name, type, price, image, location };
      message.textContent = `Updated "${name}" successfully!`;
      message.style.color = 'green';
    }
    editingVehicleId = null;
  } else {
    vehicles.push({ id: Date.now(), name, type, price, image, location });
    message.textContent = `Added "${name}" successfully!`;
    message.style.color = 'green';
  }

  saveVehicles(vehicles);
  clearAddVehicleInputs();
  loadVehicles();
}

if (addVehicleForm) {
  addVehicleForm.addEventListener('submit', handleAddVehicleSubmit);
} else {
  const addVehicleBtn = document.querySelector('#addVehicle .submit-btn');
  if (addVehicleBtn) {
    addVehicleBtn.addEventListener('click', handleAddVehicleSubmit);
  }
}

// Load Vehicles
function isValidImageUrl(url) {
  return url && /^https?:\/\/.+/i.test(url.trim());
}

function loadVehicles() {
  const vehicles = getVehicles();
  const containers = {
    scooter: document.getElementById('scooter-container'),
    bike: document.getElementById('bike-container'),
    bicycle: document.getElementById('bicycle-container'),
    car: document.getElementById('car-container')
  };

  Object.values(containers).forEach(c => c.innerHTML = '');

  if (vehicles.length === 0) {
    Object.values(containers).forEach(c => c.innerHTML = '<p class="no-data">No vehicles added yet.</p>');
    return;
  }

  vehicles.forEach(v => {
    const div = document.createElement('div');
    div.className = 'vehicle-card';
    div.style.position = 'relative';

    // Image logic: show valid URL, else fallback to placeholder
    const imgSrc = isValidImageUrl(v.image)
      ? v.image
      : 'https://via.placeholder.com/280x140?text=No+Image';

    div.innerHTML = `
      <img src="${imgSrc}" alt="${v.name}" />
      <div class="vehicle-info">
        <h3>${v.name}</h3>
        <p><strong>Type:</strong> ${v.type}</p>
        <p><strong>Price:</strong> ₹ ${Number(v.price).toFixed(2)}</p>
        <p><strong>Location:</strong> ${v.location}</p>
      </div>
      <div class="card-actions" style="display:none; position:absolute; top:10px; right:10px; background:#fff; border:1px solid #ccc; border-radius:4px; padding:5px;">
        <button class="edit-btn">Edit</button>
        <button class="delete-btn" style="margin-left:5px; color:red;">Delete</button>
      </div>
    `;

    // Toggle card actions
    div.addEventListener('click', e => {
      if (e.target.classList.contains('edit-btn') || e.target.classList.contains('delete-btn')) return;
      document.querySelectorAll('.card-actions').forEach(ca => ca.style.display = 'none');
      const actions = div.querySelector('.card-actions');
      actions.style.display = actions.style.display === 'block' ? 'none' : 'block';
    });

    // Edit handler
    div.querySelector('.edit-btn').addEventListener('click', e => {
      e.stopPropagation();
      editingVehicleId = v.id;
      document.getElementById('vehicleName').value = v.name;
      document.getElementById('vehicleType').value = v.type;
      document.getElementById('vehiclePrice').value = v.price;
      document.getElementById('vehicleImage').value = v.image;
      document.getElementById('vehicleLocation').value = v.location;

      document.getElementById('addVehicleMessage').textContent = `Editing "${v.name}". Make changes and click save.`;
      document.getElementById('addVehicleMessage').style.color = 'blue';

      // Activate Vehicles tab
      document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
      document.querySelector('.nav-btn[data-section="vehicles"]').classList.add('active');
      document.querySelectorAll('.content-section').forEach(s => s.classList.remove('active'));
      document.getElementById('vehicles').classList.add('active');

      div.querySelector('.card-actions').style.display = 'none';
    });

    // Delete handler
    div.querySelector('.delete-btn').addEventListener('click', e => {
      e.stopPropagation();
      if (confirm(`Delete "${v.name}"?`)) {
        const newList = getVehicles().filter(item => item.id !== v.id);
        saveVehicles(newList);
        loadVehicles();

        if (editingVehicleId === v.id) {
          editingVehicleId = null;
          document.getElementById('addVehicleMessage').textContent = '';
          clearAddVehicleInputs();
        }
      }
    });

    const target = containers[v.type.toLowerCase()];
    if (target) target.appendChild(div);
  });
}

// Hide card actions when clicking elsewhere
document.addEventListener('click', e => {
  if (!e.target.closest('.vehicle-card')) {
    document.querySelectorAll('.card-actions').forEach(ca => ca.style.display = 'none');
  }
});

// Load on startup
loadVehicles();

// Load Bookings
const bookingsContainer = document.getElementById('bookingsContainer');

function loadBookings() {
  const bookings = getBookings();
  bookingsContainer.innerHTML = '';

  if (bookings.length === 0) {
    bookingsContainer.innerHTML = '<p class="no-data">No bookings made yet.</p>';
    return;
  }

  bookings.forEach(b => {
    const card = document.createElement('div');
    card.className = 'booking-card';

    card.innerHTML = `
      <img src="${b.image || 'https://via.placeholder.com/150'}" alt="${b.vehicleName}" class="booking-image" />
      <div class="booking-info">
        <h3>${b.vehicleName}</h3>
        <p><strong>Type:</strong> ${b.vehicleType}</p>
        <p><strong>Price:</strong> ₹${Number(b.price).toFixed(2)}</p>
        <p><strong>Customer:</strong> ${b.customerName}</p>
        <p><strong>Date:</strong> ${b.date}</p>
        <p><strong>Booking ID:</strong> ${b.id}</p>
      </div>
    `;

    bookingsContainer.appendChild(card);
  });
}

// Load bookings when the bookings tab button is clicked
document.querySelector('.nav-btn[data-section="bookings"]').addEventListener('click', loadBookings);

// Earnings tab content load on page ready
window.addEventListener('DOMContentLoaded', () => {
  const earningsSummary = document.getElementById('earningsSummary');
  const bookings = getBookings();

  // Calculate total earnings by summing prices
  const totalEarnings = bookings.reduce((sum, booking) => sum + (booking.price || 0), 0);

  // Build earnings HTML
  let html = `<p><strong>Total Earnings:</strong> ₹${totalEarnings.toFixed(2)}</p>`;

  if (bookings.length > 0) {
    html += '<h3>Bookings Details:</h3><ul>';
    bookings.forEach(b => {
      html += `<li>${b.vehicleName} - ₹${Number(b.price).toFixed(2)} (Date: ${b.date})</li>`;
    });
    html += '</ul>';
  } else {
    html += '<p>No bookings yet.</p>';
  }

  earningsSummary.innerHTML = html;
});

// Provider logic
let providers = [];
let editingProviderId = null;

const providerName = document.getElementById('providerName');
const providerEmail = document.getElementById('providerEmail');
const providerPhone = document.getElementById('providerPhone');
const providerCompany = document.getElementById('providerCompany');
const providerAddress = document.getElementById('providerAddress');

const providerMessage = document.getElementById('providerMessage');
const providerCardContainer = document.getElementById('providerCardContainer');

const saveBtn = document.querySelector('#providers .submit-btn');

saveBtn.addEventListener('click', (e) => {
  e.preventDefault();

  const name = providerName.value.trim();
  const email = providerEmail.value.trim();
  const phone = providerPhone.value.trim();
  const company = providerCompany.value.trim();
  const address = providerAddress.value.trim();

  // Simple validation
  if (!name || !email || !phone) {
    providerMessage.textContent = 'Please fill Name, Email, and Phone.';
    providerMessage.style.color = 'red';
    return;
  }

  if (editingProviderId) {
    // Update existing provider
    const idx = providers.findIndex(p => p.id === editingProviderId);
    if (idx !== -1) {
      providers[idx] = { id: editingProviderId, name, email, phone, company, address };
      providerMessage.textContent = `Updated provider "${name}" successfully!`;
      providerMessage.style.color = 'green';
    }
    editingProviderId = null;
  } else {
    // Add new provider
    const newProvider = {
      id: Date.now(),
      name,
      email,
      phone,
      company,
      address
    };
    providers.push(newProvider);
    providerMessage.textContent = `Added provider "${name}" successfully!`;
    providerMessage.style.color = 'green';
  }

  clearInputs();
  renderProviderCards();
});

function clearInputs() {
  providerName.value = '';
  providerEmail.value = '';
  providerPhone.value = '';
  providerCompany.value = '';
  providerAddress.value = '';
}

function renderProviderCards() {
  providerCardContainer.innerHTML = '';

  if (providers.length === 0) {
    providerCardContainer.innerHTML = '<p>No previous providers added yet.</p>';
    return;
  }

  providers.forEach(provider => {
    const card = document.createElement('div');
    card.className = 'provider-card';

    card.innerHTML = `
      <h3>${provider.name}</h3>
      <p><strong>Email:</strong> ${provider.email}</p>
      <p><strong>Phone:</strong> ${provider.phone}</p>
      <p><strong>Company:</strong> ${provider.company || '-'}</p>
      <p><strong>Address:</strong> ${provider.address || '-'}</p>
      <div class="card-actions">
        <button class="edit-btn">Edit</button>
        <button class="delete-btn">Delete</button>
      </div>
    `;

    // Edit button
    card.querySelector('.edit-btn').addEventListener('click', () => {
      editingProviderId = provider.id;
      providerName.value = provider.name;
      providerEmail.value = provider.email;
      providerPhone.value = provider.phone;
      providerCompany.value = provider.company;
      providerAddress.value = provider.address;

      providerMessage.textContent = `Editing provider "${provider.name}". Make changes and save.`;
      providerMessage.style.color = 'blue';

      window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    // Delete button
    card.querySelector('.delete-btn').addEventListener('click', () => {
      if (confirm(`Delete provider "${provider.name}"?`)) {
        providers = providers.filter(p => p.id !== provider.id);
        if (editingProviderId === provider.id) {
          editingProviderId = null;
          clearInputs();
          providerMessage.textContent = '';
        }
        renderProviderCards();
      }
    });

    providerCardContainer.appendChild(card);
  });
}

// Initial render
renderProviderCards();