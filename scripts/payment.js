/**
 * Rentro Rentals - Payment Processing & Order Placement
 */

document.addEventListener("DOMContentLoaded", () => {
  const params = new URLSearchParams(window.location.search);
  const currentBooking = JSON.parse(localStorage.getItem("currentBooking") || "{}");
  
  const total = parseFloat(params.get("total")) || currentBooking.totalAmount || 0;
  const price = parseFloat(params.get("price")) || currentBooking.pricePerHour || 0;
  const hours = parseFloat(params.get("hours")) || currentBooking.hours || 0;

  // Display Total
  const totalDisplay = document.getElementById("payableAmount");
  if (totalDisplay) {
    totalDisplay.textContent = `₹${Number(total).toFixed(2)}`;
  }

  // Setup Back Button
  const backBtn = document.getElementById("backBtn");
  if (backBtn) {
    backBtn.addEventListener("click", () => window.history.back());
  }

  // Payment Method Tab Switching
  const methodItems = document.querySelectorAll(".payment-method-item");
  const tabContents = document.querySelectorAll(".payment-tab-content");

  methodItems.forEach(item => {
    item.addEventListener("click", () => {
      const tabTarget = item.getAttribute("data-tab");

      methodItems.forEach(m => m.classList.remove("active"));
      tabContents.forEach(t => t.classList.remove("active"));

      item.classList.add("active");
      const targetContent = document.getElementById(tabTarget);
      if (targetContent) targetContent.classList.add("active");
    });
  });

  // Card Live Preview Updates
  const cardNumInput = document.getElementById("cardNumber");
  const cardNameInput = document.getElementById("cardHolder");
  const cardExpiryInput = document.getElementById("cardExpiry");
  const visualCardNum = document.getElementById("visualCardNumber");
  const visualCardName = document.getElementById("visualCardHolder");
  const visualCardExp = document.getElementById("visualCardExpiry");

  if (cardNumInput && visualCardNum) {
    cardNumInput.addEventListener("input", (e) => {
      let val = e.target.value.replace(/\D/g, "").slice(0, 16);
      val = val.replace(/(\d{4})/g, "$1 ").trim();
      e.target.value = val;
      visualCardNum.textContent = val || "•••• •••• •••• 4242";
    });
  }

  if (cardNameInput && visualCardName) {
    cardNameInput.addEventListener("input", (e) => {
      visualCardName.textContent = e.target.value.toUpperCase() || "CARD HOLDER";
    });
  }

  if (cardExpiryInput && visualCardExp) {
    cardExpiryInput.addEventListener("input", (e) => {
      let val = e.target.value.replace(/\D/g, "").slice(0, 4);
      if (val.length >= 2) val = val.slice(0, 2) + "/" + val.slice(2);
      e.target.value = val;
      visualCardExp.textContent = val || "MM/YY";
    });
  }

  // Execute Order Placement
  const payBtn = document.getElementById("finalPayBtn");
  if (payBtn) {
    payBtn.addEventListener("click", () => {
      payBtn.disabled = true;
      payBtn.innerHTML = `<i class="fas fa-spinner fa-spin"></i> Processing Securely...`;

      setTimeout(() => {
        finalizeBooking(total);
      }, 1200);
    });
  }
});

function finalizeBooking(totalAmount) {
  const currentBooking = JSON.parse(localStorage.getItem("currentBooking") || "{}");
  const consumerProfile = JSON.parse(localStorage.getItem("consumerProfile") || "{}");

  const bookingId = currentBooking.bookingId || ("RR-" + Math.floor(100000 + Math.random() * 900000));
  const vehicleName = currentBooking.vehicleName || "Honda Activa 6G";
  const vehicleImage = currentBooking.vehicleImage || "../images/bike.png";
  const vehicleType = currentBooking.vehicleType || "Scooter";
  const pickupDate = currentBooking.pickupDate || "Today";
  const dropoffDate = currentBooking.dropoffDate || "Tomorrow";
  const location = currentBooking.location || "VIZAG";
  const customerName = consumerProfile.fullName || currentBooking.consumerName || "Valued Rider";
  const customerPhone = consumerProfile.phone || currentBooking.consumerPhone || "+91 9876543210";
  const customerEmail = consumerProfile.email || currentBooking.consumerEmail || "rider@rentro.com";

  // 1. Save to Provider Bookings
  const bookings = JSON.parse(localStorage.getItem("bookings") || "[]");
  const newBooking = {
    id: bookingId,
    vehicleName,
    vehicleType,
    price: Number(totalAmount),
    image: vehicleImage,
    customerName,
    customerPhone,
    customerEmail,
    location,
    date: new Date().toLocaleDateString("en-IN")
  };
  bookings.unshift(newBooking);
  localStorage.setItem("bookings", JSON.stringify(bookings));

  // 2. Save to Consumer Orders
  const myOrders = JSON.parse(localStorage.getItem("myOrders") || "[]");
  const orderRecord = {
    id: bookingId,
    name: vehicleName,
    brand: vehicleType,
    image: vehicleImage,
    rent: `₹${Number(totalAmount).toFixed(0)}`,
    location,
    dates: `${pickupDate} → ${dropoffDate}`,
    orderDate: new Date().toLocaleDateString("en-IN"),
    status: "Active / Confirmed"
  };
  myOrders.unshift(orderRecord);
  localStorage.setItem("myOrders", JSON.stringify(myOrders));

  // 3. Update Last Confirmed Reference
  localStorage.setItem("lastConfirmedBooking", JSON.stringify(newBooking));

  // Navigate to Success
  window.location.href = "success.html";
}
