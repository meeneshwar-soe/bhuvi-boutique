const protect = require('./auth');

/* Admin accounts manage the store — they do not shop.
   Mount BEFORE the router to enforce this at the API level. */
const deny = (req, res) => res.status(403).json({
  error: 'Admin accounts manage the store. Shopping actions are disabled for admin — use the Admin Dashboard.'
});

const isAdmin = req => req.user && req.user.role === 'admin';

/* Blocks every method (cart, wishlist, payments) */
const blockAdmin = [
  protect,
  (req, res, next) => (isAdmin(req) ? deny(req, res) : next())
];

/* Blocks only write operations (orders, reviews) */
const blockAdminWrites = [
  (req, res, next) => {
    if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method)) {
      return protect(req, res, () => (isAdmin(req) ? deny(req, res) : next()));
    }
    next();
  }
];

module.exports = { blockAdmin, blockAdminWrites };