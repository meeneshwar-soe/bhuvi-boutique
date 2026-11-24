const API = '';

const token = () => localStorage.getItem('token');
const currentUser = () => JSON.parse(localStorage.getItem('user') || 'null');

(function ensureViewport() {
  if (!document.querySelector('meta[name="viewport"]')) {
    const m = document.createElement('meta');
    m.name = 'viewport';
    m.content = 'width=device-width, initial-scale=1.0, viewport-fit=cover';
    document.head.prepend(m);
  }
})();

/* ==========================================================
   ADMIN SESSION GUARD (backup for cached HTML)
   Admins manage the store; the storefront is not for them.
   ========================================================== */
const STOREFRONT_PATHS = ['/', '/shop', '/cart', '/wishlist', '/checkout', '/orders'];
const isStorefront = () => STOREFRONT_PATHS.includes(location.pathname) || location.pathname.startsWith('/product/');
(function adminGuard() {
  const u = currentUser();
  if (u && u.role === 'admin' && isStorefront()) location.replace('/admin/dashboard');
})();

const TX_PATHS = ['/cart', '/wishlist', '/checkout'];
const isTxPage = () => TX_PATHS.some(p => location.pathname === p || location.pathname.startsWith(p + '/'));
if (isTxPage()) document.documentElement.classList.add('tx-page');

function tidyFooters() {
  const tx = isTxPage();
  document.querySelectorAll('footer').forEach(f => {
    if (tx) { f.remove(); return; }
    if (!f.classList.contains('site-footer') && !f.classList.contains('lx-footer')) f.remove();
  });
  if (tx) document.querySelectorAll('.site-footer, .lx-footer, .footer').forEach(el => el.remove());
}
if (document.body) tidyFooters();

async function api(path, options = {}) {
  const headers = { ...(options.headers || {}) };
  if (token()) headers['Authorization'] = 'Bearer ' + token();
  if (!(options.body instanceof FormData)) headers['Content-Type'] = 'application/json';
  const response = await fetch(API + path, { ...options, headers });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || 'Request failed');
  return data;
}

function toast(message, type) {
  const msg = String(message == null ? '' : message);
  let kind = type;
  if (!kind) {
    if (/^(❌|✗|⛔)/.test(msg) || /wrong|failed|error|invalid|not available|denied|expired/i.test(msg)) kind = 'error';
    else if (/^(✅|✓|✨|♥|🎉)/.test(msg) || /success|added|submitted|saved|copied|welcome|received/i.test(msg)) kind = 'success';
    else if (/^(⚠️||🔒)/.test(msg) || /please|login|first|only|limit|cancel/i.test(msg)) kind = 'warn';
    else kind = 'info';
  }
  const old = document.querySelector('.toast');
  if (old) { clearTimeout(old._timer); old.remove(); }
  const t = document.createElement('div');
  t.className = 'toast toast-' + kind;
  t.setAttribute('role', 'status');
  t.setAttribute('aria-live', 'polite');
  const icons = { success: '✓', error: '✕', warn: '!', info: 'i' };
  const ico = document.createElement('span');
  ico.className = 'toast-ico';
  ico.textContent = icons[kind] || 'i';
  const body = document.createElement('span');
  body.className = 'toast-msg';
  body.textContent = msg.replace(/^(❌|✅|⚠️|✨|♥|🎉|️|✓|✗|⛔)\s*/, '');
  t.appendChild(ico); t.appendChild(body);
  document.body.appendChild(t);
  requestAnimationFrame(() => t.classList.add('show'));
  t._timer = setTimeout(() => {
    t.classList.remove('show');
    setTimeout(() => t.remove(), 320);
  }, 3800);
}

function logout() {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  location.href = '/login';
}
function requireAuth() { if (!currentUser()) location.href = '/login'; }
function requireAdmin() {
  const user = currentUser();
  if (!user) { location.href = '/login'; return; }
  if (user.role !== 'admin') { alert('Admin access only'); location.href = '/'; }
}
function money(amount) { return '₹' + Number(amount || 0).toFixed(2); }

