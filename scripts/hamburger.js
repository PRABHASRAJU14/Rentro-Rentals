// Profile Modal Handling
document.getElementById('profile-link').addEventListener('click', function(e) {
  e.preventDefault();
  openProfileModal();
});

function openProfileModal() {
  const modal = document.getElementById('profile-modal');
  const nameSpan = document.getElementById('profile-name');
  const emailSpan = document.getElementById('profile-email');
  const phoneSpan = document.getElementById('profile-phone');
  const msgDiv = document.getElementById('profile-message');
  // Cleanup old form/buttons (if any)
  removeProfileActions();
  modal.classList.add('active');
  // Fetch profile data from localStorage
  const profile = JSON.parse(localStorage.getItem('userProfile'));
  if(profile) {
    nameSpan.textContent = profile.name || '';
    emailSpan.textContent = profile.email || '';
    phoneSpan.textContent = profile.phone || '';
    msgDiv.textContent = '';
    addProfileActions(); // add Edit/Delete buttons
  } else {
    nameSpan.textContent = '';
    emailSpan.textContent = '';
    phoneSpan.textContent = '';
    msgDiv.textContent = "No profile data found. Please fill your details on the create page.";
    addProfileActions(true); // show create button
  }
}
document.getElementById('close-profile').addEventListener('click', function() {
  document.getElementById('profile-modal').classList.remove('active');
  removeProfileActions();
});
document.getElementById('profile-modal').addEventListener('click', function(e) {
  if(e.target === this) {
    this.classList.remove('active');
    removeProfileActions();
  }
});

// --- Profile Edit/Delete Logic ---

function removeProfileActions() {
  // Remove old buttons/forms if present
  const oldActions = document.getElementById('profile-actions');
  if (oldActions) oldActions.remove();
  const oldForm = document.getElementById('profile-edit-form');
  if (oldForm) oldForm.remove();
}

function addProfileActions(isEmpty) {
  const detailsDiv = document.getElementById('profile-details');
  // Create a container for action buttons
  let actions = document.createElement('div');
  actions.id = 'profile-actions';
  actions.style.marginTop = '1em';

  if (isEmpty) {
    // Option to create profile (redirect or open inline form)
    let createBtn = document.createElement('button');
    createBtn.textContent = "Create Profile";
    createBtn.className = "profile-create-btn";
    createBtn.onclick = function() {
      showProfileEditForm();
    };
    actions.appendChild(createBtn);
  } else {
    // Edit button
    let editBtn = document.createElement('button');
    editBtn.textContent = "Edit";
    editBtn.className = "profile-edit-btn";
    editBtn.onclick = function() {
      showProfileEditForm();
    };
    actions.appendChild(editBtn);
    // Delete button
    let delBtn = document.createElement('button');
    delBtn.textContent = "Delete";
    delBtn.className = "profile-delete-btn";
    delBtn.style.marginLeft = "1em";
    delBtn.onclick = function() {
      if (confirm("Are you sure you want to delete your profile?")) {
        localStorage.removeItem('userProfile');
        openProfileModal();
        document.getElementById('profile-message').textContent = "Profile deleted!";
      }
    };
    actions.appendChild(delBtn);
  }
  detailsDiv.appendChild(actions);
}

function showProfileEditForm() {
  removeProfileActions();
  const detailsDiv = document.getElementById('profile-details');
  detailsDiv.innerHTML = ''; // Clear details view

  const existing = JSON.parse(localStorage.getItem('userProfile')) || {};
  // Build form
  let form = document.createElement('form');
  form.id = 'profile-edit-form';
  form.innerHTML = `
    <div>
      <label>Name:</label><br/>
      <input type="text" id="edit-profile-name" value="${existing.name || ''}" required/>
    </div>
    <div>
      <label>Email:</label><br/>
      <input type="email" id="edit-profile-email" value="${existing.email || ''}" required/>
    </div>
    <div>
      <label>Phone:</label><br/>
      <input type="tel" id="edit-profile-phone" value="${existing.phone || ''}" pattern="[0-9]{10}" maxlength="10" required/>
    </div>
    <div style="margin-top:1em;">
      <button type="submit" class="profile-save-btn">Save</button>
      <button type="button" class="profile-cancel-btn" style="margin-left:1em;">Cancel</button>
    </div>
  `;
  detailsDiv.appendChild(form);

  form.querySelector('.profile-cancel-btn').onclick = function() {
    openProfileModal();
  };

  form.onsubmit = function(e) {
    e.preventDefault();
    // Validation (basic)
    const name = document.getElementById('edit-profile-name').value.trim();
    const email = document.getElementById('edit-profile-email').value.trim();
    const phone = document.getElementById('edit-profile-phone').value.trim();
    if (!name || !email || !/^\S+@\S+\.\S+$/.test(email) || !/^\d{10}$/.test(phone)) {
      document.getElementById('profile-message').textContent = "Please enter valid details.";
      return;
    }
    // Save
    localStorage.setItem('userProfile', JSON.stringify({ name, email, phone }));
    openProfileModal();
    document.getElementById('profile-message').textContent = "Profile saved!";
  };
}

