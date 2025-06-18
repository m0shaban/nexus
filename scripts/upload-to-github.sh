#!/bin/bash

# 🚀 NEXUS GitHub Upload Script
# المطور: محمد شعبان
# الهدف: رفع مشروع NEXUS على GitHub مع حماية الحقوق التجارية

echo "🌟 NEXUS - GitHub Upload Script"
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
REPO_NAME="nexus-productivity-system"
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
    git commit -m "🎉 Initial commit: NEXUS Smart Productivity System

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
    echo ""
    echo "🎉 تم رفع المشروع بنجاح!"
    echo ""
    echo "🔗 رابط المستودع:"
    echo "   https://github.com/$GITHUB_USERNAME/$REPO_NAME"
    echo ""
    echo "📝 الخطوات التالية:"
    echo "   1. اذهب إلى المستودع على GitHub"
    echo "   2. أضف وصف للمستودع"
    echo "   3. فعّل GitHub Pages (اختياري)"
    echo "   4. راجع ملف UPLOAD_TO_GITHUB.md للتفاصيل"
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
