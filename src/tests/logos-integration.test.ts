// Simple integration test for The Logos AI
// Run with: npm test logos-integration.test.js

import { describe, it, expect } from 'vitest'
import fs from 'fs'
import path from 'path'

describe('The Logos AI Integration', () => {
  it('should have required environment variables', () => {
    // These should be set in test environment
    expect(process.env.NEXT_PUBLIC_SUPABASE_URL).toBeDefined()
    expect(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY).toBeDefined()
  })
  it('should export LogosFloatingChat component', async () => {
    // Dynamic import to avoid SSR issues in tests
    const { LogosFloatingChat } = await import('../components/LogosFloatingChat')
    expect(LogosFloatingChat).toBeDefined()
    expect(typeof LogosFloatingChat).toBe('function')
  })

  it('should have proper TypeScript interfaces', async () => {
    const types = await import('../types/database')
    
    // Check that Logos types are exported
    expect(types).toHaveProperty('LogosConversation')
    expect(types).toHaveProperty('LogosMessage')
    expect(types).toHaveProperty('LogosUserPreferences')
    expect(types).toHaveProperty('LogosKnowledgeBase')
  })

  it('should have API routes defined', () => {
    // Check that API files exist (this is a basic integration test)
    const apiRoutes = [
      'src/app/api/logos/chat/route.ts',
      'src/app/api/logos/conversations/route.ts', 
      'src/app/api/logos/preferences/route.ts'
    ]
    
    apiRoutes.forEach(route => {
      const fullPath = path.join(process.cwd(), route)
      expect(fs.existsSync(fullPath)).toBe(true)
    })
  })
})

describe('Knowledge Base Import Script', () => {
  it('should have import script available', () => {
    const scriptPath = path.join(process.cwd(), 'scripts/import-knowledge.js')
    expect(fs.existsSync(scriptPath)).toBe(true)
  })
})
