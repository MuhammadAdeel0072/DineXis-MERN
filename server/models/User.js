const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    clerkId: { type: String, required: true, unique: true },
    firstName: { type: String },
    lastName: { type: String },
    email: { type: String, required: true, unique: true },
    avatar: { type: String },
    role: {
        type: String,
        enum: ['customer', 'staff', 'chef', 'admin', 'rider'],
        default: 'customer'
    },
    addresses: [
        {
            street: String,
            city: String,
            state: String,
            zipCode: String,
            isDefault: { type: Boolean, default: false }
        }
    ],
    favorites: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],
    loyaltyPoints: { type: Number, default: 0 },
    loyaltyTier: {
        type: String,
        enum: ['Bronze', 'Silver', 'Gold', 'Platinum'],
        default: 'Bronze'
    }
}, {
    timestamps: true
});



module.exports = mongoose.model('User', userSchema);
