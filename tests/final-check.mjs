#!/usr/bin/env node

/**
 * فحص نهائي لحالة مشروع Nexus
 * Final Status Check for Nexus Project
 */

import { existsSync } from 'fs';
import { join } from 'path';

console.log('🎯 فحص نهائي لمشروع Nexus');
console.log('='.repeat(50));

// فحص ملفات قاعدة البيانات
const dbFiles = [
    '00-master-setup.sql',
    '01-setup-extensions.sql', 
    '02-create-users-new.sql',
    '03-create-notes.sql',
    '04-create-projects-new.sql',
    '05-create-scenarios.sql',
    '06-create-streaks.sql',
    '07-create-mirror.sql',
    '08-create-logos.sql',
    '09-create-analytics-views.sql',
    '10-create-sample-data.sql'
];

console.log('\n📁 ملفات قاعدة البيانات:');
let dbComplete = true;
dbFiles.forEach(file => {
    const exists = existsSync(join('db', file));
    console.log(`${exists ? '✅' : '❌'} db/${file}`);
    if (!exists) dbComplete = false;
});

// فحص ملفات الإعداد
console.log('\n⚙️ سكريبتات الإعداد:');
const setupFiles = [
    'setup-database.ps1',
    'setup-database.sh',
    'cleanup-old-files.ps1', 
    'cleanup-old-files.sh'
];

setupFiles.forEach(file => {
    const exists = existsSync(file);
    console.log(`${exists ? '✅' : '❌'} ${file}`);
});

// فحص ملفات البيئة
console.log('\n🔧 ملفات البيئة:');
const envFiles = ['.env', '.env.example'];
envFiles.forEach(file => {
    const exists = existsSync(file);
    console.log(`${exists ? '✅' : '❌'} ${file}`);
});

// فحص التوثيق
console.log('\n📚 ملفات التوثيق:');
const docFiles = [
    'DATABASE_SETUP_GUIDE.md',
    'FINAL_COMPLETION_REPORT.md', 
    'PROJECT_STATUS_FINAL.md',
    'README.md'
];

docFiles.forEach(file => {
    const exists = existsSync(file);
    console.log(`${exists ? '✅' : '❌'} ${file}`);
});

// فحص package.json
console.log('\n📦 ملفات Node.js:');
const nodeFiles = ['package.json', 'next.config.ts', 'tsconfig.json'];
nodeFiles.forEach(file => {
    const exists = existsSync(file);
    console.log(`${exists ? '✅' : '❌'} ${file}`);
});

// فحص مجلد src
console.log('\n🎨 مجلد التطبيق:');
const exists = existsSync('src');
console.log(`${exists ? '✅' : '❌'} src/`);

if (exists) {
    const srcDirs = ['app', 'components', 'types'];
    srcDirs.forEach(dir => {
        const dirExists = existsSync(join('src', dir));
        console.log(`  ${dirExists ? '✅' : '❌'} src/${dir}/`);
    });
}

// النتيجة النهائية
console.log('\n' + '='.repeat(50));
console.log('📊 النتيجة النهائية:');

if (dbComplete) {
    console.log('🎉 قاعدة البيانات: مكتملة بالكامل');
} else {
    console.log('⚠️ قاعدة البيانات: تحتاج مراجعة');
}

console.log('\n📋 الخطوات التالية:');
console.log('1. npm install (تثبيت التبعيات)');
console.log('2. npm run db:setup (إعداد قاعدة البيانات)');
console.log('3. npm run dev (تشغيل التطبيق)');

console.log('\n✨ فحص شامل منتهي!');
