const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const Product = require('./models/Product');
const connectDB = require('./config/db');

// Load env vars
dotenv.config({ path: path.join(__dirname, '.env') });

const seedTags = async () => {
    try {
        await connectDB();
        console.log('Connected to DB');

        const products = await Product.find({});
        console.log(`Found ${products.length} products.`);

        const validTags = ["heavy", "budget", "quick", "premium"];

        let updatedCount = 0;

        for (let product of products) {
            let tags = product.tags || [];
            
            // Filter out invalid tags if any
            tags = tags.filter(t => validTags.includes(t));

            // If empty, assign based on some logic
            if (tags.length === 0) {
                if (product.price > 1500) {
                    tags.push("premium");
                    tags.push("heavy");
                } else if (product.price < 500) {
                    tags.push("budget");
                    tags.push("quick");
                } else if (product.category === "Pizza" || product.category === "Burgers") {
                    tags.push("heavy");
                } else if (product.category === "Drinks") {
                    tags.push("quick");
                } else {
                    // Random pick one if nothing matches
                    const randomTag = validTags[Math.floor(Math.random() * validTags.length)];
                    tags.push(randomTag);
                }
            }

            // Deduplicate
            tags = [...new Set(tags)];

            product.tags = tags;
            await product.save();
            updatedCount++;
        }

        console.log(`Updated ${updatedCount} products with valid tags.`);
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

seedTags();
