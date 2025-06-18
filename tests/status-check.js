#!/usr/bin/env node

/**
 * Nexus App Status Checker
 * 
 * This script helps diagnose issues with the Nexus application environment.
 * It checks:
 * - Required environment variables
 * - Supabase connection
 * - Telegram bot availability
 * - NVIDIA API connectivity
 */

const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })
const https = require('https')
const readline = require('readline')

// ANSI color codes for pretty output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
  bold: '\x1b[1m',
}

// Create readline interface for user input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
})

console.log(`${colors.bold}${colors.blue}
╔═╗┌┬┐┌─┐┌┬┐┬ ┬┌─┐  ╔═╗┬ ┬┌─┐┌─┐┬┌─┌─┐┬─┐
╚═╗ │ ├─┤ │ │ │└─┐  ║  ├─┤├┤ │  ├┴┐├┤ ├┬┘
╚═╝ ┴ ┴ ┴ ┴ └─┘└─┘  ╚═╝┴ ┴└─┘└─┘┴ ┴└─┘┴└─
${colors.reset}`)

console.log(`${colors.cyan}This script checks the status of your Nexus application setup.${colors.reset}\n`)

// Check environment variables
async function checkEnvironmentVariables() {
  console.log(`${colors.bold}1. Checking environment variables...${colors.reset}`)
  
  const requiredVars = {
    'NEXT_PUBLIC_SUPABASE_URL': process.env.NEXT_PUBLIC_SUPABASE_URL,
    'NEXT_PUBLIC_SUPABASE_ANON_KEY': process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    'SUPABASE_SERVICE_ROLE_KEY': process.env.SUPABASE_SERVICE_ROLE_KEY,
    'TELEGRAM_BOT_TOKEN': process.env.TELEGRAM_BOT_TOKEN,
    'TELEGRAM_WEBHOOK_SECRET': process.env.TELEGRAM_WEBHOOK_SECRET,
    'WEBHOOK_URL': process.env.WEBHOOK_URL,
    'NVIDIA_API_KEY': process.env.NVIDIA_API_KEY,
    'NVIDIA_API_BASE_URL': process.env.NVIDIA_API_BASE_URL,
  }
  
  let allPresent = true
  
  for (const [key, value] of Object.entries(requiredVars)) {
    if (!value) {
      console.log(`  ${colors.red}✗ Missing ${key}${colors.reset}`)
      allPresent = false
    } else {
      const maskedValue = key.includes('KEY') || key.includes('TOKEN') || key.includes('SECRET') 
        ? `${value.substring(0, 5)}...${value.substring(value.length - 4)}`
        : value
      console.log(`  ${colors.green}✓ ${key}: ${maskedValue}${colors.reset}`)
    }
  }
  
  return allPresent
}

// Check Supabase connection
async function checkSupabaseConnection() {
  console.log(`\n${colors.bold}2. Testing Supabase connection...${colors.reset}`)
  
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    console.log(`  ${colors.red}✗ Cannot test: missing Supabase credentials${colors.reset}`)
    return false
  }
  
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    )
    
    console.log('  Testing connection...')
    const { error } = await supabase.from('notes').select('count', { count: 'exact', head: true })
    
    if (error) {
      console.log(`  ${colors.red}✗ Connection failed: ${error.message}${colors.reset}`)
      return false
    }
    
    console.log(`  ${colors.green}✓ Supabase connection successful${colors.reset}`)
    
    // Check if realtime is enabled
    console.log('  Testing realtime capability...')
    
    try {
      const channel = supabase.channel('test-channel')
      const subscription = channel.subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          console.log(`  ${colors.green}✓ Realtime subscription working${colors.reset}`)
          channel.unsubscribe()
        } else if (status === 'CHANNEL_ERROR') {
          console.log(`  ${colors.red}✗ Realtime subscription failed${colors.reset}`)
          channel.unsubscribe()
        }
      })
      
      // Wait a bit to check if subscription works
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      return true
    } catch (realtimeError) {
      console.log(`  ${colors.red}✗ Realtime setup failed: ${realtimeError.message}${colors.reset}`)
      return false
    }
  } catch (e) {
    console.log(`  ${colors.red}✗ Connection failed: ${e.message}${colors.reset}`)
    return false
  }
}