async function updateCartBadge() {
  try {
    if (!localStorage.getItem('token')) return;
    const cart = await api('/api/cart');
    const items = Array.isArray(cart) ? cart : (cart.items || cart.cartItems || []);
    const count = items.reduce((s, it) => s + (it.quantity || 1), 0);
    document.querySelectorAll('.cart-badge').forEach(el => el.remove());
    const link = document.querySelector('.icons a[href="/cart"]');
    if (link && count > 0) {
      const b = document.createElement('span');
      b.className = 'cart-badge';
      b.textContent = count;
      b.style.cssText = 'background:#b8860b;color:#fff;font-size:0.66rem;padding:2px 6px;border-radius:10px;margin-left:3px;font-weight:700;min-width:17px;display:inline-block;text-align:center;vertical-align:top;line-height:1.2;';
      link.appendChild(b);
    }
    document.querySelectorAll('.tab-badge[data-for="cart"]').forEach(b => { b.hidden = count === 0; b.textContent = count; });
  } catch (e) { /* silent */ }
}
window.updateCartBadge = updateCartBadge;

async function updateWishlistBadge() {
  try {
    if (!localStorage.getItem('token')) return;
    const wish = await api('/api/wishlist');
    const items = Array.isArray(wish) ? wish : (wish.items || wish.wishlist || []);
    const count = items.length;
    document.querySelectorAll('.wishlist-badge').forEach(el => el.remove());
    const link = document.querySelector('.icons a[href="/wishlist"]');
    if (link && count > 0) {
      const b = document.createElement('span');
      b.className = 'wishlist-badge';
      b.textContent = count;
      b.style.cssText = 'background:#c0392b;color:#fff;font-size:0.66rem;padding:2px 6px;border-radius:10px;margin-left:3px;font-weight:700;min-width:17px;display:inline-block;text-align:center;vertical-align:top;line-height:1.2;';
      link.appendChild(b);
    }
    document.querySelectorAll('.tab-badge[data-for="wishlist"]').forEach(b => { b.hidden = count === 0; b.textContent = count; });
  } catch (e) { /* silent */ }
}
window.updateWishlistBadge = updateWishlistBadge;

function renderNav() {
  const nav = document.getElementById('nav');
  if (!nav) return;
  const user = currentUser();
  const isAdmin = user && user.role === 'admin';

  const navLinks = isAdmin
    ? `
        <li><a href="/admin/dashboard">Dashboard</a></li>
        <li><a href="/admin/products">Products</a></li>
        <li><a href="/admin/orders">Orders</a></li>
        <li><a href="/admin/users">Users</a></li>
        <li><a href="/admin/coupons">Coupons</a></li>
        <li><a href="/admin/returns">Returns</a></li>
        <li><a href="/admin/shipping">Shipping</a></li>
      `
    : `
        <li><a href="/">Home</a></li>
        <li><a href="/shop">Shop</a></li>
        ${user ? `<li><a href="/orders">My Orders</a></li>` : ''}
        <li><a href="/about">About Us</a></li>
        <li><a href="/contact">Contact Us</a></li>
        ${user
          ? `<li class="nav-logout"><a href="#" onclick="logout();return false;">Logout</a></li>`
          : `<li class="nav-logout"><a href="/login">Login / Register</a></li>`}
      `;

  nav.innerHTML = `
    <a href="${isAdmin ? '/admin/dashboard' : '/'}" class="logo">✦ BHUVI BOUTIQUE</a>
    <ul class="nav-links">${navLinks}</ul>
    <div class="icons">
      ${!isAdmin ? `<a href="/wishlist" title="Wishlist">♡</a>` : ''}
      ${!isAdmin ? `<a href="/cart" title="Cart">🛒</a>` : ''}
      ${user
        ? `<span>Hi, ${user.name.split(' ')[0]}</span>
           <button class="btn btn-sm btn-outline" onclick="logout()">Logout</button>`
        : `<a href="/login" class="btn btn-sm">Login</a>`}
    </div>
  `;

  if (isAdmin && !document.getElementById('admNavStyle')) {
    const st = document.createElement('style');
    st.id = 'admNavStyle';
    st.textContent = '@media(min-width:861px){.nav .nav-links{gap:.35rem!important}.nav .nav-links a{font-size:.78rem!important;padding:.45rem .35rem!important}}';
    document.head.appendChild(st);
  }

  updateCartBadge();
  updateWishlistBadge();

  const deskMq = window.matchMedia('(min-width: 861px)');
  const syncLogout = () => {
    nav.querySelectorAll('.nav-logout').forEach(li => { li.style.display = deskMq.matches ? 'none' : ''; });
  };
  syncLogout();
  if (deskMq.addEventListener) deskMq.addEventListener('change', syncLogout);
  else deskMq.addListener(syncLogout);

  let toggle = nav.querySelector('.nav-toggle');
  if (!toggle) {
    toggle = document.createElement('button');
    toggle.className = 'nav-toggle';
    toggle.type = 'button';
    toggle.innerHTML = '☰';
    toggle.setAttribute('aria-label', 'Open menu');
    toggle.onclick = (e) => {
      e.stopPropagation();
      const open = nav.classList.toggle('nav-open');
      toggle.innerHTML = open ? '✕' : '☰';
      toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    };
    nav.appendChild(toggle);
  }
  const close = () => {
    nav.classList.remove('nav-open');
    const tg = nav.querySelector('.nav-toggle');
    if (tg) tg.innerHTML = '☰';
  };
  nav.querySelectorAll('.nav-links a').forEach(a => a.addEventListener('click', close));
  document.addEventListener('click', (e) => { if (!nav.contains(e.target)) close(); });
  window.addEventListener('resize', () => { if (window.innerWidth > 860) close(); });
}

