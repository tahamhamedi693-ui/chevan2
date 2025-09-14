# PowerShell script to build APK for RideShare App

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   RideShare App - APK Build Script    " -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check if EAS CLI is installed
Write-Host "Checking EAS CLI installation..." -ForegroundColor Yellow
$easVersion = eas --version 2>$null
if ($?) {
    Write-Host "✓ EAS CLI is installed (version: $easVersion)" -ForegroundColor Green
} else {
    Write-Host "✗ EAS CLI is not installed. Installing..." -ForegroundColor Red
    npm install -g eas-cli
}

Write-Host ""
Write-Host "Build Options:" -ForegroundColor Cyan
Write-Host "1. Build APK in the cloud (Recommended - requires Expo account)" -ForegroundColor White
Write-Host "2. Build APK locally (Requires Android Studio)" -ForegroundColor White
Write-Host "3. Start development server (Test with Expo Go app)" -ForegroundColor White
Write-Host "4. Exit" -ForegroundColor White
Write-Host ""

$choice = Read-Host "Select an option (1-4)"

switch ($choice) {
    "1" {
        Write-Host ""
        Write-Host "Building APK in the cloud..." -ForegroundColor Green
        Write-Host "This will upload your project to Expo servers and build the APK there." -ForegroundColor Yellow
        Write-Host ""
        
        # Check if user is logged in
        Write-Host "Checking Expo login status..." -ForegroundColor Yellow
        $whoami = eas whoami 2>$null
        if (-not $?) {
            Write-Host "You need to login to Expo first." -ForegroundColor Yellow
            eas login
        } else {
            Write-Host "✓ Logged in as: $whoami" -ForegroundColor Green
        }
        
        Write-Host ""
        Write-Host "Select build profile:" -ForegroundColor Cyan
        Write-Host "1. Preview (for testing)" -ForegroundColor White
        Write-Host "2. Production (for release)" -ForegroundColor White
        $profile = Read-Host "Select profile (1-2)"
        
        if ($profile -eq "1") {
            Write-Host "Starting preview build..." -ForegroundColor Green
            eas build --platform android --profile preview
        } elseif ($profile -eq "2") {
            Write-Host "Starting production build..." -ForegroundColor Green
            eas build --platform android --profile production
        } else {
            Write-Host "Invalid option" -ForegroundColor Red
        }
    }
    "2" {
        Write-Host ""
        Write-Host "Building APK locally..." -ForegroundColor Green
        Write-Host "This requires Android Studio and Android SDK to be installed." -ForegroundColor Yellow
        Write-Host ""
        
        $confirm = Read-Host "Do you have Android Studio installed? (y/n)"
        if ($confirm -eq "y") {
            Write-Host "Starting local build..." -ForegroundColor Green
            eas build --platform android --profile preview --local
        } else {
            Write-Host "Please install Android Studio first from: https://developer.android.com/studio" -ForegroundColor Yellow
        }
    }
    "3" {
        Write-Host ""
        Write-Host "Starting development server..." -ForegroundColor Green
        Write-Host "1. Install Expo Go app on your Android device" -ForegroundColor Yellow
        Write-Host "2. Scan the QR code that will appear" -ForegroundColor Yellow
        Write-Host ""
        Start-Sleep -Seconds 2
        npm start
    }
    "4" {
        Write-Host "Exiting..." -ForegroundColor Yellow
        exit
    }
    default {
        Write-Host "Invalid option" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "Build process completed!" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "- Download the APK from the link provided" -ForegroundColor White
Write-Host "- Transfer it to your Android device" -ForegroundColor White
Write-Host "- Enable 'Install from Unknown Sources' in Android settings" -ForegroundColor White
Write-Host "- Install the APK" -ForegroundColor White
