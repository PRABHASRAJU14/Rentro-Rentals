function parseDateTime(dateStr, timeStr) {
  // Expects dateStr: "dd-mm-yyyy", timeStr: "HH:mm"
  const [day, month, year] = dateStr.split("-").map(Number);
  const [hour, minute] = timeStr.split(":").map(Number);
  return new Date(year, month - 1, day, hour, minute);
}

function setDurationDisplay(startDateStr, startTimeStr, endDateStr, endTimeStr, durationDisplay) {
  if (startDateStr && startTimeStr && endDateStr && endTimeStr) {
    const start = parseDateTime(startDateStr, startTimeStr);
    const end = parseDateTime(endDateStr, endTimeStr);

    let diffMs = end - start;

    // If end is before start, show duration as 0
    if (diffMs < 0) diffMs = 0;

    let days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    let hours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    let minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

    let durationStr = "Duration: ";
    if (days > 0) durationStr += `${days} Day${days > 1 ? 's' : ''} `;
    if (hours > 0) durationStr += `${hours} Hour${hours > 1 ? 's' : ''} `;
    if (minutes > 0) durationStr += `${minutes} Minute${minutes > 1 ? 's' : ''}`;
    if (days === 0 && hours === 0 && minutes === 0) durationStr = "Duration: Less than a minute";

    durationDisplay.textContent = durationStr.trim();

    // Call total amount calculation directly after duration calculation
    updateTotalAmount(startDateStr, startTimeStr, endDateStr, endTimeStr);
  }
}

// Helper for days between two dd-mm-yyyy dates (inclusive)
function calculateDays(startStr, endStr) {
  function parseDate(str) {
    const [day, month, year] = str.split("-").map(Number);
    return new Date(year, month - 1, day);
  }
  const start = parseDate(startStr);
  const end = parseDate(endStr);
  const diffMs = end - start;
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24)) + 1; // inclusive
  return diffDays > 0 ? diffDays : 1;
}

// Get parameters, always converting date format if needed
const params = new URLSearchParams(window.location.search);
const locationParam = params.get("location") || "Vijayawada";
const pickupDateRaw = params.get("pickupDate") || "2025-05-18";
const dropoffDateRaw = params.get("dropoffDate") || "2025-05-20";
const pickupTime = params.get("pickupTime") || "10:00";
const dropoffTime = params.get("dropoffTime") || "10:00";
const name = params.get("name") || "Glamour";
const brand = params.get("brand") || "HERO";
const image = params.get("image") || "https://i.imgur.com/Nb0lHBJ.png";
const pricePerHour = params.get("price") || "0.00"; // price per hour expected in params

// Convert date to dd-mm-yyyy if not already
function toDDMMYYYY(str) {
  if (/^\d{2}-\d{2}-\d{4}$/.test(str)) return str; // already in dd-mm-yyyy
  if (/^\d{4}-\d{2}-\d{2}$/.test(str)) {
    const [yyyy, mm, dd] = str.split("-");
    return `${dd}-${mm}-${yyyy}`;
  }
  return str; // fallback: return as is
}
const pickupDate = toDDMMYYYY(pickupDateRaw);
const dropoffDate = toDDMMYYYY(dropoffDateRaw);

document.getElementById("rentalInfo").innerHTML = `
  📍 ${locationParam} <span>${pickupDate} → ${dropoffDate}</span>
  <span class="days">${calculateDays(pickupDate, dropoffDate)} Day(s)</span>
`;

document.getElementById("brand").textContent = brand;
document.getElementById("name").textContent = name;
document.getElementById("bikeImage").src = image;

// Set duration display if you have a container with id="durationDisplay"
const durationDisplay = document.getElementById("durationDisplay");
if (durationDisplay) {
  setDurationDisplay(pickupDate, pickupTime, dropoffDate, dropoffTime, durationDisplay);
} else {
  // Fallback: ensure total shown even if no durationDisplay (rare)
  updateTotalAmount(pickupDate, pickupTime, dropoffDate, dropoffTime);
}

// --- TOTAL AMOUNT SECTION ---
function calculateTotalHours(startDateStr, startTimeStr, endDateStr, endTimeStr) {
  const start = parseDateTime(startDateStr, startTimeStr);
  const end = parseDateTime(endDateStr, endTimeStr);
  if (!start || !end) return 0;
  let diffMs = end - start;
  if (diffMs < 0) diffMs = 0;
  const totalHours = diffMs / (1000 * 60 * 60);
  return Math.ceil(totalHours); // always round up
}

function updateTotalAmount(startDateStr, startTimeStr, endDateStr, endTimeStr) {
  const totalAmountEl = document.getElementById("totalAmount");
  if (!totalAmountEl) return;
  if (
    pricePerHour &&
    !isNaN(Number(pricePerHour)) &&
    startDateStr && startTimeStr &&
    endDateStr && endTimeStr
  ) {
    const totalHours = calculateTotalHours(startDateStr, startTimeStr, endDateStr, endTimeStr);
    const totalAmount = Number(pricePerHour) * totalHours;
    totalAmountEl.innerHTML = `<strong>Total: </strong>₹${totalAmount} <span style="font-size:0.9em;color:#666;">(${totalHours} hr${totalHours>1?'s':''} x ₹${Number(pricePerHour).toFixed(2)}/hr)</span>`;
  } else {
    totalAmountEl.textContent = "Total: -";
  }
}
// --- END TOTAL AMOUNT SECTION ---

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
    pickupTime,
    dropoffTime,
    name,
    brand,
    image,
    price: pricePerHour
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
    pickupTime,
    dropoffTime,
    name,
    brand,
    image,
    price: pricePerHour,
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