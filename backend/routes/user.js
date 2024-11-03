const express = require('express');
const router = express.Router();
const Ride = require('../models/Ride');
const User = require('../models/User');
// POST route to submit ride info
function ensureAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    return res.status(401).json({ message: 'Unauthorized' });
}
router.post('/submit-ride', ensureAuthenticated, async (req, res) => {
    const { name, email, startTime, initialLocation, finalLocation } = req.body;
    console.log(req.body);
    console.log('Authenticated User:', req.user);
    
    const userId = req.user._id;

    try {
        const ride = new Ride({
            name,
            email,
            initialLocation,
            userId,
            finalLocation,
            startTime
        });
        await ride.save();
        res.status(201).json({ message: 'Ride info submitted successfully' });
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: err.message });
    }
});
router.get('/chatt', ensureAuthenticated, async (req, res) => {
    try {
      const users = await User.find().select('-password'); // Exclude password field
      res.status(200).json(users);
    } catch (error) {
      console.error('Error fetching users:', error);
      res.status(500).json({ message: 'Server error' });
    }
  });

module.exports = router;
