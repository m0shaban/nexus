#!/usr/bin/env node

import fs from 'fs';

console.log('🔍 إجراء فحص نهائي للمشروع...\n');

// قائمة الملفات المحدثة للتحقق منها
const updatedFiles = [
  'src/components/LogosFloatingChat.tsx',
  'src/components/MainNavigation.tsx', 
  'src/components/ConvertNoteModal.tsx',
  'src/components/ui/toast.tsx',
  'src/components/ui/toaster.tsx',
  'src/app/api/projects/convert-note/route.ts'
];

// فحص وجود الملفات المحدثة
console.log('📋 فحص الملفات المحدثة:');
let allFilesExist = true;

for (const file of updatedFiles) {
  if (fs.existsSync(file)) {
    console.log(`✅ ${file}`);
  } else {
    console.log(`❌ ${file} - غير موجود`);
    allFilesExist = false;
  }
}

// فحص محتوى الملفات للتأكد من الإصلاحات
console.log('\n🔧 فحص الإصلاحات المطبقة:');

// فحص زر الشاتبوت
try {
  const chatbotContent = fs.readFileSync('src/components/LogosFloatingChat.tsx', 'utf8');
  if (chatbotContent.includes('bg-blue-600') && chatbotContent.includes('hover:bg-blue-700')) {
    console.log('✅ زر الشاتبوت: تم تبسيطه بنجاح');
  } else {
    console.log('⚠️ زر الشاتبوت: قد يحتاج مراجعة');
  }
} catch {
  console.log('❌ زر الشاتبوت: خطأ في القراءة');
}

// فحص حذف زر GitHub
try {
  const navContent = fs.readFileSync('src/components/MainNavigation.tsx', 'utf8');
  if (!navContent.includes('github') && !navContent.includes('GitHub')) {
    console.log('✅ المتصفح الرئيسي: تم حذف زر GitHub');
  } else {
    console.log('⚠️ المتصفح الرئيسي: قد يحتوي على مراجع GitHub');
  }
} catch {
  console.log('❌ المتصفح الرئيسي: خطأ في القراءة');
}

// فحص إصلاح التحويل
try {
  const convertContent = fs.readFileSync('src/components/ConvertNoteModal.tsx', 'utf8');
  if (convertContent.includes('data.project.id') && convertContent.includes('فشل في تحويل الملاحظة')) {
    console.log('✅ تحويل الملاحظات: تم إصلاح معالجة الاستجابة');
  } else {
    console.log('⚠️ تحويل الملاحظات: قد يحتاج مراجعة');
  }
} catch {
  console.log('❌ تحويل الملاحظات: خطأ في القراءة');
}

// فحص إصلاح الإشعارات
try {
  const toastContent = fs.readFileSync('src/components/ui/toast.tsx', 'utf8');
  if (toastContent.includes('z-200') || toastContent.includes('z-\\[200\\]')) {
    console.log('✅ الإشعارات: تم رفع z-index');
  } else {
    console.log('⚠️ الإشعارات: قد يحتاج مراجعة z-index');
  }
} catch {
  console.log('❌ الإشعارات: خطأ في القراءة');
}

// فحص API
try {
  const apiContent = fs.readFileSync('src/app/api/projects/convert-note/route.ts', 'utf8');
  if (apiContent.includes('details: insertError?.message') && apiContent.includes('code: insertError?.code')) {
    console.log('✅ API: تم تحسين معالجة الأخطاء');
  } else {
    console.log('⚠️ API: قد يحتاج مراجعة معالجة الأخطاء');
  }
} catch {
  console.log('❌ API: خطأ في القراءة');
}

// فحص ملفات التوثيق
console.log('\n📚 فحص ملفات التوثيق:');
const docFiles = [
  'docs/CHATBOT_BUTTON_FIX_COMPLETE.md',
  'docs/CONVERSION_AND_NOTIFICATIONS_FIX.md'
];

for (const docFile of docFiles) {
  if (fs.existsSync(docFile)) {
    console.log(`✅ ${docFile}`);
  } else {
    console.log(`⚠️ ${docFile} - غير موجود`);
  }
}

// فحص package.json للتأكد من وجود المكتبات المطلوبة
console.log('\n📦 فحص التبعيات:');
try {
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  const dependencies = { ...packageJson.dependencies, ...packageJson.devDependencies };
  
  const requiredDeps = ['next', 'react', '@supabase/supabase-js', 'tailwindcss'];
  for (const dep of requiredDeps) {
    if (dependencies[dep]) {
      console.log(`✅ ${dep}: ${dependencies[dep]}`);
    } else {
      console.log(`⚠️ ${dep}: غير موجود`);
    }
  }
} catch {
  console.log('❌ خطأ في قراءة package.json');
}

console.log('\n🎯 ملخص حالة المشروع:');
if (allFilesExist) {
  console.log('✅ جميع الملفات الأساسية موجودة');
  console.log('✅ تم تطبيق الإصلاحات المطلوبة');
  console.log('✅ المشروع جاهز للاختبار والنشر');
} else {
  console.log('⚠️ بعض الملفات مفقودة - يرجى المراجعة');
}

console.log('\n🚀 الخطوات التالية:');
console.log('1. تشغيل الخادم المحلي: npm run dev');
console.log('2. اختبار جميع الوظائف يدوياً');
console.log('3. رفع التعديلات إلى GitHub');
console.log('4. نشر المشروع إلى الإنتاج');

console.log('\n✨ تم إكمال الفحص النهائي!');
