// success.js

function getParam(name) {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get(name);
}

window.addEventListener('DOMContentLoaded', () => {
  const scooterName = getParam('scooterName');
  const scooterImage = getParam('scooterImage');

  if (scooterName) {
    const scooterNameElem = document.querySelector('.main-scooter p strong');
    const scooterModelElem = document.querySelector('.main-scooter p');
    if (scooterNameElem && scooterModelElem) {
      scooterNameElem.textContent = scooterName;
      scooterModelElem.textContent = scooterName;
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

document.querySelector('.back-arrow').addEventListener('click', () => {
  window.location.href = 'vehicle.html';
});
