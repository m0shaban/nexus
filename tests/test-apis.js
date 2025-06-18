// سكريبت سريع لاختبار APIs
const testAPIs = async () => {
  console.log('🧪 اختبار APIs...');
  
  try {
    // اختبار جلب الملاحظات
    console.log('1. اختبار جلب الملاحظات...');
    const notesResponse = await fetch('/api/notes?limit=5');
    const notesData = await notesResponse.json();
    console.log('✅ الملاحظات:', notesData);
    
    // اختبار إنشاء ملاحظة
    console.log('2. اختبار إنشاء ملاحظة...');
    const createResponse = await fetch('/api/notes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        content: 'ملاحظة اختبار من السكريبت - ' + new Date().toISOString(),
        content_type: 'text'
      })
    });
    const createData = await createResponse.json();
    console.log('✅ إنشاء ملاحظة:', createData);
    
    // اختبار جلب السيناريوهات
    console.log('3. اختبار جلب السيناريوهات...');
    const scenariosResponse = await fetch('/api/scenarios');
    const scenariosData = await scenariosResponse.json();
    console.log('✅ السيناريوهات:', scenariosData);
    
  } catch (error) {
    console.error('❌ خطأ في الاختبار:', error);
  }
};

// تشغيل الاختبار عند تحميل الصفحة
if (typeof window !== 'undefined') {
  testAPIs();
}

export { testAPIs };
