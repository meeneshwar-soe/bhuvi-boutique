const SibApiV3Sdk = require('sib-api-v3-sdk');

let defaultClient = SibApiV3Sdk.ApiClient.instance;
let apiKey = defaultClient.authentications['api-key'];
apiKey.apiKey = process.env.BREVO_API_KEY;

let apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();

const sendMail = async ({ to, subject, html }) => {
  try {
    let sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();
    sendSmtpEmail.sender = { name: 'Bhuvi Boutique', email: 'g4326777@gmail.com' };
    sendSmtpEmail.to = [{ email: to }];
    sendSmtpEmail.subject = subject;
    sendSmtpEmail.htmlContent = html;

    await apiInstance.sendTransacEmail(sendSmtpEmail);
    console.log('✅ Email sent to:', to);
    return true;
  } catch (error) {
    console.error('⚠️ Email failed (non-critical):', error.response ? error.response.body : error.message);
    return false;
  }
};

// ===== EMAIL TEMPLATES =====

const welcomeEmail = (name) => ({
  subject: 'Welcome!',
  html: `<h1>Welcome ${name} to the Bhuvi Boutique</h1>`
});

const passwordResetEmail = (name, url) => ({
  subject: 'Reset Password',
  html: `<h1>Hi ${name}</h1><p>Click here: <a href="${url}">Reset Password</a></p>`
});

const orderPlacedEmail = (name, id, total) => ({
  subject: 'Order Placed',
  html: `<h1>Your Order with id ${id} is placed. Total Amount: ₹${total}</h1>. Thank you for Ordering Keep Ordering.`
});

const orderStatusEmail = (name, id, status) => ({
  subject: 'Order Update',
  html: `<h1>Order #${id} is now ${status}</h1>`
});

// Email Verification
const verifyEmail = (name, url) => ({
  subject: 'Verify your email — Bhuvi Boutique',
  html: `<div style="font-family:sans-serif;max-width:600px;margin:auto;padding:2rem;background:#faf8f5">
    <h1 style="color:#b8860b">✦ Bhuvi BOUTIQUE</h1>
    <p>Hi <strong>${name}</strong>,</p>
    <p>Click below to activate your account. If this was not you, ignore this email.</p>
    <p style="text-align:center;margin:2rem 0">
      <a href="${url}" style="background:#b8860b;color:#fff;padding:0.8rem 2rem;text-decoration:none;border-radius:4px">Verify My Email</a>
    </p></div>`
});

// Account Suspended Email
const accountSuspendedEmail = (name, reason) => ({
  subject: 'Your Bhuvi Boutique Account Has Been Suspended',
  html: `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #eee; border-radius: 8px; overflow: hidden;">
      <div style="background: #111; color: #d4af37; padding: 20px; text-align: center;">
        <h2 style="margin:0;">✦ Bhuvi BOUTIQUE</h2>
      </div>
      <div style="padding: 30px;">
        <h3 style="color: #c0392b;">Account Suspended</h3>
        <p>Dear ${name},</p>
        <p>Your Bhuvi Boutique account has been <strong>suspended</strong> by our administration team.</p>
        ${reason ? `<p><strong>Reason:</strong> ${reason}</p>` : ''}
        <p style="background:#fdecea; padding:12px; border-left:4px solid #c0392b;">
          While suspended, you cannot log in or place new orders. Your previous orders remain unaffected.
        </p>
        <p>If you believe this is a mistake, please contact support at
          <a href="mailto:g4326777@gmail.com">g43267772007@gmail.com</a>.
        </p>
        <p>— The Bhuvi Boutique Team</p>
      </div>
    </div>
  `
});

// Account Reactivated Email
const accountActivatedEmail = (name) => ({
  subject: 'Your Bhuvi Boutique Account Has Been Reactivated',
  html: `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #eee; border-radius: 8px; overflow: hidden;">
      <div style="background: #111; color: #d4af37; padding: 20px; text-align: center;">
        <h2 style="margin:0;">✦ Bhuvi BOUTIQUE</h2>
      </div>
      <div style="padding: 30px;">
        <h3 style="color: #27ae60;">Account Reactivated</h3>
        <p>Dear ${name},</p>
        <p>Great news! Your Bhuvi Boutique account has been <strong>reactivated</strong>.</p>
        <p>You can now log in and continue shopping as usual.</p>
        <p style="background:#eafaf1; padding:12px; border-left:4px solid #27ae60;">Welcome back! We are happy to see you again.</p>
        <p>— The Bhuvi Boutique Team</p>
      </div>
    </div>
  `
});

