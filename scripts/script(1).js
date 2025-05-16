function toggleAddressForm() {
  document.getElementById('addressForm').style.display = 'flex';
  document.getElementById('addressBtn').style.display = 'none';
}

function submitAddress() {
  const pincode = document.getElementById('pincode').value.trim();
  const street = document.getElementById('street').value.trim();
  const city = document.getElementById('city').value.trim();
  const state = document.getElementById('state').value.trim();

  if (!pincode || !street || !city || !state) {
    alert('Please fill all the fields.');
    return;
  }

  const address = `
    <strong>Pincode:</strong> ${pincode}<br />
    <strong>Street:</strong> ${street}<br />
    <strong>City:</strong> ${city}<br />
    <strong>State:</strong> ${state}
  `;

  document.getElementById('addressDisplay').innerHTML = address;
  document.getElementById('addressDisplay').style.display = 'block';
  document.getElementById('addressForm').style.display = 'none';

  const btn = document.getElementById('addressBtn');
  btn.textContent = 'Update Address';
  btn.style.display = 'inline-block';

  document.getElementById('locationMessage').textContent = '';
}

function detectLocation() {
  const detectBtn = document.querySelector('.address-form button:nth-of-type(1)');
  const messageEl = document.getElementById('locationMessage');

  detectBtn.disabled = true;
  detectBtn.textContent = 'Detecting...';
  messageEl.textContent = '';

  if (!navigator.geolocation) {
    messageEl.textContent = 'Geolocation is not supported by your browser.';
    detectBtn.disabled = false;
    detectBtn.textContent = 'Detect Location';
    return;
  }

  navigator.geolocation.getCurrentPosition(
    (position) => {
      const lat = position.coords.latitude;
      const lon = position.coords.longitude;

      fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lon}`)
        .then((response) => response.json())
        .then((data) => {
          const address = data.address || {};
          document.getElementById('pincode').value = address.postcode || '';
          document.getElementById('street').value = address.road || address.pedestrian || '';
          document.getElementById('city').value = address.city || address.town || address.village || '';
          document.getElementById('state').value = address.state || '';

          messageEl.textContent = 'Location detected and fields populated!';
        })
        .catch(() => {
          messageEl.textContent = 'Failed to retrieve address from location.';
        })
        .finally(() => {
          detectBtn.disabled = false;
          detectBtn.textContent = 'Detect Location';
        });
    },
    () => {
      messageEl.textContent = 'Unable to retrieve your location.';
      detectBtn.disabled = false;
      detectBtn.textContent = 'Detect Location';
    }
  );
}
