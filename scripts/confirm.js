document.addEventListener("DOMContentLoaded", () => {
  // Check if consumer profile exists, if not redirect to profile collection
  function checkConsumerProfile() {
    const consumerProfile = JSON.parse(localStorage.getItem('consumerProfile'));
    if (!consumerProfile) {
      // Save current URL and query params to return after profile collection
      const currentUrl = window.location.href;
      const urlParams = new URLSearchParams(window.location.search);
      urlParams.set('returnUrl', 'confirm.html');
      
      window.location.href = `profile-collection.html?${urlParams.toString()}`;
      return false;
    }
    return true;
  }

  // Only proceed if profile exists
  if (!checkConsumerProfile()) {
    return;
  }

  function parseDateTime(dateStr, timeStr) {
    const [day, month, year] = dateStr.split("-").map(Number);
    const [hour, minute] = timeStr.split(":").map(Number);
    return new Date(year, month - 1, day, hour, minute);
  }

  function calculateTotalHours(start, end) {
    const diffMs = end - start;
    return Math.max(1, Math.ceil(diffMs / (1000 * 60 * 60)));
  }

  function toDDMMYYYY(str) {
    if (/^\d{4}-\d{2}-\d{2}$/.test(str)) {
      const [yyyy, mm, dd] = str.split("-");
      return `${dd}-${mm}-${yyyy}`;
    }
    return str;
  }

  const params = new URLSearchParams(window.location.search);

  const pickupDateRaw = params.get("pickupDate") || "2025-05-18";
  const dropoffDateRaw = params.get("dropoffDate") || "2025-05-20";
  const pickupTime = params.get("pickupTime") || "10:00";
  const dropoffTime = params.get("dropoffTime") || "10:00";
  const pricePerHour = parseFloat(params.get("price")) || 0;
  const location = params.get("location") || "N/A";
  const name = params.get("name") || "";
  const image = params.get("image") || "";

  const pickupDate = toDDMMYYYY(pickupDateRaw);
  const dropoffDate = toDDMMYYYY(dropoffDateRaw);

  document.getElementById("bikeImage").src = image;
  document.getElementById("bikeModel").textContent = name;
  document.getElementById("pickupDate").textContent = pickupDate;
  document.getElementById("dropoffDate").textContent = dropoffDate;
  document.getElementById("pickupTime").textContent = pickupTime;
  document.getElementById("dropoffTime").textContent = dropoffTime;
  document.getElementById("location").textContent = location;
  document.getElementById("kmIncluded").textContent = "N/A";

  const start = parseDateTime(pickupDate, pickupTime);
  const end = parseDateTime(dropoffDate, dropoffTime);
  const totalHours = calculateTotalHours(start, end);
  const totalAmount = pricePerHour * totalHours;

  document.getElementById("totalAmount").textContent = `₹${totalAmount.toFixed(2)}`;

  // Store vehicle name for success page
  localStorage.setItem('lastVehicleName', name);

  document.getElementById("pay-btn").addEventListener("click", () => {
    // Store booking details with consumer profile
    const consumerProfile = JSON.parse(localStorage.getItem('consumerProfile'));
    const bookingDetails = {
      vehicleName: name,
      vehicleImage: image,
      totalAmount: totalAmount,
      pickupDate: pickupDate,
      dropoffDate: dropoffDate,
      pickupTime: pickupTime,
      dropoffTime: dropoffTime,
      location: location,
      consumerName: consumerProfile.fullName,
      consumerEmail: consumerProfile.email,
      consumerPhone: consumerProfile.phone,
      bookingId: Date.now(),
      bookingDate: new Date().toISOString()
    };

    localStorage.setItem('currentBooking', JSON.stringify(bookingDetails));

    // Pass price and hours to payment page
    window.location.href = `payment.html?price=${pricePerHour}&hours=${totalHours}`;
  });
});