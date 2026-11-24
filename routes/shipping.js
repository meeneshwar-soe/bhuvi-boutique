const express = require('express');
const { ShippingZone } = require('../models');
const { Op } = require('sequelize');

const router = express.Router();

// Public API: Get applicable shipping zone for a location
router.get('/calculate', async (req, res) => {
  try {
    const { pincode, city, state, country, subtotal } = req.query;
    
    console.log(' Checking delivery for:', { pincode, city, state, country, subtotal });
    
    let zone = null;

    // Priority 1: Pincode match (most specific)
    if (pincode) {
      zone = await ShippingZone.findOne({
        where: {
          zoneType: 'pincode',
          pincode: { [Op.like]: `%${pincode}%` },
          isActive: true
        }
      });
      if (zone) console.log('✅ Matched by Pincode:', zone.zoneName);
    }

    // Priority 2: City match
    if (!zone && city) {
      zone = await ShippingZone.findOne({
        where: {
          zoneType: 'city',
          city: { [Op.like]: `%${city}%` },
          isActive: true
        }
      });
      if (zone) console.log('✅ Matched by City:', zone.zoneName);
    }

    // Priority 3: State match (this is what should work for Delhi)
    if (!zone && state) {
      zone = await ShippingZone.findOne({
        where: {
          zoneType: 'state',
          state: { [Op.like]: `%${state}%` },
          isActive: true
        }
      });
      if (zone) console.log('✅ Matched by State:', zone.zoneName);
    }

    // Priority 4: Country match (fallback)
    if (!zone && country) {
      zone = await ShippingZone.findOne({
        where: {
          zoneType: 'country',
          country: { [Op.like]: `%${country}%` },
          isActive: true
        }
      });
      if (zone) console.log('✅ Matched by Country:', zone.zoneName);
    }

    if (!zone) {
      console.log('❌ No delivery zone found for:', { city, state, country });
      return res.status(404).json({ error: 'No shipping zone found for this location' });
    }

    // ✅ FIXED: Use baseShippingCost (matches your admin form field name)
    const shippingCost = subtotal >= (zone.freeShippingAbove || 999999) 
      ? 0 
      : (zone.baseShippingCost || 0);

    console.log(' Shipping cost:', shippingCost, 'Zone:', zone.zoneName);

    res.json({
      zone: zone.zoneName,
      shippingCost: parseFloat(shippingCost),
      freeShippingAbove: zone.freeShippingAbove ? parseFloat(zone.freeShippingAbove) : null,
      estimatedDelivery: zone.estimatedDeliveryDays
    });
  } catch (error) {
    console.error(' Shipping calculation error:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;