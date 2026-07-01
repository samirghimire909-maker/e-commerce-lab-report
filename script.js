/* =========================================================
   CircuitCraft — demo storefront logic
   Cart state is held in memory (a plain JS array) on purpose:
   browser storage (localStorage/sessionStorage) is intentionally
   NOT used, so state resets on reload — fine for a lab demo.
   ========================================================= */

/* -----------------------------------------------------------
   GA4 HOOK (Week 3 / Week 9 of the lab)
   Once you create your GA4 property and add the gtag.js snippet
   to <head> in index.html, uncomment the gtag() calls marked
   below (search "GA4 EVENT") to send add_to_cart, begin_checkout
   and purchase events. That's what feeds the Funnel report in
   Week 9 (Home > Product > Cart > Checkout).
------------------------------------------------------------ */

/* ---------- 1. PRODUCT CATALOG ---------- */
const PRODUCTS = [
  { id: "nc-07", name: "Aria ANC Earbuds",     category: "Audio",     price: 79.00, icon: "earbuds",
    desc: "32-hour battery, -38 dB active noise cancelling." },
  { id: "sw-12", name: "Pulse Smartwatch",      category: "Wearable", price: 129.00, icon: "watch",
    desc: "Heart-rate, sleep tracking, 7-day battery." },
  { id: "sp-03", name: "Orb Mini Speaker",       category: "Audio",     price: 45.00, icon: "speaker",
    desc: "Pocket-size, 360° sound, IPX6 rated." },
  { id: "pb-21", name: "Volt 10K Power Bank",    category: "Power",     price: 34.00, icon: "powerbank",
    desc: "10,000 mAh, dual USB-C fast charging." },
  { id: "bp-09", name: "Transit Daypack",        category: "Carry",     price: 68.00, icon: "backpack",
    desc: "Padded laptop sleeve, water-resistant shell." },
  { id: "cb-14", name: "Coil Charge Cable",      category: "Power",     price: 14.00, icon: "cable",
    desc: "Braided USB-C, 1.8 m, tangle-resistant." },
  { id: "ps-05", name: "Rise Phone Stand",       category: "Desk",      price: 19.00, icon: "stand",
    desc: "Adjustable aluminum stand, foldable." },
  { id: "dl-18", name: "Glow Desk Lamp",         category: "Desk",      price: 52.00, icon: "lamp",
    desc: "Warm/cool dimming, USB-C powered." },
];

/* ---------- 2. ICONS (inline SVG, monoline style) ---------- */
const ICONS = {
  earbuds: `<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="16" cy="20" r="7"/><circle cx="32" cy="20" r="7"/><path d="M16 27v6a4 4 0 0 0 4 4"/><path d="M32 27v6a4 4 0 0 1-4 4"/></svg>`,
  watch: `<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="14" y="14" width="20" height="20" rx="4"/><path d="M18 14V8h12v6M18 34v6h12v-6"/><path d="M24 20v4l3 2"/></svg>`,
  speaker: `<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><rect x="14" y="8" width="20" height="32" rx="6"/><circle cx="24" cy="26" r="6"/><circle cx="24" cy="14" r="1.5" fill="currentColor" stroke="none"/></svg>`,
  powerbank: `<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="12" y="10" width="24" height="28" rx="3"/><path d="M26 16l-6 9h6l-6 9"/></svg>`,
  backpack: `<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 20a10 10 0 0 1 20 0v16a2 2 0 0 1-2 2H16a2 2 0 0 1-2-2z"/><path d="M18 20v-4a6 6 0 0 1 12 0v4"/><path d="M18 28h12M20 12v4"/></svg>`,
  cable: `<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 10c8 4 6 10 12 12s4 8 12 12"/><rect x="6" y="6" width="8" height="8" rx="2"/><rect x="32" y="32" width="8" height="8" rx="2"/></svg>`,
  stand: `<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 36h28M24 36V20M15 20h18l-3-8H18z"/></svg>`,
  lamp: `<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 12l8 10H10z"/><path d="M22 22v10M14 40h16"/></svg>`,
};

/* ---------- 3. STATE (in-memory only) ---------- */
let cart = []; // [{ id, qty }]

/* ---------- 4. HELPERS ---------- */
const fmt = (n) => `$${n.toFixed(2)}`;
const findProduct = (id) => PRODUCTS.find(p => p.id === id);

function cartTotal() {
  return cart.reduce((sum, item) => sum + findProduct(item.id).price * item.qty, 0);
}
function cartCount() {
  return cart.reduce((sum, item) => sum + item.qty, 0);
}

/* ---------- 5. RENDER PRODUCT GRID ---------- */
function renderProducts() {
  const grid = document.getElementById("productGrid");
  grid.innerHTML = PRODUCTS.map(p => `
    <div class="product-card">
      <div class="product-icon">${ICONS[p.icon]}</div>
      <div class="product-category">${p.category}</div>
      <div class="product-name">${p.name}</div>
      <p class="product-desc">${p.desc}</p>
      <div class="product-row">
        <span class="product-price">${fmt(p.price)}</span>
        <button class="add-btn" data-id="${p.id}" aria-label="Add ${p.name} to cart">+</button>
      </div>
    </div>
  `).join("");

  grid.querySelectorAll(".add-btn").forEach(btn => {
    btn.addEventListener("click", () => addToCart(btn.dataset.id));
  });
}

/* ---------- 6. CART LOGIC ---------- */
function addToCart(id) {
  const existing = cart.find(i => i.id === id);
  if (existing) existing.qty += 1;
  else cart.push({ id, qty: 1 });

  // GA4 EVENT: uncomment once gtag.js is installed (Week 3)
  // gtag('event', 'add_to_cart', { currency: 'USD', value: findProduct(id).price, items: [{ item_id: id, item_name: findProduct(id).name }] });

  renderCart();
  showToast(`${findProduct(id).name} added to cart`);
}