// ... The rest of your code (Orders, Notifications, Payments, Address, Logout) remains the same ...
// --- (Paste your existing modal handling code for orders, notifications, payments, address, logout below this) ---

// My Orders Modal Handling
document.getElementById('orders-link').addEventListener('click', function(e) {
  e.preventDefault();
  const modal = document.getElementById('orders-modal');
  const ordersListDiv = document.getElementById('orders-list');
  modal.classList.add('active');
  const orders = JSON.parse(localStorage.getItem('myOrders')) || [];
  if (orders.length === 0) {
    ordersListDiv.innerHTML = "<p style='color:#b45309;'>No orders found.</p>";
  } else {
    ordersListDiv.innerHTML = orders.map(order => `
      <div class="order-item">
        <img src="${order.image}" alt="${order.name}" class="order-img"/>
        <div class="order-info">
          <div><strong>${order.name}</strong> (${order.brand})</div>
          <div>Rent: <span class="order-rent">${order.rent}</span></div>
          ${order.location ? `<div>Pickup: <span>${order.location}</span></div>` : ''}
          ${order.dates ? `<div>Dates: <span>${order.dates}</span></div>` : ''}
        </div>
      </div>
    `).join('');
  }
});
document.getElementById('close-orders').addEventListener('click', function() {
  document.getElementById('orders-modal').classList.remove('active');
});
document.getElementById('orders-modal').addEventListener('click', function(e) {
  if(e.target === this) this.classList.remove('active');
});

// Notifications Modal with Toggle
document.getElementById('notifications-link').addEventListener('click', function(e) {
  e.preventDefault();
  document.getElementById('notifications-modal').classList.add('active');
  // Set toggle state from localStorage
  const toggle = document.getElementById('notification-toggle');
  toggle.checked = localStorage.getItem('notificationsEnabled') === 'true';
  updateNotificationStatusMsg();
});
document.getElementById('close-notifications').addEventListener('click', function() {
  document.getElementById('notifications-modal').classList.remove('active');
});
document.getElementById('notifications-modal').addEventListener('click', function(e) {
  if(e.target === this) this.classList.remove('active');
});
document.getElementById('notification-toggle').addEventListener('change', function() {
  localStorage.setItem('notificationsEnabled', this.checked ? 'true' : 'false');
  updateNotificationStatusMsg();
});
function updateNotificationStatusMsg() {
  const enabled = localStorage.getItem('notificationsEnabled') === 'true';
  const msg = document.getElementById('notification-status-msg');
  if (enabled) {
    msg.innerHTML = 'You will be notified up to date! 📢';
  } else {
    msg.innerHTML = 'Enable notifications to stay updated!';
  }
  // Always keep notifications-list hidden and empty
  document.getElementById('notifications-list').style.display = 'none';
  document.getElementById('notifications-list').innerHTML = '';
}

// Payments Modal
document.getElementById('payments-link').addEventListener('click', function(e) {
  e.preventDefault();
  const modal = document.getElementById('payments-modal');
  const paymentsListDiv = document.getElementById('payments-list');
  modal.classList.add('active');
  const payments = JSON.parse(localStorage.getItem('payments')) || [];
  if (payments.length === 0) {
    paymentsListDiv.innerHTML = "<p style='color:#b45309;'>No payments yet.</p>";
  } else {
    paymentsListDiv.innerHTML = payments.map(payment => `
      <div class="payment-card">
        <div class="amount">₹${payment.amount}</div>
        <div class="date">Date: ${payment.date}</div>
        <div class="mode">Paid via: ${payment.mode}</div>
      </div>
    `).join('');
  }
});
document.getElementById('close-payments').addEventListener('click', function() {
  document.getElementById('payments-modal').classList.remove('active');
});
document.getElementById('payments-modal').addEventListener('click', function(e) {
  if(e.target === this) this.classList.remove('active');
});

// Address Modal Handling
const addressLink = document.getElementById('address-link');
const addressModal = document.getElementById('address-modal');
const closeAddressBtn = document.getElementById('close-address');
const addressView = document.getElementById('address-view');
const addressForm = document.getElementById('address-form');
const addressMsg = document.getElementById('address-message');

