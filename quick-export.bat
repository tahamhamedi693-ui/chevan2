@echo off
echo ========================================
echo    Quick Export - RideShare App
echo ========================================
echo.

echo Select export option:
echo 1. Export for Web (Quick - No login required)
echo 2. Export Android APK (Requires Expo login)
echo 3. Start Dev Server (Test with Expo Go)
echo.

set /p choice="Select option (1-3): "

if "%choice%"=="1" (
    echo.
    echo Exporting for Web...
    npm run build:web
    echo.
    echo Web build exported to 'dist' folder!
    echo You can deploy this to any web hosting service.
) else if "%choice%"=="2" (
    echo.
    echo Starting Android APK export...
    echo Please complete the login in the other terminal first.
    echo Then run: eas build --platform android --profile preview
) else if "%choice%"=="3" (
    echo.
    echo Starting development server...
    npm start
)

pause