// ✅ Order Out for Delivery Email Template
const outForDeliveryEmail = (customerName, orderId) => ({
  subject: '🚚 Your Order is Out for Delivery!',
  html: `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: #141210; padding: 20px; text-align: center;">
        <h1 style="color: #b38942; margin: 0;">✦ Bhuvi BOUTIQUE</h1>
      </div>
      <div style="padding: 30px 20px; background: #fcfaf7;">
        <h2 style="color: #2b2013; margin-top: 0;">Your Order is Out for Delivery! 🚚</h2>
        <p style="color: #555; font-size: 16px;">Dear <strong>${customerName}</strong>,</p>
        <p style="color: #555; font-size: 16px;">Great news! Your order <strong>#${orderId}</strong> is on its way to you.</p>
        
        <div style="background: #fff; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #e67e22;">
          <p style="margin: 5px 0;"><strong>Order ID:</strong> #${orderId}</p>
          <p style="margin: 5px 0;"><strong>Status:</strong> <span style="color: #e67e22; font-weight: bold;">Out for Delivery</span></p>
          <p style="margin: 15px 0 5px 0;">Our delivery partner is on the way. Please keep your phone nearby for the delivery call.</p>
        </div>

        <p style="color: #555; font-size: 16px;">Thank you for shopping with Bhuvi Boutique! ✨</p>
      </div>
      <div style="background: #141210; padding: 15px; text-align: center; color: #b38942; font-size: 12px;">
        © 2024 Bhuvi Boutique. All rights reserved.
      </div>
    </div>
  `
});

// ✅ Order Delivered Email Template
const orderDeliveredEmail = (customerName, orderId, orderTotal) => ({
  subject: '🎉 Your Order Has Been Delivered!',
  html: `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: #141210; padding: 20px; text-align: center;">
        <h1 style="color: #b38942; margin: 0;">✦ Bhuvi BOUTIQUE</h1>
      </div>
      <div style="padding: 30px 20px; background: #fcfaf7;">
        <h2 style="color: #2b2013; margin-top: 0;">Your Order Has Been Delivered! 🎉</h2>
        <p style="color: #555; font-size: 16px;">Dear <strong>${customerName}</strong>,</p>
        <p style="color: #555; font-size: 16px;">Great news! Your order <strong>#${orderId}</strong> has been successfully delivered.</p>
        
        <div style="background: #fff; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #b38942;">
          <p style="margin: 5px 0;"><strong>Order ID:</strong> #${orderId}</p>
          <p style="margin: 5px 0;"><strong>Total Amount:</strong> ₹${orderTotal}</p>
          <p style="margin: 5px 0;"><strong>Status:</strong> <span style="color: #27ae60; font-weight: bold;">Delivered</span></p>
        </div>

        <p style="color: #555; font-size: 16px;">We hope you love your purchase! If you have any questions or concerns, please don't hesitate to contact us.</p>
        
        <p style="color: #555; font-size: 16px;">Thank you for shopping with Bhuvi Boutique! ✨</p>
        
        <div style="text-align: center; margin-top: 30px;">
          <a href="http://localhost:5000/orders" style="background: #b38942; color: #fff; padding: 12px 30px; text-decoration: none; border-radius: 4px; display: inline-block;">View My Orders</a>
        </div>
      </div>
      <div style="background: #141210; padding: 15px; text-align: center; color: #b38942; font-size: 12px;">
        © 2024 Bhuvi Boutique. All rights reserved.
      </div>
    </div>
  `
});

// ✅ Order Cancelled Email Template
const orderCancelledEmail = (customerName, orderId, reason = '') => ({
  subject: '❌ Your Order Has Been Cancelled',
  html: `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: #141210; padding: 20px; text-align: center;">
        <h1 style="color: #b38942; margin: 0;">✦ Bhuvi BOUTIQUE</h1>
      </div>
      <div style="padding: 30px 20px; background: #fcfaf7;">
        <h2 style="color: #c0392b; margin-top: 0;">Your Order Has Been Cancelled ❌</h2>
        <p style="color: #555; font-size: 16px;">Dear <strong>${customerName}</strong>,</p>
        <p style="color: #555; font-size: 16px;">Your order <strong>#${orderId}</strong> has been cancelled.</p>
        
        ${reason ? `<div style="background: #fdecea; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #c0392b;">
          <p style="margin: 0;"><strong>Reason:</strong> ${reason}</p>
        </div>` : ''}
        
        <div style="background: #fff; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #c0392b;">
          <p style="margin: 5px 0;"><strong>Order ID:</strong> #${orderId}</p>
          <p style="margin: 5px 0;"><strong>Status:</strong> <span style="color: #c0392b; font-weight: bold;">Cancelled</span></p>
        </div>

        <p style="color: #555; font-size: 16px;">If you have any questions about this cancellation, please contact our support team.</p>
        
        <p style="color: #555; font-size: 16px;">We apologize for any inconvenience and hope to serve you again soon.</p>
      </div>
      <div style="background: #141210; padding: 15px; text-align: center; color: #b38942; font-size: 12px;">
        © 2024 Bhuvi Boutique. All rights reserved.
      </div>
    </div>
  `
});

