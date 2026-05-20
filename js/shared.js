// OpticAura Shared JavaScript
// Manages State (Cart, Wishlist), Navigation, Header/Footer Injection, and Dynamic UI interactions.

document.addEventListener('DOMContentLoaded', () => {
  // 1. Initialize State
  initCart();
  initWishlist();

  // 2. Inject Shared Layout (Header, Footer, Cart Side-Panel)
  injectHeader();
  injectFooter();
  injectCartPanel();
  
  // 3. Setup UI Event Listeners
  setupNavigationEvents();
  updateHeaderBadges();
  renderCartItems();

  // 4. Page-specific initialization alerts (e.g. active nav highlighting)
  highlightActiveNav();
});

// ==================== STATE MANAGEMENT (localStorage) ====================

function initCart() {
  if (!localStorage.getItem('opticaura_cart')) {
    localStorage.setItem('opticaura_cart', JSON.stringify([]));
  }
}

function initWishlist() {
  if (!localStorage.getItem('opticaura_wishlist')) {
    localStorage.setItem('opticaura_wishlist', JSON.stringify([]));
  }
}

function getCart() {
  return JSON.parse(localStorage.getItem('opticaura_cart') || '[]');
}

function setCart(cart) {
  localStorage.setItem('opticaura_cart', JSON.stringify(cart));
  updateHeaderBadges();
  renderCartItems();
}

function getWishlist() {
  return JSON.parse(localStorage.getItem('opticaura_wishlist') || '[]');
}

function setWishlist(wishlist) {
  localStorage.setItem('opticaura_wishlist', JSON.stringify(wishlist));
  updateHeaderBadges();
}

// Global functions exposed to window for inline calls
window.addToCart = function(productId, quantity = 1, showNotification = true) {
  if (typeof PRODUCTS === 'undefined') return;
  const product = PRODUCTS[productId];
  if (!product) return;

  let cart = getCart();
  const existingItem = cart.find(item => item.id === productId);

  if (existingItem) {
    existingItem.qty += quantity;
  } else {
    cart.push({
      id: productId,
      name: product.name,
      price: product.price,
      image: product.image,
      category: product.category,
      qty: quantity
    });
  }

  setCart(cart);
  if (showNotification) {
    showToast(`Added <strong>${product.name}</strong> to Cart!`);
    openCartSidebar();
  }
};

window.removeFromCart = function(productId) {
  let cart = getCart();
  cart = cart.filter(item => item.id !== productId);
  setCart(cart);
  showToast(`Item removed from Cart.`);
};

window.updateCartQty = function(productId, qty) {
  let cart = getCart();
  const item = cart.find(item => item.id === productId);
  if (item) {
    item.qty = Math.max(1, parseInt(qty, 10));
    setCart(cart);
  }
};

window.toggleWishlist = function(productId) {
  if (typeof PRODUCTS === 'undefined') return;
  const product = PRODUCTS[productId];
  if (!product) return;

  let wishlist = getWishlist();
  const index = wishlist.indexOf(productId);

  if (index !== -1) {
    wishlist.splice(index, 1);
    setWishlist(wishlist);
    showToast(`Removed <strong>${product.name}</strong> from Wishlist.`);
    document.dispatchEvent(new CustomEvent('wishlistChanged', { detail: { productId, inWishlist: false } }));
  } else {
    wishlist.push(productId);
    setWishlist(wishlist);
    showToast(`Added <strong>${product.name}</strong> to Wishlist! ❤️`);
    document.dispatchEvent(new CustomEvent('wishlistChanged', { detail: { productId, inWishlist: true } }));
  }
};

window.isInWishlist = function(productId) {
  const wishlist = getWishlist();
  return wishlist.includes(productId);
};

// ==================== SHARED LAYOUT INJECTION ====================

