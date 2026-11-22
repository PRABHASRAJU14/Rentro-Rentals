/**
 * Rentro Rentals - Booking Engine & Pricing Calculations
 * Calculates rental fares, creates reservations, validates date conflicts, and tracks provider earnings.
 */

const RentroBookings = {
  getAll() {
    return RentroStorage.get(RentroStorage.KEYS.BOOKINGS) || [];
  },

  getById(id) {
    const list = this.getAll();
    return list.find(b => b.id === id) || null;
  },

  getByCustomer(customerId) {
    const list = this.getAll();
    return list.filter(b => b.customerId === customerId).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  },

  getByProvider(providerId) {
    const list = this.getAll();
    return list.filter(b => b.providerId === providerId).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  },

  saveAll(bookings) {
    return RentroStorage.set(RentroStorage.KEYS.BOOKINGS, bookings);
  },

  // Calculate pricing breakdown
  calculatePrice(vehicle, pickupDate, pickupTime, returnDate, returnTime) {
    if (!vehicle) return null;

    const duration = RentroUtils.calculateDuration(pickupDate, pickupTime, returnDate, returnTime);
    if (!duration.isValid) {
      return {
        isValid: false,
        durationText: 'Invalid duration',
        totalHours: 0,
        basePrice: 0,
        taxes: 0,
        securityDeposit: vehicle.securityDeposit || 500,
        totalAmount: 0
      };
    }

    const { hours, days, remainingHours } = duration;
    let basePrice = 0;

    if (days >= 1) {
      // Days + remaining hours (capped at day rate if hours * hourly > day rate)
      const hourlyExtra = Math.min(remainingHours * (vehicle.pricePerHour || 45), vehicle.pricePerDay || 400);
      basePrice = (days * (vehicle.pricePerDay || 400)) + hourlyExtra;
    } else {
      // Hourly, capped at day rate
      basePrice = Math.min(hours * (vehicle.pricePerHour || 45), vehicle.pricePerDay || 400);
    }

    const gstRate = 0.18; // 18% GST
    const taxes = Math.round(basePrice * gstRate);
    const securityDeposit = Number(vehicle.securityDeposit) || 500;
    const totalAmount = basePrice + taxes; // Deposit can be collected refundable or bundled

    return {
      isValid: true,
      durationText: duration.text,
      totalHours: hours,
      days: days,
      remainingHours: remainingHours,
      pricePerHour: vehicle.pricePerHour,
      pricePerDay: vehicle.pricePerDay,
      basePrice: Math.round(basePrice),
      taxes: taxes,
      securityDeposit: securityDeposit,
      totalAmount: Math.round(totalAmount),
      grandTotalWithDeposit: Math.round(totalAmount + securityDeposit)
    };
  },

  // Create new booking with collision verification
  create(bookingData) {
    // 1. Conflict verification
    const availability = RentroVehicles.checkAvailability(
      bookingData.vehicleId,
      bookingData.pickupDate,
      bookingData.pickupTime,
      bookingData.returnDate,
      bookingData.returnTime
    );

    if (!availability.available) {
      return {
        success: false,
        message: `Booking Conflict: ${availability.reason}`
      };
    }

    const newBooking = {
      id: RentroUtils.generateId('BOOK'),
      customerId: bookingData.customerId,
      customerName: bookingData.customerName || 'Customer',
      customerEmail: bookingData.customerEmail || '',
      customerPhone: bookingData.customerPhone || '',
      providerId: bookingData.providerId,
      vehicleId: bookingData.vehicleId,
      vehicleName: bookingData.vehicleName,
      vehicleImage: bookingData.vehicleImage,
      vehicleCity: bookingData.vehicleCity,
      pickupLocation: bookingData.pickupLocation,
      pickupDate: bookingData.pickupDate,
      pickupTime: bookingData.pickupTime,
      returnDate: bookingData.returnDate,
      returnTime: bookingData.returnTime,
      durationText: bookingData.durationText,
      totalHours: bookingData.totalHours,
      basePrice: bookingData.basePrice,
      taxes: bookingData.taxes,
      securityDeposit: bookingData.securityDeposit,
      totalAmount: bookingData.totalAmount,
      paymentMethod: bookingData.paymentMethod || 'Online Payment',
      paymentStatus: bookingData.paymentStatus || 'Paid',
      bookingStatus: 'Confirmed', // Confirmed immediately upon successful payment verification
      createdAt: new Date().toISOString()
    };

    const allBookings = this.getAll();
    allBookings.unshift(newBooking);
    this.saveAll(allBookings);

    return { success: true, booking: newBooking };
  },

  // Update status (e.g. Confirmed, Active, Completed, Cancelled, Rejected)
  updateStatus(bookingId, newStatus) {
    const list = this.getAll();
    const index = list.findIndex(b => b.id === bookingId);
    if (index === -1) return { success: false, message: 'Booking not found.' };

    list[index].bookingStatus = newStatus;
    this.saveAll(list);
    return { success: true, booking: list[index] };
  },

  // Provider Analytics & Earnings Engine
  getProviderAnalytics(providerId) {
    const bookings = this.getByProvider(providerId);
    const vehicles = RentroVehicles.getByProvider(providerId);

    const totalVehicles = vehicles.length;
    const activeVehicles = vehicles.filter(v => v.available).length;

    const totalBookings = bookings.length;
    const pendingBookings = bookings.filter(b => b.bookingStatus === 'Pending').length;
    const confirmedBookings = bookings.filter(b => b.bookingStatus === 'Confirmed' || b.bookingStatus === 'Active').length;
    const completedBookings = bookings.filter(b => b.bookingStatus === 'Completed').length;
    const rejectedBookings = bookings.filter(b => b.bookingStatus === 'Rejected' || b.bookingStatus === 'Cancelled').length;

    // Calculate revenue from paid bookings (Confirmed, Active, Completed)
    const validEarningBookings = bookings.filter(b => 
      b.bookingStatus === 'Completed' || b.bookingStatus === 'Active' || b.bookingStatus === 'Confirmed'
    );

    const totalEarnings = validEarningBookings.reduce((sum, b) => sum + (Number(b.basePrice) || 0), 0);

    // Current month earnings
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    const monthlyEarnings = validEarningBookings
      .filter(b => {
        const d = new Date(b.createdAt);
        return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
      })
      .reduce((sum, b) => sum + (Number(b.basePrice) || 0), 0);

    return {
      totalVehicles,
      activeVehicles,
      totalBookings,
      pendingBookings,
      confirmedBookings,
      completedBookings,
      rejectedBookings,
      totalEarnings,
      monthlyEarnings,
      recentBookings: bookings.slice(0, 8)
    };
  }
};

window.RentroBookings = RentroBookings;
