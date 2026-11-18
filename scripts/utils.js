/**
 * Rentro Rentals - Utility Functions
 * Core helpers for date calculations, currency formatting, toasts, modals, and path resolution.
 */

const RentroUtils = {
  // Determine if current page is in /html/ directory or root
  isSubDir() {
    return window.location.pathname.includes('/html/');
  },

  // Resolve asset path based on current page depth
  resolvePath(path) {
    if (!path) return '';
    if (path.startsWith('http://') || path.startsWith('https://') || path.startsWith('data:')) {
      return path;
    }
    const cleanPath = path.replace(/^(\.\.\/)+/, '').replace(/^\//, '');
    return this.isSubDir() ? `../${cleanPath}` : cleanPath;
  },

  // Format currency into Indian Rupee format
  formatCurrency(amount) {
    const num = Number(amount) || 0;
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(num);
  },

  // Generate unique IDs
  generateId(prefix = 'ID') {
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `${prefix}-${timestamp}-${random}`;
  },

  // Calculate rental duration in days and hours
  calculateDuration(pickupDate, pickupTime, returnDate, returnTime) {
    if (!pickupDate || !returnDate) return { hours: 0, days: 0, text: '0 hrs', isValid: false };

    const pTime = pickupTime || '10:00';
    const rTime = returnTime || '18:00';

    const start = new Date(`${pickupDate}T${pTime}`);
    const end = new Date(`${returnDate}T${rTime}`);

    if (isNaN(start.getTime()) || isNaN(end.getTime()) || end <= start) {
      return { hours: 0, days: 0, text: 'Invalid duration', isValid: false };
    }

    const diffMs = end - start;
    const totalHours = Math.ceil(diffMs / (1000 * 60 * 60));
    const days = Math.floor(totalHours / 24);
    const remainingHours = totalHours % 24;

    let text = '';
    if (days > 0 && remainingHours > 0) {
      text = `${days} day${days > 1 ? 's' : ''} ${remainingHours} hr${remainingHours > 1 ? 's' : ''}`;
    } else if (days > 0) {
      text = `${days} day${days > 1 ? 's' : ''}`;
    } else {
      text = `${totalHours} hr${totalHours > 1 ? 's' : ''}`;
    }

    return {
      hours: totalHours,
      days: days,
      remainingHours: remainingHours,
      text: text,
      isValid: true,
      startDate: start,
      endDate: end
    };
  },

  // Format Date for display (e.g., "18 Nov 2026, 10:00 AM")
  formatDateTime(dateStr, timeStr) {
    if (!dateStr) return 'N/A';
    const time = timeStr || '10:00';
    const d = new Date(`${dateStr}T${time}`);
    if (isNaN(d.getTime())) return `${dateStr} ${time}`;
    return d.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  },

  formatDateOnly(dateStr) {
    if (!dateStr) return 'N/A';
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  },

  // Get current date string formatted as YYYY-MM-DD
  getTodayDateString(offsetDays = 0) {
    const d = new Date();
    d.setDate(d.getDate() + offsetDays);
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  },

  // Toast Notification System
  showToast(message, type = 'info', duration = 3500) {
    let container = document.getElementById('rentro-toast-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'rentro-toast-container';
      container.className = 'rentro-toast-container';
      document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = `rentro-toast rentro-toast-${type}`;

    let iconSvg = '';
    if (type === 'success') {
      iconSvg = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>`;
    } else if (type === 'error') {
      iconSvg = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>`;
    } else if (type === 'warning') {
      iconSvg = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>`;
    } else {
      iconSvg = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>`;
    }

    toast.innerHTML = `
      <div class="toast-icon">${iconSvg}</div>
      <div class="toast-message">${message}</div>
      <button class="toast-close" aria-label="Close">&times;</button>
    `;

    toast.querySelector('.toast-close').addEventListener('click', () => {
      toast.classList.add('hide');
      setTimeout(() => toast.remove(), 300);
    });

    container.appendChild(toast);

    setTimeout(() => {
      if (toast.parentElement) {
        toast.classList.add('hide');
        setTimeout(() => toast.remove(), 300);
      }
    }, duration);
  },

  // Modal Dialog System (Confirm / Alert)
  confirmModal({ title, message, confirmText = 'Confirm', cancelText = 'Cancel', type = 'primary' }) {
    return new Promise((resolve) => {
      const modalBackdrop = document.createElement('div');
      modalBackdrop.className = 'rentro-modal-backdrop';

      modalBackdrop.innerHTML = `
        <div class="rentro-modal-card">
          <div class="modal-header">
            <h3>${title || 'Confirm Action'}</h3>
            <button class="modal-close-btn">&times;</button>
          </div>
          <div class="modal-body">
            <p>${message}</p>
          </div>
          <div class="modal-footer">
            <button class="btn btn-secondary modal-cancel-btn">${cancelText}</button>
            <button class="btn btn-${type === 'danger' ? 'danger' : 'primary'} modal-confirm-btn">${confirmText}</button>
          </div>
        </div>
      `;

      document.body.appendChild(modalBackdrop);

      const close = (result) => {
        modalBackdrop.classList.add('fade-out');
        setTimeout(() => {
          modalBackdrop.remove();
          resolve(result);
        }, 200);
      };

      modalBackdrop.querySelector('.modal-close-btn').addEventListener('click', () => close(false));
      modalBackdrop.querySelector('.modal-cancel-btn').addEventListener('click', () => close(false));
      modalBackdrop.querySelector('.modal-confirm-btn').addEventListener('click', () => close(true));
      modalBackdrop.addEventListener('click', (e) => {
        if (e.target === modalBackdrop) close(false);
      });
    });
  },

  // Initialize Lucide icons if loaded
  initIcons() {
    if (window.lucide && typeof window.lucide.createIcons === 'function') {
      window.lucide.createIcons();
    }
  }
};

window.RentroUtils = RentroUtils;
