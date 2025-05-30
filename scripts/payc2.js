function getQueryParams() {
  return new URLSearchParams(window.location.search);
}

function goBack() {
  // Navigate back to payment page, preserving query parameters
  const params = window.location.search;
  window.location.href = 'payment.html' + params;
}

document.addEventListener("DOMContentLoaded", () => {
  const params = getQueryParams();
  const total = params.get('total') || '0.00';

  // Update total amount display
  const amountText = document.querySelector('.amount-text strong');
  if (amountText) {
    amountText.textContent = `₹ ${total}`;
  }

  // Handle "Make Payment" button click
  const payBtn = document.querySelector('.pay-button');
  if (payBtn) {
    payBtn.addEventListener('click', () => {
      // Redirect to success page (you can add ?total=... if needed)
      window.location.href = 'success.html';
    });
  }
});

