function goBack() {
  const query = window.location.search;
  window.location.href = 'confirm.html' + query;
}

document.addEventListener("DOMContentLoaded", () => {
  const params = new URLSearchParams(window.location.search);
  const price = params.get("price") || "0.00";

  // Display only price with ₹ sign
  document.getElementById("amount").textContent = `₹ ${price}`;

  const paymentMethods = document.querySelectorAll(".payment-method");
  paymentMethods.forEach((method) => {
    if (method.textContent.trim() === "Debit Card") {
      method.addEventListener("click", () => {
        window.location.href = "payc1.html";
      });
    }
  });

  // Back arrow listener
  const backArrow = document.querySelector(".back-arrow");
  if (backArrow) {
    backArrow.addEventListener("click", goBack);
  }
});
