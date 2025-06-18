#!/usr/bin/env pwsh

# 🔍 فحص شامل نهائي لحالة شاتبوت اللوغوس
# يفحص: قاعدة البيانات، API، الواجهة، والتكامل الكامل

Write-Host "🤖 فحص شامل لنظام شاتبوت اللوغوس" -ForegroundColor Cyan
Write-Host "=" * 50 -ForegroundColor Gray

# 1. فحص متغيرات البيئة
Write-Host "`n🔑 فحص متغيرات البيئة:" -ForegroundColor Yellow
if (Test-Path ".env.local") {
    Write-Host "✅ ملف .env.local موجود" -ForegroundColor Green
    
    $envContent = Get-Content ".env.local" -Raw
    
    if ($envContent -match "NEXT_PUBLIC_SUPABASE_URL=https://mtsgkpgbdzgqrcqitayq.supabase.co") {
        Write-Host "✅ Supabase URL مضبوط" -ForegroundColor Green
    } else {
        Write-Host "❌ Supabase URL غير صحيح" -ForegroundColor Red
    }
    
    if ($envContent -match "SUPABASE_SERVICE_ROLE_KEY=") {
        Write-Host "✅ Service Role Key موجود" -ForegroundColor Green
    } else {
        Write-Host "❌ Service Role Key مفقود" -ForegroundColor Red
    }
    
    if ($envContent -match "NVIDIA_API_KEY=") {
        Write-Host "✅ NVIDIA API Key موجود" -ForegroundColor Green
    } else {
        Write-Host "⚠️ NVIDIA API Key مفقود - سيعمل في وضع محدود" -ForegroundColor Yellow
    }
} else {
    Write-Host "❌ ملف .env.local غير موجود" -ForegroundColor Red
}

# 2. فحص ملفات الكود
Write-Host "`n📁 فحص ملفات الكود:" -ForegroundColor Yellow

$codeFiles = @(
    @{ path = "src/app/api/logos/chat/route.ts"; name = "Chat API" },
    @{ path = "src/components/LogosChat.tsx"; name = "React Component" },
    @{ path = "src/hooks/useLogosChat.ts"; name = "Chat Hook" },
    @{ path = "src/lib/nvidia-ai.ts"; name = "NVIDIA AI Integration" },
    @{ path = "setup-logos-database.sql"; name = "Database Schema" }
)

foreach ($file in $codeFiles) {
    if (Test-Path $file.path) {
        Write-Host "✅ $($file.name): موجود" -ForegroundColor Green
    } else {
        Write-Host "❌ $($file.name): مفقود ($($file.path))" -ForegroundColor Red
    }
}

# 3. فحص dependencies
Write-Host "`n📦 فحص التبعيات:" -ForegroundColor Yellow
if (Test-Path "package.json") {
    $packageJson = Get-Content "package.json" -Raw | ConvertFrom-Json
    
    $requiredDeps = @("@supabase/supabase-js", "openai", "framer-motion")
    foreach ($dep in $requiredDeps) {
        if ($packageJson.dependencies.$dep) {
            Write-Host "✅ $dep: $($packageJson.dependencies.$dep)" -ForegroundColor Green
        } else {
            Write-Host "❌ $dep: مفقود" -ForegroundColor Red
        }
    }
} else {
    Write-Host "❌ package.json غير موجود" -ForegroundColor Red
}

# 4. اختبار بناء المشروع
Write-Host "`n🔨 فحص إمكانية البناء:" -ForegroundColor Yellow
Write-Host "فحص أخطاء TypeScript..." -ForegroundColor Gray

try {
    $typeCheckResult = npx tsc --noEmit 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ لا توجد أخطاء TypeScript" -ForegroundColor Green
    } else {
        Write-Host "⚠️ توجد أخطاء TypeScript:" -ForegroundColor Yellow
        $typeCheckResult | Select-Object -First 5 | ForEach-Object { Write-Host "  $_" -ForegroundColor Gray }
    }
} catch {
    Write-Host "❌ فشل فحص TypeScript" -ForegroundColor Red
}

# 5. فحص بناء Next.js
Write-Host "`nفحص بناء Next.js..." -ForegroundColor Gray
try {
    $buildResult = npm run build 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ بناء Next.js نجح" -ForegroundColor Green
    } else {
        Write-Host "❌ فشل بناء Next.js" -ForegroundColor Red
        $buildResult | Select-Object -Last 10 | ForEach-Object { Write-Host "  $_" -ForegroundColor Gray }
    }
} catch {
    Write-Host "❌ خطأ في بناء Next.js" -ForegroundColor Red
}

# 6. إرشادات الاختبار النهائي
Write-Host "`n🎯 خطوات الاختبار النهائي:" -ForegroundColor Cyan
Write-Host "1. تشغيل الخادم:" -ForegroundColor White
Write-Host "   npm run dev" -ForegroundColor Gray

Write-Host "`n2. اختبار API مباشرة:" -ForegroundColor White
Write-Host "   node test-chatbot-live.mjs" -ForegroundColor Gray

Write-Host "`n3. اختبار الواجهة:" -ForegroundColor White
Write-Host "   - افتح http://localhost:3000" -ForegroundColor Gray
Write-Host "   - ابحث عن أيقونة الشاتبوت (دائرة زرقاء في الأسفل)" -ForegroundColor Gray
Write-Host "   - انقر عليها واكتب رسالة" -ForegroundColor Gray

Write-Host "`n4. التحقق من قاعدة البيانات:" -ForegroundColor White
Write-Host "   - ادخل إلى Supabase Dashboard" -ForegroundColor Gray
Write-Host "   - تحقق من وجود جداول logos_*" -ForegroundColor Gray
Write-Host "   - تشغيل setup-logos-database.sql إذا لزم الأمر" -ForegroundColor Gray

# 7. ملخص التشخيص
Write-Host "`n📋 ملخص الحالة:" -ForegroundColor Cyan

if (Test-Path "src/components/LogosChat.tsx" -and Test-Path "src/app/api/logos/chat/route.ts") {
    Write-Host "✅ الكود الأساسي للشاتبوت موجود" -ForegroundColor Green
} else {
    Write-Host "❌ ملفات الشاتبوت الأساسية مفقودة" -ForegroundColor Red
}

if (Test-Path ".env.local") {
    Write-Host "✅ ملف البيئة موجود" -ForegroundColor Green
} else {
    Write-Host "❌ يجب إنشاء ملف .env.local" -ForegroundColor Red
}

Write-Host "`n🚀 الحالة المتوقعة:" -ForegroundColor Yellow
Write-Host "- الشاتبوت سيعمل في وضع تجريبي/mock حتى مع عدم وجود قاعدة البيانات" -ForegroundColor Gray
Write-Host "- مع NVIDIA API سيولد استجابات ذكية حقيقية" -ForegroundColor Gray
Write-Host "- مع قاعدة البيانات سيحفظ المحادثات ويتذكر السياق" -ForegroundColor Gray

Write-Host "`n💡 إذا واجهت مشاكل:" -ForegroundColor Cyan
Write-Host "1. تأكد من تشغيل الخادم بـ npm run dev" -ForegroundColor Gray
Write-Host "2. فحص console في المتصفح للأخطاء" -ForegroundColor Gray
Write-Host "3. فحص terminal للأخطاء في الخادم" -ForegroundColor Gray
Write-Host "4. جرب إعادة تشغيل الخادم" -ForegroundColor Gray

Write-Host "`n🎉 انتهى الفحص!" -ForegroundColor Green