// ... (keep all your existing code above this) ...

// ✅ NEW: Return Accepted Email Template
const returnAcceptedEmail = (customerName, orderId, type, reason) => ({
  subject: '✅ Your Return Request Has Been Accepted',
  html: `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: #141210; padding: 20px; text-align: center;">
        <h1 style="color: #b38942; margin: 0;">✦ Bhuvi BOUTIQUE</h1>
      </div>
      <div style="padding: 30px 20px; background: #fcfaf7;">
        <h2 style="color: #27ae60; margin-top: 0;">Return Request Accepted ✅</h2>
        <p style="color: #555; font-size: 16px;">Dear <strong>${customerName}</strong>,</p>
        <p style="color: #555; font-size: 16px;">We have reviewed your request for Order <strong>#${orderId}</strong> and it has been <strong>accepted</strong>.</p>
        
        <div style="background: #fff; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #27ae60;">
          <p style="margin: 5px 0;"><strong>Order ID:</strong> #${orderId}</p>
          <p style="margin: 5px 0;"><strong>Request Type:</strong> ${type || 'Return'}</p>
          <p style="margin: 5px 0;"><strong>Reason:</strong> ${reason || 'Not specified'}</p>
          <p style="margin: 5px 0;"><strong>Status:</strong> <span style="color: #27ae60; font-weight: bold;">Accepted</span></p>
        </div>

        <p style="color: #555; font-size: 16px;">Our team will contact you shortly with the next steps for the ${type === 'Replace' ? 'replacement' : 'return pickup'} process.</p>
        
        <p style="color: #555; font-size: 16px;">Thank you for shopping with Bhuvi Boutique! ✨</p>
      </div>
      <div style="background: #141210; padding: 15px; text-align: center; color: #b38942; font-size: 12px;">
        © 2024 Bhuvi Boutique. All rights reserved.
      </div>
    </div>
  `
});

// ✅ NEW: Return Rejected Email Template
const returnRejectedEmail = (customerName, orderId, type, reason) => ({
  subject: '❌ Your Return Request Has Been Rejected',
  html: `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: #141210; padding: 20px; text-align: center;">
        <h1 style="color: #b38942; margin: 0;">✦ Bhuvi BOUTIQUE</h1>
      </div>
      <div style="padding: 30px 20px; background: #fcfaf7;">
        <h2 style="color: #c0392b; margin-top: 0;">Return Request Rejected ❌</h2>
        <p style="color: #555; font-size: 16px;">Dear <strong>${customerName}</strong>,</p>
        <p style="color: #555; font-size: 16px;">We have reviewed your request for Order <strong>#${orderId}</strong>. Unfortunately, we are unable to process this request at this time.</p>
        
        <div style="background: #fff; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #c0392b;">
          <p style="margin: 5px 0;"><strong>Order ID:</strong> #${orderId}</p>
          <p style="margin: 5px 0;"><strong>Request Type:</strong> ${type || 'Return'}</p>
          <p style="margin: 5px 0;"><strong>Reason provided:</strong> ${reason || 'Not specified'}</p>
          <p style="margin: 5px 0;"><strong>Status:</strong> <span style="color: #c0392b; font-weight: bold;">Rejected</span></p>
        </div>

        <p style="color: #555; font-size: 16px;">If you believe this is a mistake or have further questions, please reply to this email or contact our support team directly.</p>
        
        <p style="color: #555; font-size: 16px;">Thank you for understanding.</p>
      </div>
      <div style="background: #141210; padding: 15px; text-align: center; color: #b38942; font-size: 12px;">
        © 2024 Bhuvi Boutique. All rights reserved.
      </div>
    </div>
  `
});

// ===== UPDATE EXPORTS =====
module.exports = {
  sendMail,
  welcomeEmail,
  passwordResetEmail,
  orderPlacedEmail,
  orderStatusEmail,
  verifyEmail,
  accountSuspendedEmail,
  accountActivatedEmail,
  outForDeliveryEmail,
  orderDeliveredEmail,
  orderCancelledEmail,
  returnAcceptedEmail,     // ✅ Added
  returnRejectedEmail      // ✅ Added
};