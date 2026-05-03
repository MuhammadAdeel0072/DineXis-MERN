const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    name: { type: String, required: true },
    image: { type: String, required: true },
    description: { type: String, required: true },
    category: {
        type: String,
        required: true
    },
    price: { type: Number, default: 0 },
    countInStock: { type: Number, required: true, default: 0 },
    lowStockThreshold: { type: Number, default: 10 },
    isAvailable: { type: Boolean, default: true },
    isSpecial: { type: Boolean, default: false },
    spicyLevel: { type: Number, default: 0 },
    isVegetarian: { type: Boolean, default: false },
    isBestSeller: { type: Boolean, default: false },
    preparationTime: { type: Number, default: 20 },
    dietaryInfo: [String],
    hasVariants: { type: Boolean, default: false },
    variants: [
        {
            name: { type: String, required: true },
            price: { type: Number, required: true },
            prepTime: { type: Number, default: 0 }
        }
    ],
    tags: {
        type: [String],
        default: []
    },
}, {
    timestamps: true
});

// Pre-save validation for variants
productSchema.pre('save', async function() {
    if (this.hasVariants && this.variants && this.variants.length > 0) {
        const variantNames = this.variants.map(v => v.name.toLowerCase().trim());
        const uniqueNames = new Set(variantNames);
        if (uniqueNames.size !== variantNames.length) {
            throw new Error('Duplicate variant names found');
        }

        for (const variant of this.variants) {
            if (!variant.name || variant.name.trim() === '') {
                throw new Error('Each variant must have a name');
            }
            if (variant.price === undefined || variant.price === null || variant.price < 0) {
                throw new Error(`Variant '${variant.name}' must have a valid price`);
            }
        }
    } else if (this.hasVariants && (!this.variants || this.variants.length === 0)) {
        throw new Error('Products with variations enabled must have at least one variant');
    }
});

// Index for category filtering
productSchema.index({ category: 1 });

module.exports = mongoose.model('Product', productSchema);