// Check Telegram Bot setup
async function checkTelegramBot() {
  console.log(`\n${colors.bold}3. Checking Telegram Bot...${colors.reset}`)
  
  if (!process.env.TELEGRAM_BOT_TOKEN) {
    console.log(`  ${colors.red}✗ Cannot test: missing TELEGRAM_BOT_TOKEN${colors.reset}`)
    return false
  }
  
  return new Promise((resolve) => {
    const url = `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/getMe`
    
    https.get(url, (res) => {
      let data = ''
      
      res.on('data', (chunk) => {
        data += chunk
      })
      
      res.on('end', () => {
        try {
          const response = JSON.parse(data)
          
          if (response.ok) {
            console.log(`  ${colors.green}✓ Bot found: @${response.result.username}${colors.reset}`)
            
            // Now check webhook status
            checkWebhook().then(resolve)
          } else {
            console.log(`  ${colors.red}✗ Bot check failed: ${response.description}${colors.reset}`)
            resolve(false)
          }
        } catch (e) {
          console.log(`  ${colors.red}✗ Failed to parse response: ${e.message}${colors.reset}`)
          resolve(false)
        }
      })
    }).on('error', (e) => {
      console.log(`  ${colors.red}✗ Request failed: ${e.message}${colors.reset}`)
      resolve(false)
    })
  })
}

// Check webhook configuration
async function checkWebhook() {
  if (!process.env.TELEGRAM_BOT_TOKEN || !process.env.WEBHOOK_URL) {
    console.log(`  ${colors.red}✗ Cannot test webhook: missing required variables${colors.reset}`)
    return false
  }
  
  return new Promise((resolve) => {
    const url = `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/getWebhookInfo`
    
    https.get(url, (res) => {
      let data = ''
      
      res.on('data', (chunk) => {
        data += chunk
      })
      
      res.on('end', () => {
        try {
          const response = JSON.parse(data)
          
          if (response.ok) {
            const webhook = response.result
            
            if (webhook.url) {
              const expected = `${process.env.WEBHOOK_URL}/api/telegram-webhook`
              const actual = webhook.url
              
              if (actual === expected) {
                console.log(`  ${colors.green}✓ Webhook properly configured: ${webhook.url}${colors.reset}`)
                resolve(true)
              } else {
                console.log(`  ${colors.yellow}⚠ Webhook mismatch:${colors.reset}`)
                console.log(`    Expected: ${expected}`)
                console.log(`    Actual:   ${webhook.url}`)
                resolve(false)
              }
            } else {
              console.log(`  ${colors.red}✗ No webhook URL set${colors.reset}`)
              resolve(false)
            }
            
            if (webhook.has_custom_certificate) {
              console.log(`  ${colors.yellow}⚠ Bot uses custom certificate${colors.reset}`)
            }
            
            if (webhook.pending_update_count > 0) {
              console.log(`  ${colors.yellow}⚠ ${webhook.pending_update_count} pending updates${colors.reset}`)
            }
            
            if (webhook.last_error_date) {
              const errorDate = new Date(webhook.last_error_date * 1000)
              console.log(`  ${colors.red}✗ Last error: ${errorDate.toISOString()}: ${webhook.last_error_message}${colors.reset}`)
            }
          } else {
            console.log(`  ${colors.red}✗ Webhook check failed: ${response.description}${colors.reset}`)
            resolve(false)
          }
        } catch (e) {
          console.log(`  ${colors.red}✗ Failed to parse webhook response: ${e.message}${colors.reset}`)
          resolve(false)
        }
      })
    }).on('error', (e) => {
      console.log(`  ${colors.red}✗ Webhook request failed: ${e.message}${colors.reset}`)
      resolve(false)
    })
  })
}

