require('dotenv').config();

const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const { sequelize } = require('./models');
const { blockAdmin, blockAdminWrites } = require('./middleware/blockAdmin');

const app = express();
app.set('trust proxy', true);

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));

// Multer Configuration for Image Uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'public/uploads/products/'),
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});
const upload = multer({ storage });
app.set('upload', upload);

/* ==========================================================
   PAGE SENDER
   - viewport / theme-color / mobile.css on every page
   - admin.css + admin.js on admin pages
   - early admin guard on storefront pages: an admin session
     is redirected to the dashboard before the page paints
   ========================================================== */
const ADM_GUARD = '<script>/*adm-guard*/(function(){try{var u=JSON.parse(localStorage.getItem("user")||"null");if(u&&u.role==="admin"){var p=location.pathname;if(p==="/"||p==="/shop"||p==="/cart"||p==="/wishlist"||p==="/checkout"||p==="/orders"||p.indexOf("/product/")===0){location.replace("/admin/dashboard");}}}catch(e){}})();</script>';

function sendPage(res, filePath, isAdmin) {
  let html;
  try {
    html = fs.readFileSync(filePath, 'utf8');
  } catch (e) {
    return res.status(404).send('Page not found');
  }

  if (!/name=["']viewport["']/i.test(html)) {
    const tag = '<meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover">';
    html = /<head[^>]*>/i.test(html)
      ? html.replace(/<head[^>]*>/i, m => m + '\n  ' + tag)
      : tag + '\n' + html;
  }

  if (!/name=["']theme-color["']/i.test(html)) {
    const tag = '<meta name="theme-color" content="#141210">';
    html = /<head[^>]*>/i.test(html)
      ? html.replace(/<head[^>]*>/i, m => m + '\n  ' + tag)
      : html;
  }

  if (!isAdmin && !/adm-guard/.test(html)) {
    html = /<head[^>]*>/i.test(html)
      ? html.replace(/<head[^>]*>/i, m => m + '\n  ' + ADM_GUARD)
      : ADM_GUARD + '\n' + html;
  }

  if (!/mobile\.css/i.test(html)) {
    const link = '<link rel="stylesheet" href="/css/mobile.css">';
    html = /<\/head>/i.test(html)
      ? html.replace(/<\/head>/i, '  ' + link + '\n</head>')
      : html + '\n' + link;
  }

  if (isAdmin) {
    if (!/admin\.css/i.test(html)) {
      const link = '<link rel="stylesheet" href="/css/admin.css">';
      html = /<\/head>/i.test(html)
        ? html.replace(/<\/head>/i, '  ' + link + '\n</head>')
        : html + '\n' + link;
    }
    if (!/admin\.js/i.test(html)) {
      const scr = '<script src="/js/admin.js"></script>';
      html = /<\/body>/i.test(html)
        ? html.replace(/<\/body>/i, '  ' + scr + '\n</body>')
        : html + '\n' + scr;
    }
  }

  res.type('html').send(html);
}

const view = f => path.join(__dirname, 'views', f);

// ==========================================
// CUSTOMER PAGES
// ==========================================
app.get('/', (req, res) => sendPage(res, view('index.html'), false));
app.get('/login', (req, res) => sendPage(res, view('login.html'), false));
app.get('/register', (req, res) => sendPage(res, view('register.html'), false));
app.get('/forgot-password', (req, res) => sendPage(res, view('forgot-password.html'), false));
app.get('/reset-password', (req, res) => sendPage(res, view('reset-password.html'), false));
app.get('/shop', (req, res) => sendPage(res, view('shop.html'), false));
app.get('/product/:id', (req, res) => sendPage(res, view('product.html'), false));
app.get('/cart', (req, res) => sendPage(res, view('cart.html'), false));
app.get('/wishlist', (req, res) => sendPage(res, view('wishlist.html'), false));
app.get('/checkout', (req, res) => sendPage(res, view('checkout.html'), false));
app.get('/orders', (req, res) => sendPage(res, view('orders.html'), false));

// ==========================================
// LEGAL & INFORMATION PAGES
// ==========================================
app.get('/terms', (req, res) => sendPage(res, view('terms.html'), false));
// ✅ Privacy is now combined into /terms — no separate page
app.get('/return-policy', (req, res) => sendPage(res, view('return-policy.html'), false));
app.get('/shipping-policy', (req, res) => sendPage(res, view('shipping-policy.html'), false));
app.get('/about', (req, res) => sendPage(res, view('about.html'), false));
app.get('/contact', (req, res) => sendPage(res, view('contact.html'), false));

// ==========================================
// ADMIN PAGES
// ==========================================
app.get('/admin', (req, res) => res.redirect('/admin/dashboard'));
app.get('/admin/:page', (req, res) => {
  const page = String(req.params.page).replace(/[^a-z0-9-]/gi, '');
  sendPage(res, path.join(__dirname, 'views', 'admin', page + '.html'), true);
});

// ==========================================
// APIs — shopping endpoints refuse admin sessions
// ==========================================
app.use('/auth', require('./routes/auth'));
app.use('/api/auth', require('./routes/auth'));
app.use('/api/products', require('./routes/products'));
app.use('/api/admin/products', require('./routes/products'));
app.use('/api/cart', blockAdmin, require('./routes/cart'));
app.use('/api/wishlist', blockAdmin, require('./routes/wishlist'));
app.use('/api/orders', blockAdminWrites, require('./routes/orders'));
app.use('/api/reviews', blockAdminWrites, require('./routes/reviews'));
app.use('/api/coupons', require('./routes/coupons'));
app.use('/api/payments', blockAdmin, require('./routes/payments'));
app.use('/api/shipping', require('./routes/shipping'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/contact', require('./routes/contact'));

// ==========================================
// 404 + ERROR HANDLERS
// ==========================================
app.use((req, res) => {
  if (req.path.startsWith('/api/')) return res.status(404).json({ error: 'API endpoint not found' });
  res.status(404).send('Page not found');
});

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: err.message });
});

// ==========================================
// START
// ==========================================
const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server listening on port ${PORT}`);
});

sequelize.authenticate()
  .then(() => console.log('✅ Database connected successfully'))
  .catch(err => console.error('❌ DB connection error:', err.message));