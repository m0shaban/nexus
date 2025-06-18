# ========================================
# Nexus Project Status Check
# فحص شامل لحالة مشروع Nexus
# ========================================

Write-Host "🚀 فحص شامل لمشروع Nexus" -ForegroundColor Cyan
Write-Host "=" * 50

# 1. فحص ملفات قاعدة البيانات
Write-Host "`n📁 فحص ملفات قاعدة البيانات..." -ForegroundColor Yellow

$dbFiles = @(
    "db/00-master-setup.sql",
    "db/01-setup-extensions.sql", 
    "db/02-create-users-new.sql",
    "db/03-create-notes.sql",
    "db/04-create-projects-new.sql",
    "db/05-create-scenarios.sql",
    "db/06-create-streaks.sql",
    "db/07-create-mirror.sql",
    "db/08-create-logos.sql",
    "db/09-create-analytics-views.sql",
    "db/10-create-sample-data.sql"
)

$dbComplete = $true
foreach ($file in $dbFiles) {
    if (Test-Path $file) {
        Write-Host "✅ $file" -ForegroundColor Green
    } else {
        Write-Host "❌ $file" -ForegroundColor Red
        $dbComplete = $false
    }
}

# 2. فحص ملفات البيئة
Write-Host "`n🔧 فحص ملفات البيئة..." -ForegroundColor Yellow

$envFiles = @(".env", ".env.example")
foreach ($file in $envFiles) {
    if (Test-Path $file) {
        Write-Host "✅ $file" -ForegroundColor Green
    } else {
        Write-Host "❌ $file" -ForegroundColor Red
    }
}

# 3. فحص سكريبتات الإعداد
Write-Host "`n⚙️ فحص سكريبتات الإعداد..." -ForegroundColor Yellow

$setupFiles = @(
    "setup-database.ps1",
    "setup-database.sh", 
    "cleanup-old-files.ps1",
    "cleanup-old-files.sh"
)

foreach ($file in $setupFiles) {
    if (Test-Path $file) {
        Write-Host "✅ $file" -ForegroundColor Green
    } else {
        Write-Host "❌ $file" -ForegroundColor Red
    }
}

# 4. فحص ملفات التوثيق
Write-Host "`n📚 فحص ملفات التوثيق..." -ForegroundColor Yellow

$docFiles = @(
    "DATABASE_SETUP_GUIDE.md",
    "FINAL_COMPLETION_REPORT.md",
    "README.md"
)

foreach ($file in $docFiles) {
    if (Test-Path $file) {
        Write-Host "✅ $file" -ForegroundColor Green
    } else {
        Write-Host "❌ $file" -ForegroundColor Red
    }
}

# 5. فحص ملفات Node.js
Write-Host "`n📦 فحص ملفات Node.js..." -ForegroundColor Yellow

if (Test-Path "package.json") {
    Write-Host "✅ package.json" -ForegroundColor Green
    
    # فحص التبعيات المهمة
    $packageContent = Get-Content "package.json" | ConvertFrom-Json
    $requiredDeps = @("@supabase/supabase-js", "next", "react")
    
    foreach ($dep in $requiredDeps) {        if ($packageContent.dependencies.$dep) {
            Write-Host "  ✅ ${dep}: $($packageContent.dependencies.$dep)" -ForegroundColor Green
        } else {
            Write-Host "  ❌ ${dep}: غير موجود" -ForegroundColor Red
        }
    }
} else {
    Write-Host "❌ package.json" -ForegroundColor Red
}

# 6. فحص node_modules
if (Test-Path "node_modules") {
    Write-Host "✅ node_modules موجود" -ForegroundColor Green
} else {
    Write-Host "❌ node_modules غير موجود - قم بتشغيل npm install" -ForegroundColor Red
}

# 7. النتيجة النهائية
Write-Host "`n" + "=" * 50
if ($dbComplete) {
    Write-Host "🎉 قاعدة البيانات: جاهزة ومكتملة" -ForegroundColor Green
} else {
    Write-Host "⚠️ قاعدة البيانات: تحتاج مراجعة" -ForegroundColor Yellow
}

Write-Host "`n📋 الخطوات التالية:"
Write-Host "1. تأكد من تحديث متغيرات البيئة في .env"
Write-Host "2. قم بتشغيل: npm install (إذا لم تقم بذلك)"
Write-Host "3. قم بتشغيل: npm run db:setup (لإعداد قاعدة البيانات)"
Write-Host "4. قم بتشغيل: npm run dev (لتشغيل التطبيق)"

Write-Host "`n✨ انتهى الفحص الشامل" -ForegroundColor Cyan
