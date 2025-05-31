const params = new URLSearchParams(window.location.search);
let pickupLocation = params.get("location") || "N/A";
let pickupDate = params.get("pickupDate") || "N/A";
let pickupTime = params.get("pickupTime") || "N/A";
let dropoffDate = params.get("dropoffDate") || "N/A";
let dropoffTime = params.get("dropoffTime") || calculateDropoffTime(pickupTime);

pickupDate = formatDate(pickupDate);
dropoffDate = formatDate(dropoffDate);

document.addEventListener("DOMContentLoaded", () => {
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
      console.warn("Failed to parse vehicleFormData", e);
    }
  }

  populateLocationDropdown();
  renderVehicles(pickupLocation);

  document.getElementById("backBtn").addEventListener("click", () => {
    window.location.href = `search.html?pickupDate=${encodeURIComponent(pickupDate)}&pickupTime=${encodeURIComponent(pickupTime)}&dropoffDate=${encodeURIComponent(dropoffDate)}&dropoffTime=${encodeURIComponent(dropoffTime)}&location=${encodeURIComponent(pickupLocation)}`;
  });

  document.getElementById("locationSelect").addEventListener("change", (e) => {
    pickupLocation = e.target.value;
    renderVehicles(pickupLocation);
  });
});

function populateLocationDropdown() {
  const select = document.getElementById("locationSelect");
  select.innerHTML = ""; // Clear old options

  const storedVehicles = JSON.parse(localStorage.getItem("vehicles")) || [];
  let uniqueLocations = [...new Set(storedVehicles.map(v => v.location).filter(Boolean))];

  uniqueLocations = uniqueLocations.filter(
    loc => loc.toLowerCase() !== (pickupLocation || "").toLowerCase()
  );

  if (pickupLocation && pickupLocation !== "N/A") {
    const firstOption = document.createElement("option");
    firstOption.value = pickupLocation;
    firstOption.textContent = pickupLocation;
    firstOption.selected = true;
    select.appendChild(firstOption);
  }

  uniqueLocations.forEach(loc => {
    const option = document.createElement("option");
    option.value = loc;
    option.textContent = loc;
    select.appendChild(option);
  });
}

function parseDateTime(dateStr, timeStr) {
  if (!dateStr || !timeStr || dateStr === "N/A" || timeStr === "N/A") return null;
  const [day, month, year] = dateStr.split("-").map(Number);
  const [hour, minute] = timeStr.split(":").map(Number);
  return new Date(year, month - 1, day, hour, minute);
}

function calculateTotalHours(startDateStr, startTimeStr, endDateStr, endTimeStr) {
  const start = parseDateTime(startDateStr, startTimeStr);
  const end = parseDateTime(endDateStr, endTimeStr);
  if (!start || !end) return 0;
  let diffMs = end - start;
  if (diffMs < 0) diffMs = 0;
  const totalHours = diffMs / (1000 * 60 * 60);
  return Math.ceil(totalHours);
}

function renderVehicles(location) {
  const container = document.getElementById("vehicles-container");
  container.innerHTML = "";

  const storedVehicles = JSON.parse(localStorage.getItem("vehicles")) || [];
  const filtered = storedVehicles.filter(
    v => v.location && v.location.toLowerCase() === location.toLowerCase()
  );

  const types = ["Scooter", "Bike", "Bicycle", "Car"];
  const grouped = {};

  types.forEach(type => {
    grouped[type] = filtered.filter(
      v => v.type && v.type.toLowerCase() === type.toLowerCase()
    );
  });

  let hasVehicles = false;

  types.forEach(type => {
    const vehicles = grouped[type];
    if (vehicles.length > 0) {
      hasVehicles = true;
      const groupDiv = document.createElement("div");
      groupDiv.className = "vehicle-group";

      const heading = document.createElement("h2");
      heading.textContent = type + "s";
      groupDiv.appendChild(heading);

      vehicles.forEach((vehicle, index) => {
        const card = document.createElement("div");
        card.className = "card fade-in";
        card.style.animationDelay = `${index * 0.1}s`;

        let totalAmount = "-";
        let totalAmountNumber = 0;
        if (
          vehicle.price &&
          !isNaN(Number(vehicle.price)) &&
          pickupDate !== "N/A" && pickupTime !== "N/A" &&
          dropoffDate !== "N/A" && dropoffTime !== "N/A"
        ) {
          const totalHours = calculateTotalHours(
            pickupDate,
            pickupTime,
            dropoffDate,
            dropoffTime
          );
          totalAmountNumber = Number(vehicle.price) * totalHours;
          totalAmount = "₹" + totalAmountNumber;
        }

        const urlParams = new URLSearchParams({
          name: vehicle.name,
          image: vehicle.image,
          price: vehicle.price,
          location: location,
          pickupDate,
          pickupTime,
          dropoffDate,
          dropoffTime,
          total: totalAmountNumber
        });

        card.innerHTML = `
          <h3>${vehicle.name}</h3>
          <img src="${vehicle.image}" alt="${vehicle.name}" class="scooter-img"/>
          <div class="location-name"><strong>Location:</strong> ${location}</div>
          <div class="time-row">
            <div class="time-block">
              <div class="time">${pickupTime}</div>
              <div class="date">${pickupDate}</div>
            </div>
            <div class="to-circle">to</div>
            <div class="time-block">
              <div class="time">${dropoffTime}</div>
              <div class="date">${dropoffDate}</div>
            </div>
          </div>
          <div class="price">₹ <strong>${Number(vehicle.price).toFixed(2)}</strong> <span class="per-hour">/hr</span></div>
          <div class="card-bottom">
            <div class="total-amount">
              <strong>Total: </strong>
              <span>${totalAmount}</span>
            </div>
            <button class="book-btn" onclick="window.location.href='del.html?${urlParams.toString()}'">Book</button>
          </div>
        `;
        groupDiv.appendChild(card);
      });

      container.appendChild(groupDiv);
    }
  });

  if (!hasVehicles) {
    container.innerHTML = `<p class="no-vehicles">🚫 No vehicles available in <strong>${location}</strong>.</p>`;
  }
}

function formatDate(dateString) {
  if (!dateString || dateString === "N/A") return "N/A";
  const d = new Date(dateString);
  if (isNaN(d.getTime())) return dateString;
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = d.getFullYear();
  return `${day}-${month}-${year}`;
}

function calculateDropoffTime(pickupTime) {
  if (!pickupTime || !/^\d{2}:\d{2}$/.test(pickupTime)) return pickupTime;
  let [hours, minutes] = pickupTime.split(":").map(Number);
  hours += 2;
  if (hours >= 24) hours -= 24;
  return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}`;
}