const TAB_ICONS = {
  home: '<svg viewBox="0 0 24 24"><path d="M3 10.5 12 3l9 7.5"/><path d="M5 9.5V21h5v-6h4v6h5V9.5"/></svg>',
  shop: '<svg viewBox="0 0 24 24"><rect x="4" y="4" width="7" height="7" rx="1.5"/><rect x="13" y="4" width="7" height="7" rx="1.5"/><rect x="4" y="13" width="7" height="7" rx="1.5"/><rect x="13" y="13" width="7" height="7" rx="1.5"/></svg>',
  heart: '<svg viewBox="0 0 24 24"><path d="M12 20s-7-4.6-9-9c-1.2-2.7.6-6 3.8-6 2 0 3.2 1 4.2 2.6C12 6 13.2 5 15.2 5c3.2 0 5 3.3 3.8 6-2 4.4-9 9-9 9z"/></svg>',
  bag: '<svg viewBox="0 0 24 24"><path d="M6 7h12l1 14H5L6 7z"/><path d="M9 10V6a3 3 0 0 1 6 0v4"/></svg>',
  orders: '<svg viewBox="0 0 24 24"><path d="M3 7l9-4 9 4-9 4-9-4z"/><path d="M3 7v10l9 4 9-4V7"/><path d="M12 11v10"/></svg>',
  user: '<svg viewBox="0 0 24 24"><circle cx="12" cy="8" r="4"/><path d="M4 21c1.5-4 5-6 8-6s6.5 2 8 6"/></svg>'
};

function renderTabbar() {
  const mq = window.matchMedia('(max-width: 700px)');
  const build = () => {
    const existing = document.querySelector('.m-tabbar');
    if (existing) existing.remove();
    document.body.classList.remove('has-tabbar');
    const user = currentUser();
    if (!mq.matches || (user && user.role === 'admin') || isTxPage()) return;

    const p = location.pathname;
    const tabs = [
      { href: '/', icon: TAB_ICONS.home, label: 'Home', on: p === '/' },
      { href: '/shop', icon: TAB_ICONS.shop, label: 'Shop', on: p.startsWith('/shop') || p.startsWith('/product') },
      { href: '/wishlist', icon: TAB_ICONS.heart, label: 'Wishlist', on: p.startsWith('/wishlist'), badge: 'wishlist' },
      { href: '/cart', icon: TAB_ICONS.bag, label: 'Bag', on: p.startsWith('/cart') || p.startsWith('/checkout'), badge: 'cart' },
      user
        ? { href: '/orders', icon: TAB_ICONS.orders, label: 'Orders', on: p.startsWith('/orders') }
        : { href: '/login', icon: TAB_ICONS.user, label: 'Account', on: p.startsWith('/login') || p.startsWith('/register') }
    ];

    const bar = document.createElement('nav');
    bar.className = 'm-tabbar';
    bar.setAttribute('aria-label', 'Primary');
    bar.innerHTML = tabs.map(t => `
      <a href="${t.href}" class="m-tab${t.on ? ' active' : ''}">
        <span class="m-tab-ico">${t.icon}${t.badge ? `<i class="tab-badge" data-for="${t.badge}" hidden>0</i>` : ''}</span>
        <span class="m-tab-label">${t.label}</span>
      </a>`).join('');
    document.body.appendChild(bar);
    document.body.classList.add('has-tabbar');
    updateCartBadge();
    updateWishlistBadge();
  };
  build();
  if (mq.addEventListener) mq.addEventListener('change', build);
  else mq.addListener(build);
}

