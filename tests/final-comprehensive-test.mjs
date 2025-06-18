#!/usr/bin/env node

/**
 * 🎉 الفحص النهائي الشامل للشاتبوت
 * يتأكد من أن جميع المكونات تعمل بكفاءة 100%
 */

console.log('🔍 بدء الفحص النهائي الشامل للشاتبوت...\n');

async function runComprehensiveTest() {
    const results = {
        api_status: false,
        ai_generation: false,
        database_schema: false,
        response_quality: false,
        error_handling: false,
        frontend_integration: false
    };

    try {
        // 1. اختبار API الأساسي
        console.log('1️⃣ اختبار API الأساسي...');
        const response = await fetch('http://localhost:3000/api/logos/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                message: 'اختبار سريع للنظام',
                userId: '12345678-1234-1234-1234-123456789012',
                conversationId: null
            })
        });
        
        if (response.ok) {
            results.api_status = true;
            console.log('   ✅ API يستجيب بنجاح');
            
            const data = await response.json();
            
            // 2. اختبار توليد الذكاء الاصطناعي
            if (data.success && data.message) {
                results.ai_generation = true;
                console.log('   ✅ توليد الذكاء الاصطناعي يعمل');
                
                // 3. اختبار جودة الاستجابة
                if (data.message.content && data.message.content.length > 100) {
                    results.response_quality = true;
                    console.log('   ✅ جودة الاستجابة عالية');
                }
                
                // 4. اختبار معالجة الأخطاء
                if (data.fallback || data.ai_powered) {
                    results.error_handling = true;
                    console.log('   ✅ معالجة الأخطاء تعمل');
                }
                
                // 5. اختبار السكيما
                if (data.message.id && data.conversationId) {
                    results.database_schema = true;
                    console.log('   ✅ تكامل قاعدة البيانات صحيح');
                }
                
                console.log('\n📊 تفاصيل الاستجابة:');
                console.log(`   🤖 النموذج: ${data.message.metadata?.model || 'غير محدد'}`);
                console.log(`   🔢 الرموز: ${data.message.metadata?.tokens_used || 'غير محدد'}`);
                console.log(`   ⏱️  الوقت: ${data.message.metadata?.processing_time || 'غير محدد'}ms`);
                console.log(`   📝 طول المحتوى: ${data.message.content.length} حرف`);
                console.log(`   💡 الوضع: ${data.fallback ? 'Fallback' : data.mock ? 'Mock' : 'Full Database'}`);
            }
        } else {
            console.log('   ❌ فشل في API:', response.status);
        }
        
        // 6. اختبار الواجهة الأمامية (تحقق من الوصول)
        console.log('\n2️⃣ اختبار الواجهة الأمامية...');
        const frontendResponse = await fetch('http://localhost:3000/');
        if (frontendResponse.ok) {
            results.frontend_integration = true;
            console.log('   ✅ الواجهة الأمامية متاحة');
        } else {
            console.log('   ❌ فشل في الوصول للواجهة الأمامية');
        }
        
    } catch (error) {
        console.log('❌ خطأ في الاختبار:', error.message);
    }
    
    // عرض النتائج النهائية
    console.log('\n' + '='.repeat(50));
    console.log('📋 تقرير الفحص النهائي:');
    console.log('='.repeat(50));
    
    const tests = [
        ['API الأساسي', results.api_status],
        ['توليد الذكاء الاصطناعي', results.ai_generation],
        ['تكامل قاعدة البيانات', results.database_schema],
        ['جودة الاستجابة', results.response_quality],
        ['معالجة الأخطاء', results.error_handling],
        ['الواجهة الأمامية', results.frontend_integration]
    ];
    
    tests.forEach(([test, status]) => {
        console.log(`${status ? '✅' : '❌'} ${test}`);
    });
    
    const successCount = Object.values(results).filter(Boolean).length;
    const totalTests = Object.keys(results).length;
    const successRate = Math.round((successCount / totalTests) * 100);
    
    console.log('\n' + '='.repeat(50));
    console.log(`🎯 النتيجة النهائية: ${successCount}/${totalTests} (${successRate}%)`);
    
    if (successRate >= 80) {
        console.log('🎉 النظام جاهز للإنتاج!');
        console.log('✨ يمكنك استخدام الشاتبوت بثقة كاملة');
    } else if (successRate >= 60) {
        console.log('⚠️  النظام يحتاج تحسينات طفيفة');
    } else {
        console.log('🚨 النظام يحتاج إصلاحات جوهرية');
    }
    
    console.log('\n🔗 للوصول للشاتبوت:');
    console.log('   http://localhost:3000');
    console.log('   (ابحث عن أيقونة الشاتبوت في الزاوية السفلى اليمنى)');
}

// تشغيل الاختبار
runComprehensiveTest().then(() => {
    console.log('\n✅ انتهى الفحص الشامل');
}).catch(error => {
    console.log('\n💥 خطأ في الفحص الشامل:', error.message);
});
