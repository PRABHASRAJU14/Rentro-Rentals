/**
 * Rentro Rentals - Validation Engine
 * Form validation helpers, sanitization, and input event bindings.
 */

const RentroValidator = {
  isValidEmail(email) {
    if (!email) return false;
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(String(email).toLowerCase().trim());
  },

  isValidPhone(phone) {
    if (!phone) return false;
    const clean = phone.replace(/[^0-9]/g, '');
    return clean.length === 10 || (clean.length === 11 && clean.startsWith('0')) || (clean.length === 12 && clean.startsWith('91'));
  },

  isValidCardNumber(number) {
    if (!number) return false;
    const clean = number.replace(/\s+/g, '');
    if (!/^\d{16}$/.test(clean)) return false;
    // Luhn algorithm check
    let sum = 0;
    let shouldDouble = false;
    for (let i = clean.length - 1; i >= 0; i--) {
      let digit = parseInt(clean.charAt(i), 10);
      if (shouldDouble) {
        digit *= 2;
        if (digit > 9) digit -= 9;
      }
      sum += digit;
      shouldDouble = !shouldDouble;
    }
    return sum % 10 === 0;
  },

  isValidExpiry(expiryStr) {
    if (!expiryStr) return false;
    const match = expiryStr.match(/^(\d{2})\/(\d{2})$/);
    if (!match) return false;
    const month = parseInt(match[1], 10);
    const year = parseInt(match[2], 10) + 2000;
    if (month < 1 || month > 12) return false;
    
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1;

    if (year < currentYear) return false;
    if (year === currentYear && month < currentMonth) return false;
    return true;
  },

  isValidCVV(cvv) {
    return /^\d{3,4}$/.test((cvv || '').trim());
  },

  isValidUPI(upiId) {
    if (!upiId) return false;
    return /^[a-zA-Z0-9.\-_]{2,49}@[a-zA-Z]{2,}$/.test(upiId.trim());
  },

  // Display error message under an input
  showError(inputElement, message) {
    if (!inputElement) return;
    inputElement.classList.add('input-error');
    let errorElem = inputElement.parentElement.querySelector('.field-error-msg');
    if (!errorElem) {
      errorElem = document.createElement('span');
      errorElem.className = 'field-error-msg';
      inputElement.parentElement.appendChild(errorElem);
    }
    errorElem.textContent = message;
    errorElem.style.display = 'block';
  },

  clearError(inputElement) {
    if (!inputElement) return;
    inputElement.classList.remove('input-error');
    const errorElem = inputElement.parentElement.querySelector('.field-error-msg');
    if (errorElem) {
      errorElem.textContent = '';
      errorElem.style.display = 'none';
    }
  },

  // Attach live validation formatting for credit/debit card input
  formatCardNumberInput(input) {
    if (!input) return;
    input.addEventListener('input', (e) => {
      let val = e.target.value.replace(/\D/g, '');
      val = val.substring(0, 16);
      const parts = [];
      for (let i = 0; i < val.length; i += 4) {
        parts.push(val.substring(i, i + 4));
      }
      e.target.value = parts.join(' ');
    });
  },

  formatExpiryInput(input) {
    if (!input) return;
    input.addEventListener('input', (e) => {
      let val = e.target.value.replace(/\D/g, '').substring(0, 4);
      if (val.length >= 2) {
        val = val.substring(0, 2) + '/' + val.substring(2);
      }
      e.target.value = val;
    });
  }
};

window.RentroValidator = RentroValidator;
