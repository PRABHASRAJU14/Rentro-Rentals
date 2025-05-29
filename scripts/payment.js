function goBack() {
  const query = window.location.search;
  window.location.href = 'confirm.html' + query;
}

document.addEventListener("DOMContentLoaded", () => {
  const params = new URLSearchParams(window.location.search);
  const price = params.get("price") || "0.00";
  document.getElementById("amount").textContent = `₹ ${price}`;
  const totalAmount = price;

  const paymentMethods = document.querySelectorAll(".payment-method");

  // Define destinations by index
  const paymentPages = [
    "payc1.html",   // 0 - Debit Card
    "payc2.html",   // 1 - Credit Card
    "cod.html",     // 2 - COD
    "upi.html",     // 3 - UPI Payment
    "mob.html",     // 4 - Mobikwik (image only)
    "paytm.html"    // 5 - Paytm (image only)
  ];

  paymentMethods.forEach((method, index) => {
    method.addEventListener("click", () => {
      const targetPage = paymentPages[index];
      if (targetPage) {
        window.location.href = `${targetPage}?total=${totalAmount}`;
      }
    });
  });

  const backArrow = document.querySelector(".back-arrow");
  if (backArrow) {
    backArrow.addEventListener("click", goBack);
  }
});
