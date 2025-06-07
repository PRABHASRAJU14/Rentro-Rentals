document.addEventListener("DOMContentLoaded", function() {

function parseDateTime(dateStr, timeStr) {
  const [day, month, year] = dateStr.split("-").map(Number);
  const [hour, minute] = timeStr.split(":").map(Number);
  return new Date(year, month - 1, day, hour, minute);
}

function setDurationDisplay(startDateStr, startTimeStr, endDateStr, endTimeStr, durationDisplay) {
  if (startDateStr && startTimeStr && endDateStr && endTimeStr) {
    const start = parseDateTime(startDateStr, startTimeStr);
    const end = parseDateTime(endDateStr, endTimeStr);

    let diffMs = end - start;
    if (diffMs < 0) diffMs = 0;

    let totalHours = Math.floor(diffMs / (1000 * 60 * 60));
    let days = Math.floor(totalHours / 24);
    let hours = totalHours % 24;

    let durationStr = "";
    if (days > 0) durationStr += `${days} Day${days > 1 ? 's' : ''}`;
    if (days > 0 && hours > 0) durationStr += ` ${hours} Hour${hours > 1 ? 's' : ''}`;
    if (days === 0 && hours > 0) durationStr += `${hours} Hour${hours > 1 ? 's' : ''}`;
    if (totalHours === 0) durationStr = "Less than an hour";

    durationDisplay.innerHTML = `<span class="days">${durationStr.trim()}</span>`;

    updateTotalAmount(startDateStr, startTimeStr, endDateStr, endTimeStr);
  }
}

function calculateTotalHours(startDateStr, startTimeStr, endDateStr, endTimeStr) {
  const start = parseDateTime(startDateStr, startTimeStr);
  const end = parseDateTime(endDateStr, endTimeStr);
  if (!start || !end) return 0;
  let diffMs = end - start;
  if (diffMs < 0) diffMs = 0;
  return Math.floor(diffMs / (1000 * 60 * 60));
}

const params = new URLSearchParams(window.location.search);
const locationParam = params.get("location") || "Vijayawada";
const pickupDateRaw = params.get("pickupDate") || "2025-05-18";
const dropoffDateRaw = params.get("dropoffDate") || "2025-05-20";
const pickupTime = params.get("pickupTime") || "10:00";
const dropoffTime = params.get("dropoffTime") || "10:00";
const name = params.get("name") || "Glamour";
const brand = params.get("brand") || "HERO";
const image = params.get("image") || "https://i.imgur.com/Nb0lHBJ.png";
const pricePerHour = params.get("price") || "0.00";

function toDDMMYYYY(str) {
  if (/^\d{2}-\d{2}-\d{4}$/.test(str)) return str;
  if (/^\d{4}-\d{2}-\d{2}$/.test(str)) {
    const [yyyy, mm, dd] = str.split("-");
    return `${dd}-${mm}-${yyyy}`;
  }
  return str;
}

const pickupDate = toDDMMYYYY(pickupDateRaw);
const dropoffDate = toDDMMYYYY(dropoffDateRaw);

// --- HOURS/DAYS LOGIC ---
const totalHours = calculateTotalHours(pickupDate, pickupTime, dropoffDate, dropoffTime);
const rentalInfoEl = document.getElementById("rentalInfo");
let durationStr = "";
if (totalHours < 24) {
  durationStr += `${totalHours} Hour(s)`;
} else {
  const days = Math.floor(totalHours / 24);
  const hours = totalHours % 24;
  durationStr += `${days} Day(s)`;
  if (hours > 0) durationStr += ` ${hours} Hour(s)`;
}
if (totalHours === 0) durationStr = "Less than an hour";

const displayStr = `📍 ${locationParam} <span>${pickupDate} → ${dropoffDate}</span> <span class="days">${durationStr}</span>`;
rentalInfoEl.innerHTML = displayStr;

// --- VEHICLE NAME IN PLACE OF BRAND ---
document.getElementById("brand").textContent = name; // Show vehicle name where brand was
document.getElementById("name").textContent = "";    // Optionally blank the secondary field
document.getElementById("bikeImage").src = image;

const durationDisplay = document.getElementById("durationDisplay");
if (durationDisplay) {
  setDurationDisplay(pickupDate, pickupTime, dropoffDate, dropoffTime, durationDisplay);
} else {
  updateTotalAmount(pickupDate, pickupTime, dropoffDate, dropoffTime);
}

// --- TOTAL AMOUNT SECTION ---
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
    totalAmountEl.innerHTML = `<strong>Total: </strong>₹${totalAmount}`;
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

document.getElementById("submitBtn").addEventListener("click", (event) => {
  event.preventDefault(); // Just in case
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

}); // End DOMContentLoaded