function renderCartBar() {
  if (!location.pathname.startsWith('/cart')) return;
  let bar = null;
  let timer = null;

  const build = async () => {
    try {
      if (!token()) { if (bar) { bar.remove(); bar = null; document.body.classList.remove('has-cartbar'); } return; }
      const cart = await api('/api/cart');
      const items = Array.isArray(cart) ? cart : (cart.items || cart.cartItems || []);
      const count = items.reduce((s, i) => s + (i.quantity || 1), 0);
      const total = items.reduce((s, i) => {
        const p = i.Product || i.product || {};
        return s + (Number(p.price) || 0) * (i.quantity || 1);
      }, 0);

      if (!bar) {
        bar = document.createElement('div');
        bar.className = 'm-cartbar';
        bar.innerHTML = `
          <div class="m-cartbar-sum">
            <strong id="mCartTotal">₹0.00</strong>
            <span id="mCartCount">0 pieces</span>
          </div>
          <a href="/checkout" class="m-cartbar-cta" id="mCartCta">Proceed to Checkout
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/><path d="m13 6 6 6-6 6"/></svg>
          </a>`;
        document.body.appendChild(bar);
        document.body.classList.add('has-cartbar');
      }

      bar.querySelector('#mCartTotal').textContent = money(total);
      bar.querySelector('#mCartCount').textContent = count + (count === 1 ? ' piece' : ' pieces') + ' · incl. all taxes';
      const cta = bar.querySelector('#mCartCta');
      if (count === 0) {
        cta.classList.add('disabled');
        cta.setAttribute('aria-disabled', 'true');
        cta.href = '/shop';
        cta.firstChild.textContent = 'Browse the Collection ';
      } else {
        cta.classList.remove('disabled');
        cta.removeAttribute('aria-disabled');
        cta.href = '/checkout';
        cta.firstChild.textContent = 'Proceed to Checkout ';
      }
    } catch (e) { /* silent */ }
  };

  build();

  const mo = new MutationObserver(muts => {
    const outside = muts.some(m => {
      const t = m.target;
      if (bar && bar.contains(t)) return false;
      if (t.closest && t.closest('.toast, .m-tabbar, .m-cartbar')) return false;
      return true;
    });
    if (!outside) return;
    clearTimeout(timer);
    timer = setTimeout(build, 300);
  });
  mo.observe(document.body, { childList: true, subtree: true, characterData: true });
}
window.updateCartBar = renderCartBar;

(function addShippingTab() {
  function inject() {
    if (!location.pathname.startsWith('/admin')) return;
    const els = Array.from(document.querySelectorAll('a, button'));
    const returnsBtn = els.find(el =>
      (el.getAttribute('href') || '').includes('/admin/returns') ||
      (el.getAttribute('onclick') || '').includes('/admin/returns') ||
      el.textContent.trim() === 'Returns'
    );
    const alreadyThere = els.some(el =>
      (el.getAttribute('href') || '').includes('/admin/shipping') ||
      (el.getAttribute('onclick') || '').includes('/admin/shipping') ||
      el.textContent.trim() === 'Shipping'
    );
    if (!returnsBtn || alreadyThere) return;
    const tag = returnsBtn.tagName.toLowerCase();
    const btn = document.createElement(tag);
    btn.className = returnsBtn.className;
    btn.textContent = 'Shipping';
    if (tag === 'a') btn.href = '/admin/shipping';
    else btn.onclick = () => (location.href = '/admin/shipping');
    returnsBtn.insertAdjacentElement('afterend', btn);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', inject);
  else inject();
})();

document.addEventListener('DOMContentLoaded', () => {
  const u = currentUser();
  if (u && u.role === 'admin' && isStorefront()) { location.replace('/admin/dashboard'); return; }
  tidyFooters();
  renderNav();
  renderTabbar();
  renderCartBar();
});