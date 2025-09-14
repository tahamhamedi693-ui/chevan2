# PowerShell script to help set up the database for user types
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "RideShare Database Setup for User Types" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "This script will guide you through setting up the database for user types." -ForegroundColor Yellow
Write-Host ""

Write-Host "IMPORTANT: You need to run the following SQL in your Supabase Dashboard:" -ForegroundColor Red
Write-Host ""
Write-Host "1. Go to https://app.supabase.com and log in" -ForegroundColor Green
Write-Host "2. Select your project" -ForegroundColor Green
Write-Host "3. Navigate to SQL Editor" -ForegroundColor Green
Write-Host "4. Copy and run this SQL:" -ForegroundColor Green
Write-Host ""

$sql = @"
-- Add user_type column to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS user_type text DEFAULT 'passenger' 
CHECK (user_type IN ('passenger', 'driver'));

-- Update existing profiles to have a default user_type if they don't have one
UPDATE public.profiles 
SET user_type = 'passenger' 
WHERE user_type IS NULL;

-- Make user_type column NOT NULL after setting defaults
ALTER TABLE public.profiles 
ALTER COLUMN user_type SET NOT NULL;
"@

Write-Host $sql -ForegroundColor White
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "After running the SQL, your app will be ready to use with user types!" -ForegroundColor Green
Write-Host ""
Write-Host "Press any key to open the DATABASE_SETUP.md file for more details..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")

# Open the DATABASE_SETUP.md file
Start-Process notepad.exe -ArgumentList "$PSScriptRoot\DATABASE_SETUP.md"
