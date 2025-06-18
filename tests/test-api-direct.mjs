#!/usr/bin/env node

/**
 * تشخيص مباشر لـ API الشاتبوت
 * نرسل طلب مباشر لـ /api/logos/chat ونرى ما يحدث
 */

const BASE_URL = 'http://localhost:3000';
const API_ENDPOINT = '/api/logos/chat';

console.log('🔍 بدء اختبار API المباشر للشاتبوت...\n');

async function testChatAPI() {
    try {
        console.log('📤 إرسال طلب إلى:', `${BASE_URL}${API_ENDPOINT}`);
          const requestData = {
            message: 'مرحباً، هذا اختبار للشاتبوت',
            userId: '12345678-1234-1234-1234-123456789012', // UUID صالح
            conversationId: null
        };
        
        console.log('📝 بيانات الطلب:', JSON.stringify(requestData, null, 2));
        
        const response = await fetch(`${BASE_URL}${API_ENDPOINT}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestData)
        });
        
        console.log(`📊 حالة الاستجابة: ${response.status} ${response.statusText}`);
        console.log('📋 عناوين الاستجابة:');
        for (const [key, value] of response.headers.entries()) {
            console.log(`   ${key}: ${value}`);
        }
        
        const responseText = await response.text();
        console.log('\n📥 النص الخام للاستجابة:');
        console.log(responseText);
        
        if (response.headers.get('content-type')?.includes('application/json')) {
            try {
                const responseData = JSON.parse(responseText);
                console.log('\n✅ البيانات المُحللة:');
                console.log(JSON.stringify(responseData, null, 2));
                
                if (responseData.success) {
                    console.log('\n🎉 نجح الطلب! تفاصيل الرسالة:');
                    console.log(`   - المحتوى: ${responseData.message.content.substring(0, 100)}...`);
                    console.log(`   - المعرف: ${responseData.message.id}`);
                    console.log(`   - المحادثة: ${responseData.conversationId}`);
                    
                    if (responseData.mock) {
                        console.log('⚠️  تحذير: هذه استجابة تجريبية (mock)');
                    }
                    if (responseData.fallback) {
                        console.log('⚠️  تحذير: هذه استجابة احتياطية (fallback)');
                    }
                    if (responseData.ai_powered) {
                        console.log('🤖 معلومة: تم توليد الاستجابة بالذكاء الاصطناعي');
                    }
                } else {
                    console.log('\n❌ فشل الطلب! رسالة الخطأ:');
                    console.log(`   ${responseData.error}`);
                }
                
            } catch (parseError) {
                console.log('\n❌ خطأ في تحليل JSON:');
                console.log(parseError.message);
            }
        } else {
            console.log('\n⚠️  الاستجابة ليست JSON');
        }
        
    } catch (error) {
        console.log('\n💥 خطأ في الشبكة أو الاتصال:');
        console.log(error.message);
        
        if (error.code === 'ECONNREFUSED') {
            console.log('\n🚨 لا يمكن الاتصال بالخادم. تأكد من أن Next.js يعمل:');
            console.log('   npm run dev');
        }
    }
}

// تشغيل الاختبار
testChatAPI().then(() => {
    console.log('\n✅ انتهى الاختبار');
}).catch(error => {
    console.log('\n💥 خطأ غير متوقع:', error.message);
});