function renderAddressView() {
  const address = JSON.parse(localStorage.getItem('userAddress'));
  addressForm.style.display = 'none';
  addressMsg.textContent = '';
  if (address) {
    addressView.innerHTML = `
      <div class="address-box">
        <div><strong>Address Line 1:</strong> ${address.line1}</div>
        <div><strong>Street:</strong> ${address.street}</div>
        <div><strong>City:</strong> ${address.city}</div>
        <div><strong>State:</strong> ${address.state}</div>
        <div><strong>Pincode:</strong> ${address.pincode}</div>
        <div class="address-actions">
          <button class="edit-address">Edit</button>
          <button class="delete-address">Delete</button>
        </div>
      </div>
    `;
    addressView.querySelector('.edit-address').onclick = function() {
      addressForm.style.display = 'flex';
      addressView.innerHTML = '';
      document.getElementById('address-line1').value = address.line1;
      document.getElementById('street').value = address.street;
      document.getElementById('city').value = address.city;
      document.getElementById('state').value = address.state;
      document.getElementById('pincode').value = address.pincode;
    };
    addressView.querySelector('.delete-address').onclick = function() {
      localStorage.removeItem('userAddress');
      renderAddressView();
      addressMsg.textContent = 'Address deleted!';
    };
  } else {
    addressView.innerHTML = '';
    addressForm.style.display = 'flex';
    addressForm.reset && addressForm.reset();
  }
}

addressLink.addEventListener('click', function(e) {
  e.preventDefault();
  addressModal.classList.add('active');
  renderAddressView();
});

closeAddressBtn.addEventListener('click', function() {
  addressModal.classList.remove('active');
  addressMsg.textContent = '';
});
addressModal.addEventListener('click', function(e) {
  if(e.target === this) this.classList.remove('active');
});

// Save address on submit
addressForm.addEventListener('submit', function(e) {
  e.preventDefault();
  const line1 = document.getElementById('address-line1').value.trim();
  const street = document.getElementById('street').value.trim();
  const city = document.getElementById('city').value.trim();
  const state = document.getElementById('state').value.trim();
  const pincode = document.getElementById('pincode').value.trim();
  if (!line1 || !street || !city || !state || !/^\d{6}$/.test(pincode)) {
    addressMsg.textContent = 'Please fill all required fields with valid data.';
    return;
  }
  localStorage.setItem('userAddress', JSON.stringify({
    line1, street, city, state, pincode
  }));
  renderAddressView();
  addressMsg.textContent = 'Address saved!';
});

// LOGOUT: Clear all user data and reload/redirect
document.getElementById('logout-link').addEventListener('click', function(e) {
  e.preventDefault();
  localStorage.removeItem('userProfile');
  localStorage.removeItem('myOrders');
  localStorage.removeItem('userAddress');
  localStorage.removeItem('myCart');
  localStorage.removeItem('myWishlist');
  localStorage.removeItem('payments');
  localStorage.removeItem('notificationsEnabled');
  window.location.href = "../index.html";
});
// // Cart Modal Handling
// document.getElementById('cart-link').addEventListener('click', function(e) {
//   e.preventDefault();
//   const modal = document.getElementById('cart-modal');
//   const cartListDiv = document.getElementById('cart-list');
//   modal.classList.add('active');
//   const cart = JSON.parse(localStorage.getItem('myCart')) || [];
//   if (cart.length === 0) {
//     cartListDiv.innerHTML = "<p style='color:#b45309;'>Your cart is empty.</p>";
//   } else {
//     cartListDiv.innerHTML = cart.map(vehicle => `
//       <div class="order-item">
//         <img src="${vehicle.image}" alt="${vehicle.name}" class="order-img"/>
//         <div class="order-info">
//           <div><strong>${vehicle.name}</strong> (${vehicle.brand})</div>
//           <div>Rent: <span class="order-rent">${vehicle.rent}</span></div>
//         </div>
//       </div>
//     `).join('');
//   }
// });
// document.getElementById('close-cart').addEventListener('click', function() {
//   document.getElementById('cart-modal').classList.remove('active');
// });
// document.getElementById('cart-modal').addEventListener('click', function(e) {
//   if(e.target === this) this.classList.remove('active');
// });

// // Wishlist Modal Handling
// document.getElementById('wishlist-link').addEventListener('click', function(e) {
//   e.preventDefault();
//   const modal = document.getElementById('wishlist-modal');
//   const wishlistListDiv = document.getElementById('wishlist-list');
//   modal.classList.add('active');
//   const wishlist = JSON.parse(localStorage.getItem('myWishlist')) || [];
//   if (wishlist.length === 0) {
//     wishlistListDiv.innerHTML = "<p style='color:#b45309;'>Your wishlist is empty.</p>";
//   } else {
//     wishlistListDiv.innerHTML = wishlist.map(vehicle => `
//       <div class="order-item">
//         <img src="${vehicle.image}" alt="${vehicle.name}" class="order-img"/>
//         <div class="order-info">
//           <div><strong>${vehicle.name}</strong> (${vehicle.brand})</div>
//           <div>Rent: <span class="order-rent">${vehicle.rent}</span></div>
//         </div>
//       </div>
//     `).join('');
//   }
// });
// document.getElementById('close-wishlist').addEventListener('click', function() {
//   document.getElementById('wishlist-modal').classList.remove('active');
// });
// document.getElementById('wishlist-modal').addEventListener('click', function(e) {
//   if(e.target === this) this.classList.remove('active');
// });

