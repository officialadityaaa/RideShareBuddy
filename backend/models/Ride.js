// backend/models/Ride.js
const mongoose = require('mongoose');

const RideSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: {
        type: String,
        required: true,
        lowercase: true,
        trim: true,
    },
     userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // Add this line
    startTime: { type: Date, required: true },  // Add journey start time
    initialLocation: {
        lat: { type: Number, required: true },
        lng: { type: Number, required: true }
    },
    finalLocation: {
        lat: { type: Number, required: true },
        lng: { type: Number, required: true }
    }
});

const Ride = mongoose.model('Ride', RideSchema);
module.exports = Ride;
