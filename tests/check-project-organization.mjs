#!/usr/bin/env node

/**
 * 🚀 سكريبت التحقق السريع من تنظيم المشروع
 * يتأكد من أن جميع الملفات في أماكنها الصحيحة وأن النظام جاهز
 */

import { promises as fs } from 'fs';
import { existsSync } from 'fs';

console.log('🔍 بدء التحقق من تنظيم المشروع...\n');

const checks = {
    structure: false,
    readme: false,
    contributing: false,
    license: false,
    env_example: false,
    package_scripts: false,
    directories: false
};

async function checkProjectStructure() {
    console.log('1️⃣ فحص هيكل المشروع...');
    
    const requiredDirs = ['src', 'docs', 'tests', 'database', 'scripts', 'public'];
    const missingDirs = [];
    
    for (const dir of requiredDirs) {
        if (!existsSync(dir)) {
            missingDirs.push(dir);
        }
    }
    
    if (missingDirs.length === 0) {
        checks.structure = true;
        console.log('   ✅ جميع المجلدات الأساسية موجودة');
    } else {
        console.log(`   ❌ مجلدات مفقودة: ${missingDirs.join(', ')}`);
    }
}

async function checkEssentialFiles() {
    console.log('\n2️⃣ فحص الملفات الأساسية...');
    
    // README
    if (existsSync('README.md')) {
        const readmeContent = await fs.readFile('README.md', 'utf8');
        if (readmeContent.includes('NEXUS') && readmeContent.length > 5000) {
            checks.readme = true;
            console.log('   ✅ README.md شامل ومفصل');
        } else {
            console.log('   ⚠️  README.md موجود لكن قد يحتاج تحسين');
        }
    } else {
        console.log('   ❌ README.md مفقود');
    }
    
    // CONTRIBUTING
    if (existsSync('CONTRIBUTING.md')) {
        const contribContent = await fs.readFile('CONTRIBUTING.md', 'utf8');
        if (contribContent.includes('المساهمة') && contribContent.length > 3000) {
            checks.contributing = true;
            console.log('   ✅ CONTRIBUTING.md دليل مساهمة شامل');
        } else {
            console.log('   ⚠️  CONTRIBUTING.md موجود لكن قد يحتاج تحسين');
        }
    } else {
        console.log('   ❌ CONTRIBUTING.md مفقود');
    }
    
    // LICENSE
    if (existsSync('LICENSE')) {
        checks.license = true;
        console.log('   ✅ LICENSE موجود');
    } else {
        console.log('   ❌ LICENSE مفقود');
    }
    
    // .env.example
    if (existsSync('.env.example')) {
        const envContent = await fs.readFile('.env.example', 'utf8');
        if (envContent.includes('SUPABASE') && envContent.includes('NVIDIA')) {
            checks.env_example = true;
            console.log('   ✅ .env.example محدث ومنظم');
        } else {
            console.log('   ⚠️  .env.example موجود لكن قد يحتاج تحسين');
        }
    } else {
        console.log('   ❌ .env.example مفقود');
    }
}

async function checkPackageScripts() {
    console.log('\n3️⃣ فحص package.json scripts...');
    
    if (existsSync('package.json')) {
        const packageContent = await fs.readFile('package.json', 'utf8');
        const packageData = JSON.parse(packageContent);
        
        const requiredScripts = [
            'test:comprehensive',
            'db:setup',
            'setup:all',
            'health',
            'ai:test',
            'chat:test'
        ];
        
        const missingScripts = requiredScripts.filter(script => !packageData.scripts[script]);
        
        if (missingScripts.length === 0) {
            checks.package_scripts = true;
            console.log(`   ✅ جميع الـ scripts المطلوبة موجودة (${Object.keys(packageData.scripts).length} script)`);
        } else {
            console.log(`   ❌ scripts مفقودة: ${missingScripts.join(', ')}`);
        }
    } else {
        console.log('   ❌ package.json مفقود');
    }
}

