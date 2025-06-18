# 🚀 NEXUS GitHub Upload Script (PowerShell)
# المطور: محمد شعبان
# الهدف: رفع مشروع NEXUS على GitHub مع حماية الحقوق التجارية

Write-Host "🌟 NEXUS - GitHub Upload Script" -ForegroundColor Green
Write-Host "© 2025 محمد شعبان - جميع الحقوق محفوظة" -ForegroundColor Yellow
Write-Host "=============================================" -ForegroundColor Cyan

# التحقق من وجود Git
try {
    git --version | Out-Null
    Write-Host "✅ Git متوفر" -ForegroundColor Green
} catch {
    Write-Host "❌ خطأ: Git غير مثبت على النظام" -ForegroundColor Red
    Write-Host "يرجى تثبيت Git من: https://git-scm.com/download/win" -ForegroundColor Yellow
    exit 1
}

# التحقق من المجلد الحالي
if (-Not (Test-Path "package.json")) {
    Write-Host "❌ خطأ: يجب تشغيل الـ script من مجلد المشروع" -ForegroundColor Red
    exit 1
}

Write-Host "✅ التحقق من المتطلبات مكتمل" -ForegroundColor Green

# اسم المستودع
$REPO_NAME = "nexus-productivity-system"
Write-Host "📁 اسم المستودع: $REPO_NAME" -ForegroundColor Blue

# طلب username من المستخدم
Write-Host ""
$GITHUB_USERNAME = Read-Host "👤 أدخل GitHub username الخاص بك"

if ([string]::IsNullOrWhiteSpace($GITHUB_USERNAME)) {
    Write-Host "❌ خطأ: يجب إدخال GitHub username" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "🔄 بدء عملية الرفع..." -ForegroundColor Yellow

# تهيئة Git (إذا لم يكن مُهيأً)
if (-Not (Test-Path ".git")) {
    Write-Host "📝 تهيئة Git repository..." -ForegroundColor Blue
    git init
    git add .
    
    $commitMessage = @"
🎉 Initial commit: NEXUS Smart Productivity System

✨ Features:
- 📝 Advanced Notes Management with Markdown editor
- 📊 Intelligent Project Tracking with analytics  
- 🎯 Habit Building with gamification
- 🤖 AI Assistant (Logos) powered by NVIDIA
- 📱 Modern responsive UI with Next.js 15

🔒 Commercial Rights Protected:
- © 2025 محمد شعبان (Mohamed Shaban)
- Commercial use requires paid license
- Contact: ENG.MOHAMED0SHABAN@GMAIL.COM

🏗️ Tech Stack:
- Next.js 15.3.3 + TypeScript
- Supabase Database with RLS
- NVIDIA AI Integration
- Tailwind CSS + Framer Motion
- Comprehensive testing suite

📞 Contact Information:
- Name: محمد شعبان (Mohamed Shaban)
- Phone: +201121891913
- Email: ENG.MOHAMED0SHABAN@GMAIL.COM
- LinkedIn: https://www.linkedin.com/in/moshabann/

🚀 Ready for production deployment
"@
    
    git commit -m $commitMessage
}

# إضافة remote repository
Write-Host "🔗 إضافة remote repository..." -ForegroundColor Blue
try {
    git remote add origin "https://github.com/$GITHUB_USERNAME/$REPO_NAME.git" 2>$null
} catch {
    # Remote already exists, continue
}

# تعيين branch رئيسي
Write-Host "🌿 تعيين main branch..." -ForegroundColor Blue
git branch -M main

# رفع المشروع
Write-Host "⬆️ رفع المشروع على GitHub..." -ForegroundColor Blue
try {
    git push -u origin main
    Write-Host ""
    Write-Host "🎉 تم رفع المشروع بنجاح!" -ForegroundColor Green
    Write-Host ""
    Write-Host "🔗 رابط المستودع:" -ForegroundColor Cyan
    Write-Host "   https://github.com/$GITHUB_USERNAME/$REPO_NAME" -ForegroundColor White
    Write-Host ""
    Write-Host "📝 الخطوات التالية:" -ForegroundColor Yellow
    Write-Host "   1. اذهب إلى المستودع على GitHub" -ForegroundColor White
    Write-Host "   2. أضف وصف للمستودع" -ForegroundColor White
    Write-Host "   3. فعّل GitHub Pages (اختياري)" -ForegroundColor White
    Write-Host "   4. راجع ملف UPLOAD_TO_GITHUB.md للتفاصيل" -ForegroundColor White
    Write-Host ""
    Write-Host "📞 للاستخدام التجاري تواصل مع:" -ForegroundColor Magenta
    Write-Host "   محمد شعبان - ENG.MOHAMED0SHABAN@GMAIL.COM" -ForegroundColor White
    Write-Host ""
} catch {
    Write-Host ""
    Write-Host "❌ فشل في رفع المشروع!" -ForegroundColor Red
    Write-Host ""
    Write-Host "🔧 خطوات استكشاف الأخطاء:" -ForegroundColor Yellow
    Write-Host "   1. تأكد من إنشاء المستودع على GitHub أولاً:" -ForegroundColor White
    Write-Host "      https://github.com/new" -ForegroundColor White
    Write-Host "   2. اسم المستودع: $REPO_NAME" -ForegroundColor White
    Write-Host "   3. تأكد من تسجيل الدخول في Git:" -ForegroundColor White
    Write-Host "      git config --global user.name 'اسمك'" -ForegroundColor White
    Write-Host "      git config --global user.email 'بريدك@example.com'" -ForegroundColor White
    Write-Host "   4. راجع ملف UPLOAD_TO_GITHUB.md للتفاصيل" -ForegroundColor White
    Write-Host ""
}

Write-Host "=============================================" -ForegroundColor Cyan
Write-Host "© 2025 محمد شعبان - جميع الحقوق محفوظة" -ForegroundColor Yellow

# توقف لعرض النتائج
Read-Host "اضغط Enter للمتابعة..."
