// import mongoose from "mongoose";

// const connectDB = async () => {
//   mongoose.connection.on("connected", () => {
//     console.log("MongoDB connected");
//   });

//   await mongoose.connect(`${process.env.MONGODB_URI}/trendify`);
// };

// export default connectDB;

import mongoose from "mongoose";

const connectDB = async () => {
  try {
    // Check if MONGO_URI is set
    if (!process.env.MONGO_URI) {
      console.error("❌ MONGO_URI is not set in environment variables!");
      console.error("Please add MONGO_URI to your .env file");
      process.exit(1);
    }

    // Log connection attempt (without showing password)
    const uriForLogging = process.env.MONGO_URI.replace(/\/\/([^:]+):([^@]+)@/, '//$1:***@');
    console.log("🔌 Connecting to MongoDB...");
    console.log("📍 URI:", uriForLogging);

    // MongoDB connection options (removed deprecated useNewUrlParser and useUnifiedTopology)
    const connectionOptions = {};
    
    // Enable MongoDB encryption at rest (if using MongoDB Atlas with encryption)
    // For local MongoDB, ensure TLS/SSL is enabled in connection string
    if (process.env.MONGO_TLS === 'true' || process.env.MONGO_URI?.includes('ssl=true')) {
      connectionOptions.tls = true;
      // Only allow invalid certificates in development
      if (process.env.NODE_ENV === 'development') {
        connectionOptions.tlsAllowInvalidCertificates = true;
      }
    }

    // Connection event handlers
    mongoose.connection.on("connected", () => {
      console.log("✅ MongoDB connected successfully!");
    });

    mongoose.connection.on("error", (err) => {
      console.error("❌ MongoDB connection error:", err.message);
      
      // Provide helpful error messages
      if (err.message.includes('authentication failed')) {
        console.error("\n💡 Tip: Check your MongoDB username and password in the connection string");
      } else if (err.message.includes('IP')) {
        console.error("\n💡 Tip: Your IP address might not be whitelisted in MongoDB Atlas");
        console.error("   Go to: https://cloud.mongodb.com/v2#/security/network/whitelist");
        console.error("   Click 'Add IP Address' -> 'Add Current IP Address'");
      } else if (err.message.includes('ENOTFOUND') || err.message.includes('getaddrinfo')) {
        console.error("\n💡 Tip: Check your MongoDB cluster name in the connection string");
        console.error("   Make sure the cluster is not paused in MongoDB Atlas");
      }
    });

    mongoose.connection.on("disconnected", () => {
      console.warn("⚠️  MongoDB disconnected");
    });

    // Handle process termination
    process.on('SIGINT', async () => {
      await mongoose.connection.close();
      console.log('MongoDB connection closed due to app termination');
      process.exit(0);
    });

    // Attempt connection
    await mongoose.connect(process.env.MONGO_URI, connectionOptions);
    
  } catch (error) {
    console.error("\n❌ MongoDB connection failed!");
    console.error("Error:", error.message);
    
    // Provide specific guidance based on error
    if (error.message.includes('IP')) {
      console.error("\n🔧 FIX: Whitelist your IP address in MongoDB Atlas");
      console.error("   1. Go to: https://cloud.mongodb.com/v2#/security/network/whitelist");
      console.error("   2. Click 'Add IP Address'");
      console.error("   3. Click 'Add Current IP Address' (or 'Allow Access from Anywhere' for dev)");
      console.error("   4. Wait a few minutes for changes to propagate");
    } else if (error.message.includes('authentication')) {
      console.error("\n🔧 FIX: Check your database credentials");
      console.error("   1. Verify username and password in .env file");
      console.error("   2. Check Database Access in MongoDB Atlas");
      console.error("   3. Make sure password is URL-encoded if it contains special characters");
    } else if (error.message.includes('ENOTFOUND')) {
      console.error("\n🔧 FIX: Check your connection string");
      console.error("   1. Verify cluster name is correct");
      console.error("   2. Make sure cluster is not paused");
      console.error("   3. Check MongoDB Atlas status: https://status.mongodb.com/");
    }
    
    console.error("\n📚 See MONGODB_CONNECTION_FIX.md for detailed troubleshooting guide\n");
    process.exit(1);
  }
};

export default connectDB;

