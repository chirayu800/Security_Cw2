# 🔐 Data Encryption Implementation Guide

## Overview

This application implements industry-standard encryption for:
1. **Sensitive Data at Rest** - AES-256-GCM encryption for database fields
2. **Passwords** - bcrypt hashing (already implemented)
3. **Encrypted Communication** - HTTPS/TLS support
4. **Database Encryption** - MongoDB connection encryption

---

## 📍 Implementation Locations

### 1. **Encryption Utility**
**File:** `backend/utils/encryption.js`

**Features:**
- AES-256-GCM encryption algorithm
- PBKDF2 key derivation (100,000 iterations)
- Automatic salt and IV generation
- Authentication tags for data integrity

**Functions:**
- `encrypt(text)` - Encrypts sensitive data
- `decrypt(encryptedData)` - Decrypts encrypted data
- `hash(text)` - One-way hashing (SHA-256)
- `generateEncryptionKey()` - Generates secure encryption keys

---

### 2. **User Model Encryption**
**File:** `backend/models/userModel.js`

**Encrypted Fields:**
- ✅ `email` - Encrypted before saving, decrypted when reading
- ✅ `name` - Encrypted before saving, decrypted when reading

**Features:**
- Automatic encryption on save (pre-save hook)
- Automatic decryption on read (post-find hooks)
- `findByEmail()` method for encryption-aware email searches
- Backward compatibility with unencrypted data

---

### 3. **Contact Model Encryption**
**File:** `backend/models/contactModel.js`

**Encrypted Fields:**
- ✅ `email` - Encrypted
- ✅ `name` - Encrypted
- ✅ `message` - Encrypted

---

### 4. **Newsletter Model Encryption**
**File:** `backend/models/newsletterModel.js`

**Encrypted Fields:**
- ✅ `email` - Encrypted

**Features:**
- Email normalization (lowercase, trim) before encryption
- `findByEmail()` method for encryption-aware searches

---

### 5. **MongoDB Connection Encryption**
**File:** `backend/config/mongodb.js`

**Features:**
- TLS/SSL support for MongoDB connections
- Automatic detection from connection string
- Development mode allows invalid certificates

---

### 6. **HTTPS Server**
**File:** `backend/server-https.js`

**Features:**
- Full HTTPS/TLS support
- Security headers (HSTS, XSS protection, etc.)
- Automatic HTTP to HTTPS redirect in production
- SSL certificate validation

---

## 🔑 Environment Variables

Add these to your `.env` file:

```env
# Encryption Key (REQUIRED - Generate a secure 32+ character key)
# Generate one using: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
ENCRYPTION_KEY=your-secure-encryption-key-minimum-32-characters-long

# HTTPS Configuration (Optional)
HTTPS_PORT=4443
SSL_CERT_PATH=./ssl/cert.pem
SSL_KEY_PATH=./ssl/key.pem

# MongoDB TLS (Optional - usually in connection string)
MONGO_TLS=true
```

---

## 🚀 Setup Instructions

### Step 1: Generate Encryption Key

```bash
# Generate a secure encryption key
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Copy the output and add it to your `.env` file:
```env
ENCRYPTION_KEY=<generated-key>
```

### Step 2: Generate SSL Certificates (for HTTPS)

**For Development (Self-Signed):**

**Windows (PowerShell):**
```powershell
cd backend
.\generate-ssl-cert.ps1
```

**Linux/Mac:**
```bash
cd backend
chmod +x generate-ssl-cert.sh
./generate-ssl-cert.sh
```

**Manual (if scripts don't work):**
```bash
mkdir -p backend/ssl
openssl genrsa -out backend/ssl/key.pem 4096
openssl req -new -x509 -key backend/ssl/key.pem -out backend/ssl/cert.pem -days 365 -subj "/CN=localhost"
```

**For Production:**
- Use certificates from a trusted CA (Let's Encrypt, etc.)
- Or use a service like Cloudflare, AWS Certificate Manager, etc.

### Step 3: Update MongoDB Connection String

Ensure your MongoDB connection string includes SSL:
```
mongodb+srv://user:pass@cluster.mongodb.net/dbname?ssl=true
```

Or for local MongoDB with TLS:
```
mongodb://localhost:27017/dbname?ssl=true
```

---

## 📊 Encryption Details

### Algorithm: AES-256-GCM
- **Key Size:** 256 bits (32 bytes)
- **IV Size:** 128 bits (16 bytes)
- **Tag Size:** 128 bits (16 bytes)
- **Salt Size:** 512 bits (64 bytes)

### Key Derivation: PBKDF2
- **Algorithm:** SHA-512
- **Iterations:** 100,000
- **Salt:** Random 64-byte salt per encryption

### Data Format
Encrypted data is stored as:
```
salt:iv:tag:encryptedData
```
All components are base64 encoded.

---

## 🔒 What Gets Encrypted

### User Data
- ✅ Email addresses
- ✅ User names
- ✅ Passwords (hashed with bcrypt, not encrypted)

### Contact Data
- ✅ Contact emails
- ✅ Contact names
- ✅ Contact messages

### Newsletter Data
- ✅ Subscriber emails

### Not Encrypted (by design)
- ❌ User IDs (needed for queries)
- ❌ Roles (needed for authorization)
- ❌ Timestamps
- ❌ Status fields

---

## 🧪 Testing Encryption

### Test Encryption Utility

Create a test file `backend/test-encryption.js`:

```javascript
import { encrypt, decrypt, generateEncryptionKey } from './utils/encryption.js';

