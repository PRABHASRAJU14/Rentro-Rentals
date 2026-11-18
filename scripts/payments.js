/**
 * Rentro Rentals - Payment & OTP Simulation Engine
 * Handles payment method routing, demo OTP generation, card validation, and transaction recording.
 */

const RentroPayments = {
  OTP_STORAGE_KEY: 'rentro_demo_otp',
  OTP_TIMESTAMP_KEY: 'rentro_otp_timestamp',

  // Save in-flight checkout draft
  saveCheckoutDraft(bookingDraft) {
    sessionStorage.setItem('rentro_checkout_draft', JSON.stringify(bookingDraft));
  },

  getCheckoutDraft() {
    try {
      const data = sessionStorage.getItem('rentro_checkout_draft');
      return data ? JSON.parse(data) : null;
    } catch (e) {
      return null;
    }
  },

  clearCheckoutDraft() {
    sessionStorage.removeItem('rentro_checkout_draft');
  },

  // Generate 6-digit Demo OTP
  generateOTP() {
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    sessionStorage.setItem(this.OTP_STORAGE_KEY, otp);
    sessionStorage.setItem(this.OTP_TIMESTAMP_KEY, Date.now().toString());
    return otp;
  },

  getCurrentOTP() {
    return sessionStorage.getItem(this.OTP_STORAGE_KEY);
  },

  // Verify entered OTP
  verifyOTP(enteredOtp) {
    const currentOtp = this.getCurrentOTP();
    if (!currentOtp) {
      return { success: false, message: 'No OTP generated or OTP has expired. Please request a new one.' };
    }

    if (enteredOtp.trim() === currentOtp.trim()) {
      // Clear OTP upon success
      sessionStorage.removeItem(this.OTP_STORAGE_KEY);
      sessionStorage.removeItem(this.OTP_TIMESTAMP_KEY);
      return { success: true };
    }

    return { success: false, message: 'Invalid OTP entered. Please check the code displayed above.' };
  },

  // Finalize booking transaction after OTP or COD confirmation
  processFinalPayment(paymentMethod) {
    const draft = this.getCheckoutDraft();
    if (!draft) {
      return { success: false, message: 'No active booking draft found. Please select a vehicle.' };
    }

    // Attach payment method
    draft.paymentMethod = paymentMethod;
    draft.paymentStatus = (paymentMethod === 'Cash on Delivery') ? 'Pending (COD)' : 'Paid (Demo Verified)';

    // Save using centralized booking engine
    const result = RentroBookings.create(draft);
    if (result.success) {
      // Store last confirmed booking for success page presentation
      sessionStorage.setItem('rentro_last_confirmed_booking', JSON.stringify(result.booking));
      this.clearCheckoutDraft();
      return { success: true, booking: result.booking };
    } else {
      return { success: false, message: result.message };
    }
  }
};

window.RentroPayments = RentroPayments;
