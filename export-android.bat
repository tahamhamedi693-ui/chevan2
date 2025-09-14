@echo off
echo ========================================
echo    Android APK Export - RideShare App
echo ========================================
echo.

echo Checking login status...
eas whoami >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: You need to login to Expo first!
    echo.
    echo Please run: eas login
    echo Or create a free account at: https://expo.dev
    echo.
    pause
    exit /b 1
)

echo You are logged in to Expo!
echo.
echo Starting Android APK build...
echo This will take about 10-20 minutes.
echo.

echo Build type:
echo 1. Preview APK (for testing)
echo 2. Production APK (for release)
echo.
set /p buildtype="Select (1 or 2): "

if "%buildtype%"=="1" (
    echo.
    echo Building Preview APK...
    eas build --platform android --profile preview --non-interactive
) else if "%buildtype%"=="2" (
    echo.
    echo Building Production APK...
    eas build --platform android --profile production --non-interactive
) else (
    echo Invalid selection
    pause
    exit /b 1
)

echo.
echo Build submitted! You will receive a download link when it's ready.
echo Check your build status at: https://expo.dev/accounts/[your-username]/projects/rideshare-app/builds
echo.
pause
