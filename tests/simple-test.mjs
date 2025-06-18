#!/usr/bin/env node

// اختبار بسيط لقاعدة البيانات
console.log('🔄 بدء اختبار قاعدة البيانات...');

async function simpleTest() {
    try {
        const url = 'https://mtsgkpgbdzgqrcqitayq.supabase.co';
        const key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im10c2drcGdiZHpncXJjcWl0YXlxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk4NjE0MTcsImV4cCI6MjA2NTQzNzQxN30.YQsP9A5aL-sGkThnupPwPR0S1fUAA62p_ukiXLQcEnA';
        
        console.log('🌐 اختبار الاتصال...');
        
        const response = await fetch(`${url}/rest/v1/users?select=count`, {
            headers: {
                'apikey': key,
                'Authorization': `Bearer ${key}`
            }
        });
        
        if (response.ok) {
            console.log('✅ الاتصال ناجح');
            console.log('📊 Status:', response.status);
            
            // اختبار الجداول
            const tables = ['users', 'projects', 'notes', 'tasks'];
            
            for (const table of tables) {
                try {
                    const tableResponse = await fetch(`${url}/rest/v1/${table}?select=count`, {
                        headers: {
                            'apikey': key,
                            'Authorization': `Bearer ${key}`,
                            'Prefer': 'count=exact'
                        }
                    });
                    
                    if (tableResponse.ok) {
                        const count = tableResponse.headers.get('content-range');
                        console.log(`✅ ${table}: موجود (${count || 'غير معروف'})`);
                    } else {
                        console.log(`❌ ${table}: غير موجود (${tableResponse.status})`);
                    }                } catch {
                    console.log(`❌ ${table}: خطأ في الوصول`);
                }
            }
            
        } else {
            console.log('❌ فشل الاتصال:', response.status, response.statusText);
        }
        
    } catch (error) {
        console.error('❌ خطأ:', error.message);
    }
}

simpleTest();
