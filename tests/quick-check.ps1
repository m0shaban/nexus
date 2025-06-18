#!/usr/bin/env pwsh

Write-Host "🚀 Nexus System Quick Check" -ForegroundColor Green
Write-Host "===========================" -ForegroundColor Green

# تحقق من الملفات المطلوبة
$requiredFiles = @(
    "src\app\api\notes\route.ts",
    "src\components\NotesDisplayFixed.tsx", 
    "src\components\ProfessionalNoteTaker.tsx",
    "nexus-compatible-database-setup.sql",
    "test-database.mjs"
)

Write-Host "`n📁 Checking required files..." -ForegroundColor Yellow

$allFilesExist = $true
foreach ($file in $requiredFiles) {
    if (Test-Path $file) {
        Write-Host "✅ $file" -ForegroundColor Green
    } else {
        Write-Host "❌ $file" -ForegroundColor Red
        $allFilesExist = $false
    }
}

# تحقق من متغيرات البيئة
Write-Host "`n🔧 Checking environment setup..." -ForegroundColor Yellow

if (Test-Path ".env.local") {
    Write-Host "✅ .env.local exists" -ForegroundColor Green
    
    $envContent = Get-Content ".env.local" -Raw
    
    if ($envContent -match "NEXT_PUBLIC_SUPABASE_URL=https://") {
        Write-Host "✅ Supabase URL configured" -ForegroundColor Green
    } else {
        Write-Host "⚠️ Supabase URL needs configuration" -ForegroundColor Yellow
    }
    
    if ($envContent -match "NEXT_PUBLIC_SUPABASE_ANON_KEY=") {
        Write-Host "✅ Supabase ANON_KEY configured" -ForegroundColor Green
    } else {
        Write-Host "⚠️ Supabase ANON_KEY needs configuration" -ForegroundColor Yellow
    }
} else {
    Write-Host "❌ .env.local not found" -ForegroundColor Red
    Write-Host "   Copy .env.local.example to .env.local and configure" -ForegroundColor Cyan
    $allFilesExist = $false
}

# تحقق من package.json
Write-Host "`n📦 Checking dependencies..." -ForegroundColor Yellow

if (Test-Path "package.json") {
    Write-Host "✅ package.json exists" -ForegroundColor Green
    
    $packageJson = Get-Content "package.json" -Raw | ConvertFrom-Json
    
    $requiredDeps = @("@supabase/supabase-js", "react", "next")
    foreach ($dep in $requiredDeps) {
        if ($packageJson.dependencies.$dep -or $packageJson.devDependencies.$dep) {
            Write-Host "✅ $dep installed" -ForegroundColor Green
        } else {
            Write-Host "⚠️ $dep might be missing" -ForegroundColor Yellow
        }
    }
} else {
    Write-Host "❌ package.json not found" -ForegroundColor Red
    $allFilesExist = $false
}

# النتيجة النهائية
Write-Host "`n🎯 Summary:" -ForegroundColor Cyan
if ($allFilesExist) {
    Write-Host "✅ All required files are present!" -ForegroundColor Green
    Write-Host "`n📋 Next steps:" -ForegroundColor Yellow
    Write-Host "1. Run the database setup SQL in Supabase" -ForegroundColor White
    Write-Host "2. Configure .env.local with your Supabase credentials" -ForegroundColor White
    Write-Host "3. Run: node test-database.mjs" -ForegroundColor White
    Write-Host "4. Run: npm run dev" -ForegroundColor White
    Write-Host "5. Visit: http://localhost:3000/notes" -ForegroundColor White
} else {
    Write-Host "❌ Some files are missing. Please check the output above." -ForegroundColor Red
}

Write-Host "`n🔗 Quick Links:" -ForegroundColor Cyan
Write-Host "- Database Setup: nexus-compatible-database-setup.sql" -ForegroundColor White
Write-Host "- Test Database: node test-database.mjs" -ForegroundColor White
Write-Host "- Fix Guide: FIX_GUIDE_COMPLETE.md" -ForegroundColor White

Write-Host "`n==========================" -ForegroundColor Green
Write-Host "🎉 Check complete!" -ForegroundColor Green
