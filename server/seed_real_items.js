const mongoose = require('mongoose');
const path = require('path');
const dotenv = require('dotenv');
const Product = require('./models/Product');

dotenv.config({ path: path.join(__dirname, '.env') });

const items = [
    // Drinks
    { name: 'Mint Margarita', category: 'Drinks', price: 250, description: 'Cool and refreshing mint drink', image: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=500', preparationTime: 5, isVegetarian: true, countInStock: 50 },
    { name: 'Cold Coffee', category: 'Drinks', price: 350, description: 'Creamy coffee with ice cream', image: 'https://images.unsplash.com/photo-1517701604599-bb29b565090c?w=500', preparationTime: 8, isVegetarian: true, countInStock: 50 },
    { name: 'Fresh Orange Juice', category: 'Drinks', price: 300, description: 'Freshly squeezed oranges', image: 'https://images.unsplash.com/photo-1624517452488-04869289c4ca?w=500', preparationTime: 5, isVegetarian: true, countInStock: 50 },
    { name: 'Lemonade', category: 'Drinks', price: 200, description: 'Fresh lemon juice with mint', image: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=500', preparationTime: 5, isVegetarian: true, countInStock: 50 },
    { name: 'Strawberry Shake', category: 'Drinks', price: 400, description: 'Sweet strawberry and milk shake', image: 'https://images.unsplash.com/photo-1579739678182-3651a0842740?w=500', preparationTime: 10, isVegetarian: true, countInStock: 50 },
    { name: 'Mango Smoothie', category: 'Drinks', price: 450, description: 'Thick mango smoothie', image: 'https://images.unsplash.com/photo-1546173159-315724a9d669?w=500', preparationTime: 10, isVegetarian: true, countInStock: 50 },
    { name: 'Green Tea', category: 'Drinks', price: 150, description: 'Healthy and warm green tea', image: 'https://images.unsplash.com/photo-1544787210-2213d84ad96b?w=500', preparationTime: 5, isVegetarian: true, countInStock: 50 },
    { name: 'Black Coffee', category: 'Drinks', price: 200, description: 'Strong roasted black coffee', image: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=500', preparationTime: 5, isVegetarian: true, countInStock: 50 },
    { name: 'Iced Latte', category: 'Drinks', price: 450, description: 'Iced milk coffee with syrup', image: 'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=500', preparationTime: 8, isVegetarian: true, countInStock: 50 },
    { name: 'Peach Juice', category: 'Drinks', price: 300, description: 'Fresh and sweet peach nectar', image: 'https://images.unsplash.com/photo-1595981267035-7b04ca84a82d?w=500', preparationTime: 5, isVegetarian: true, countInStock: 50 },

    // Foods
    { name: 'Zinger Burger', category: 'Food', price: 450, description: 'Crispy chicken burger with cheese', image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=500', preparationTime: 15, isVegetarian: false, countInStock: 50, isBestSeller: true },
    { name: 'Chicken Sandwich', category: 'Food', price: 350, description: 'Grilled chicken with fresh salad', image: 'https://images.unsplash.com/photo-1521390188846-e2a3a97453a0?w=500', preparationTime: 10, isVegetarian: false, countInStock: 50 },
    { name: 'Club Sandwich', category: 'Food', price: 550, description: 'Double layer chicken and egg sandwich', image: 'https://images.unsplash.com/photo-1509722747041-619f3936863d?w=500', preparationTime: 15, isVegetarian: false, countInStock: 50 },
    { name: 'Fries', category: 'Food', price: 200, description: 'Crispy golden potato fries', image: 'https://images.unsplash.com/photo-1541592106381-b31e9677c0e5?w=500', preparationTime: 8, isVegetarian: true, countInStock: 50 },
    { name: 'Loaded Fries', category: 'Food', price: 450, description: 'Fries with cheese and chicken', image: 'https://images.unsplash.com/photo-1585109649139-366815a0d713?w=500', preparationTime: 15, isVegetarian: false, countInStock: 50 },
    { name: 'Nuggets', category: 'Food', price: 400, description: 'Deep fried chicken nuggets', image: 'https://images.unsplash.com/photo-1562967914-608f82629710?w=500', preparationTime: 12, isVegetarian: false, countInStock: 50 },
    { name: 'Shawarma', category: 'Food', price: 300, description: 'Spicy chicken wrap with garlic sauce', image: 'https://images.unsplash.com/photo-1626700051175-651bf415ec84?w=500', preparationTime: 10, isVegetarian: false, countInStock: 50 },
    { name: 'Pasta', category: 'Food', price: 700, description: 'Creamy fettuccine pasta with mushrooms', image: 'https://images.unsplash.com/photo-1612491789661-97af1926c06a?w=500', preparationTime: 18, isVegetarian: true, countInStock: 50 },
    { name: 'Garlic Bread', category: 'Food', price: 250, description: 'Toasted bread with garlic butter', image: 'https://images.unsplash.com/photo-1573140285932-e0969796016e?w=500', preparationTime: 10, isVegetarian: true, countInStock: 50 },
    { name: 'Wrap Roll', category: 'Food', price: 350, description: 'Tortilla wrap with spicy filling', image: 'https://images.unsplash.com/photo-1626700051175-651bf415ec84?w=500', preparationTime: 12, isVegetarian: false, countInStock: 50 },

    // Sweets
    { name: 'Chocolate Cake', category: 'Sweets', price: 400, description: 'Rich and moist chocolate delight', image: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=500', preparationTime: 5, isVegetarian: true, countInStock: 50 },
    { name: 'Brownie', category: 'Sweets', price: 300, description: 'Warm fudgy brownie with nuts', image: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=500', preparationTime: 5, isVegetarian: true, countInStock: 50 },
    { name: 'Ice Cream', category: 'Sweets', price: 350, description: 'Three scoops of premium ice cream', image: 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=500', preparationTime: 5, isVegetarian: true, countInStock: 50 },
    { name: 'Gulab Jamun', category: 'Sweets', price: 200, description: 'Deep fried milk solids in syrup', image: 'https://images.unsplash.com/photo-1601303116539-2ee283027382?w=500', preparationTime: 5, isVegetarian: true, countInStock: 50 },
    { name: 'Donuts', category: 'Sweets', price: 250, description: 'Fresh glazed donuts', image: 'https://images.unsplash.com/photo-1527515545081-5db817172677?w=500', preparationTime: 5, isVegetarian: true, countInStock: 50 },
    { name: 'Cheesecake', category: 'Sweets', price: 600, description: 'Creamy New York style cheesecake', image: 'https://images.unsplash.com/photo-1533134242443-d4fd215305ad?w=500', preparationTime: 5, isVegetarian: true, countInStock: 50 },
    { name: 'Cupcakes', category: 'Sweets', price: 300, description: 'Set of two decorated cupcakes', image: 'https://images.unsplash.com/photo-1576618148400-f54bed99fcfd?w=500', preparationTime: 5, isVegetarian: true, countInStock: 50 },
    { name: 'Kheer', category: 'Sweets', price: 250, description: 'Traditional rice pudding', image: 'https://images.unsplash.com/photo-1589113103503-4948869163a3?w=500', preparationTime: 10, isVegetarian: true, countInStock: 50 },
    { name: 'Ras Malai', category: 'Sweets', price: 350, description: 'Cottage cheese balls in sweet milk', image: 'https://images.unsplash.com/photo-1601303116539-2ee283027382?w=500', preparationTime: 10, isVegetarian: true, countInStock: 50 },
    { name: 'Fruit Trifle', category: 'Sweets', price: 300, description: 'Layers of custard, cake and fruit', image: 'https://images.unsplash.com/photo-1576618148400-f54bed99fcfd?w=500', preparationTime: 10, isVegetarian: true, countInStock: 50 },

    // Dishes
    { name: 'Chicken Karahi', category: 'Dishes', price: 1200, description: 'Spicy traditional chicken curry', image: 'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=500', preparationTime: 25, isVegetarian: false, countInStock: 50 },
    { name: 'Mutton Karahi', category: 'Dishes', price: 2200, description: 'Slow cooked mutton in wok', image: 'https://images.unsplash.com/photo-1545231027-63b6f2a3c1ad?w=500', preparationTime: 35, isVegetarian: false, countInStock: 50 },
    { name: 'Biryani', category: 'Dishes', price: 600, description: 'Fragrant rice with spicy chicken', image: 'https://images.unsplash.com/photo-1563379091339-03b21bc4a4f8?w=500', preparationTime: 20, isVegetarian: false, countInStock: 50, isSpecial: true },
    { name: 'Pulao', category: 'Dishes', price: 500, description: 'Mild and aromatic traditional rice', image: 'https://images.unsplash.com/photo-1589302168068-964664d93dc9?w=500', preparationTime: 20, isVegetarian: false, countInStock: 50 },
    { name: 'BBQ Platter', category: 'Dishes', price: 2500, description: 'Assorted grilled meats', image: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=500', preparationTime: 30, isVegetarian: false, countInStock: 50 },
    { name: 'Handi', category: 'Dishes', price: 1000, description: 'Creamy chicken cooked in clay pot', image: 'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=500', preparationTime: 25, isVegetarian: false, countInStock: 50 },
    { name: 'Nihari', category: 'Dishes', price: 800, description: 'Slow cooked beef stew', image: 'https://images.unsplash.com/photo-1545231027-63b6f2a3c1ad?w=500', preparationTime: 40, isVegetarian: false, countInStock: 50 },
    { name: 'Haleem', category: 'Dishes', price: 400, description: 'Thick meat and grain stew', image: 'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=500', preparationTime: 40, isVegetarian: false, countInStock: 50 },
    { name: 'White Karahi', category: 'Dishes', price: 1300, description: 'Chicken in white creamy sauce', image: 'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=500', preparationTime: 25, isVegetarian: false, countInStock: 50 },
    { name: 'Chicken Tikka', category: 'Dishes', price: 400, description: 'Spicy grilled chicken piece', image: 'https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?w=500', preparationTime: 15, isVegetarian: false, countInStock: 50 },
];

const seedDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');
        
        await Product.deleteMany({});
        console.log('Cleared existing products');
        
        await Product.insertMany(items);
        console.log('Inserted 40 new items');
        
        process.exit();
    } catch (err) {
        console.error('Error seeding DB:', err);
        process.exit(1);
    }
};

seedDB();
