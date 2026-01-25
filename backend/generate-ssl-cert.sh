#!/bin/bash
# Generate self-signed SSL certificates for development
# For production, use certificates from a trusted CA (Let's Encrypt, etc.)

echo "Generating self-signed SSL certificates for development..."

# Create ssl directory if it doesn't exist
mkdir -p ssl

# Generate private key
openssl genrsa -out ssl/key.pem 4096

# Generate certificate signing request and self-signed certificate
openssl req -new -x509 -key ssl/key.pem -out ssl/cert.pem -days 365 -subj "/C=US/ST=State/L=City/O=Organization/CN=localhost"

echo "✅ SSL certificates generated successfully!"
echo "📁 Certificates saved in: ssl/cert.pem and ssl/key.pem"
echo "⚠️  These are self-signed certificates for development only!"
echo "   For production, use certificates from a trusted CA."
