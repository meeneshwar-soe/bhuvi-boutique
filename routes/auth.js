const express = require('express');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { User } = require('../models');
const protect = require('../middleware/auth');
const { sendMail, welcomeEmail, passwordResetEmail, verifyEmail } = require('../services/email');

const router = express.Router();
const pendingSignups = new Map(); // temporary memory for unverified signups
const signToken = (id) => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '7d' });

// REGISTER
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const existing = await User.findOne({ where: { email } });
    if (existing) return res.status(400).json({ error: 'Email already registered' });

    const verifyToken = crypto.randomBytes(32).toString('hex');
    pendingSignups.set(email.toLowerCase(), {
      name, password, token: verifyToken,
      expires: Date.now() + 60 * 60 * 1000 // 1 hour
    });

    const verifyUrl = `${process.env.CLIENT_URL || 'http://localhost:5000'}/auth/verify-email?token=${verifyToken}`;
        const sent = await sendMail({ to: email, ...verifyEmail(name, verifyUrl) });
    if (!sent) {
      pendingSignups.delete(email.toLowerCase());
      return res.status(500).json({ error: 'Could not send the verification email right now. Please try again.' });
    }

        res.json({ success: true, message: 'Verification link sent! Please check your email to activate your account.' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// LOGIN
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ where: { email } });
    if (!user || user.suspended) return res.status(401).json({ error: 'Email not registered' });

    const valid = await user.comparePassword(password);
    if (!valid) return res.status(401).json({ error: 'Wrong Password. Please try Again Later' });

    res.json({ token: signToken(user.id), user: { id: user.id, name: user.name, email, role: user.role } });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// FORGOT PASSWORD
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ where: { email } });
    
    if (!user) return res.json({ success: true, message: 'If email exists, reset link sent' });

    const token = crypto.randomBytes(32).toString('hex');
    user.resetToken = token;
    user.resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hour
    await user.save();

    const clientUrl = (process.env.CLIENT_URL || 'http://localhost:5000').trim();
    const resetUrl = `${clientUrl}/reset-password?token=${token}`;
    
    console.log('🔗 EXACT LINK SENT TO EMAIL:', resetUrl);
    await sendMail({ to: user.email, ...passwordResetEmail(user.name, resetUrl) });

    res.json({ success: true, message: 'Reset link sent to your email' });
  } catch (error) {
    console.error('❌ Forgot password error:', error);
    res.status(500).json({ error: 'Failed to send reset email' });
  }
});

// RESET PASSWORD
router.post('/reset-password', async (req, res) => {
  try {
    const { token, password } = req.body;
    
    if (!token || !password) {
      return res.status(400).json({ error: 'Token and password are required' });
    }

    const user = await User.findOne({ where: { resetToken: token } });
    
    if (!user) {
      console.log('❌ No user found with this token');
      return res.status(400).json({ error: 'Invalid or expired token' });
    }
    
    if (!user.resetTokenExpiry || new Date(user.resetTokenExpiry) < new Date()) {
      console.log('❌ Token expired');
      return res.status(400).json({ error: 'Token expired' });
    }

    user.password = password; 
    user.resetToken = null;
    user.resetTokenExpiry = null;
    
    await user.save();

    console.log('✅ Password successfully updated for:', user.email);
    res.json({ success: true, message: 'Password reset successful' });
  } catch (error) {
    console.error('❌ Reset password error:', error);
    res.status(500).json({ error: error.message });
  }
});

// VERIFY EMAIL (user clicks link from inbox)
router.get('/verify-email', async (req, res) => {
  try {
    const { token } = req.query;
    let foundEmail = null, foundData = null;

    for (const [email, data] of pendingSignups.entries()) {
      if (data.token === token) { foundEmail = email; foundData = data; break; }
    }

    if (!foundData || Date.now() > foundData.expires) {
      return res.send('<h2 style="font-family:sans-serif;text-align:center;margin-top:4rem; color:red;">❌ Invalid or expired link.</h2>');
    }

    // Create the user in the database ONLY NOW
    await User.create({ 
      name: foundData.name, 
      email: foundEmail, 
      password: foundData.password, 
      role: 'customer' 
    });
    pendingSignups.delete(foundEmail);

    // Send a clean "Success" page instead of auto-logging in
    res.send(`<!DOCTYPE html>
    <html>
    <head><title>Email Verified</title></head>
    <body style="font-family:sans-serif; background:#faf8f5; display:flex; align-items:center; justify-content:center; height:100vh; margin:0;">
      <div style="text-align:center; background:#fff; padding:3rem 4rem; border-radius:12px; border-top:5px solid #27ae60; box-shadow:0 10px 30px rgba(0,0,0,.12);">
        <div style="font-size:4rem;">✅</div>
        <h1 style="color:#27ae60; margin:.5rem 0; font-family:Georgia,serif;">Email Verified!</h1>
        <p style="color:#666; font-size:1.1rem;">Your account is now active.<br>Please log in on your device to start shopping.</p>
        <a href="/login" style="display:inline-block; margin-top:1.5rem; background:#b8860b; color:#fff; padding:0.8rem 2rem; text-decoration:none; border-radius:6px; font-weight:bold;">GO TO LOGIN</a>
      </div>
    </body>
    </html>`);
  } catch (error) {
    console.error(' Verify email error:', error);
    res.status(500).send('Verification failed: ' + error.message);
  }
});
  

// CHECK IF EMAIL IS VERIFIED (for polling from registration device)
router.get('/check-verification', async (req, res) => {
  try {
    const { email } = req.query;
    if (!email) return res.json({ verified: false });

    const user = await User.findOne({ where: { email } });
    res.json({ verified: !!user }); // true if user exists in database
  } catch (error) {
    res.json({ verified: false });
  }
});

module.exports = router;