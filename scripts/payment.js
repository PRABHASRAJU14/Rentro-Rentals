document.addEventListener("DOMContentLoaded", () => {
  const params = new URLSearchParams(window.location.search);
  const price = parseFloat(params.get("price")) || 0;  // price per hour
  const hours = parseFloat(params.get("hours")) || 0;  // total hours

  // Calculate total amount
  const totalAmount = price * hours;

  // Display total amount
  const amountElem = document.getElementById("amount");
  if (amountElem) {
    amountElem.textContent = `₹ ${totalAmount.toFixed(2)}`;
  }

  const paymentMethods = document.querySelectorAll(".payment-method");

  const paymentPages = [
    "payc1.html",   // 0 - Debit Card
    "payc2.html",   // 1 - Credit Card
    "cod.html",     // 2 - COD
    "upi.html",     // 3 - UPI Payment
    "mob.html",     // 4 - Mobikwik
    "paytm.html"    // 5 - Paytm
  ];

  paymentMethods.forEach((method, index) => {
    method.addEventListener("click", () => {
      const targetPage = paymentPages[index];
      if (targetPage) {
        // Pass total amount in query string
        window.location.href = `${targetPage}?total=${totalAmount.toFixed(2)}`;
      }
    });
  });
});
