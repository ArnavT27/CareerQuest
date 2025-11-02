# PowerShell script to help set up .env.local file
# Run with: .\setup-env.ps1

$envFile = ".env.local"
$envPath = Join-Path $PSScriptRoot $envFile

Write-Host "`n🔧 .env.local Setup Helper`n" -ForegroundColor Cyan
Write-Host "=" * 50

# Check if file exists
if (Test-Path $envPath) {
    Write-Host "✅ Found existing .env.local file" -ForegroundColor Green
    $content = Get-Content $envPath -Raw
    
    if ([string]::IsNullOrWhiteSpace($content)) {
        Write-Host "⚠️  File exists but is EMPTY" -ForegroundColor Yellow
    } else {
        Write-Host "📄 Current content:" -ForegroundColor Blue
        Get-Content $envPath | ForEach-Object { Write-Host "   $_" }
        Write-Host ""
        
        $hasKey = $content -match "VITE_GEMINI_API_KEY\s*="
        if ($hasKey) {
            Write-Host "✅ VITE_GEMINI_API_KEY is already set" -ForegroundColor Green
            $choice = Read-Host "Do you want to update it? (y/n)"
            if ($choice -ne 'y') {
                Write-Host "Exiting. No changes made." -ForegroundColor Yellow
                exit
            }
        }
    }
} else {
    Write-Host "📝 Creating new .env.local file" -ForegroundColor Blue
}

Write-Host "`nPlease enter your Gemini API Key:" -ForegroundColor Cyan
Write-Host "(Get it from: https://makersuite.google.com/app/apikey)" -ForegroundColor Gray
$apiKey = Read-Host "API Key"

if ([string]::IsNullOrWhiteSpace($apiKey)) {
    Write-Host "`n❌ API Key cannot be empty!" -ForegroundColor Red
    exit 1
}

# Validate format (should start with AIza)
if ($apiKey -notmatch "^AIza[SyD]") {
    Write-Host "`n⚠️  Warning: API key doesn't match expected format (should start with 'AIza')" -ForegroundColor Yellow
    $continue = Read-Host "Continue anyway? (y/n)"
    if ($continue -ne 'y') {
        Write-Host "Exiting. No changes made." -ForegroundColor Yellow
        exit
    }
}

# Write to file
$envContent = "VITE_GEMINI_API_KEY=$apiKey"
Set-Content -Path $envPath -Value $envContent -NoNewline

Write-Host "`n✅ Successfully saved to .env.local" -ForegroundColor Green
Write-Host "`n📋 Next steps:" -ForegroundColor Cyan
Write-Host "   1. Restart your dev server (stop with Ctrl+C, then run: npm run dev)" -ForegroundColor White
Write-Host "   2. The API key should now be loaded automatically" -ForegroundColor White
Write-Host "`n" 

