# Firebase Deployment Script
# This script will login and deploy to Firebase Hosting

Write-Host "🔐 Step 1: Logging in to Firebase..." -ForegroundColor Cyan
npx firebase-tools login

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Login failed. Please try again." -ForegroundColor Red
    exit 1
}

Write-Host "✅ Login successful!" -ForegroundColor Green

Write-Host "`n🔨 Step 2: Building the project..." -ForegroundColor Cyan
npm run build

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Build failed." -ForegroundColor Red
    exit 1
}

Write-Host "✅ Build successful!" -ForegroundColor Green

Write-Host "`n🚀 Step 3: Deploying to Firebase Hosting..." -ForegroundColor Cyan
npx firebase-tools deploy --only hosting --project topcomputers-69b82

if ($LASTEXITCODE -eq 0) {
    Write-Host "`n✅ Deployment successful!" -ForegroundColor Green
    Write-Host "🌐 Your site should be live shortly!" -ForegroundColor Green
} else {
    Write-Host "`n❌ Deployment failed." -ForegroundColor Red
    exit 1
}

