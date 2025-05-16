function goBack() {
  const pickupDate = document.getElementById("pickupDate").textContent || "";
  const pickupTime = document.getElementById("pickupTime").textContent || "";
  const dropoffDate = document.getElementById("dropoffDate").textContent || "";
  const dropoffTime = document.getElementById("dropoffTime").textContent || "";
  const location = document.getElementById("location").textContent || "";

  sessionStorage.setItem("vehicleFormData", JSON.stringify({
    pickupDate,
    pickupTime,
    dropoffDate,
    dropoffTime,
    location
  }));

  window.location.href = "vehicle.html";
}

document.addEventListener("DOMContentLoaded", () => {
  console.log("Confirm page loaded");

  const params = new URLSearchParams(window.location.search);

  let name = params.get("name");
  let image = params.get("image");
  let price = params.get("price");
  let location = params.get("location");
  let pickupDate = params.get("pickupDate");
  let pickupTime = params.get("pickupTime");
  let dropoffDate = params.get("dropoffDate");
  let dropoffTime = params.get("dropoffTime");

  if (!name || !price) {
    const stored = JSON.parse(sessionStorage.getItem("bookingDetails") || "{}");
    name = name || stored.name || "Unknown";
    image = image || stored.image || "default.jpg";
    price = price || stored.price || "0.00";
    location = location || stored.location || "N/A";
    pickupDate = pickupDate || stored.pickupDate || "N/A";
    pickupTime = pickupTime || stored.pickupTime || "N/A";
    dropoffDate = dropoffDate || stored.dropoffDate || pickupDate;
    dropoffTime = dropoffTime || stored.dropoffTime || pickupTime;
  }

  const bookingDetails = {
    name,
    image,
    price,
    location,
    pickupDate,
    pickupTime,
    dropoffDate,
    dropoffTime
  };
  sessionStorage.setItem("bookingDetails", JSON.stringify(bookingDetails));
  console.log("Booking details saved to sessionStorage:", bookingDetails);

  const [brand, ...modelParts] = name.split(" ");
  const model = modelParts.join(" ");
  let kmIncluded = "N/A";
  const kmMatch = price.match(/\(([^)]+)\)/);
  if (kmMatch && kmMatch[1]) {
    kmIncluded = kmMatch[1];
  }

  document.getElementById("bikeBrand").textContent = brand;
  document.getElementById("bikeModel").textContent = model;
  document.getElementById("bikeImage").src = image;
  document.getElementById("pickupDate").textContent = pickupDate;
  document.getElementById("pickupTime").textContent = pickupTime;
  document.getElementById("dropoffDate").textContent = dropoffDate;
  document.getElementById("dropoffTime").textContent = dropoffTime;
  document.getElementById("location").textContent = location;
  document.getElementById("kmIncluded").textContent = kmIncluded;

  const formattedPrice = price.startsWith('₹') ? price : `₹${price}`;
  document.getElementById("price").textContent = formattedPrice;

  document.getElementById("pay-btn").addEventListener("click", (e) => {
    e.preventDefault();
    const encodedPrice = encodeURIComponent(formattedPrice.replace(/₹\s?/, ""));
    window.location.href = `payment.html?price=${encodedPrice}`;
  });
});
