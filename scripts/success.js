// success.js

window.addEventListener('DOMContentLoaded', () => {
  // Get booked vehicle info from localStorage
  const bookedVehicle = JSON.parse(localStorage.getItem('selectedVehicle'));

  if (bookedVehicle) {
    // Show image and alt text
    const scooterImgElem = document.querySelector('.main-scooter img');
    scooterImgElem.src = bookedVehicle.image || '../images/placeholder-bike.png';
    scooterImgElem.alt = bookedVehicle.name || 'Selected Scooter';

    // Fill in vehicle details
    document.querySelector('.vehicle-name').textContent = bookedVehicle.name || 'N/A';
    document.querySelector('.vehicle-type').textContent = `Type: ${bookedVehicle.type || 'N/A'}`;
    document.querySelector('.vehicle-price').textContent = `Price: $${bookedVehicle.price?.toFixed(2) || '0.00'}`;

    // Customer and date info
    const customerName = localStorage.getItem('customerName') || 'Guest';
    document.querySelector('.customer-name').textContent = `Customer: ${customerName}`;
    document.querySelector('.booking-date').textContent = `Date: ${new Date().toLocaleDateString()}`;

    // Save booking into localStorage bookings array
    const bookings = JSON.parse(localStorage.getItem('bookings') || '[]');

    // Prevent duplicate booking saves by checking last booking id or timestamp
    // (Optional: you can improve logic here as needed)
    if (!bookings.find(b => b.id === bookedVehicle.id)) {
      bookings.push({
        id: Date.now(),
        vehicleName: bookedVehicle.name,
        vehicleType: bookedVehicle.type,
        price: bookedVehicle.price,
        image: bookedVehicle.image,
        customerName,
        date: new Date().toLocaleDateString()
      });
      localStorage.setItem('bookings', JSON.stringify(bookings));
    }

    // Optional: clear selectedVehicle after saving booking
    // localStorage.removeItem('selectedVehicle');
  }
});

// Back arrow click handler
document.querySelector('.back-arrow').addEventListener('click', () => {
  window.location.href = 'vehicle.html';
});
