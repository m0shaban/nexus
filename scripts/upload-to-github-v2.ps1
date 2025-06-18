# 🚀 NEXUS GitHub Upload Script v2.0 (PowerShell)
# المطور: محمد شعبان
# الإصدار: v2.0 - محدث مع الأيقونات المتقدمة وتحسينات الواجهة
# الهدف: رفع مشروع NEXUS على GitHub مع حماية الحقوق التجارية

Write-Host "🌟 NEXUS - GitHub Upload Script v2.0" -ForegroundColor Green
Write-Host "✨ التحديثات: أيقونات متقدمة + تحسينات واجهة المستخدم" -ForegroundColor Magenta
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
$REPO_NAME = "nexus"
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
    
    $commitMessage = "🎉 NEXUS v2.0: Advanced Icons and Enhanced UI

✨ Major Updates v2.0:
- Advanced Neural Network Icons with animations
- AdvancedLogosIcon component (neural, quantum, matrix variants)
- Enhanced visual effects and CSS animations
- Quantum interference and neural pulse effects
- Spin-slow animations and gradient enhancements

🤖 Logos AI Enhancements:
- Unified welcome message across all components
- Specialized strategic consultation focus
- Enhanced floating chat with neural animations
- Smooth transitions and hover effects

🏗️ Tech Stack v2.0:
- Next.js 15.3.3 + TypeScript
- Supabase Database with RLS
- NVIDIA AI Integration
- Tailwind CSS + Advanced Animations
- Neural Network Visual Effects

🔒 Commercial Rights Protected:
- © 2025 محمد شعبان (Mohamed Shaban)
- Commercial use requires paid license
- Contact: ENG.MOHAMED0SHABAN@GMAIL.COM

📞 Contact Information:
- Name: محمد شعبان (Mohamed Shaban)
- Phone: +201121891913
- Email: ENG.MOHAMED0SHABAN@GMAIL.COM
- LinkedIn: https://www.linkedin.com/in/moshabann/

🚀 Ready for production deployment with enhanced UI"
    
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
    
    # إنشاء تاغ v2.0
    Write-Host "🏷️ إنشاء تاغ الإصدار v2.0..." -ForegroundColor Blue
    $tagMessage = "🎨 NEXUS v2.0: Advanced Neural Icons and Enhanced UI

✨ Major Features:
- Advanced LogosIcon with neural network animations
- Quantum and Matrix visual effects
- Enhanced CSS animations (spin-slow, neural-pulse)
- Unified Logos AI experience
- Modern gradient effects (conic, radial)

🔒 © 2025 محمد شعبان - Commercial License Required
📧 Contact: ENG.MOHAMED0SHABAN@GMAIL.COM"

    git tag -a "v2.0" -m $tagMessage
    git push origin v2.0
    
    Write-Host ""
    Write-Host "🎉 تم رفع NEXUS v2.0 بنجاح!" -ForegroundColor Green
    Write-Host ""
    Write-Host "🔗 رابط المستودع:" -ForegroundColor Cyan
    Write-Host "   https://github.com/$GITHUB_USERNAME/$REPO_NAME" -ForegroundColor White
    Write-Host ""
    
    # تنبيه خاص لتحديث Vercel
    Write-Host "🚨 تنبيه مهم - تحديث Vercel:" -ForegroundColor Red
    Write-Host "   إذا كان لديك نسخة منشورة على Vercel، تأكد من:" -ForegroundColor Yellow
    Write-Host "   1. 🔄 إعادة النشر على Vercel لتحديث الأيقونات الجديدة" -ForegroundColor White
    Write-Host "   2. 🎨 التأكد من ظهور الأيقونات المتقدمة (Neural Network)" -ForegroundColor White
    Write-Host "   3. ⚡ اختبار الحركات والتأثيرات البصرية الجديدة" -ForegroundColor White
    Write-Host "   4. 🌐 مراجعة https://vercel.com/dashboard للنشر" -ForegroundColor White
    Write-Host ""
    
    Write-Host "✨ ميزات v2.0 الجديدة:" -ForegroundColor Magenta
    Write-Host "   🧠 أيقونات Neural Network متحركة" -ForegroundColor White
    Write-Host "   ⚛️ تأثيرات Quantum و Matrix" -ForegroundColor White
    Write-Host "   🌟 حركات CSS متقدمة (spin-slow, neural-pulse)" -ForegroundColor White
    Write-Host "   💫 Gradients مخصصة (conic, radial)" -ForegroundColor White
    Write-Host ""
    
    Write-Host "📝 الخطوات التالية:" -ForegroundColor Yellow
    Write-Host "   1. 📋 أضف وصف للمستودع مع 'v2.0 Advanced Icons'" -ForegroundColor White
    Write-Host "   2. 🏷️ تحقق من Release v2.0 في GitHub" -ForegroundColor White
    Write-Host "   3. 🌐 حديث Vercel من GitHub" -ForegroundColor White
    Write-Host "   4. 📖 راجع docs/LOGOS_ICONS_ENHANCEMENT.md" -ForegroundColor White
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
Write-Host "🎨 NEXUS v2.0 - Enhanced with Neural Network Icons" -ForegroundColor Magenta
Write-Host "© 2025 محمد شعبان - جميع الحقوق محفوظة" -ForegroundColor Yellow

# توقف لعرض النتائج
Read-Host "اضغط Enter للمتابعة..."