// Test encryption/decryption
const original = "test@example.com";
const encrypted = encrypt(original);
const decrypted = decrypt(encrypted);

console.log("Original:", original);
console.log("Encrypted:", encrypted);
console.log("Decrypted:", decrypted);
console.log("Match:", original === decrypted);

// Generate encryption key
console.log("\nGenerated Key:", generateEncryptionKey());
```

Run it:
```bash
node backend/test-encryption.js
```

---

## 🚦 Running the Application

### Development (HTTP)
```bash
cd backend
npm start
# Server runs on http://localhost:4000
```

### Production (HTTPS)
```bash
cd backend
node server-https.js
# Server runs on https://localhost:4443
```

---

## 🔍 How It Works

### Encryption Flow

1. **Before Saving to Database:**
   ```
   User Input → Encrypt (AES-256-GCM) → Store in DB
   ```

2. **After Reading from Database:**
   ```
   Read from DB → Decrypt (AES-256-GCM) → Return to Application
   ```

3. **Password Hashing (Separate):**
   ```
   User Password → bcrypt Hash → Store in DB
   ```

### Automatic Encryption/Decryption

Mongoose hooks automatically handle encryption:

```javascript
// Pre-save hook encrypts before saving
userSchema.pre('save', function(next) {
  if (this.isModified('email')) {
    this.email = encrypt(this.email);
  }
  next();
});

// Post-find hook decrypts after reading
userSchema.post('find', function(docs) {
  docs.forEach(doc => {
    doc.email = decrypt(doc.email);
  });
});
```

---

## ⚠️ Important Security Notes

### 1. **Encryption Key Security**
- ✅ Store `ENCRYPTION_KEY` in environment variables
- ✅ Never commit encryption keys to version control
- ✅ Use different keys for development and production
- ✅ Rotate keys periodically

### 2. **Backward Compatibility**
- The system handles both encrypted and unencrypted data
- Existing unencrypted data will be encrypted on next save
- Use migration scripts for bulk encryption if needed

### 3. **Performance**
- Encryption/decryption adds minimal overhead
- PBKDF2 key derivation is CPU-intensive but secure
- Consider caching for frequently accessed data

### 4. **HTTPS in Production**
- Always use HTTPS in production
- Use trusted SSL certificates
- Enable HSTS headers
- Regular certificate renewal

---

## 📝 Migration Guide

If you have existing unencrypted data:

1. **Backup your database first!**

2. **Create a migration script:**
```javascript
import userModel from './models/userModel.js';
import { encrypt } from './utils/encryption.js';

async function migrateUsers() {
  const users = await userModel.find({});
  
  for (const user of users) {
    // Check if already encrypted
    if (!user.email.includes(':')) {
      user.email = encrypt(user.email);
      user.name = encrypt(user.name);
      await user.save();
    }
  }
  
  console.log('Migration complete!');
}
```

3. **Run migration:**
```bash
node migrate-encryption.js
```

---

## ✅ Security Checklist

- [x] AES-256-GCM encryption for sensitive data
- [x] bcrypt password hashing
- [x] Automatic encryption/decryption hooks
- [x] HTTPS/TLS support
- [x] MongoDB connection encryption
- [x] Security headers
- [x] Environment variable configuration
- [x] Backward compatibility
- [x] Encryption key generation utility

---

## 🆘 Troubleshooting

### "ENCRYPTION_KEY not set" Warning
- Add `ENCRYPTION_KEY` to your `.env` file
- Generate a secure key using the utility

### "Decryption error" in logs
- Data might be in plain text (backward compatibility)
- Check if encryption key matches the one used to encrypt
- Verify data format

### SSL Certificate Errors
- Ensure certificates exist in `backend/ssl/` directory
- Check file permissions
- Verify certificate paths in `.env`

### MongoDB Connection Issues
- Verify connection string includes SSL parameters
- Check firewall settings
- Verify MongoDB server supports TLS

---

## 📚 References

- [AES-256-GCM](https://en.wikipedia.org/wiki/Galois/Counter_Mode)
- [PBKDF2](https://en.wikipedia.org/wiki/PBKDF2)
- [MongoDB Encryption](https://www.mongodb.com/docs/manual/core/security-encryption/)
- [HTTPS Best Practices](https://developers.google.com/web/fundamentals/security/encrypt-in-transit)

---

## 🎯 Summary

Your application now has:
1. ✅ **Data Encryption at Rest** - Sensitive fields encrypted in database
2. ✅ **Password Hashing** - bcrypt for secure password storage
3. ✅ **Encrypted Communication** - HTTPS/TLS support
4. ✅ **Database Encryption** - MongoDB connection encryption
5. ✅ **Automatic Encryption** - Mongoose hooks handle encryption/decryption
6. ✅ **Industry Standards** - AES-256-GCM, PBKDF2, bcrypt

All sensitive data is now protected using industry-standard encryption methods! 🔒