function injectHeader() {
  const headerHtml = `
    <!-- Top Info Bar -->
    <div class="top-bar">
      <div class="top-bar-container">
        <a href="index.html">About us</a>
        <a href="stores.html">Contact Us</a>
        <a href="stores.html">Offline Stores</a>
        <a href="stores.html">Book Appointment</a>
        <a href="payment.html">Secure Payment</a>
      </div>
    </div>

    <!-- Main Navigation Header -->
    <header class="main-header">
      <div class="main-header-container">
        <a href="index.html" class="logo">OpticAura</a>
        
        <nav class="main-nav">
          <div class="dropdown">
            <a href="shop.html?category=eyeglasses" class="dropdown-toggle">EYEGLASSES</a>
            <ul class="dropdown-menu">
              <li><a href="shop.html?category=eyeglasses&sub=men">Men's Eyeglasses</a></li>
              <li><a href="shop.html?category=eyeglasses&sub=women">Women's Eyeglasses</a></li>
              <li><a href="shop.html?category=eyeglasses&sub=computer">Computer Glasses</a></li>
              <li><a href="shop.html?category=eyeglasses&sub=kids">Kids' Eyeglasses</a></li>
            </ul>
          </div>

          <div class="dropdown">
            <a href="shop.html?category=sunglasses" class="dropdown-toggle">SUNGLASSES</a>
            <ul class="dropdown-menu">
              <li><a href="shop.html?category=sunglasses&sub=men">Men's Sunglasses</a></li>
              <li><a href="shop.html?category=sunglasses&sub=women">Women's Sunglasses</a></li>
              <li><a href="shop.html?category=sunglasses&sub=icon">Power Sunglasses</a></li>
              <li><a href="shop.html?category=sunglasses&sub=sports">Sports Sunglasses</a></li>
            </ul>
          </div>

          <div class="dropdown">
            <a href="shop.html?category=contacts" class="dropdown-toggle">CONTACTS</a>
            <ul class="dropdown-menu">
              <li><a href="shop.html?category=contacts&sub=daily">Daily Disposable</a></li>
              <li><a href="shop.html?category=contacts&sub=monthly">Monthly Disposable</a></li>
              <li><a href="shop.html?category=contacts&sub=colored">Colored Contact Lenses</a></li>
              <li><a href="shop.html?category=contacts&sub=lens">Solution & Care</a></li>
            </ul>
          </div>

          <div class="dropdown">
            <a href="special-power.html" class="dropdown-toggle">SPECIAL POWER</a>
            <ul class="dropdown-menu">
              <li><a href="special-power.html">Advanced Tech Lenses</a></li>
              <li><a href="shop.html?category=eyeglasses&sub=computer">Blue Cut + UV protection</a></li>
            </ul>
          </div>

          <div class="dropdown">
            <a href="stores.html" class="dropdown-toggle">STORES</a>
            <ul class="dropdown-menu">
              <li><a href="stores.html">Find a Store</a></li>
              <li><a href="stores.html">Book Eye Test</a></li>
            </ul>
          </div>
        </nav>

        <div class="nav-icons">
          <!-- Search box -->
          <div class="nav-search-container">
            <input type="text" id="navSearchInput" placeholder="Search premium eyewear...">
            <span class="search-trigger-btn">🔍</span>
          </div>

          <div class="wishlist-trigger" onclick="location.href='shop.html?wishlist=true'" title="View Wishlist">
            <span class="heart-icon">♡</span>
            <span class="badge wishlist-badge">0</span>
          </div>
          
          <div class="cart-trigger" onclick="openCartSidebar()" title="View Cart">
            <span class="cart-icon">🛒</span>
            <span class="badge cart-badge">0</span>
          </div>

          <!-- Mobile Menu Toggle Button -->
          <div class="mobile-menu-toggle" id="mobileMenuToggle">
            <span></span>
            <span></span>
            <span></span>
          </div>
        </div>
      </div>

      <!-- Mobile Nav Drawer -->
      <div class="mobile-nav-drawer" id="mobileNavDrawer">
        <ul>
          <li>
            <a href="shop.html?category=eyeglasses">EYEGLASSES</a>
            <ul>
              <li><a href="shop.html?category=eyeglasses&sub=men">- Men</a></li>
              <li><a href="shop.html?category=eyeglasses&sub=women">- Women</a></li>
              <li><a href="shop.html?category=eyeglasses&sub=computer">- Computer</a></li>
              <li><a href="shop.html?category=eyeglasses&sub=kids">- Kids</a></li>
            </ul>
          </li>
          <li>
            <a href="shop.html?category=sunglasses">SUNGLASSES</a>
            <ul>
              <li><a href="shop.html?category=sunglasses&sub=men">- Men</a></li>
              <li><a href="shop.html?category=sunglasses&sub=women">- Women</a></li>
              <li><a href="shop.html?category=sunglasses&sub=icon">- Power</a></li>
              <li><a href="shop.html?category=sunglasses&sub=sports">- Sports</a></li>
            </ul>
          </li>
          <li>
            <a href="shop.html?category=contacts">CONTACTS</a>
            <ul>
              <li><a href="shop.html?category=contacts&sub=daily">- Daily</a></li>
              <li><a href="shop.html?category=contacts&sub=monthly">- Monthly</a></li>
              <li><a href="shop.html?category=contacts&sub=colored">- Colored</a></li>
              <li><a href="shop.html?category=contacts&sub=lens">- Solution & Care</a></li>
            </ul>
          </li>
          <li><a href="special-power.html">SPECIAL POWER</a></li>
          <li><a href="stores.html">STORES & EYE TEST</a></li>
          <li><a href="shop.html?wishlist=true">MY WISHLIST</a></li>
        </ul>
      </div>
    </header>
  `;

  // Insert header
  const existingHeader = document.querySelector('header');
  const existingTopBar = document.querySelector('.top-bar');

  if (existingHeader) existingHeader.remove();
  if (existingTopBar) existingTopBar.remove();

  const headerWrapper = document.createElement('div');
  headerWrapper.innerHTML = headerHtml;
  document.body.insertBefore(headerWrapper, document.body.firstChild);
}

