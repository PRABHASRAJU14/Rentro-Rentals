/**
 * Rentro Rentals - Vehicle Operations & Availability Engine
 * Handles CRUD operations, filtering, sorting, and booking collision detection.
 */

const RentroVehicles = {
  getAll() {
    return RentroStorage.get(RentroStorage.KEYS.VEHICLES) || [];
  },

  getById(id) {
    const list = this.getAll();
    return list.find(v => v.id === id) || null;
  },

  getByProvider(providerId) {
    const list = this.getAll();
    return list.filter(v => v.providerId === providerId);
  },

  saveAll(vehicles) {
    return RentroStorage.set(RentroStorage.KEYS.VEHICLES, vehicles);
  },

  // Check if a vehicle is available for a specific date/time window
  checkAvailability(vehicleId, pickupDate, pickupTime, returnDate, returnTime) {
    const vehicle = this.getById(vehicleId);
    if (!vehicle) {
      return { available: false, reason: 'Vehicle does not exist.' };
    }

    if (!vehicle.available) {
      return { available: false, reason: 'Vehicle is currently taken offline by the owner.' };
    }

    // If dates are not provided, only general availability applies
    if (!pickupDate || !returnDate) {
      return { available: true };
    }

    const requestedStart = new Date(`${pickupDate}T${pickupTime || '10:00'}`);
    const requestedEnd = new Date(`${returnDate}T${returnTime || '18:00'}`);

    if (isNaN(requestedStart.getTime()) || isNaN(requestedEnd.getTime()) || requestedEnd <= requestedStart) {
      return { available: false, reason: 'Invalid date/time range provided.' };
    }

    // Check all existing bookings for this vehicle
    const allBookings = RentroStorage.get(RentroStorage.KEYS.BOOKINGS) || [];
    const activeBookings = allBookings.filter(b => 
      b.vehicleId === vehicleId &&
      b.bookingStatus !== 'Cancelled' &&
      b.bookingStatus !== 'Rejected' &&
      b.bookingStatus !== 'Completed'
    );

    for (const b of activeBookings) {
      const bStart = new Date(`${b.pickupDate}T${b.pickupTime || '10:00'}`);
      const bEnd = new Date(`${b.returnDate}T${b.returnTime || '18:00'}`);

      // Overlap condition: (StartA < EndB) and (EndA > StartB)
      if (requestedStart < bEnd && requestedEnd > bStart) {
        return {
          available: false,
          reason: `Reserved from ${RentroUtils.formatDateTime(b.pickupDate, b.pickupTime)} to ${RentroUtils.formatDateTime(b.returnDate, b.returnTime)}`,
          conflictingBookingId: b.id
        };
      }
    }

    return { available: true };
  },

  // Advanced Filtering and Sorting Engine
  filterAndSort(filters = {}) {
    let vehicles = this.getAll();

    // 1. City Filter (Case-insensitive substring match or exact match)
    if (filters.city && filters.city !== 'all') {
      const targetCity = filters.city.trim().toLowerCase();
      vehicles = vehicles.filter(v => v.city.toLowerCase().includes(targetCity) || targetCity.includes(v.city.toLowerCase()));
    }

    // 2. Category Filter
    if (filters.category && filters.category !== 'all') {
      vehicles = vehicles.filter(v => v.category.toLowerCase() === filters.category.toLowerCase());
    }

    // 3. Brand Filter
    if (filters.brand && filters.brand !== 'all') {
      vehicles = vehicles.filter(v => v.brand.toLowerCase() === filters.brand.toLowerCase());
    }

    // 4. Transmission
    if (filters.transmission && filters.transmission !== 'all') {
      vehicles = vehicles.filter(v => v.transmission.toLowerCase() === filters.transmission.toLowerCase());
    }

    // 5. Fuel Type
    if (filters.fuelType && filters.fuelType !== 'all') {
      vehicles = vehicles.filter(v => v.fuelType.toLowerCase() === filters.fuelType.toLowerCase());
    }

    // 6. Price Range
    if (filters.minPrice !== undefined && filters.minPrice !== null && filters.minPrice !== '') {
      vehicles = vehicles.filter(v => v.pricePerDay >= Number(filters.minPrice));
    }
    if (filters.maxPrice !== undefined && filters.maxPrice !== null && filters.maxPrice !== '') {
      vehicles = vehicles.filter(v => v.pricePerDay <= Number(filters.maxPrice));
    }

    // 7. General Availability Filter
    if (filters.availabilityOnly) {
      vehicles = vehicles.filter(v => v.available);
    }

    // 8. Search Query (Name, Model, Location)
    if (filters.searchQuery) {
      const q = filters.searchQuery.trim().toLowerCase();
      vehicles = vehicles.filter(v => 
        v.name.toLowerCase().includes(q) ||
        v.brand.toLowerCase().includes(q) ||
        v.model.toLowerCase().includes(q) ||
        v.location.toLowerCase().includes(q)
      );
    }

    // 9. Sorting
    const sort = filters.sort || 'recommended';
    switch (sort) {
      case 'price-asc':
        vehicles.sort((a, b) => a.pricePerDay - b.pricePerDay);
        break;
      case 'price-desc':
        vehicles.sort((a, b) => b.pricePerDay - a.pricePerDay);
        break;
      case 'rating':
        vehicles.sort((a, b) => (b.rating || 0) - (a.rating || 0));
        break;
      case 'name':
        vehicles.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'recommended':
      default:
        // Prioritize available high-rated vehicles
        vehicles.sort((a, b) => (b.rating * 10 + (b.available ? 50 : 0)) - (a.rating * 10 + (a.available ? 50 : 0)));
        break;
    }

    return vehicles;
  },

  // Add new vehicle listing
  add(vehicleData) {
    const list = this.getAll();
    const newVehicle = {
      id: RentroUtils.generateId('VEH'),
      providerId: vehicleData.providerId,
      name: vehicleData.name.trim(),
      brand: vehicleData.brand.trim(),
      model: vehicleData.model ? vehicleData.model.trim() : vehicleData.name.trim(),
      regNumber: vehicleData.regNumber ? vehicleData.regNumber.toUpperCase().trim() : 'AP 39 XX 0000',
      category: vehicleData.category || 'Scooter',
      city: vehicleData.city.trim(),
      location: vehicleData.location.trim(),
      pricePerHour: Number(vehicleData.pricePerHour) || 45,
      pricePerDay: Number(vehicleData.pricePerDay) || 400,
      securityDeposit: Number(vehicleData.securityDeposit) || 500,
      fuelType: vehicleData.fuelType || 'Petrol',
      transmission: vehicleData.transmission || 'Automatic',
      mileage: vehicleData.mileage || '45 km/l',
      seatingCapacity: Number(vehicleData.seatingCapacity) || 2,
      description: vehicleData.description || 'Reliable and well-maintained vehicle for hassle-free rides.',
      available: vehicleData.available !== undefined ? vehicleData.available : true,
      rating: 5.0,
      reviewCount: 1,
      images: vehicleData.images && vehicleData.images.length > 0 ? vehicleData.images : ['images/honda activa 6g.png'],
      features: vehicleData.features || ['Sanitized Helmet', 'Full Tank Available', '24/7 Roadside Assistance'],
      createdAt: new Date().toISOString()
    };

    list.unshift(newVehicle);
    this.saveAll(list);
    return newVehicle;
  },

  // Update existing vehicle
  update(id, updatedFields) {
    const list = this.getAll();
    const index = list.findIndex(v => v.id === id);
    if (index === -1) return null;

    list[index] = { ...list[index], ...updatedFields };
    this.saveAll(list);
    return list[index];
  },

  // Delete vehicle (safely preserves past booking records)
  delete(id) {
    const list = this.getAll();
    const filtered = list.filter(v => v.id !== id);
    this.saveAll(filtered);
    return true;
  },

  // Toggle availability state
  toggleStatus(id) {
    const v = this.getById(id);
    if (!v) return null;
    return this.update(id, { available: !v.available });
  }
};

window.RentroVehicles = RentroVehicles;