// Check NVIDIA API connection
async function checkNvidiaAPI() {
  console.log(`\n${colors.bold}4. Checking NVIDIA API...${colors.reset}`)
  
  if (!process.env.NVIDIA_API_KEY || !process.env.NVIDIA_API_BASE_URL) {
    console.log(`  ${colors.red}✗ Cannot test: missing NVIDIA API credentials${colors.reset}`)
    return false
  }
  
  return new Promise((resolve) => {
    const options = {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${process.env.NVIDIA_API_KEY}`
      }
    }
    
    // Just try to access the API to check if the key works
    // This is a simple HEAD request to avoid calling model endpoints unnecessarily
    const url = `${process.env.NVIDIA_API_BASE_URL}/models`
    
    const req = https.request(url, options, (res) => {
      if (res.statusCode === 200) {
        console.log(`  ${colors.green}✓ NVIDIA API connection successful${colors.reset}`)
        resolve(true)
      } else {
        console.log(`  ${colors.red}✗ NVIDIA API returned status code ${res.statusCode}${colors.reset}`)
        
        let data = ''
        res.on('data', (chunk) => {
          data += chunk
        })
        
        res.on('end', () => {
          console.log(`  ${colors.red}Response: ${data}${colors.reset}`)
          resolve(false)
        })
      }
    })
    
    req.on('error', (e) => {
      console.log(`  ${colors.red}✗ NVIDIA API request failed: ${e.message}${colors.reset}`)
      resolve(false)
    })
    
    req.end()
  })
}

// Show summary
function showSummary(results) {
  console.log(`\n${colors.bold}${colors.blue}=== Summary ===${colors.reset}`)
  
  const total = Object.keys(results).length
  const passed = Object.values(results).filter(Boolean).length
  
  console.log(`${colors.bold}${passed}/${total} checks passed${colors.reset}`)
  
  if (passed === total) {
    console.log(`\n${colors.green}${colors.bold}✓ All systems operational!${colors.reset}`)
  } else {
    console.log(`\n${colors.yellow}${colors.bold}⚠ Some checks failed. See above for details.${colors.reset}`)
    
    // Show troubleshooting tips
    console.log(`\n${colors.bold}${colors.magenta}Troubleshooting Tips:${colors.reset}`)
    
    if (!results.env) {
      console.log(`${colors.yellow}- Make sure your .env.local file contains all required variables${colors.reset}`)
    }
    
    if (!results.supabase) {
      console.log(`${colors.yellow}- Check your Supabase project settings and make sure Realtime is enabled${colors.reset}`)
      console.log(`${colors.yellow}- Ensure your database has the required tables and permissions${colors.reset}`)
    }
    
    if (!results.telegram) {
      console.log(`${colors.yellow}- Verify your Telegram bot token${colors.reset}`)
      console.log(`${colors.yellow}- Run the setup-webhook script again${colors.reset}`)
    }
    
    if (!results.nvidia) {
      console.log(`${colors.yellow}- Check your NVIDIA API key and URL${colors.reset}`)
      console.log(`${colors.yellow}- Ensure you have access to the required models${colors.reset}`)
    }
  }
  
  console.log('\nNote: You can add these checks to your deployment pipeline for automatic verification.')
}

// Main function
async function main() {
  try {
    const results = {
      env: await checkEnvironmentVariables(),
      supabase: await checkSupabaseConnection(),
      telegram: await checkTelegramBot(),
      nvidia: await checkNvidiaAPI()
    }
    
    showSummary(results)
  } catch (error) {
    console.error(`${colors.red}Error running status check: ${error.message}${colors.reset}`)
  } finally {
    rl.close()
  }
}

// Run the main function
main()