function injectFooter() {
  const footerHtml = `
    <footer>
      <div class="footer-container">
        <div class="footer-col footer-logo">
          <h2>OpticAura</h2>
          <p>Your trusted premium eyewear partner. Experience luxury craftsmanship, advanced vision protection, and professional eye care delivered to your door.</p>
        </div>

        <div class="footer-col">
          <h3>Collection Hub</h3>
          <ul>
            <li><a href="shop.html?category=eyeglasses">Eyeglasses Catalog</a></li>
            <li><a href="shop.html?category=sunglasses">Sunglasses Range</a></li>
            <li><a href="shop.html?category=contacts">Contact Lenses</a></li>
            <li><a href="special-power.html">Lens Protection Tech</a></li>
          </ul>
        </div>

        <div class="footer-col">
          <h3>Customer Support</h3>
          <ul>
            <li><a href="stores.html">Book Eye Exam</a></li>
            <li><a href="stores.html">Store Finder</a></li>
            <li><a href="payment.html">Checkout Details</a></li>
            <li><a href="index.html">Privacy & Terms</a></li>
          </ul>
        </div>

        <div class="footer-col">
          <h3>OpticAura Trust</h3>
          <p style="font-size: 14px; margin-bottom: 12px; opacity: 0.8;">100% Secure SSL checkout, home trials, and a 1-year product warranty.</p>
          <div class="payment-methods">
            <img src="https://img.icons8.com/color/48/000000/visa.png" alt="Visa">
            <img src="https://img.icons8.com/color/48/000000/mastercard.png" alt="Mastercard">
            <img src="https://img.icons8.com/color/48/000000/rupay.png" alt="Rupay">
            <img src="https://img.icons8.com/color/48/000000/paytm.png" alt="Paytm">
          </div>
        </div>
      </div>

      <div class="bottom-bar">
        © 2026 OpticAura Eyewear. All Rights Reserved. Built for ultimate clarity and premium style.
      </div>
    </footer>
  `;

  // Insert footer
  const existingFooter = document.querySelector('footer');
  if (existingFooter) existingFooter.remove();

  const footerWrapper = document.createElement('div');
  footerWrapper.innerHTML = footerHtml;
  document.body.appendChild(footerWrapper);
}

