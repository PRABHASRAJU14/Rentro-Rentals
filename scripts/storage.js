/**
 * Rentro Rentals - Centralized Storage & Seed Data
 * Manages localStorage synchronization, schema versioning, and initial data seeding.
 */

const RentroStorage = {
  KEYS: {
    VEHICLES: 'rentro_vehicles',
    BOOKINGS: 'rentro_bookings',
    USERS: 'rentro_users',
    CITIES: 'rentro_cities',
    CURRENT_USER: 'rentro_current_user',
    ACTIVE_SEARCH: 'rentro_active_search',
    CHECKOUT_DRAFT: 'rentro_checkout_draft',
    VERSION: 'rentro_data_version'
  },

  CURRENT_VERSION: '2.3.0',

  init() {
    const existingVersion = localStorage.getItem(this.KEYS.VERSION);
    if (!existingVersion || existingVersion !== this.CURRENT_VERSION) {
      this.seedData();
      localStorage.setItem(this.KEYS.VERSION, this.CURRENT_VERSION);
    }

    // Ensure Royal Enfield uses original cropped PNG photo in any existing stored session
    try {
      const vehicles = this.get(this.KEYS.VEHICLES);
      if (vehicles && Array.isArray(vehicles)) {
        let changed = false;
        vehicles.forEach(v => {
          if (v.id === 'VEH007' || (v.name && v.name.includes('Classic 350'))) {
            if (!v.images || !v.images[0] || v.images[0].includes('bike.png') || v.images[0].endsWith('.jpg')) {
              v.images = ['images/royal enfield classic 350.png'];
              changed = true;
            }
          }
        });
        if (changed) {
          this.set(this.KEYS.VEHICLES, vehicles);
        }
      }
    } catch (e) {}
  },

  seedData() {
    // 1. Seed Cities
    const defaultCities = [
      { id: 'CITY_VIZAG', name: 'Visakhapatnam', state: 'Andhra Pradesh', popular: true, image: 'images/Vizag.png', vehicleCount: 14, tag: 'Coastal Ride Hub' },
      { id: 'CITY_VIJ', name: 'Vijayawada', state: 'Andhra Pradesh', popular: true, image: 'images/vij.png', vehicleCount: 10, tag: 'Commercial Hub' },
      { id: 'CITY_HYD', name: 'Hyderabad', state: 'Telangana', popular: true, image: 'images/hyd.png', vehicleCount: 22, tag: 'Cyber City' },
      { id: 'CITY_BLR', name: 'Bangalore', state: 'Karnataka', popular: true, image: 'images/ban.png', vehicleCount: 28, tag: 'Silicon Valley' },
      { id: 'CITY_CHN', name: 'Chennai', state: 'Tamil Nadu', popular: true, image: 'images/ch.png', vehicleCount: 16, tag: 'Marina Expressway' },
      { id: 'CITY_MUM', name: 'Mumbai', state: 'Maharashtra', popular: true, image: 'images/mum.png', vehicleCount: 25, tag: 'Financial Capital' },
      { id: 'CITY_DEL', name: 'Delhi NCR', state: 'Delhi', popular: true, image: 'images/del.png', vehicleCount: 30, tag: 'Capital Metro' },
      { id: 'CITY_PUN', name: 'Pune', state: 'Maharashtra', popular: true, image: 'images/pune.png', vehicleCount: 18, tag: 'Automobile Hub' },
      { id: 'CITY_KOL', name: 'Kolkata', state: 'West Bengal', popular: false, image: 'images/kol.png', vehicleCount: 12, tag: 'Heritage City' },
      { id: 'CITY_JAI', name: 'Jaipur', state: 'Rajasthan', popular: false, image: 'images/jai.png', vehicleCount: 11, tag: 'Pink City' },
      { id: 'CITY_AHM', name: 'Ahmedabad', state: 'Gujarat', popular: false, image: 'images/ahmedabad.png', vehicleCount: 14, tag: 'Sabarmati Hub' },
      { id: 'CITY_CBE', name: 'Coimbatore', state: 'Tamil Nadu', popular: false, image: 'images/coimbatore.png', vehicleCount: 9, tag: 'Textile Hub' },
      { id: 'CITY_LKO', name: 'Lucknow', state: 'Uttar Pradesh', popular: false, image: 'images/lucknow.png', vehicleCount: 10, tag: 'City of Nawabs' },
      { id: 'CITY_BBI', name: 'Bhubaneswar', state: 'Odisha', popular: false, image: 'images/bhubaneswar.png', vehicleCount: 8, tag: 'Smart Temple City' }
    ];
    localStorage.setItem(this.KEYS.CITIES, JSON.stringify(defaultCities));

    // 2. Seed Users
    const defaultUsers = [
      {
        id: 'USER001',
        name: 'Rahul Sharma',
        email: 'rahul@example.com',
        password: 'password123',
        phone: '9876543210',
        role: 'consumer',
        city: 'Visakhapatnam',
        avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80',
        drivingLicense: 'DL-04202100892',
        joinedDate: '2026-01-15'
      },
      {
        id: 'PROV001',
        name: 'Kiran Kumar',
        businessName: 'Coastal Wheels Fleet',
        email: 'provider@example.com',
        password: 'password123',
        phone: '9123456789',
        role: 'provider',
        city: 'Visakhapatnam',
        avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=150&q=80',
        verified: true,
        bankAccount: 'HDFC Bank - A/C No: ****4589',
        ifscCode: 'HDFC0001234',
        panNumber: 'ABCDE1234F',
        joinedDate: '2025-10-10'
      },
      {
        id: 'PROV002',
        name: 'Suresh Varma',
        businessName: 'Metro Urban Mobility',
        email: 'metro@example.com',
        password: 'password123',
        phone: '9848022338',
        role: 'provider',
        city: 'Hyderabad',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
        verified: true,
        bankAccount: 'ICICI Bank - A/C No: ****9821',
        ifscCode: 'ICIC0000456',
        panNumber: 'XYZDE5678G',
        joinedDate: '2025-11-20'
      }
    ];
    localStorage.setItem(this.KEYS.USERS, JSON.stringify(defaultUsers));

    // 3. Seed Vehicles
    const defaultVehicles = [
      {
        id: 'VEH001',
        providerId: 'PROV001',
        name: 'Honda Activa 6G BS6',
        brand: 'Honda',
        model: 'Activa 6G Smart Key Edition',
        regNumber: 'AP 39 BK 4521',
        category: 'Scooter',
        city: 'Visakhapatnam',
        location: 'Siripuram Junction, Near Tech Park',
        pricePerHour: 45,
        pricePerDay: 420,
        securityDeposit: 500,
        fuelType: 'Petrol',
        transmission: 'Automatic',
        mileage: '48 km/l',
        seatingCapacity: 2,
        description: 'Smooth, reliable, and fuel-efficient scooter with combi-brake system. Fully sanitized with 2 ISI-certified helmets included.',
        available: true,
        rating: 4.8,
        reviewCount: 42,
        images: ['images/honda activa 6g.png'],
        features: ['Smart Keyless Start', 'Combi Brake System', 'Underseat Storage', 'USB Mobile Charger'],
        createdAt: '2026-01-20'
      },
      {
        id: 'VEH002',
        providerId: 'PROV001',
        name: 'Bajaj Pulsar NS 400Z',
        brand: 'Bajaj',
        model: 'Pulsar NS 400',
        regNumber: 'AP 39 CE 9940',
        category: 'Sports Bike',
        city: 'Visakhapatnam',
        location: 'RK Beach Road, Near Coastal Hub',
        pricePerHour: 95,
        pricePerDay: 850,
        securityDeposit: 1500,
        fuelType: 'Petrol',
        transmission: 'Manual',
        mileage: '30 km/l',
        seatingCapacity: 2,
        description: 'High-performance streetfighter featuring dual-channel ABS, liquid cooling, and digital telemetry. Ideal for highway runs and Ghat trips.',
        available: true,
        rating: 4.9,
        reviewCount: 29,
        images: ['images/bajaj pulsar ns 400.png'],
        features: ['Dual-channel ABS', 'Digital Console', 'Traction Control', 'LED Projector Headlamps'],
        createdAt: '2026-02-05'
      },
      {
        id: 'VEH003',
        providerId: 'PROV001',
        name: 'Suzuki Access 125 BS6',
        brand: 'Suzuki',
        model: 'Access 125 Special Edition',
        regNumber: 'AP 39 AQ 3312',
        category: 'Scooter',
        city: 'Visakhapatnam',
        location: 'Dwaraka Nagar, RTC Complex Road',
        pricePerHour: 50,
        pricePerDay: 450,
        securityDeposit: 500,
        fuelType: 'Petrol',
        transmission: 'Automatic',
        mileage: '50 km/l',
        seatingCapacity: 2,
        description: 'Retro chrome styling combined with peppy 125cc engine and external fuel lid. Perfect for city exploring.',
        available: true,
        rating: 4.7,
        reviewCount: 35,
        images: ['images/suzuki access 125(BS6).png'],
        features: ['External Fuel Cap', 'Chrome Mirrors', 'Bluetooth Connectivity', 'Dual Luggage Hooks'],
        createdAt: '2026-01-10'
      },
      {
        id: 'VEH004',
        providerId: 'PROV001',
        name: 'TVS Jupiter 125',
        brand: 'TVS',
        model: 'Jupiter 125 Disc SmartXonnect',
        regNumber: 'AP 31 DM 7721',
        category: 'Scooter',
        city: 'Vijayawada',
        location: 'MG Road, Benz Circle',
        pricePerHour: 45,
        pricePerDay: 400,
        securityDeposit: 500,
        fuelType: 'Petrol',
        transmission: 'Automatic',
        mileage: '52 km/l',
        seatingCapacity: 2,
        description: 'Largest underseat storage in its class that fits two full-face helmets. Metal body build for supreme safety.',
        available: true,
        rating: 4.6,
        reviewCount: 19,
        images: ['images/tvs jupiter.png'],
        features: ['33L Boot Space', 'Front Fuel Fill', 'Eco / Power Indicator', 'LED Headlight'],
        createdAt: '2026-02-12'
      },
      {
        id: 'VEH005',
        providerId: 'PROV002',
        name: 'Honda Dio 125 Sport',
        brand: 'Honda',
        model: 'Dio 125 H-Smart',
        regNumber: 'TS 09 FH 6610',
        category: 'Scooter',
        city: 'Hyderabad',
        location: 'Hitec City, Cyber Towers',
        pricePerHour: 55,
        pricePerDay: 480,
        securityDeposit: 500,
        fuelType: 'Petrol',
        transmission: 'Automatic',
        mileage: '46 km/l',
        seatingCapacity: 2,
        description: 'Youthful aggressive scooter styling with dual exhaust notes and wave disc brakes. Great agility in IT corridor traffic.',
        available: true,
        rating: 4.8,
        reviewCount: 51,
        images: ['images/honda dio 125.png'],
        features: ['Sporty Graphics', 'Wave Disc Brake', 'Side Stand Engine Cut-off', 'Digital Meter'],
        createdAt: '2026-01-18'
      },
      {
        id: 'VEH006',
        providerId: 'PROV002',
        name: 'Honda Activa 5G Deluxe',
        brand: 'Honda',
        model: 'Activa 5G Deluxe',
        regNumber: 'TS 07 ED 1009',
        category: 'Scooter',
        city: 'Hyderabad',
        location: 'Gachibowli, Outer Ring Road',
        pricePerHour: 40,
        pricePerDay: 380,
        securityDeposit: 500,
        fuelType: 'Petrol',
        transmission: 'Automatic',
        mileage: '45 km/l',
        seatingCapacity: 2,
        description: 'Dependable and easy handling scooter for quick office daily commutes and errands.',
        available: true,
        rating: 4.5,
        reviewCount: 64,
        images: ['images/honda activa 5g.png'],
        features: ['Full Metal Body', 'Tubeless Tyres', 'Analog-Digital Meter', '4-in-1 Lock with Seat Opening'],
        createdAt: '2025-12-10'
      },
      {
        id: 'VEH007',
        providerId: 'PROV001',
        name: 'Royal Enfield Classic 350',
        brand: 'Royal Enfield',
        model: 'Classic 350 Stealth Black',
        regNumber: 'AP 39 KL 1902',
        category: 'Cruiser',
        city: 'Visakhapatnam',
        location: 'Gajuwaka Highway Junction',
        pricePerHour: 110,
        pricePerDay: 990,
        securityDeposit: 2000,
        fuelType: 'Petrol',
        transmission: 'Manual',
        mileage: '35 km/l',
        seatingCapacity: 2,
        description: 'Timeless thump and comfortable upright cruising position. Equipped with touring seats, crash guard, and mobile mount.',
        available: true,
        rating: 4.9,
        reviewCount: 78,
        images: ['images/royal enfield classic 350.png'],
        features: ['Tripper Navigation', 'Dual-Channel ABS', 'Alloy Wheels', 'Touring Seat'],
        createdAt: '2026-01-05'
      },
      {
        id: 'VEH008',
        providerId: 'PROV002',
        name: 'Ather 450X Gen 3',
        brand: 'Ather',
        model: '450X Pro Pack',
        regNumber: 'KA 03 MX 8812',
        category: 'Electric Scooter',
        city: 'Bangalore',
        location: 'Koramangala 4th Block',
        pricePerHour: 60,
        pricePerDay: 550,
        securityDeposit: 1000,
        fuelType: 'Electric',
        transmission: 'Automatic',
        mileage: '105 km/charge',
        seatingCapacity: 2,
        description: 'Instant torque Warp mode with Google Maps on a 7-inch touchscreen dashboard. Zero tailpipe emissions, futuristic ride.',
        available: true,
        rating: 4.9,
        reviewCount: 47,
        images: ['images/honda dio 125.png'],
        features: ['Warp Acceleration Mode', 'Touchscreen Google Maps', 'Fast Charging (1.5 km/min)', 'Reverse Assist'],
        createdAt: '2026-02-01'
      }
    ];
    localStorage.setItem(this.KEYS.VEHICLES, JSON.stringify(defaultVehicles));

    // 4. Seed Bookings
    const today = RentroUtils.getTodayDateString(0);
    const yesterday = RentroUtils.getTodayDateString(-1);
    const twoDaysAgo = RentroUtils.getTodayDateString(-3);
    const nextWeek = RentroUtils.getTodayDateString(5);

    const defaultBookings = [
      {
        id: 'BOOK-8012',
        customerId: 'USER001',
        customerName: 'Rahul Sharma',
        customerEmail: 'rahul@example.com',
        customerPhone: '9876543210',
        providerId: 'PROV001',
        vehicleId: 'VEH001',
        vehicleName: 'Honda Activa 6G BS6',
        vehicleImage: 'images/honda activa 6g.png',
        vehicleCity: 'Visakhapatnam',
        pickupLocation: 'Siripuram Junction, Near Tech Park',
        pickupDate: twoDaysAgo,
        pickupTime: '10:00',
        returnDate: yesterday,
        returnTime: '18:00',
        durationText: '1 day 8 hrs',
        totalHours: 32,
        basePrice: 840,
        taxes: 151,
        securityDeposit: 500,
        totalAmount: 991,
        paymentMethod: 'UPI (GPay / PhonePe)',
        paymentStatus: 'Paid',
        bookingStatus: 'Completed',
        createdAt: '2026-11-15T09:30:00.000Z'
      },
      {
        id: 'BOOK-8013',
        customerId: 'USER001',
        customerName: 'Rahul Sharma',
        customerEmail: 'rahul@example.com',
        customerPhone: '9876543210',
        providerId: 'PROV001',
        vehicleId: 'VEH002',
        vehicleName: 'Bajaj Pulsar NS 400Z',
        vehicleImage: 'images/bajaj pulsar ns 400.png',
        vehicleCity: 'Visakhapatnam',
        pickupLocation: 'RK Beach Road, Near Coastal Hub',
        pickupDate: today,
        pickupTime: '11:00',
        returnDate: today,
        returnTime: '20:00',
        durationText: '9 hrs',
        totalHours: 9,
        basePrice: 855,
        taxes: 154,
        securityDeposit: 1500,
        totalAmount: 1009,
        paymentMethod: 'Credit Card',
        paymentStatus: 'Paid',
        bookingStatus: 'Active',
        createdAt: '2026-11-18T08:00:00.000Z'
      },
      {
        id: 'BOOK-8014',
        customerId: 'USER002',
        customerName: 'Priya Reddy',
        customerEmail: 'priya@example.com',
        customerPhone: '9988776655',
        providerId: 'PROV001',
        vehicleId: 'VEH003',
        vehicleName: 'Suzuki Access 125 BS6',
        vehicleImage: 'images/suzuki access 125(BS6).png',
        vehicleCity: 'Visakhapatnam',
        pickupLocation: 'Dwaraka Nagar, RTC Complex Road',
        pickupDate: nextWeek,
        pickupTime: '09:00',
        returnDate: nextWeek,
        returnTime: '21:00',
        durationText: '12 hrs',
        totalHours: 12,
        basePrice: 600,
        taxes: 108,
        securityDeposit: 500,
        totalAmount: 708,
        paymentMethod: 'Debit Card',
        paymentStatus: 'Paid',
        bookingStatus: 'Pending',
        createdAt: '2026-11-18T10:15:00.000Z'
      }
    ];
    localStorage.setItem(this.KEYS.BOOKINGS, JSON.stringify(defaultBookings));

    // Default Current User (Logged in as Customer Rahul Sharma for immediate seamless testing)
    if (!localStorage.getItem(this.KEYS.CURRENT_USER)) {
      localStorage.setItem(this.KEYS.CURRENT_USER, JSON.stringify(defaultUsers[0]));
    }
  },

  // Generic Get from LocalStorage
  get(key) {
    try {
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : null;
    } catch (e) {
      console.error(`Failed to parse ${key} from localStorage:`, e);
      return null;
    }
  },

  // Generic Set to LocalStorage
  set(key, val) {
    try {
      localStorage.setItem(key, JSON.stringify(val));
      return true;
    } catch (e) {
      console.error(`Failed to write ${key} to localStorage:`, e);
      return false;
    }
  },

  // Reset all data to factory seeds
  resetAll() {
    localStorage.removeItem(this.KEYS.VERSION);
    this.seedData();
  }
};

// Initialize seed data immediately
RentroStorage.init();
window.RentroStorage = RentroStorage;
