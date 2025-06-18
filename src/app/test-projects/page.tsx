import Link from 'next/link'

export default function TestProjectsPage() {
  const testProjectId = '123e4567-e89b-12d3-a456-426614174000'
  
  return (
    <div style={{ padding: '20px' }}>
      <h1>صفحة المشاريع التجريبية</h1>
      <p>هذه صفحة تجريبية للتحقق من التوجيه</p>
      
      <div style={{ marginTop: '20px' }}>
        <Link href={`/projects/${testProjectId}`}>
          <button style={{ 
            padding: '10px 20px', 
            backgroundColor: '#007bff', 
            color: 'white', 
            border: 'none', 
            borderRadius: '5px',
            cursor: 'pointer'
          }}>
            اختبار صفحة المشروع الفردي
          </button>
        </Link>
      </div>
    </div>
  )
}
