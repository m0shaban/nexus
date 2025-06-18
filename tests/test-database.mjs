import { createClient } from '@supabase/supabase-js'

// Test configuration
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase configuration!')
  console.log('Please check your .env.local file')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function testDatabaseConnection() {
  console.log('🔍 Testing database connection...')
  
  try {
    // Test basic connection
    const { data, error } = await supabase
      .from('notes')
      .select('count(*)')
      .limit(1)
    
    if (error) {
      console.error('❌ Database connection failed:', error.message)
      return false
    }
    
    console.log('✅ Database connection successful!')
    return true
    
  } catch (error) {
    console.error('❌ Unexpected error:', error)
    return false
  }
}

async function testNotesTable() {
  console.log('📝 Testing notes table...')
  
  try {
    // Try to fetch notes
    const { data: notes, error: fetchError } = await supabase
      .from('notes')
      .select('*')
      .limit(5)
    
    if (fetchError) {
      console.error('❌ Notes table access failed:', fetchError.message)
      return false
    }
    
    console.log(`✅ Notes table working! Found ${notes?.length || 0} notes`)
    
    // Test inserting a note
    const testNote = {
      content: 'Test note from database checker - ' + new Date().toISOString(),
      content_type: 'text',
      analysis_status: 'pending'
    }
    
    const { data: newNote, error: insertError } = await supabase
      .from('notes')
      .insert([testNote])
      .select()
      .single()
    
    if (insertError) {
      console.error('❌ Failed to insert test note:', insertError.message)
      return false
    }
    
    console.log('✅ Successfully inserted test note:', newNote.id)
    
    // Clean up - delete the test note
    const { error: deleteError } = await supabase
      .from('notes')
      .delete()
      .eq('id', newNote.id)
    
    if (deleteError) {
      console.warn('⚠️ Failed to delete test note:', deleteError.message)
    } else {
      console.log('✅ Test note cleaned up successfully')
    }
    
    return true
    
  } catch (error) {
    console.error('❌ Unexpected error in notes test:', error)
    return false
  }
}

async function testRealtimeConnection() {
  console.log('🔄 Testing Realtime connection...')
  
  return new Promise((resolve) => {
    const channel = supabase.channel('test-channel')
    
    const timeout = setTimeout(() => {
      console.log('⚠️ Realtime connection timeout (this is normal in some environments)')
      channel.unsubscribe()
      resolve(false)
    }, 10000) // 10 second timeout
    
    channel
      .on('system', { event: '*' }, () => {
        // Just to have a listener
      })
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          console.log('✅ Realtime connection successful!')
          clearTimeout(timeout)
          channel.unsubscribe()
          resolve(true)
        } else if (status === 'CHANNEL_ERROR') {
          console.log('❌ Realtime connection failed')
          clearTimeout(timeout)
          channel.unsubscribe()
          resolve(false)
        }
      })
  })
}

async function runDatabaseTests() {
  console.log('🚀 Starting Nexus Database Tests...')
  console.log('=====================================')
  
  const tests = [
    { name: 'Database Connection', test: testDatabaseConnection },
    { name: 'Notes Table', test: testNotesTable },
    { name: 'Realtime Connection', test: testRealtimeConnection }
  ]
  
  let passedTests = 0
  
  for (const { name, test } of tests) {
    console.log(`\n📋 Running: ${name}`)
    const passed = await test()
    if (passed) {
      passedTests++
    }
  }
  
  console.log('\n=====================================')
  console.log(`📊 Test Results: ${passedTests}/${tests.length} tests passed`)
  
  if (passedTests === tests.length) {
    console.log('🎉 All tests passed! Your Nexus database is ready to use.')
  } else {
    console.log('⚠️ Some tests failed. Please check your configuration.')
    
    if (passedTests === 0) {
      console.log('\n💡 Troubleshooting tips:')
      console.log('1. Check your .env.local file has correct Supabase credentials')
      console.log('2. Make sure you ran the database setup SQL script')
      console.log('3. Verify your Supabase project is active')
      console.log('4. Check if RLS policies are properly configured')
    }
  }
  
  process.exit(passedTests === tests.length ? 0 : 1)
}

// Run tests
runDatabaseTests().catch(error => {
  console.error('💥 Test runner failed:', error)
  process.exit(1)
})
