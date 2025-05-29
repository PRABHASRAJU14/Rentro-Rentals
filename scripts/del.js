function parseDate(str) {
  const parts = str.split("-");
  return new Date(parts[0], parts[1] - 1, parts[2]);
}

function calculateDays(startStr, endStr) {
  const start = new Date(startStr);
  const end = new Date(endStr);

  // Calculate time difference using UTC to avoid time zone issues
  const utcStart = Date.UTC(start.getFullYear(), start.getMonth(), start.getDate());
  const utcEnd = Date.UTC(end.getFullYear(), end.getMonth(), end.getDate());

  const diffMs = utcEnd - utcStart;
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24)) + 1;
  return diffDays > 0 ? diffDays : 1;
}

const params = new URLSearchParams(window.location.search);
const locationParam = params.get("location") || "Default City";
const pickupDate = params.get("pickupDate") || "2025-06-01";
const dropoffDate = params.get("dropoffDate") || "2025-06-10";
const name = params.get("name") || "TVS Jupiter";
const brand = params.get("brand") || "HERO";
const image = params.get("image") || "https://i.imgur.com/Nb0lHBJ.png";

document.getElementById("rentalInfo").innerHTML = `
  📍 ${locationParam} <span>${pickupDate} → ${dropoffDate}</span>
  <span class="days">${calculateDays(pickupDate, dropoffDate)} Day(s)</span>
`;

document.getElementById("brand").textContent = brand;
document.getElementById("name").textContent = name;
document.getElementById("bikeImage").src = image;

const addressSection = document.getElementById("addressSection");
const addressForm = document.getElementById("addressForm");
const addressDisplay = document.getElementById("addressDisplay");
const addressBtn = document.getElementById("addressBtn");

function toggleAddressForm() {
  addressForm.style.display = "flex";
  addressBtn.style.display = "none";
}
window.toggleAddressForm = toggleAddressForm;

function submitAddress() {
  const pincode = document.getElementById("pincode").value.trim();
  const street = document.getElementById("street").value.trim();
  const city = document.getElementById("city").value.trim();
  const state = document.getElementById("state").value.trim();

  if (!pincode || !street || !city || !state) {
    alert("Please fill all the fields.");
    return;
  }

  addressDisplay.innerHTML = `
    <strong>Pincode:</strong> ${pincode}<br />
    <strong>Street:</strong> ${street}<br />
    <strong>City:</strong> ${city}<br />
    <strong>State:</strong> ${state}
  `;
  addressDisplay.style.display = "block";
  addressForm.style.display = "none";
  addressBtn.textContent = "Update Address";
  addressBtn.style.display = "inline-block";
  document.getElementById("locationMessage").textContent = "";
}
window.submitAddress = submitAddress;

function detectLocation() {
  const messageEl = document.getElementById("locationMessage");
  messageEl.textContent = "Detecting...";

  if (!navigator.geolocation) {
    messageEl.textContent = "Geolocation not supported.";
    return;
  }

  navigator.geolocation.getCurrentPosition(
    (position) => {
      const lat = position.coords.latitude;
      const lon = position.coords.longitude;

      fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lon}`)
        .then((res) => res.json())
        .then((data) => {
          const address = data.address || {};
          document.getElementById("pincode").value = address.postcode || "";
          document.getElementById("street").value = address.road || address.pedestrian || "";
          document.getElementById("city").value = address.city || address.town || address.village || "";
          document.getElementById("state").value = address.state || "";
          messageEl.textContent = "Location detected!";
        })
        .catch(() => {
          messageEl.textContent = "Failed to retrieve address.";
        });
    },
    () => {
      messageEl.textContent = "Could not get your location.";
    }
  );
}
window.detectLocation = detectLocation;

document.getElementById("backBtn").addEventListener("click", () => {
  const query = new URLSearchParams({
    location: locationParam,
    pickupDate,
    dropoffDate,
    name,
    brand,
    image
  }).toString();
  window.location.href = "vehicle.html?" + query;
});

document.getElementById("submitBtn").addEventListener("click", () => {
  const deliveryMode = document.querySelector('input[name="delivery"]:checked').value;
  if (deliveryMode === "home" && !addressDisplay.innerHTML.trim()) {
    alert("Please submit your address before continuing.");
    return;
  }

  const query = new URLSearchParams({
    location: locationParam,
    pickupDate,
    dropoffDate,
    name,
    brand,
    image,
    deliveryMode
  });

  if (deliveryMode === "home") {
    query.set("pincode", document.getElementById("pincode").value.trim());
    query.set("street", document.getElementById("street").value.trim());
    query.set("city", document.getElementById("city").value.trim());
    query.set("state", document.getElementById("state").value.trim());
  }

  window.location.href = "confirm.html?" + query.toString();
});
