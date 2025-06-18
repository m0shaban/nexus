#!/bin/bash

# 🚀 NEXUS GitHub Upload Script v2.0
# المطور: محمد شعبان
# الإصدار: v2.0 - محدث مع الأيقونات المتقدمة وتحسينات الواجهة
# الهدف: رفع مشروع NEXUS على GitHub مع حماية الحقوق التجارية

echo "🌟 NEXUS - GitHub Upload Script v2.0"
echo "✨ التحديثات: أيقونات متقدمة + تحسينات واجهة المستخدم"
echo "© 2025 محمد شعبان - جميع الحقوق محفوظة"
echo "============================================="

# التحقق من وجود Git
if ! command -v git &> /dev/null; then
    echo "❌ خطأ: Git غير مثبت على النظام"
    exit 1
fi

# التحقق من المجلد الحالي
if [ ! -f "package.json" ]; then
    echo "❌ خطأ: يجب تشغيل الـ script من مجلد المشروع"
    exit 1
fi

echo "✅ التحقق من المتطلبات..."

# اسم المستودع
REPO_NAME="nexus"
echo "📁 اسم المستودع: $REPO_NAME"

# طلب username من المستخدم
echo ""
read -p "👤 أدخل GitHub username الخاص بك: " GITHUB_USERNAME

if [ -z "$GITHUB_USERNAME" ]; then
    echo "❌ خطأ: يجب إدخال GitHub username"
    exit 1
fi

echo ""
echo "🔄 بدء عملية الرفع..."

# تهيئة Git (إذا لم يكن مُهيأً)
if [ ! -d ".git" ]; then
    echo "📝 تهيئة Git repository..."
    git init
    git add .
    git commit -m "🎉 NEXUS v2.0: Advanced Icons & Enhanced UI

✨ Major Updates v2.0:
- 🎨 Advanced Neural Network Icons with animations
- 🧠 AdvancedLogosIcon component (neural, quantum, matrix variants)
- 🌟 Enhanced visual effects and CSS animations
- 💫 Quantum interference and neural pulse effects
- 🔄 Spin-slow animations and gradient enhancements

🤖 Logos AI Enhancements:
- � Unified welcome message across all components
- 🎯 Specialized strategic consultation focus
- ⚡ Enhanced floating chat with neural animations
- 🌊 Smooth transitions and hover effects

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

🚀 Ready for production deployment"
fi

# إضافة remote repository
echo "🔗 إضافة remote repository..."
git remote add origin "https://github.com/$GITHUB_USERNAME/$REPO_NAME.git" 2>/dev/null || true

# تعيين branch رئيسي
echo "🌿 تعيين main branch..."
git branch -M main

# رفع المشروع
echo "⬆️ رفع المشروع على GitHub..."
if git push -u origin main; then
    
    # إنشاء تاغ v2.0
    echo "🏷️ إنشاء تاغ الإصدار v2.0..."
    git tag -a "v2.0" -m "🎨 NEXUS v2.0: Advanced Neural Icons & Enhanced UI

✨ Major Features:
- Advanced LogosIcon with neural network animations
- Quantum and Matrix visual effects
- Enhanced CSS animations (spin-slow, neural-pulse)
- Unified Logos AI experience
- Modern gradient effects (conic, radial)

🔒 © 2025 محمد شعبان - Commercial License Required
📧 Contact: ENG.MOHAMED0SHABAN@GMAIL.COM"

    git push origin v2.0
    
    echo ""
    echo "🎉 تم رفع NEXUS v2.0 بنجاح!"
    echo ""
    echo "🔗 رابط المستودع:"
    echo "   https://github.com/$GITHUB_USERNAME/$REPO_NAME"
    echo ""
    
    # تنبيه خاص لتحديث Vercel
    echo "� تنبيه مهم - تحديث Vercel:"
    echo "   إذا كان لديك نسخة منشورة على Vercel، تأكد من:"
    echo "   1. 🔄 إعادة النشر على Vercel لتحديث الأيقونات الجديدة"
    echo "   2. 🎨 التأكد من ظهور الأيقونات المتقدمة (Neural Network)"
    echo "   3. ⚡ اختبار الحركات والتأثيرات البصرية الجديدة"
    echo "   4. 🌐 مراجعة https://vercel.com/dashboard للنشر"
    echo ""
    
    echo "✨ ميزات v2.0 الجديدة:"
    echo "   🧠 أيقونات Neural Network متحركة"
    echo "   ⚛️ تأثيرات Quantum و Matrix"
    echo "   🌟 حركات CSS متقدمة (spin-slow, neural-pulse)"
    echo "   💫 Gradients مخصصة (conic, radial)"
    echo ""
    
    echo "📝 الخطوات التالية:"
    echo "   1. 📋 أضف وصف للمستودع مع 'v2.0 Advanced Icons'"
    echo "   2. 🏷️ تحقق من Release v2.0 في GitHub"
    echo "   3. 🌐 حديث Vercel من GitHub"
    echo "   4. 📖 راجع docs/LOGOS_ICONS_ENHANCEMENT.md"
    echo ""
    echo "📞 للاستخدام التجاري تواصل مع:"
    echo "   محمد شعبان - ENG.MOHAMED0SHABAN@GMAIL.COM"
    echo ""
else
    echo ""
    echo "❌ فشل في رفع المشروع!"
    echo ""
    echo "🔧 خطوات استكشاف الأخطاء:"
    echo "   1. تأكد من إنشاء المستودع على GitHub أولاً:"
    echo "      https://github.com/new"
    echo "   2. اسم المستودع: $REPO_NAME"
    echo "   3. تأكد من تسجيل الدخول في Git:"
    echo "      git config --global user.name 'اسمك'"
    echo "      git config --global user.email 'بريدك@example.com'"
    echo "   4. راجع ملف UPLOAD_TO_GITHUB.md للتفاصيل"
    echo ""
fi

echo "============================================="
echo "© 2025 محمد شعبان - جميع الحقوق محفوظة"
