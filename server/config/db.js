const mongoose = require('mongoose');
const dns = require('dns');

// Use Google Public DNS to resolve MongoDB Atlas SRV/TXT records
// (ISP/router DNS often fails to resolve these)
dns.setServers(['8.8.8.8', '8.8.4.4']);

const connectDB = async (retryCount = 0) => {
    const MAX_RETRIES = 5;
    const RETRY_DELAY = 5000; // 5 seconds

    try {
        console.log(`🔄 Attempting to connect to MongoDB (Attempt ${retryCount + 1})...`);
        const conn = await mongoose.connect(process.env.MONGO_URI, {
            serverSelectionTimeoutMS: 30000, // Increased to 30s
            socketTimeoutMS: 45000,
            connectTimeoutMS: 30000, // Explicitly increase connect timeout
            family: 4 // Force IPv4 to avoid common EAI_AGAIN (DNS) issues
        });
        console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error(`❌ Connection Error (Attempt ${retryCount + 1}): ${error.message}`);
        
        if (retryCount < MAX_RETRIES) {
            console.log(`⏳ Retrying in ${RETRY_DELAY/1000}s...`);
            await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
            return connectDB(retryCount + 1);
        } else {
            console.error('🔥 Maximum connection retries exceeded. Manual intervention required.');
            process.exit(1);
        }
    }
};

module.exports = connectDB;
