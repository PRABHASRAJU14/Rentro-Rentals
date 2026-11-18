/**
 * Rentro Rentals - Delivery & Fulfillment Engine
 */

document.addEventListener("DOMContentLoaded", () => {
  const params = new URLSearchParams(window.location.search);

  // Extract Query Parameters
  const name = params.get("name") || "Honda Activa 6G";
  const brand = params.get("brand") || "Scooter";
  const image = params.get("image") || "../images/honda activa 6g.png";
  const pricePerHour = parseFloat(params.get("price")) || 40;
  const location = params.get("location") || "VIZAG";
  const pickupDate = params.get("pickupDate") || "Today";
  const pickupTime = params.get("pickupTime") || "10:00";
  const dropoffDate = params.get("dropoffDate") || "Tomorrow";
  const dropoffTime = params.get("dropoffTime") || "18:00";

  // Calculate Duration and Price
  const totalHours = calculateHours(pickupDate, pickupTime, dropoffDate, dropoffTime);
  const totalAmount = parseFloat(params.get("total")) || (pricePerHour * totalHours);

  // Populate UI Fields
  document.getElementById("vehicleName").textContent = name;
  document.getElementById("vehicleType").textContent = `${brand} • ${location}`;
  document.getElementById("vehicleImage").src = image;
  document.getElementById("tripTiming").textContent = `📅 ${pickupDate} ${pickupTime} → ${dropoffDate} ${dropoffTime} (${totalHours} hrs)`;
  document.getElementById("totalPriceDisplay").textContent = `₹${totalAmount.toFixed(0)}`;

  // Set default city in address field
  document.getElementById("city").value = location;

  // Setup Back Button
  document.getElementById("backBtn").addEventListener("click", () => {
    window.history.back();
  });

  // Setup Delivery Mode Radio Toggles
  const modeRadios = document.querySelectorAll('input[name="deliveryMode"]');
  const addressSection = document.getElementById("addressSection");

  modeRadios.forEach(radio => {
    radio.addEventListener("change", () => {
      document.querySelectorAll(".mode-radio-card").forEach(c => c.classList.remove("active"));
      radio.closest(".mode-radio-card").classList.add("active");

      if (radio.value === "home") {
        addressSection.style.display = "block";
      } else {
        addressSection.style.display = "none";
      }
    });
  });

  // Setup Form Submission
  document.getElementById("continueBtn").addEventListener("click", (e) => {
    e.preventDefault();

    const selectedMode = document.querySelector('input[name="deliveryMode"]:checked').value;
    const pincode = document.getElementById("pincode").value.trim();
    const street = document.getElementById("street").value.trim();
    const city = document.getElementById("city").value.trim();
    const state = document.getElementById("state").value.trim();

    if (selectedMode === "home") {
      if (!pincode || !street || !city || !state) {
        alert("Please complete your delivery address or use 'Detect Location'.");
        return;
      }
    }

    const nextParams = new URLSearchParams({
      name,
      brand,
      image,
      price: pricePerHour,
      location,
      pickupDate,
      pickupTime,
      dropoffDate,
      dropoffTime,
      total: totalAmount,
      hours: totalHours,
      deliveryMode: selectedMode
    });

    if (selectedMode === "home") {
      nextParams.set("pincode", pincode);
      nextParams.set("street", street);
      nextParams.set("city", city);
      nextParams.set("state", state);
    }

    window.location.href = `confirm.html?${nextParams.toString()}`;
  });
});

function calculateHours(startDate, startTime, endDate, endTime) {
  try {
    const start = new Date(`${startDate}T${startTime}`);
    const end = new Date(`${endDate}T${endTime}`);
    if (isNaN(start.getTime()) || isNaN(end.getTime()) || end <= start) return 8;
    const diffMs = end - start;
    return Math.max(1, Math.ceil(diffMs / (1000 * 60 * 60)));
  } catch (e) {
    return 8;
  }
}

// GPS Location Detection via OpenStreetMap Nominatim
function detectUserLocation() {
  const msgEl = document.getElementById("gpsMessage");
  const detectBtn = document.getElementById("detectGpsBtn");

  msgEl.textContent = "Detecting your current location...";
  msgEl.className = "gps-message";
  detectBtn.disabled = true;

  if (!navigator.geolocation) {
    msgEl.textContent = "Geolocation is not supported by your browser.";
    msgEl.className = "gps-message error";
    detectBtn.disabled = false;
    return;
  }

  navigator.geolocation.getCurrentPosition(
    (position) => {
      const lat = position.coords.latitude;
      const lon = position.coords.longitude;

      fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lon}`)
        .then(res => res.json())
        .then(data => {
          const address = data.address || {};
          document.getElementById("pincode").value = address.postcode || "";
          document.getElementById("street").value = address.road || address.neighbourhood || address.suburb || "";
          document.getElementById("city").value = address.city || address.town || address.county || "";
          document.getElementById("state").value = address.state || "";

          msgEl.textContent = "✓ Location detected & address filled!";
          msgEl.className = "gps-message success";
        })
        .catch(() => {
          msgEl.textContent = "Could not fetch address details. Please fill manually.";
          msgEl.className = "gps-message error";
        })
        .finally(() => {
          detectBtn.disabled = false;
        });
    },
    (err) => {
      msgEl.textContent = "Permission denied or location unavailable.";
      msgEl.className = "gps-message error";
      detectBtn.disabled = false;
    },
    { timeout: 8000 }
  );
}