function injectCartPanel() {
  const panelHtml = `
    <!-- Cart Overlay backdrop -->
    <div class="cart-backdrop" id="cartBackdrop" onclick="closeCartSidebar()"></div>

    <!-- Sliding Sidebar -->
    <div class="cart-sidebar" id="cartSidebar">
      <div class="cart-header">
        <h3>Shopping Bag (<span id="cartSidebarCount">0</span>)</h3>
        <button class="cart-close-btn" onclick="closeCartSidebar()">✕</button>
      </div>

      <div class="cart-items-container" id="cartSidebarItems">
        <!-- Rendered dynamically -->
        <div class="empty-cart-msg">Your shopping cart is empty.</div>
      </div>

      <div class="cart-summary-footer">
        <div class="cart-summary-row">
          <span>Bag Subtotal</span>
          <strong id="cartSidebarSubtotal">₹0</strong>
        </div>
        <div class="cart-summary-row promo-applied" style="display:none;" id="cartSidebarDiscountRow">
          <span>Discount (10% Applied)</span>
          <strong id="cartSidebarDiscount">-₹0</strong>
        </div>
        <div class="cart-summary-row total-row">
          <span>Total Payable</span>
          <strong id="cartSidebarTotal">₹0</strong>
        </div>
        
        <div class="cart-action-buttons">
          <a href="payment.html" class="checkout-btn">PROCEED TO SECURE CHECKOUT</a>
          <button class="continue-shopping-btn" onclick="closeCartSidebar()">CONTINUE SHOPPING</button>
        </div>
      </div>
    </div>

    <!-- Toast Notification container -->
    <div class="toast-container" id="toastContainer"></div>
  `;

  const cartWrapper = document.createElement('div');
  cartWrapper.innerHTML = panelHtml;
  document.body.appendChild(cartWrapper);
}

// ==================== CART SIDEBAR CONTROLLER ====================

window.openCartSidebar = function() {
  document.getElementById('cartSidebar').classList.add('open');
  document.getElementById('cartBackdrop').classList.add('visible');
  document.body.style.overflow = 'hidden'; // block page scroll
  renderCartItems();
};

window.closeCartSidebar = function() {
  document.getElementById('cartSidebar').classList.remove('open');
  document.getElementById('cartBackdrop').classList.remove('visible');
  document.body.style.overflow = ''; // restore scroll
};

function renderCartItems() {
  const container = document.getElementById('cartSidebarItems');
  const cart = getCart();

  if (!container) return;

  if (cart.length === 0) {
    container.innerHTML = `<div class="empty-cart-msg">Your shopping cart is empty.<br><br><a href="shop.html" onclick="closeCartSidebar()" style="color:#d4a373; font-weight:bold;">Shop Eyewear Now</a></div>`;
    document.getElementById('cartSidebarCount').innerText = '0';
    document.getElementById('cartSidebarSubtotal').innerText = '₹0';
    document.getElementById('cartSidebarTotal').innerText = '₹0';
    document.getElementById('cartSidebarDiscountRow').style.display = 'none';
    return;
  }

  let subtotal = 0;
  let itemsCount = 0;
  let html = '';

  cart.forEach(item => {
    subtotal += item.price * item.qty;
    itemsCount += item.qty;

    html += `
      <div class="cart-item-card" data-id="${item.id}">
        <div class="cart-item-img">
          <img src="${item.image}" alt="${item.name}">
        </div>
        <div class="cart-item-details">
          <h4><a href="product.html?id=${item.id}" onclick="closeCartSidebar()">${item.name}</a></h4>
          <div class="cart-item-cat">${item.category.toUpperCase()}</div>
          <div class="cart-item-price">₹${item.price.toLocaleString()}</div>
          
          <div class="cart-item-actions">
            <div class="cart-qty-picker">
              <button onclick="changeQtyClick('${item.id}', -1)">-</button>
              <input type="number" value="${item.qty}" min="1" onchange="window.updateCartQty('${item.id}', this.value)">
              <button onclick="changeQtyClick('${item.id}', 1)">+</button>
            </div>
            <button class="cart-item-remove-btn" onclick="window.removeFromCart('${item.id}')">Remove</button>
          </div>
        </div>
      </div>
    `;
  });

  container.innerHTML = html;
  
  // Calculate discount & totals (Default Promo: AURA10 applied in localStorage if typed or auto-simulated)
  let finalTotal = subtotal;
  const isPromoApplied = localStorage.getItem('opticaura_promo') === 'AURA10';
  
  document.getElementById('cartSidebarCount').innerText = itemsCount;
  document.getElementById('cartSidebarSubtotal').innerText = `₹${subtotal.toLocaleString()}`;

  if (isPromoApplied) {
    const discount = Math.round(subtotal * 0.1);
    finalTotal = subtotal - discount;
    document.getElementById('cartSidebarDiscount').innerText = `-₹${discount.toLocaleString()}`;
    document.getElementById('cartSidebarDiscountRow').style.display = 'flex';
  } else {
    document.getElementById('cartSidebarDiscountRow').style.display = 'none';
  }

  document.getElementById('cartSidebarTotal').innerText = `₹${finalTotal.toLocaleString()}`;
}

