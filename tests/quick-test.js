#!/usr/bin/env node

import fs from 'fs';

console.log('🔍 اختبار سريع للتطبيق...');

try {
    // اختبار تحميل Next.js config
    console.log('📋 فحص ملفات التكوين...');
    
    // فحص الملفات الأساسية
    const requiredFiles = [
        'package.json',
        '.env',
        'next.config.ts',
        'tailwind.config.ts',
        'src/app/layout.tsx',
        'src/components/SplashScreenSimple.tsx'
    ];
    
    let allGood = true;
    
    requiredFiles.forEach(file => {
        if (fs.existsSync(file)) {
            console.log(`✅ ${file}`);
        } else {
            console.log(`❌ ${file} مفقود`);
            allGood = false;
        }
    });
    
    // فحص مجلد db
    if (fs.existsSync('db')) {
        const dbFiles = fs.readdirSync('db').filter(f => f.endsWith('.sql'));
        console.log(`📁 مجلد db: ${dbFiles.length} ملف SQL`);
        
        if (dbFiles.length >= 10) {
            console.log('✅ ملفات قاعدة البيانات مكتملة');
        } else {
            console.log('⚠️ ملفات قاعدة البيانات ناقصة');
            allGood = false;
        }
    } else {
        console.log('❌ مجلد db مفقود');
        allGood = false;
    }
    
    console.log('\n' + '='.repeat(40));
    
    if (allGood) {
        console.log('🎉 جميع الملفات الأساسية موجودة!');
        console.log('💡 يمكنك الآن:');
        console.log('   1. npm run dev (تشغيل التطبيق)');
        console.log('   2. إعداد قاعدة البيانات في Supabase');
    } else {
        console.log('⚠️ هناك ملفات مفقودة - تحقق من التفاصيل أعلاه');
    }
    
} catch (error) {
    console.error('❌ خطأ في الاختبار:', error.message);
}

console.log('\n🏁 انتهى الاختبار');
