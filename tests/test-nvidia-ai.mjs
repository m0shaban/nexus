#!/usr/bin/env node

// Test NVIDIA AI Integration
import { generateLogosResponse } from '../src/lib/nvidia-ai.js'

async function testNvidiaAI() {
  console.log('🧪 Testing NVIDIA AI Integration...\n')
  
  const testMessage = 'مرحباً، أريد أن أبدأ مشروع في الذكاء الاصطناعي. ما نصيحتك؟'
  
  console.log(`📝 Test Message: ${testMessage}\n`)
  
  try {
    const startTime = Date.now()
    
    const result = await generateLogosResponse(testMessage, [], {})
    
    const endTime = Date.now()
    
    console.log('✅ AI Response Generated Successfully!\n')
    console.log('📊 Metadata:')
    console.log(`   Model: ${result.metadata.model}`)
    console.log(`   Tokens Used: ${result.metadata.tokens_used}`)
    console.log(`   Processing Time: ${result.metadata.processing_time}ms`)
    console.log(`   Confidence Score: ${result.metadata.confidence_score}`)
    console.log(`   Total Time: ${endTime - startTime}ms\n`)
    
    console.log('💬 Response Content:')
    console.log('─'.repeat(60))
    console.log(result.content)
    console.log('─'.repeat(60))
    
    console.log('\n🎉 Test completed successfully!')
    
  } catch (error) {
    console.error('❌ Test Failed:')
    console.error(error)
    
    console.log('\n🔍 Troubleshooting:')
    console.log('• Check if NVIDIA_API_KEY is set in .env.local')
    console.log('• Verify the API key is valid')
    console.log('• Check internet connection')
    console.log('• Ensure OpenAI package is installed: npm install openai')
  }
}

// Run the test
testNvidiaAI()
