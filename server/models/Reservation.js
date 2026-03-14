const mongoose = require('mongoose');

const reservationSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    },
    reservationDate: {
        type: Date,
        required: true
    },
    reservationTime: {
        type: String, // e.g., "19:00"
        required: true
    },
    numberOfGuests: {
        type: Number,
        required: true,
        min: 1
    },
    tableNumber: {
        type: Number
    },
    status: {
        type: String,
        enum: ['pending', 'confirmed', 'cancelled', 'completed'],
        default: 'pending'
    },
    specialRequests: {
        type: String
    },
    occasion: {
        type: String // e.g., "Birthday", "Anniversary"
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Reservation', reservationSchema);
