console.log("Product Details Loaded");

// ==========================================
// FAQ ACCORDION
// ==========================================

const faqItems = document.querySelectorAll(".faq-item");

faqItems.forEach((item) => {

    const button = item.querySelector(".faq-question");

    button.addEventListener("click", () => {

        faqItems.forEach((faq) => {

            if (faq !== item) {

                faq.classList.remove("active");

            }

        });

        item.classList.toggle("active");

    });

});

// ==========================================
// ADD TO CART / BUY NOW
// ==========================================

// This page is static (no server-side templating), so it has no
// built-in way to know which product it's showing. Link to it as
// product-details.html?id=<real product id> and this picks that up.
const productId = new URLSearchParams(window.location.search).get("id");

const cartBtn = document.querySelector(".cart-btn");
const buyBtn = document.querySelector(".buy-btn");

function addToCart(id, quantity = 1) {
    return fetch("/api/cart/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            item_type: "product",
            item_id: Number(id),
            quantity: quantity
        })
    }).then((res) => res.json());
}

if (!productId) {

    console.warn(
        "No product id in the URL (expected ?id=<product_id>) — " +
        "Add to Cart and Buy Now are disabled on this page."
    );

    if (cartBtn) cartBtn.disabled = true;
    if (buyBtn) buyBtn.disabled = true;

} else {

    if (cartBtn) {

        cartBtn.addEventListener("click", () => {

            const originalText = cartBtn.textContent;

            cartBtn.disabled = true;
            cartBtn.textContent = "Adding...";

            addToCart(productId, 1)
                .then((data) => {
                    if (data.success) {
                        cartBtn.textContent = "✓ Added to Cart";
                        setTimeout(() => {
                            cartBtn.textContent = originalText;
                            cartBtn.disabled = false;
                        }, 1500);
                    } else {
                        alert(data.message || "Failed to add to cart.");
                        cartBtn.textContent = originalText;
                        cartBtn.disabled = false;
                    }
                })
                .catch((err) => {
                    console.error("Add to cart error:", err);
                    alert("Network error. Please try again.");
                    cartBtn.textContent = originalText;
                    cartBtn.disabled = false;
                });

        });

    }

    if (buyBtn) {

        buyBtn.addEventListener("click", () => {

            const originalText = buyBtn.textContent;

            buyBtn.disabled = true;
            buyBtn.textContent = "Processing...";

            addToCart(productId, 1)
                .then((data) => {
                    if (data.success) {
                        window.location.href = "../cart/cart.html";
                    } else {
                        alert(data.message || "Failed to add to cart.");
                        buyBtn.textContent = originalText;
                        buyBtn.disabled = false;
                    }
                })
                .catch((err) => {
                    console.error("Buy now error:", err);
                    alert("Network error. Please try again.");
                    buyBtn.textContent = originalText;
                    buyBtn.disabled = false;
                });

        });

    }

}