window.changeQtyClick = function(productId, delta) {
  const cart = getCart();
  const item = cart.find(item => item.id === productId);
  if (item) {
    item.qty = Math.max(1, item.qty + delta);
    setCart(cart);
  }
};

// ==================== UI EVENTS & HELPERS ====================

function updateHeaderBadges() {
  const cart = getCart();
  const wishlist = getWishlist();

  const totalCartQty = cart.reduce((total, item) => total + item.qty, 0);

  const cartBadges = document.querySelectorAll('.cart-badge');
  const wishlistBadges = document.querySelectorAll('.wishlist-badge');

  cartBadges.forEach(badge => {
    badge.innerText = totalCartQty;
    badge.style.display = totalCartQty > 0 ? 'inline-block' : 'none';
  });

  wishlistBadges.forEach(badge => {
    badge.innerText = wishlist.length;
    badge.style.display = wishlist.length > 0 ? 'inline-block' : 'none';
  });
}

function setupNavigationEvents() {
  // Mobile Nav Drawer Toggle
  const toggleBtn = document.getElementById('mobileMenuToggle');
  const navDrawer = document.getElementById('mobileNavDrawer');
  
  if (toggleBtn && navDrawer) {
    toggleBtn.addEventListener('click', () => {
      toggleBtn.classList.toggle('active');
      navDrawer.classList.toggle('open');
    });
  }

  // Sticky header shift on scroll
  const header = document.querySelector('.main-header');
  window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  });

  // Search input interaction
  const searchInput = document.getElementById('navSearchInput');
  const searchTrigger = document.querySelector('.search-trigger-btn');

  function triggerSearch() {
    const val = searchInput.value.trim();
    if (val) {
      window.location.href = `shop.html?search=${encodeURIComponent(val)}`;
    }
  }

  if (searchInput) {
    searchInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') triggerSearch();
    });
  }
  
  if (searchTrigger) {
    searchTrigger.addEventListener('click', triggerSearch);
  }
}

function highlightActiveNav() {
  // Map page names to active navigation highlighting
  const path = window.location.pathname;
  const page = path.split('/').pop() || 'index.html';
  
  const navLinks = document.querySelectorAll('.main-nav > .dropdown > a');
  navLinks.forEach(link => link.classList.remove('active'));

  if (page === 'index.html') {
    // index doesn't have direct dropdown but keeps it basic
  } else if (page === 'shop.html') {
    const params = new URLSearchParams(window.location.search);
    const cat = params.get('category');
    if (cat === 'eyeglasses') {
      document.querySelector('.main-nav > .dropdown:nth-child(1) > a')?.classList.add('active');
    } else if (cat === 'sunglasses') {
      document.querySelector('.main-nav > .dropdown:nth-child(2) > a')?.classList.add('active');
    } else if (cat === 'contacts') {
      document.querySelector('.main-nav > .dropdown:nth-child(3) > a')?.classList.add('active');
    }
  } else if (page === 'special-power.html') {
    document.querySelector('.main-nav > .dropdown:nth-child(4) > a')?.classList.add('active');
  } else if (page === 'stores.html') {
    document.querySelector('.main-nav > .dropdown:nth-child(5) > a')?.classList.add('active');
  }
}

// Global Notification Alert
window.showToast = function(message) {
  const container = document.getElementById('toastContainer');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.innerHTML = message;

  container.appendChild(toast);

  // Trigger CSS Animation
  setTimeout(() => {
    toast.classList.add('show');
  }, 10);

  // Auto remove toast
  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => {
      toast.remove();
    }, 400);
  }, 3500);
};
