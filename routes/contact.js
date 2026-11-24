const express = require('express');

const protect = require('../middleware/auth');   // ✅ add this line

const { sendMail } = require('../services/email');

const router = express.Router();

// ==========================================
// CONFIG
// ==========================================
const BUSINESS_EMAIL = 'meeneshwar2007@gmail.com';

const SUBJECTS = [
  'Order enquiry',
  'Return or exchange',
  'Payment issue',
  'Product or sizing question',
  'Partnership or wholesale',
  'Privacy request',
  'Other'
];

// Simple per-IP rate limit: max 5 messages per hour (spam protection)
const hits = new Map();

// ==========================================
// POST /api/contact  — PUBLIC (guests + logged-in users)
// ✅ NOTE: No `protect` middleware here on purpose,
//    so visitors can contact you without an account.
// ==========================================
router.post('/', protect, async (req, res) => {
  try {
    // ---------- Rate limiting ----------
    const ip = req.ip || req.headers['x-forwarded-for'] || 'unknown';
    const now = Date.now();
    const log = (hits.get(ip) || []).filter(t => now - t < 3600000); // keep last 1 hour
    if (log.length >= 5) {
      return res.status(429).json({
        error: 'Too many messages sent. Please try again later or email us directly at ' + BUSINESS_EMAIL
      });
    }

    // ---------- Read & validate input ----------
    const { name, email, phone, subject, orderId, message } = req.body || {};

    if (!name || String(name).trim().length < 2) {
      return res.status(400).json({ error: 'Please enter your full name.' });
    }
    if (!email || !/^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i.test(String(email).trim())) {
      return res.status(400).json({ error: 'Please enter a valid email address.' });
    }
    if (phone && !/^[0-9+\-\s()]{8,16}$/.test(String(phone).trim())) {
      return res.status(400).json({ error: 'Please enter a valid phone number or leave it blank.' });
    }
    if (!subject || !SUBJECTS.includes(subject)) {
      return res.status(400).json({ error: 'Please choose a valid subject.' });
    }
    if (!message || String(message).trim().length < 10) {
      return res.status(400).json({ error: 'Please describe your enquiry in at least 10 characters.' });
    }
    if (String(message).length > 2000) {
      return res.status(400).json({ error: 'Message is too long (max 2000 characters).' });
    }

    // ---------- Build reference & record the hit ----------
    const cleanName = String(name).trim().slice(0, 80);
    const cleanEmail = String(email).trim().slice(0, 120);
    const cleanPhone = phone ? String(phone).trim().slice(0, 20) : '';
    const cleanOrder = orderId ? String(orderId).trim().slice(0, 20) : '';
    const cleanMessage = String(message).trim().slice(0, 2000);
    const reference = 'BB-' + Date.now().toString().slice(-6);

    log.push(now);
    hits.set(ip, log);

    console.log(`📬 New contact message ${reference} from ${cleanName} <${cleanEmail}> — ${subject}`);

    // ---------- Send email to business inbox ----------
    await sendMail({
      to: BUSINESS_EMAIL,
      subject: `[Bhuvi Boutique] ${subject} — ${reference}`,
      html: `
        <div style="font-family:Arial,Helvetica,sans-serif;max-width:600px;margin:0 auto;padding:20px;">
          <div style="background:#141210;padding:18px;text-align:center;">
            <h1 style="color:#b38942;margin:0;font-size:22px;letter-spacing:2px;">✦ BHUVI BOUTIQUE</h1>
          </div>
          <div style="padding:24px;background:#fcfaf7;">
            <h2 style="margin:0 0 6px;color:#2b2013;font-size:18px;">New contact message</h2>
            <p style="margin:0 0 18px;color:#7d756d;font-size:13px;">Reference: <strong>${reference}</strong> · ${new Date().toLocaleString('en-IN')}</p>

            <table style="width:100%;border-collapse:collapse;font-size:14px;">
              <tr>
                <td style="padding:9px 12px;background:#fff;border:1px solid #eee;width:110px;"><b>Name</b></td>
                <td style="padding:9px 12px;background:#fff;border:1px solid #eee;">${cleanName}</td>
              </tr>
              <tr>
                <td style="padding:9px 12px;background:#fff;border:1px solid #eee;"><b>Email</b></td>
                <td style="padding:9px 12px;background:#fff;border:1px solid #eee;">
                  <a href="mailto:${cleanEmail}" style="color:#b8860b;">${cleanEmail}</a>
                </td>
              </tr>
              <tr>
                <td style="padding:9px 12px;background:#fff;border:1px solid #eee;"><b>Phone</b></td>
                <td style="padding:9px 12px;background:#fff;border:1px solid #eee;">${cleanPhone ? `<a href="tel:${cleanPhone}" style="color:#b8860b;">${cleanPhone}</a>` : '—'}</td>
              </tr>
              <tr>
                <td style="padding:9px 12px;background:#fff;border:1px solid #eee;"><b>Subject</b></td>
                <td style="padding:9px 12px;background:#fff;border:1px solid #eee;">${subject}</td>
              </tr>
              <tr>
                <td style="padding:9px 12px;background:#fff;border:1px solid #eee;"><b>Order #</b></td>
                <td style="padding:9px 12px;background:#fff;border:1px solid #eee;">${cleanOrder || '—'}</td>
              </tr>
            </table>

            <div style="margin-top:18px;background:#fff;border:1px solid #eee;border-left:4px solid #b8860b;padding:14px;white-space:pre-wrap;color:#4c453e;font-size:14px;line-height:1.6;">${cleanMessage}</div>

            <p style="margin:18px 0 0;color:#7d756d;font-size:12px;">
              Reply directly to <a href="mailto:${cleanEmail}" style="color:#b8860b;">${cleanEmail}</a> from your inbox.
            </p>
          </div>
          <div style="background:#141210;padding:12px;text-align:center;color:#8d8375;font-size:11px;">
            © 2026 Bhuvi Boutique · New Delhi, India
          </div>
        </div>`
    });

    // ---------- Success response ----------
    res.json({ success: true, reference });

  } catch (error) {
    console.error('❌ Contact form error:', error);
    res.status(500).json({
      error: 'Could not send your message right now. Please email us directly at ' + BUSINESS_EMAIL
    });
  }
});

// ==========================================
// GET /api/contact — quick health check (optional, useful for testing)
// ==========================================
router.get('/', (req, res) => {
  res.json({ ok: true, endpoint: 'POST /api/contact', public: true });
});

module.exports = router;