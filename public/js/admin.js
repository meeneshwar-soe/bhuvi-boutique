/* ==========================================================
   BHUVI BOUTIQUE — ADMIN SHELL + SHARED HELPERS
   ========================================================== */
(function () {
  'use strict';
  if (!location.pathname.startsWith('/admin')) return;
  document.body.classList.add('adm-page');

  /* ----- locate sidebar + main (new markup or legacy markup) ----- */
  var side = document.querySelector('.adm-side, .sidebar, .admin-sidebar, .admin-nav, aside');
  if (!side) {
    var link = document.querySelector('a[href="/admin/dashboard"], a[href="/admin/products"]');
    if (link) side = link.closest('div, nav, aside');
  }
  var main = document.querySelector('.adm-main, .admin-main, .main-content, main');
  if (side) {
    side.classList.add('adm-side');
    if (!main) main = side.nextElementSibling;
  }
  if (main) main.classList.add('adm-main');

  /* ----- active nav state ----- */
  if (side) {
    side.querySelectorAll('a[href]').forEach(function (a) {
      var href = a.getAttribute('href');
      if (href === location.pathname || (href !== '/admin' && location.pathname.startsWith(href))) a.classList.add('active');
    });
  }

  /* ----- scrim ----- */
  var scrim = document.querySelector('.adm-scrim');
  if (!scrim) {
    scrim = document.createElement('div');
    scrim.className = 'adm-scrim';
    document.body.appendChild(scrim);
  }
  var close = function () {
    document.body.classList.remove('adm-open');
    var b = document.querySelector('.adm-burger');
    if (b) { b.innerHTML = '☰'; b.setAttribute('aria-expanded', 'false'); }
  };
  scrim.addEventListener('click', close);
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') close(); });
  window.addEventListener('resize', function () { if (window.innerWidth > 900) close(); });
  if (side) side.querySelectorAll('a').forEach(function (a) { a.addEventListener('click', close); });

  /* ----- mobile topbar with drawer toggle ----- */
  if (!document.querySelector('.adm-topbar')) {
    var bar = document.createElement('div');
    bar.className = 'adm-topbar';
    var title = (document.title || 'Admin').split('·')[0].split('|')[0].trim() || 'Admin';
    bar.innerHTML =
      '<button class="adm-burger" type="button" aria-label="Open admin menu" aria-expanded="false">☰</button>' +
      '<span class="adm-topbar-title"></span>' +
      '<a class="adm-store" href="/" target="_blank" rel="noopener">Store ↗</a>';
    bar.querySelector('.adm-topbar-title').textContent = title;
    var burger = bar.querySelector('.adm-burger');
    burger.addEventListener('click', function () {
      var open = document.body.classList.toggle('adm-open');
      burger.innerHTML = open ? '✕' : '☰';
      burger.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    var nav = document.getElementById('nav');
    if (nav && nav.parentNode) nav.insertAdjacentElement('afterend', bar);
    else document.body.prepend(bar);
  }

  /* ----- shared helpers ----- */
  var STATUS = ['Pending', 'Confirmed', 'Shipped', 'OutForDelivery', 'Delivered', 'Cancelled'];
  var STATUS_LABEL = { Pending: 'Pending', Confirmed: 'Confirmed', Shipped: 'Shipped', OutForDelivery: 'Out for delivery', Delivered: 'Delivered', Cancelled: 'Cancelled', Returned: 'Returned', Replaced: 'Replaced' };
  var STATUS_HUE = { Pending: '#ad5a1f', Confirmed: '#1f5f6b', Shipped: '#2f6fb0', OutForDelivery: '#b38942', Delivered: '#236338', Cancelled: '#b3362a', Returned: '#a12860', Replaced: '#a12860' };

  window.ADM = {
    STATUS: STATUS,
    STATUS_LABEL: STATUS_LABEL,
    STATUS_HUE: STATUS_HUE,
    money: function (n) { return '₹' + Number(n || 0).toFixed(2); },
    arr: function (d, keys) {
      if (Array.isArray(d)) return d;
      for (var i = 0; i < keys.length; i++) if (d && Array.isArray(d[keys[i]])) return d[keys[i]];
      return [];
    },
    getJSON: async function (paths) {
      for (var i = 0; i < paths.length; i++) {
        try {
          var r = await fetch(paths[i], { headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token') } });
          if (r.ok) return await r.json();
        } catch (e) { /* try next */ }
      }
      return null;
    },
    countUp: function (el, target, fmt) {
      var start = performance.now(), dur = 850;
      var step = function (now) {
        var p = Math.min((now - start) / dur, 1);
        var eased = 1 - Math.pow(1 - p, 3);
        el.textContent = fmt(target * eased);
        if (p < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    },
    csv: function (filename, rows) {
      var esc = function (v) { return '"' + String(v == null ? '' : v).replace(/"/g, '""') + '"'; };
      var blob = new Blob([rows.map(function (r) { return r.map(esc).join(','); }).join('\n')], { type: 'text/csv' });
      var a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 400);
    }
  };
})();