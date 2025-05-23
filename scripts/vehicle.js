const scooters = [ 
  {
    name: "TVS Jupiter",
    image: "../images/tvs jupiter.png",
    price: "₹180 (50 km included)"
  },
  {
    name: "Honda Activa 6G",
    image: "../images/honda activa 6g.png",
    price: "₹100 (80 km included)"
  },
  {
    name: "Honda Dio 125",
    image: "../images/honda dio 125.png",
    price: "₹552 (120 km included)"
  },
  {
    name: "Suzuki Access 125 (BS6)",
    image: "../images/suzuki access 125(BS6).png",
    price: "₹150 (120 km included)"
  },
  {
    name: "Honda Activa 5G",
    image: "../images/honda activa 5g.png",
    price: "₹300 (100 km included)"
  }
];

// Read URL parameters initially
const params = new URLSearchParams(window.location.search);
let pickupLocation = params.get("location") || "N/A";
let pickupDate = params.get("pickupDate") || "N/A";
let pickupTime = params.get("pickupTime") || "N/A";
let dropoffDate = params.get("dropoffDate") || "N/A";
let dropoffTime = params.get("dropoffTime") || calculateDropoffTime(pickupTime);

// Format pickup and dropoff dates
pickupDate = formatDate(pickupDate);
dropoffDate = formatDate(dropoffDate);

// On DOM ready, try to load saved form data, set back link and render scooters
document.addEventListener("DOMContentLoaded", () => {
  // Check sessionStorage for saved data from confirm page
  const storedFormData = sessionStorage.getItem("vehicleFormData");
  if (storedFormData) {
    try {
      const data = JSON.parse(storedFormData);
      if (data.pickupDate) pickupDate = formatDate(data.pickupDate);
      if (data.pickupTime) pickupTime = data.pickupTime;
      if (data.dropoffDate) dropoffDate = formatDate(data.dropoffDate);
      if (data.dropoffTime) dropoffTime = data.dropoffTime;
      if (data.location) pickupLocation = data.location;
    } catch (e) {
      console.warn("Failed to parse vehicleFormData from sessionStorage", e);
    }
  }

  // Set back link to preserve search inputs
  const backLink = document.getElementById("backLink");
  if (backLink) {
    backLink.href = `search.html?pickupDate=${encodeURIComponent(pickupDate)}&pickupTime=${encodeURIComponent(pickupTime)}&dropoffDate=${encodeURIComponent(dropoffDate)}&dropoffTime=${encodeURIComponent(dropoffTime)}&location=${encodeURIComponent(pickupLocation)}`;
  }

  // Render the scooters list
  displayScooters();
});

// Render scooter cards dynamically
function displayScooters() {
  const container = document.getElementById("scooter-container");
  container.innerHTML = ""; // Clear previous content if any

  scooters.forEach((scooter) => {
    const formattedPickupDate = pickupDate;
    const formattedDropDate = dropoffDate;

    const card = document.createElement("div");
    card.className = "card";

    const urlParams = new URLSearchParams({
      name: scooter.name,
      image: scooter.image,
      price: scooter.price,
      location: pickupLocation,
      pickupDate: formattedPickupDate,
      pickupTime: pickupTime,
      dropoffDate: formattedDropDate,
      dropoffTime: dropoffTime,
    });

    card.innerHTML = `
      <h2>${scooter.name}</h2>
      <img src="${scooter.image}" alt="${scooter.name}" class="scooter-img"/>
      <div class="location-name"><strong>Location:</strong> ${pickupLocation}</div>
      <div class="time-row">
        <div class="time-block">
          <div class="time">${pickupTime}</div>
          <div class="date">${formattedPickupDate}</div>
        </div>
        <div class="to-circle">to</div>
        <div class="time-block">
          <div class="time">${dropoffTime}</div>
          <div class="date">${formattedDropDate}</div>
        </div>
      </div>
      <div class="bottom-row">
        <div class="price">
          ₹ <strong>${scooter.price.split(" ")[0].replace("₹", "")}</strong><br>
          <small>${scooter.price.split(" ").slice(1).join(" ")}</small>
        </div>
        <button class="book-btn"
          onclick="window.location.href='del.html?${urlParams.toString()}'">
          Book
        </button>
      </div>
    `;

    container.appendChild(card);
  });
}

// Helper: Format date to DD-MM-YYYY
function formatDate(dateStr) {
  if (!dateStr || isNaN(Date.parse(dateStr))) return "N/A";
  const date = new Date(dateStr);
  const day = date.getDate().toString().padStart(2, "0");
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const year = date.getFullYear();
  return `${day}-${month}-${year}`;
}

// Calculate dropoff time (default +1h30m)
function calculateDropoffTime(pickupTimeStr) {
  if (!pickupTimeStr || pickupTimeStr === "N/A") return "00:00";
  const [hourStr, minuteStr] = pickupTimeStr.split(":");
  let hour = parseInt(hourStr, 10);
  const minute = parseInt(minuteStr, 10);

  let totalMinutes = hour * 60 + minute + 90;
  totalMinutes = totalMinutes % (24 * 60);

  const adjustedHour = Math.floor(totalMinutes / 60);
  const adjustedMinute = totalMinutes % 60;

  return `${adjustedHour.toString().padStart(2, '0')}:${adjustedMinute.toString().padStart(2, '0')}`;
}
