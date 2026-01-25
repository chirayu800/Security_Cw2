/**
 * HTTPS Server Configuration
 * For production, use this server file instead of server.js
 * Requires SSL certificates (cert.pem and key.pem)
 */

import express from "express";
import cors from "cors";
import https from "https";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import "dotenv/config";
import connectDB from "./config/mongodb.js";
import connectCloudinary from "./config/cloudinary.js";
import userRouter from "./routes/userRoute.js";
import productRouter from "./routes/productRoute.js";
import cartRouter from "./routes/cartRoute.js";
import newsletterRouter from "./routes/newsletterRoute.js";
import contactRouter from "./routes/contactRoute.js";
import auditLogRouter from "./routes/auditLogRoute.js";
import csrfProtection from "./middleware/csrfProtection.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// INFO: Create express app
const app = express();
const port = process.env.HTTPS_PORT || 4443;
app.set("trust proxy", true);
connectDB();
connectCloudinary();

// INFO: Middleware
app.use(express.json());

// Security headers for HTTPS
app.use((req, res, next) => {
  // Force HTTPS
  if (req.header('x-forwarded-proto') !== 'https' && process.env.NODE_ENV === 'production') {
    res.redirect(`https://${req.header('host')}${req.url}`);
  } else {
    next();
  }
});

// Security headers
app.use((req, res, next) => {
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  next();
});

const corsOptions = {
  origin: process.env.ALLOWED_ORIGINS?.split(',') || true,
  credentials: true,
  optionSuccessStatus: 200
};

app.use(cors(corsOptions));
app.use(csrfProtection);

// INFO: API endpoints
app.use("/api/user", userRouter);
app.use("/api/product", productRouter);
app.use("/api/cart", cartRouter);
app.use("/api/newsletter", newsletterRouter);
app.use("/api/contact", contactRouter);
app.use("/api/audit-logs", auditLogRouter);

// INFO: Default route
app.get("/", (req, res) => {
  res.send("API is running securely over HTTPS...");
});

// SSL Certificate paths
const certPath = process.env.SSL_CERT_PATH || path.join(__dirname, 'ssl', 'cert.pem');
const keyPath = process.env.SSL_KEY_PATH || path.join(__dirname, 'ssl', 'key.pem');

// Check if certificates exist
if (!fs.existsSync(certPath) || !fs.existsSync(keyPath)) {
  console.error('SSL certificates not found!');
  console.error(`Expected cert at: ${certPath}`);
  console.error(`Expected key at: ${keyPath}`);
  console.error('\nTo generate self-signed certificates for development:');
  console.error('openssl req -x509 -newkey rsa:4096 -nodes -keyout ssl/key.pem -out ssl/cert.pem -days 365');
  console.error('\nFor production, use certificates from a trusted CA (Let\'s Encrypt, etc.)');
  process.exit(1);
}

// Read SSL certificates
const options = {
  key: fs.readFileSync(keyPath),
  cert: fs.readFileSync(certPath),
};

// Create HTTPS server
const httpsServer = https.createServer(options, app);

// INFO: Start HTTPS server
httpsServer.listen(port, () => {
  console.log(`🔒 HTTPS Server is running securely at https://localhost:${port}`);
  console.log(`📋 Using SSL certificates from: ${certPath}`);
});

// Handle errors
httpsServer.on('error', (error) => {
  console.error('HTTPS Server error:', error);
  process.exit(1);
});
