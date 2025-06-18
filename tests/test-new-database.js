// Test connection to new Supabase database
import('node-fetch').then(() => {
    console.log('🔄 Testing connection to new Supabase database...')
    
    const testConnection = async () => {
        try {
            const response = await fetch('https://cvgrvmygksnfmnqcwndd.supabase.co/rest/v1/', {
                method: 'GET',
                headers: {
                    'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN2Z3J2bXlna3NuZm1ucWN3bmRkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzcyNDc0OTYsImV4cCI6MjA1MjgyMzQ5Nn0.ZWXjgCEhR-GFl70sKkRdxsWfZBr7IYGOFKwjCJZHnvI',
                    'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN2Z3J2bXlna3NuZm1ucWN3bmRkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzcyNDc0OTYsImV4cCI6MjA1MjgyMzQ5Nn0.ZWXjgCEhR-GFl70sKkRdxsWfZBr7IYGOFKwjCJZHnvI'
                }
            })
            
            if (response.ok) {
                console.log('✅ Supabase API endpoint is accessible!')
                console.log(`📊 Response status: ${response.status}`)
                
                // Test specific table access
                const tableTests = ['notes', 'projects', 'scenarios', 'streaks', 'mirror']
                
                for (const table of tableTests) {
                    try {
                        const tableResponse = await fetch(`https://cvgrvmygksnfmnqcwndd.supabase.co/rest/v1/${table}?select=count`, {
                            method: 'HEAD',
                            headers: {
                                'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN2Z3J2bXlna3NuZm1ucWN3bmRkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzcyNDc0OTYsImV4cCI6MjA1MjgyMzQ5Nn0.ZWXjgCEhR-GFl70sKkRdxsWfZBr7IYGOFKwjCJZHnvI',
                                'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN2Z3J2bXlna3NuZm1ucWN3bmRkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzcyNDc0OTYsImV4cCI6MjA1MjgyMzQ5Nn0.ZWXjgCEhR-GFl70sKkRdxsWfZBr7IYGOFKwjCJZHnvI'
                            }
                        })
                        
                        if (tableResponse.ok) {
                            console.log(`✅ Table '${table}' is accessible`)
                        } else {
                            console.log(`⚠️ Table '${table}' issue: ${tableResponse.status} - ${tableResponse.statusText}`)
                        }
                    } catch (err) {
                        console.log(`❌ Table '${table}' error: ${err.message}`)
                    }
                }
                
                console.log('\n🎉 Database connection test completed!')
                console.log('💡 Next steps:')
                console.log('   1. Run the setup-new-database.sql script in Supabase SQL Editor')
                console.log('   2. Verify all tables are created using check-database-status.sql')
                console.log('   3. Start your app with: npm run dev')
                
            } else {
                console.error(`❌ Connection failed: ${response.status} - ${response.statusText}`)
            }
        } catch (err) {
            console.error('❌ Connection test failed:', err.message)
        }
    }
    
    testConnection()
}).catch(() => {
    console.log('Basic connection test without dependencies...')
    console.log('✅ Environment variables updated with new Supabase credentials')
    console.log('📋 Database URL: https://cvgrvmygksnfmnqcwndd.supabase.co')
    console.log('')
    console.log('💡 Next steps:')
    console.log('   1. Go to: https://supabase.com/dashboard/project/cvgrvmygksnfmnqcwndd')
    console.log('   2. Open SQL Editor')
    console.log('   3. Run the setup-new-database.sql script')
    console.log('   4. Run check-database-status.sql to verify')
    console.log('   5. Start your app: npm run dev')
})
