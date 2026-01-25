# PowerShell script to generate self-signed SSL certificates for development
# For production, use certificates from a trusted CA (Let's Encrypt, etc.)

Write-Host "Generating self-signed SSL certificates for development..." -ForegroundColor Cyan

# Create ssl directory if it doesn't exist
if (-not (Test-Path "ssl")) {
    New-Item -ItemType Directory -Path "ssl" | Out-Null
}

# Check if OpenSSL is available
$opensslPath = Get-Command openssl -ErrorAction SilentlyContinue

if (-not $opensslPath) {
    Write-Host "❌ OpenSSL not found!" -ForegroundColor Red
    Write-Host "Please install OpenSSL:" -ForegroundColor Yellow
    Write-Host "  - Windows: Download from https://slproweb.com/products/Win32OpenSSL.html" -ForegroundColor Yellow
    Write-Host "  - Or use: choco install openssl" -ForegroundColor Yellow
    exit 1
}

# Generate private key
Write-Host "Generating private key..." -ForegroundColor Yellow
& openssl genrsa -out ssl/key.pem 4096

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to generate private key" -ForegroundColor Red
    exit 1
}

# Generate certificate
Write-Host "Generating certificate..." -ForegroundColor Yellow
& openssl req -new -x509 -key ssl/key.pem -out ssl/cert.pem -days 365 -subj "/C=US/ST=State/L=City/O=Organization/CN=localhost"

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to generate certificate" -ForegroundColor Red
    exit 1
}

Write-Host "✅ SSL certificates generated successfully!" -ForegroundColor Green
Write-Host "📁 Certificates saved in: ssl/cert.pem and ssl/key.pem" -ForegroundColor Cyan
Write-Host "⚠️  These are self-signed certificates for development only!" -ForegroundColor Yellow
Write-Host "   For production, use certificates from a trusted CA." -ForegroundColor Yellow
