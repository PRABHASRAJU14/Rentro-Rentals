// success.js

// Function to get URL parameters by name
function getParam(name) {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get(name);
}

// On page load, update main scooter image and name if provided
window.addEventListener('DOMContentLoaded', () => {
  const scooterName = getParam('scooterName');
  const scooterImage = getParam('scooterImage');

  if (scooterName) {
    const scooterNameElem = document.querySelector('.main-scooter p strong');
    const scooterModelElem = document.querySelector('.main-scooter p');
    if (scooterNameElem && scooterModelElem) {
      // If scooterName contains brand and model separated by a space, split it
      const parts = scooterName.split(' ');
      scooterNameElem.textContent = parts[0] || scooterName; // Brand (first word)
      scooterModelElem.textContent = scooterName; // Full name
    }
  }

  if (scooterImage) {
    const scooterImgElem = document.querySelector('.main-scooter img');
    if (scooterImgElem) {
      scooterImgElem.src = scooterImage;
      scooterImgElem.alt = scooterName || 'Selected Scooter';
    }
  }
});

// Back arrow click handler (optional if you want JS instead of inline HTML)
document.querySelector('.back-arrow').addEventListener('click', () => {
  window.location.href = 'vehicle.html';
});
