@echo off
echo ========================================
echo    RideShare App - APK Build Script    
echo ========================================
echo.

echo Checking EAS CLI installation...
eas --version >nul 2>&1
if %errorlevel% equ 0 (
    echo EAS CLI is installed
) else (
    echo EAS CLI is not installed. Installing...
    npm install -g eas-cli
)

echo.
echo Build Options:
echo 1. Build APK in the cloud (Recommended - requires Expo account)
echo 2. Build APK locally (Requires Android Studio)
echo 3. Start development server (Test with Expo Go app)
echo 4. Exit
echo.

set /p choice="Select an option (1-4): "

if "%choice%"=="1" (
    echo.
    echo Building APK in the cloud...
    echo This will upload your project to Expo servers and build the APK there.
    echo.
    
    echo Checking Expo login status...
    eas whoami >nul 2>&1
    if %errorlevel% neq 0 (
        echo You need to login to Expo first.
        eas login
    )
    
    echo.
    echo Select build profile:
    echo 1. Preview - for testing
    echo 2. Production - for release
    set /p profile="Select profile (1-2): "
    
    if "%profile%"=="1" (
        echo Starting preview build...
        eas build --platform android --profile preview
    ) else if "%profile%"=="2" (
        echo Starting production build...
        eas build --platform android --profile production
    ) else (
        echo Invalid option
    )
) else if "%choice%"=="2" (
    echo.
    echo Building APK locally...
    echo This requires Android Studio and Android SDK to be installed.
    echo.
    
    set /p confirm="Do you have Android Studio installed? (y/n): "
    if "%confirm%"=="y" (
        echo Starting local build...
        eas build --platform android --profile preview --local
    ) else (
        echo Please install Android Studio first from: https://developer.android.com/studio
    )
) else if "%choice%"=="3" (
    echo.
    echo Starting development server...
    echo 1. Install Expo Go app on your Android device
    echo 2. Scan the QR code that will appear
    echo.
    timeout /t 2 >nul
    npm start
) else if "%choice%"=="4" (
    echo Exiting...
    exit /b
) else (
    echo Invalid option
)

echo.
echo Build process completed!
echo.
echo Next steps:
echo - Download the APK from the link provided
echo - Transfer it to your Android device
echo - Enable 'Install from Unknown Sources' in Android settings
echo - Install the APK
pause
