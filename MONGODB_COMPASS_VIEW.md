# 📊 Viewing Data in MongoDB Compass

## What You'll See in MongoDB Compass

After registration, you can view the user data in MongoDB Compass. Here's what each field contains:

### User Document Structure

```json
{
  "_id": ObjectId("..."),
  "emailHash": "abc123def456...",  // ✅ VISIBLE - SHA-256 hash of email (for searching)
  "email": "salt:iv:tag:encrypted", // 🔒 ENCRYPTED - Actual email (encrypted with AES-256-GCM)
  "name": "salt:iv:tag:encrypted",  // 🔒 ENCRYPTED - User's name (encrypted)
  "password": "$2b$10$...",         // 🔒 HASHED - Password (bcrypt hash)
  "role": "user",                    // ✅ VISIBLE - User role
  "cartData": {},                    // ✅ VISIBLE - Shopping cart data
  "isAdmin": false,                  // ✅ VISIBLE - Admin status
  "createdAt": ISODate("..."),      // ✅ VISIBLE - Creation timestamp
  "updatedAt": ISODate("...")        // ✅ VISIBLE - Update timestamp
}
```

## Fields Visible in MongoDB Compass

### ✅ Readable Fields:
- **`_id`**: Unique user ID
- **`emailHash`**: SHA-256 hash of the email (for searching, doesn't reveal actual email)
- **`role`**: User role (user, admin, moderator)
- **`cartData`**: Shopping cart data
- **`isAdmin`**: Admin status
- **`createdAt`**: Registration date
- **`updatedAt`**: Last update date

### 🔒 Encrypted/Hashed Fields:
- **`email`**: Encrypted email (format: `salt:iv:tag:encryptedData`)
- **`name`**: Encrypted name (format: `salt:iv:tag:encryptedData`)
- **`password`**: Bcrypt hash (format: `$2b$10$...`)

## How to View in MongoDB Compass

1. **Open MongoDB Compass**
2. **Connect to your database** (using your connection string)
3. **Select your database** (usually the database name from your connection string)
4. **Click on the `users` collection**
5. **View the documents** - You'll see all registered users

## Example Document in Compass

```
_id: ObjectId("65a1b2c3d4e5f6g7h8i9j0k1")
emailHash: "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855"
email: "dGhpc2lzYXNsYWx0OnRoaXNpc2FuaXY6dGhpc2lzYXRhZzp0aGlzaXNlbmNyeXB0ZWRkYXRh"
name: "YW5vdGhlcnNhbHQ6YW5vdGhlcml2OmFub3RoZXJ0YWc6YW5vdGhlcmVuY3J5cHRlZGRhdGE="
password: "$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy"
role: "user"
cartData: {}
isAdmin: false
createdAt: 2024-01-15T10:30:00.000Z
updatedAt: 2024-01-15T10:30:00.000Z
```

## Security Notes

- **Email Hash**: The `emailHash` field is a one-way hash (SHA-256). It cannot be reversed to get the original email, but it allows the system to search for users by email.
- **Encrypted Fields**: The `email` and `name` fields are encrypted and can only be decrypted with the `ENCRYPTION_KEY` from your `.env` file.
- **Password Hash**: The `password` field uses bcrypt, which is a one-way hash. It cannot be reversed.

## Querying Users in Compass

You can query users by:
- **`_id`**: Direct ID lookup
- **`emailHash`**: Search by email hash (if you know the hash)
- **`role`**: Filter by role (user, admin, moderator)
- **`isAdmin`**: Filter by admin status

Example query:
```json
{ "role": "user" }
```

This will show all regular users.

## Troubleshooting

If you don't see data in MongoDB Compass:

1. **Check connection**: Make sure you're connected to the correct database
2. **Check collection name**: The collection should be named `users` (Mongoose automatically pluralizes)
3. **Refresh**: Click the refresh button in Compass
4. **Check backend logs**: Look for "User saved to database successfully!" message

## Data Flow

1. **Registration**: User registers → Data encrypted → Saved to MongoDB
2. **Login**: User logs in → System searches by `emailHash` → Finds user → Decrypts email/name → Compares password
3. **MongoDB Compass**: Shows encrypted/hashed data as stored in database
