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
    variationGroups: [
        {
            name: { type: String, required: true },
            type: { 
                type: String, 
                enum: ['single', 'multi'],
                default: 'single'
            },
            required: { type: Boolean, default: false },
            options: [
                {
                    name: { type: String, required: true },
                    price: { type: Number, required: true },
                    prepTime: { type: Number, default: 0 }
                }
            ]
        }
    ],
}, {
    timestamps: true
});

// Pre-save validation for variationGroups
productSchema.pre('save', async function() {
    if (this.hasVariants && this.variationGroups && this.variationGroups.length > 0) {
        // Validate each variation group
        for (const group of this.variationGroups) {
            if (!group.name || group.name.trim() === '') {
                throw new Error('Each variation group must have a name');
            }
            if (!group.options || group.options.length === 0) {
                throw new Error(`Variation group '${group.name}' must have at least one option`);
            }
            
            const optionNames = group.options.map(o => o.name.toLowerCase().trim());
            const uniqueOptionNames = new Set(optionNames);
            if (uniqueOptionNames.size !== optionNames.length) {
                throw new Error(`Duplicate options found in variation group '${group.name}'`);
            }

            for (const option of group.options) {
                if (!option.name || option.name.trim() === '') {
                    throw new Error(`An option in '${group.name}' is missing a name`);
                }
                if (option.price === undefined || option.price === null || option.price < 0) {
                    throw new Error(`Option '${option.name}' in '${group.name}' must have a valid price`);
                }
            }
        }
    } else if (this.hasVariants && (!this.variationGroups || this.variationGroups.length === 0)) {
        throw new Error('Products with variations enabled must have at least one variation group');
    }
});

// Index for category filtering
productSchema.index({ category: 1 });

module.exports = mongoose.model('Product', productSchema);
