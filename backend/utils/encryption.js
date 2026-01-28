/**
 * Data Encryption Utility
 * Uses AES-256-GCM for encrypting sensitive data
 * Industry standard encryption for data at rest
 */

import crypto from 'crypto';

// Encryption algorithm
const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16; 
const SALT_LENGTH = 64; 
const TAG_LENGTH = 16; 
const KEY_LENGTH = 32; 
const ITERATIONS = 100000; 

/**
 * Get encryption key from environment variable
 * In production, use a strong, randomly generated key stored securely
 */
const getEncryptionKey = () => {
  const key = process.env.ENCRYPTION_KEY;
  const isProd = process.env.NODE_ENV === 'production';
  
  if (!key) {
    if (isProd) {
      throw new Error('ENCRYPTION_KEY is required in production');
    }
    console.warn('WARNING: ENCRYPTION_KEY not set in environment variables. Using default key (NOT SECURE FOR PRODUCTION)');
    // Default key for development only - MUST be changed in production
    return 'default-encryption-key-change-in-production-32-chars!!';
  }
  
  if (key.length < 32) {
    throw new Error('ENCRYPTION_KEY must be at least 32 characters long');
  }
  
  return key;
};

/**
 * Derive a key from the master encryption key using PBKDF2
 * @param {string} masterKey - Master encryption key
 * @param {Buffer} salt - Salt for key derivation
 * @returns {Buffer} Derived key
 */
const deriveKey = (masterKey, salt) => {
  return crypto.pbkdf2Sync(masterKey, salt, ITERATIONS, KEY_LENGTH, 'sha512');
};

/**
 * Encrypt sensitive data using AES-256-GCM
 * @param {string} text - Plain text to encrypt
 * @returns {string} Encrypted data in format: salt:iv:tag:encryptedData (all base64 encoded)
 */
export const encrypt = (text) => {
  if (!text || text === '') {
    return text; // Return empty string as-is
  }

  try {
    const masterKey = getEncryptionKey();
    
    // If using default key (not secure), log warning but continue
    if (masterKey === 'default-encryption-key-change-in-production-32-chars!!') {
      console.warn('⚠️  Using default encryption key - encryption may not work correctly!');
    }
    
    // Generate random salt and IV
    const salt = crypto.randomBytes(SALT_LENGTH);
    const iv = crypto.randomBytes(IV_LENGTH);
    
    // Derive key from master key using salt
    const key = deriveKey(masterKey, salt);
    
    // Create cipher
    const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
    
    // Encrypt the text
    let encrypted = cipher.update(text, 'utf8', 'base64');
    encrypted += cipher.final('base64');
    
    // Get authentication tag
    const tag = cipher.getAuthTag();
    
    // Combine salt:iv:tag:encryptedData (all base64 encoded)
    const result = [
      salt.toString('base64'),
      iv.toString('base64'),
      tag.toString('base64'),
      encrypted
    ].join(':');
    
    return result;
  } catch (error) {
    console.error('Encryption error:', error);
    // In production, never silently store plain text
    if (process.env.NODE_ENV === 'production') {
      throw error;
    }
    // Dev/backward compatibility fallback
    console.warn('⚠️  Encryption failed, storing as plain text (NOT SECURE)');
    return text;
  }
};

/**
 * Decrypt data encrypted with AES-256-GCM
 * @param {string} encryptedData - Encrypted data in format: salt:iv:tag:encryptedData
 * @returns {string} Decrypted plain text
 */
export const decrypt = (encryptedData) => {
  if (!encryptedData || encryptedData === '') {
    return encryptedData; // Return empty string as-is
  }

  // Check if data is already decrypted (not in encrypted format)
  if (!encryptedData.includes(':')) {
    // Data might be plain text (for backward compatibility)
    return encryptedData;
  }

  try {
    const masterKey = getEncryptionKey();
    
    // Split the encrypted data
    const parts = encryptedData.split(':');
    
    if (parts.length !== 4) {
      // Invalid format, might be plain text
      console.warn('Invalid encryption format, treating as plain text');
      return encryptedData;
    }
    
    const [saltBase64, ivBase64, tagBase64, encrypted] = parts;
    
    // Decode from base64
    const salt = Buffer.from(saltBase64, 'base64');
    const iv = Buffer.from(ivBase64, 'base64');
    const tag = Buffer.from(tagBase64, 'base64');
    
    // Derive key from master key using salt
    const key = deriveKey(masterKey, salt);
    
    // Create decipher
    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
    decipher.setAuthTag(tag);
    
    // Decrypt the text
    let decrypted = decipher.update(encrypted, 'base64', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  } catch (error) {
    console.error('Decryption error:', error);
    if (process.env.NODE_ENV === 'production') {
      throw error;
    }
    // Dev/backward compatibility fallback
    return encryptedData;
  }
};

/**
 * Hash data (one-way, for comparison purposes)
 * Uses SHA-256
 * @param {string} text - Text to hash
 * @returns {string} Hashed value
 */
export const hash = (text) => {
  if (!text) return '';
  return crypto.createHash('sha256').update(text).digest('hex');
};

/**
 * Generate a secure random encryption key
 * Use this to generate your ENCRYPTION_KEY for production
 * @returns {string} Random 32-byte key in hex format
 */
export const generateEncryptionKey = () => {
  return crypto.randomBytes(32).toString('hex');
};

// Export for testing/generation
export default {
  encrypt,
  decrypt,
  hash,
  generateEncryptionKey
};