async function checkDirectoryContents() {
    console.log('\n4️⃣ فحص محتويات المجلدات...');
    
    const dirChecks = [];
    
    // فحص مجلد docs
    if (existsSync('docs')) {
        const docsFiles = await fs.readdir('docs');
        const hasDocs = docsFiles.some(file => file.endsWith('.md'));
        dirChecks.push(['docs', hasDocs, `${docsFiles.length} ملف`]);
    }
    
    // فحص مجلد tests
    if (existsSync('tests')) {
        const testsFiles = await fs.readdir('tests');
        const hasTests = testsFiles.some(file => file.includes('test') || file.includes('check'));
        dirChecks.push(['tests', hasTests, `${testsFiles.length} ملف`]);
    }
    
    // فحص مجلد database
    if (existsSync('database')) {
        const dbFiles = await fs.readdir('database');
        const hasSQL = dbFiles.some(file => file.endsWith('.sql'));
        dirChecks.push(['database', hasSQL, `${dbFiles.length} ملف`]);
    }
    
    // فحص مجلد scripts
    if (existsSync('scripts')) {
        const scriptsFiles = await fs.readdir('scripts');
        const hasScripts = scriptsFiles.length > 0;
        dirChecks.push(['scripts', hasScripts, `${scriptsFiles.length} ملف`]);
    }
    
    dirChecks.forEach(([dir, hasContent, count]) => {
        if (hasContent) {
            console.log(`   ✅ ${dir}/ منظم (${count})`);
        } else {
            console.log(`   ⚠️  ${dir}/ فارغ أو يحتاج ملفات`);
        }
    });
    
    if (dirChecks.every(check => check[1])) {
        checks.directories = true;
    }
}

async function runAllChecks() {
    await checkProjectStructure();
    await checkEssentialFiles();
    await checkPackageScripts();
    await checkDirectoryContents();
    
    // عرض النتائج النهائية
    console.log('\n' + '='.repeat(50));
    console.log('📋 تقرير التحقق النهائي:');
    console.log('='.repeat(50));
    
    const allChecks = [
        ['هيكل المجلدات', checks.structure],
        ['README شامل', checks.readme],
        ['دليل المساهمة', checks.contributing],
        ['ترخيص MIT', checks.license],
        ['مثال متغيرات البيئة', checks.env_example],
        ['Package scripts', checks.package_scripts],
        ['محتوى المجلدات', checks.directories]
    ];
    
    allChecks.forEach(([check, status]) => {
        console.log(`${status ? '✅' : '❌'} ${check}`);
    });
    
    const successCount = Object.values(checks).filter(Boolean).length;
    const totalChecks = Object.keys(checks).length;
    const successRate = Math.round((successCount / totalChecks) * 100);
    
    console.log('\n' + '='.repeat(50));
    console.log(`🎯 النتيجة النهائية: ${successCount}/${totalChecks} (${successRate}%)`);
    
    if (successRate >= 90) {
        console.log('🎉 المشروع منظم بشكل احترافي!');
        console.log('✨ جاهز للنشر كمشروع مفتوح المصدر');
        console.log('🌟 يمكن البدء في استقطاب المساهمين');
    } else if (successRate >= 70) {
        console.log('⚠️  المشروع منظم بشكل جيد لكن يحتاج تحسينات طفيفة');
        console.log('💡 راجع العناصر المفقودة أعلاه');
    } else {
        console.log('🚨 المشروع يحتاج المزيد من التنظيم');
        console.log('🔧 ابدأ بإنشاء الملفات المفقودة');
    }
    
    console.log('\n🎯 للحصول على نتيجة 100%:');
    console.log('   📖 تأكد من جودة README و CONTRIBUTING');
    console.log('   📁 نظم جميع الملفات في مجلداتها الصحيحة');
    console.log('   ⚙️  أضف جميع الـ scripts المفيدة');
    console.log('   📄 تأكد من وجود جميع الملفات الأساسية');
}

// تشغيل جميع الفحوصات
runAllChecks().then(() => {
    console.log('\n✅ انتهى فحص تنظيم المشروع');
}).catch(error => {
    console.log('\n💥 خطأ في فحص تنظيم المشروع:', error.message);
});
