/* ==========================================================
   MichiePlus shared cart/API client.

   Loaded by marketplace.html, product-details.html, and cart.html.
   This is the ONE place that knows how to talk to /api/cart/*, so
   there is a single source of truth for request/error handling
   instead of three copies of the same fetch logic drifting apart.

   Every page that includes this file gets, for free:
     - MichiePlusCart.toast(message, isError)
     - MichiePlusCart.apiFetch(url, options, timeoutMs)
     - MichiePlusCart.refreshCartBadge()   -> updates #cartCount if present
     - MichiePlusCart.addToCart(itemId, {itemType, quantity, button})
========================================================== */
(function (global) {
  "use strict";

  function ensureToastEl() {
    let el = document.getElementById("mpToast");
    if (!el) {
      el = document.createElement("div");
      el.id = "mpToast";
      el.setAttribute("role", "status");
      el.style.position = "fixed";
      el.style.right = "20px";
      el.style.bottom = "20px";
      el.style.padding = "14px 17px";
      el.style.borderRadius = "10px";
      el.style.background = "#172033";
      el.style.color = "#fff";
      el.style.display = "none";
      el.style.maxWidth = "360px";
      el.style.zIndex = "9999";
      document.body.appendChild(el);
    }
    return el;
  }

  function toast(message, isError) {
    const el = ensureToastEl();
    el.textContent = message;
    el.style.display = "block";
    el.style.background = isError ? "#b42318" : "#172033";
    clearTimeout(toast._t);
    toast._t = setTimeout(() => { el.style.display = "none"; }, 3500);
  }

  /**
   * Wraps fetch() so every caller gets:
   *  - a hard timeout (default 8s) via AbortController, distinguished
   *    from a real network failure
   *  - JSON-or-explain-why parsing (never a silent "Network error")
   *  - a rejected promise carrying a human-readable .message built
   *    from the backend's structured {success, error, message, details}
   *    response, per the app's API contract
   */
  async function apiFetch(url, options, timeoutMs) {
    options = options || {};
    timeoutMs = timeoutMs || 8000;
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    try {
      let response;
      try {
        response = await fetch(url, {
          ...options,
          signal: controller.signal,
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            ...(options.headers || {}),
          },
        });
      } catch (error) {
        if (error.name === "AbortError") {
          throw new Error("Network timeout while contacting the server.");
        }
        throw new Error("Network failure: " + error.message);
      }

      let body;
      try {
        body = await response.json();
      } catch (error) {
        throw new Error(`HTTP ${response.status}: Server returned invalid JSON.`);
      }

      if (!response.ok || body.success === false) {
        const detail = body.details ? " — " + body.details : "";
        const err = new Error(
          `HTTP ${response.status}: ${body.message || body.error || "Request failed."}${detail}`
        );
        err.status = response.status;
        err.code = body.error;
        throw err;
      }
      return body;
    } finally {
      clearTimeout(timer);
    }
  }

  async function refreshCartBadge() {
    const badge = document.getElementById("cartCount");
    if (!badge) return;
    try {
      const body = await apiFetch("/api/cart/count");
      badge.textContent = body.data.count;
    } catch (error) {
      // Don't blow up page load over a badge; just log it clearly.
      console.error("Cart count failed:", error);
    }
  }

  /**
   * Shared "Add to cart" flow used by both the marketplace grid and the
   * product detail buy box. Handles button state (disable / "Adding..."
   * / restore) and updates the header badge from the server's
   * authoritative cart_count -- never guesses the count client-side.
   */
  async function addToCart(itemId, opts) {
    opts = opts || {};
    const itemType = opts.itemType || "product";
    const quantity = opts.quantity || 1;
    const button = opts.button || null;

    let originalText;
    if (button) {
      originalText = button.textContent;
      button.disabled = true;
      button.textContent = "Adding…";
    }

    try {
      const body = await apiFetch("/api/cart/add", {
        method: "POST",
        body: JSON.stringify({ item_type: itemType, item_id: itemId, quantity }),
      });
      const badge = document.getElementById("cartCount");
      if (badge) badge.textContent = body.data.cart_count;
      toast(body.message, false);
      if (button) button.textContent = "Added to cart";
      return body;
    } catch (error) {
      console.error("Add to cart failed:", error);
      toast(error.message, true);
      throw error;
    } finally {
      if (button) {
        setTimeout(() => {
          button.disabled = false;
          button.textContent = originalText;
        }, 1200);
      }
    }
  }

  global.MichiePlusCart = { toast, apiFetch, refreshCartBadge, addToCart };
})(window);