function changeQty(id, delta) {
  const item = cart.find(i => i.id === id);
  if (!item) return;
  item.qty += delta;
  if (item.qty <= 0) cart = cart.filter(i => i.id !== id);
  renderCart();
}

function removeItem(id) {
  cart = cart.filter(i => i.id !== id);
  renderCart();
}

function renderCart() {
  document.getElementById("cartCount").textContent = cartCount();
  const itemsEl = document.getElementById("cartItems");

  if (cart.length === 0) {
    itemsEl.innerHTML = `<p class="cart-empty">Your cart is empty. Add something from the catalog.</p>`;
  } else {
    itemsEl.innerHTML = cart.map(item => {
      const p = findProduct(item.id);
      return `
        <div class="cart-item">
          <div class="cart-item-icon">${ICONS[p.icon]}</div>
          <div class="cart-item-info">
            <div class="cart-item-name">${p.name}</div>
            <div class="cart-item-price">${fmt(p.price)}</div>
            <div class="qty-controls">
              <button class="qty-btn" data-id="${p.id}" data-delta="-1">−</button>
              <span class="qty-val">${item.qty}</span>
              <button class="qty-btn" data-id="${p.id}" data-delta="1">+</button>
            </div>
            <button class="remove-btn" data-id="${p.id}">Remove</button>
          </div>
        </div>`;
    }).join("");

    itemsEl.querySelectorAll(".qty-btn").forEach(btn => {
      btn.addEventListener("click", () => changeQty(btn.dataset.id, parseInt(btn.dataset.delta)));
    });
    itemsEl.querySelectorAll(".remove-btn").forEach(btn => {
      btn.addEventListener("click", () => removeItem(btn.dataset.id));
    });
  }

  document.getElementById("cartSubtotal").textContent = fmt(cartTotal());
  document.getElementById("checkoutTotal").textContent = fmt(cartTotal());
}

/* ---------- 7. CART DRAWER TOGGLE ---------- */
const cartDrawer = document.getElementById("cartDrawer");
const overlay = document.getElementById("overlay");

function openCart() {
  cartDrawer.classList.add("open");
  overlay.classList.add("visible");
}
function closeCart() {
  cartDrawer.classList.remove("open");
  overlay.classList.remove("visible");
}
document.getElementById("cartToggle").addEventListener("click", openCart);
document.getElementById("cartClose").addEventListener("click", closeCart);
overlay.addEventListener("click", closeCart);

/* ---------- 8. CHECKOUT MODAL ---------- */
const checkoutOverlay = document.getElementById("checkoutOverlay");
const checkoutForm = document.getElementById("checkoutForm");
const checkoutProcessing = document.getElementById("checkoutProcessing");
const checkoutSuccess = document.getElementById("checkoutSuccess");

document.getElementById("checkoutBtn").addEventListener("click", () => {
  if (cart.length === 0) {
    showToast("Add an item before checking out");
    return;
  }
  closeCart();
  checkoutOverlay.classList.add("visible");
  checkoutForm.classList.remove("hidden");
  checkoutProcessing.classList.add("hidden");
  checkoutSuccess.classList.add("hidden");

  // GA4 EVENT: uncomment once gtag.js is installed (Week 3)
  // gtag('event', 'begin_checkout', { currency: 'USD', value: cartTotal() });
});

function closeCheckout() {
  checkoutOverlay.classList.remove("visible");
}
document.getElementById("checkoutClose").addEventListener("click", closeCheckout);

document.getElementById("orderForm").addEventListener("submit", (e) => {
  e.preventDefault();
  checkoutForm.classList.add("hidden");
  checkoutProcessing.classList.remove("hidden");

  const email = e.target.email.value;

  // Simulated payment gateway delay
  setTimeout(() => {
    checkoutProcessing.classList.add("hidden");
    checkoutSuccess.classList.remove("hidden");

    const orderId = "CC-" + Math.floor(100000 + Math.random() * 900000);
    document.getElementById("orderId").textContent = orderId;
    document.getElementById("confirmEmail").textContent = email;

    // GA4 EVENT: uncomment once gtag.js is installed (Week 3)
    // gtag('event', 'purchase', { transaction_id: orderId, currency: 'USD', value: cartTotal(),
    //   items: cart.map(i => ({ item_id: i.id, item_name: findProduct(i.id).name, quantity: i.qty })) });

    cart = [];
    renderCart();
  }, 1400);
});

document.getElementById("continueShoppingBtn").addEventListener("click", closeCheckout);

/* ---------- 9. TOAST ---------- */
let toastTimer;
function showToast(msg) {
  const toast = document.getElementById("toast");
  toast.textContent = msg;
  toast.classList.add("visible");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove("visible"), 2200);
}

/* ---------- 10. UTM CAPTURE (Week 8 of the lab) ----------
   If someone arrives via a UTM-tagged link (utm_source,
   utm_medium, utm_campaign...), log it — with GA4 installed,
   gtag.js reads these automatically, but this makes the demo
   visible in the console even without GA4 connected yet. */
(function captureUTM() {
  const params = new URLSearchParams(window.location.search);
  const utmKeys = ["utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content"];
  const found = {};
  utmKeys.forEach(k => { if (params.get(k)) found[k] = params.get(k); });
  if (Object.keys(found).length) {
    console.log("UTM parameters detected on this visit:", found);
  }
})();

/* ---------- INIT ---------- */
renderProducts();
renderCart();

// GA4 EVENT (page/product view): uncomment once gtag.js is installed (Week 3)
// gtag('event', 'view_item_list', { item_list_name: 'Catalog' });