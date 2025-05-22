document.addEventListener("DOMContentLoaded", () => { 
  const cityDataStr = localStorage.getItem('selectedCity');
  if (cityDataStr) {
    try {
      const cityData = JSON.parse(cityDataStr);

      const bannerImg = document.getElementById("city-banner");
      if (bannerImg && cityData.image) {
        bannerImg.src = cityData.image;
        bannerImg.alt = cityData.name;
      }

      const cityNameText = document.getElementById('city-name-text');
      if (cityNameText && cityData.name) cityNameText.textContent = cityData.name;

      const locationInput = document.getElementById('location');
      if (locationInput && cityData.name) locationInput.value = cityData.name;
    } catch (e) {
      console.warn('Error parsing selectedCity data:', e);
    }
  }

  // Update back arrow to go to city.html
document.querySelector('.back-arrow')?.addEventListener("click", (e) => {
  e.preventDefault();
  window.location.href = "city.html";
});


  const pickupDateInput = document.getElementById("pickupDate");
  const dropoffDateInput = document.getElementById("dropoffDate");
  const pickupTimeInput = document.getElementById("pickupTime");
  const dropoffTimeInput = document.getElementById("dropoffTime");

  const today = new Date().toISOString().split("T")[0];
  pickupDateInput.min = today;
  dropoffDateInput.min = today;

  pickupDateInput.addEventListener("change", () => {
    updateMinTime(pickupDateInput, pickupTimeInput);
    updateDuration();
  });

  dropoffDateInput.addEventListener("change", () => {
    updateMinTime(dropoffDateInput, dropoffTimeInput);
    updateDuration();
  });

  ["pickupDate", "pickupTime", "dropoffDate", "dropoffTime"].forEach(id => {
    document.getElementById(id).addEventListener("change", updateDuration);
  });

  document.getElementById("searchBtn").addEventListener("click", handleSearch);

  updateDuration();
});

function updateMinTime(dateInput, timeInput) {
  const selectedDate = new Date(dateInput.value);
  const now = new Date();

  if (selectedDate.toDateString() === now.toDateString()) {
    const hours = now.getHours().toString().padStart(2, "0");
    const minutes = now.getMinutes().toString().padStart(2, "0");
    timeInput.min = `${hours}:${minutes}`;
  } else {
    timeInput.removeAttribute("min");
  }
}

function updateDuration() {
  const pickupDate = document.getElementById("pickupDate").value;
  const pickupTime = document.getElementById("pickupTime").value;
  const dropoffDate = document.getElementById("dropoffDate").value;
  const dropoffTime = document.getElementById("dropoffTime").value;
  const durationDisplay = document.getElementById("duration");

  if (pickupDate && pickupTime && dropoffDate && dropoffTime) {
    const pickup = new Date(`${pickupDate}T${pickupTime}`);
    const dropoff = new Date(`${dropoffDate}T${dropoffTime}`);
    const now = new Date();

    if (pickup <= now) {
      durationDisplay.textContent = "Duration: Pickup must be in the future";
      return;
    }

    if (dropoff <= pickup) {
      durationDisplay.textContent = "Duration: Dropoff must be after pickup";
      return;
    }

    const diffMs = dropoff - pickup;
    const totalMinutes = Math.floor(diffMs / (1000 * 60));
    const days = Math.floor(totalMinutes / (60 * 24));
    const hours = Math.floor((totalMinutes % (60 * 24)) / 60);
    const minutes = totalMinutes % 60;

    let durationStr = "Duration: ";
    if (days > 0) durationStr += `${days} Day${days > 1 ? 's' : ''} `;
    if (hours > 0) durationStr += `${hours} Hour${hours > 1 ? 's' : ''} `;
    if (minutes > 0) durationStr += `${minutes} Minute${minutes > 1 ? 's' : ''}`;
    if (days === 0 && hours === 0 && minutes === 0) durationStr = "Duration: Less than a minute";

    durationDisplay.textContent = durationStr.trim();
  } else {
    durationDisplay.textContent = "Duration: ";
  }
}

function handleSearch() {
  const pickupDate = document.getElementById("pickupDate").value;
  const pickupTime = document.getElementById("pickupTime").value;
  const dropoffDate = document.getElementById("dropoffDate").value;
  const dropoffTime = document.getElementById("dropoffTime").value;
  const pickupLocation = document.getElementById("location").value.trim();

  const pickup = new Date(`${pickupDate}T${pickupTime}`);
  const dropoff = new Date(`${dropoffDate}T${dropoffTime}`);
  const now = new Date();

  if (!pickupDate || !pickupTime || !dropoffDate || !dropoffTime || !pickupLocation) {
    alert("Please fill all fields.");
    return;
  }

  if (pickup <= now) {
    alert("Pickup must be in the future.");
    return;
  }

  if (dropoff <= pickup) {
    alert("Dropoff must be after pickup.");
    return;
  }

  const params = new URLSearchParams({
    pickupDate,
    pickupTime,
    dropoffDate,
    dropoffTime,
    location: pickupLocation
  });

  sessionStorage.setItem("vehicleFormData", JSON.stringify(Object.fromEntries(params.entries())));
  window.location.href = `vehicle.html?${params.toString()}`;
}
