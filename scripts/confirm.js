/**
 * Rentro Rentals - Booking Confirmation & Invoice Service
 */

document.addEventListener("DOMContentLoaded", () => {
  const urlParams = new URLSearchParams(window.location.search);

  // Check if consumer profile exists, if not prompt profile collection
  function checkProfile() {
    let consumerProfile = null;
    try {
      consumerProfile = JSON.parse(localStorage.getItem("consumerProfile"));
    } catch (e) {}

    if (!consumerProfile || !consumerProfile.fullName) {
      // Auto-fallback from userProfile or userSession if available
      const legacyProfile = JSON.parse(localStorage.getItem("userProfile") || "null");
      const userSession = JSON.parse(localStorage.getItem("userSession") || "null");

      if (legacyProfile && legacyProfile.name) {
        consumerProfile = {
          fullName: legacyProfile.name,
          email: legacyProfile.email || "rider@rentro.com",
          phone: legacyProfile.phone || "+91 9876543210"
        };
        localStorage.setItem("consumerProfile", JSON.stringify(consumerProfile));
      } else if (userSession && userSession.email) {
        consumerProfile = {
          fullName: userSession.email.split("@")[0].toUpperCase(),
          email: userSession.email,
          phone: "+91 9876543210"
        };
        localStorage.setItem("consumerProfile", JSON.stringify(consumerProfile));
      } else {
        // Redirect to profile collection
        urlParams.set("returnUrl", "confirm.html");
        window.location.href = `profile-collection.html?${urlParams.toString()}`;
        return false;
      }
    }
    return consumerProfile;
  }

  const profile = checkProfile();
  if (!profile) return;

  // Extract Query Parameters
  const name = urlParams.get("name") || "Honda Activa 6G";
  const brand = urlParams.get("brand") || "Scooter";
  const image = urlParams.get("image") || "../images/honda activa 6g.png";
  const pricePerHour = parseFloat(urlParams.get("price")) || 40;
  const location = urlParams.get("location") || "VIZAG";
  const pickupDate = urlParams.get("pickupDate") || "Today";
  const pickupTime = urlParams.get("pickupTime") || "10:00";
  const dropoffDate = urlParams.get("dropoffDate") || "Tomorrow";
  const dropoffTime = urlParams.get("dropoffTime") || "18:00";
  const deliveryMode = urlParams.get("deliveryMode") || "hub";
  const hours = parseFloat(urlParams.get("hours")) || 8;
  const totalAmount = parseFloat(urlParams.get("total")) || (pricePerHour * hours);

  // Populate UI
  document.getElementById("bikeImage").src = image;
  document.getElementById("bikeModel").textContent = name;
  document.getElementById("vehicleTypeBadge").textContent = `${brand} • ${location}`;
  document.getElementById("pickupDate").textContent = pickupDate;
  document.getElementById("pickupTime").textContent = pickupTime;
  document.getElementById("dropoffDate").textContent = dropoffDate;
  document.getElementById("dropoffTime").textContent = dropoffTime;
  document.getElementById("rentalHours").textContent = `${hours} Hours`;
  document.getElementById("deliveryMode").textContent = deliveryMode === "home" ? "Doorstep Delivery" : "Hub Self-Pickup";

  // Rider info
  document.getElementById("riderName").textContent = profile.fullName;
  document.getElementById("riderContact").textContent = `${profile.phone} • ${profile.email}`;

  // Pricing
  document.getElementById("basePrice").textContent = `₹${(pricePerHour * hours).toFixed(2)}`;
  document.getElementById("totalAmount").textContent = `₹${totalAmount.toFixed(2)}`;

  // Back button
  document.getElementById("backBtn").addEventListener("click", () => {
    window.history.back();
  });

  // Proceed to Pay
  document.getElementById("pay-btn").addEventListener("click", () => {
    const bookingDetails = {
      bookingId: "RR-" + Math.floor(100000 + Math.random() * 900000),
      vehicleName: name,
      vehicleType: brand,
      vehicleImage: image,
      pricePerHour: pricePerHour,
      totalAmount: totalAmount,
      hours: hours,
      pickupDate: pickupDate,
      pickupTime: pickupTime,
      dropoffDate: dropoffDate,
      dropoffTime: dropoffTime,
      location: location,
      deliveryMode: deliveryMode,
      consumerName: profile.fullName,
      consumerEmail: profile.email,
      consumerPhone: profile.phone,
      bookingDate: new Date().toISOString()
    };

    localStorage.setItem("currentBooking", JSON.stringify(bookingDetails));
    localStorage.setItem("lastVehicleName", name);

    window.location.href = `payment.html?price=${pricePerHour}&hours=${hours}&total=${totalAmount}`;
  });
});
