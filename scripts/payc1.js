// payc1.js

function getQueryParams() {
  return new URLSearchParams(window.location.search);
}

function goBack() {
  // Go back to payment page with all query params intact
  const params = window.location.search;
  window.location.href = 'payment.html' + params;
}

document.addEventListener("DOMContentLoaded", () => {
  const params = getQueryParams();
  const total = params.get('total') || '0.00';

  // Update total payable amount display
  const amountText = document.querySelector('.amount-text strong');
  if (amountText) {
    amountText.textContent = `₹ ${total}`;
  }

  // Attach goBack function to all back arrows
  document.querySelectorAll('.back-arrow, .inner-back-arrow').forEach(el => {
    el.addEventListener('click', goBack);
  });

  // Handle make payment button click
  const payBtn = document.querySelector('.pay-button');
  if (payBtn) {
    payBtn.addEventListener('click', () => {
      // Redirect to success page (add params if needed)
      window.location.href = 'success.html';
    });
  }
});
