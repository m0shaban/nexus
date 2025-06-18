// Test Supabase connection
const { createClient } = require('@supabase/supabase-js')

const supabase = createClient(
  'https://ekszinqbsrtkwoiswsgi.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVrc3ppbnFic3J0a3dvaXN3c2dpIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0OTY0NDQ1NCwiZXhwIjoyMDY1MjIwNDU0fQ.TjiqM560CQKniDktltAu5kevrsskzBC6urhEvbRjO3k'
)

async function testConnection() {
  try {
    console.log('Testing Supabase connection...')
    
    // Test basic connection
    const { error } = await supabase
      .from('logos_conversations')
      .select('count', { count: 'exact', head: true })
      .limit(1)
    
    if (error) {
      console.log('Database tables not found:', error.message)
      console.log('This is expected if tables are not created yet')
      return false
    }
    
    console.log('Database tables exist and accessible!')
    return true
    
  } catch (err) {
    console.error('Connection error:', err)
    return false
  }
}

// Run test
testConnection().then(result => {
  console.log('Connection test result:', result ? 'SUCCESS' : 'NEEDS_SETUP')
  process.exit(0)
})

module.exports = { testConnection, supabase }
