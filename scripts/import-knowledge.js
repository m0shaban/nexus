#!/usr/bin/env node

/**
 * Knowledge Base Import Script for The Logos AI
 * Imports JSON/Excel files into the logos_knowledge_base table
 * 
 * Usage:
 * node import-knowledge.js <file-path> [category] [priority]
 * 
 * Example:
 * node import-knowledge.js "./data/strategic-frameworks.json" "methodology" 85
 */

const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

// Environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing required environment variables:');
  console.error('   - NEXT_PUBLIC_SUPABASE_URL');
  console.error('   - SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

/**
 * Parse file content based on extension
 */
function parseFileContent(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  const content = fs.readFileSync(filePath, 'utf8');
  
  switch (ext) {
    case '.json':
      return {
        type: 'json',
        data: JSON.parse(content)
      };
    case '.md':
      return {
        type: 'markdown',
        data: content
      };
    case '.txt':
      return {
        type: 'text',
        data: content
      };
    default:
      throw new Error(`Unsupported file type: ${ext}`);
  }
}

/**
 * Extract meaningful content from parsed data
 */
function extractContent(parsedData) {
  if (parsedData.type === 'json') {
    // For JSON files, stringify with proper formatting
    return JSON.stringify(parsedData.data, null, 2);
  } else {
    // For text/markdown files, return as-is
    return parsedData.data;
  }
}

/**
 * Extract tags from content
 */
function extractTags(filename, content, category) {
  const tags = [category];
  const lowercaseContent = content.toLowerCase();
  
  // Add filename-based tags
  const baseName = path.basename(filename, path.extname(filename));
  tags.push(baseName.replace(/[-_]/g, ' ').toLowerCase());
  
  // Add content-based tags
  const keywords = [
    'strategy', 'framework', 'methodology', 'analysis', 'planning',
    'decision', 'risk', 'project', 'management', 'leadership',
    'innovation', 'technology', 'business', 'development'
  ];
  
  keywords.forEach(keyword => {
    if (lowercaseContent.includes(keyword)) {
      tags.push(keyword);
    }
  });
  
  return [...new Set(tags)]; // Remove duplicates
}

/**
 * Import a single file into knowledge base
 */
async function importFile(filePath, category = 'general', priority = 50) {
  try {
    console.log(`📁 Processing: ${filePath}`);
    
    if (!fs.existsSync(filePath)) {
      throw new Error(`File not found: ${filePath}`);
    }
    
    const parsedData = parseFileContent(filePath);
    const content = extractContent(parsedData);
    const filename = path.basename(filePath);
    const title = path.basename(filePath, path.extname(filePath))
      .replace(/[-_]/g, ' ')
      .replace(/\b\w/g, l => l.toUpperCase());
    
    const tags = extractTags(filename, content, category);
    
    const { data, error } = await supabase
      .from('logos_knowledge_base')
      .insert({
        title,
        content,
        content_type: parsedData.type,
        source_file: filename,
        category,
        tags,
        priority: parseInt(priority)
      })
      .select();
    
    if (error) {
      throw error;
    }
    
    console.log(`✅ Successfully imported: ${title}`);
    console.log(`   - Category: ${category}`);
    console.log(`   - Type: ${parsedData.type}`);
    console.log(`   - Priority: ${priority}`);
    console.log(`   - Tags: ${tags.join(', ')}`);
    console.log(`   - Content length: ${content.length} characters`);
    
    return data[0];
    
  } catch (error) {
    console.error(`❌ Error importing ${filePath}:`, error.message);
    throw error;
  }
}

/**
 * Import multiple files from a directory
 */
async function importDirectory(dirPath, category = 'general', priority = 50) {
  try {
    if (!fs.existsSync(dirPath)) {
      throw new Error(`Directory not found: ${dirPath}`);
    }
    
    const files = fs.readdirSync(dirPath);
    const supportedExtensions = ['.json', '.md', '.txt'];
    const filesToImport = files.filter(file => 
      supportedExtensions.includes(path.extname(file).toLowerCase())
    );
    
    console.log(`📂 Found ${filesToImport.length} files to import from ${dirPath}`);
    
    const results = [];
    for (const file of filesToImport) {
      const fullPath = path.join(dirPath, file);
      try {
        const result = await importFile(fullPath, category, priority);
        results.push(result);
      } catch (error) {
        console.error(`⚠️  Skipped ${file}: ${error.message}`);
      }
    }
    
    console.log(`\n🎉 Import complete! Successfully imported ${results.length} files.`);
    return results;
    
  } catch (error) {
    console.error(`❌ Error importing directory ${dirPath}:`, error.message);
    throw error;
  }
}

/**
 * Main execution
 */
async function main() {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    console.log(`
🧠 The Logos AI - Knowledge Base Import Tool

Usage:
  node import-knowledge.js <file-or-directory-path> [category] [priority]

Arguments:
  file-or-directory-path  Path to JSON/MD/TXT file or directory
  category               Category for the knowledge (default: 'general')
  priority               Priority level 0-100 (default: 50)

Examples:
  node import-knowledge.js "./data/frameworks.json" "methodology" 85
  node import-knowledge.js "./books/" "literature" 70
  node import-knowledge.js "./strategy.md" "planning" 90

Supported file types: .json, .md, .txt
    `);
    process.exit(0);
  }
  
  const filePath = args[0];
  const category = args[1] || 'general';
  const priority = parseInt(args[2]) || 50;
  
  try {
    const stats = fs.statSync(filePath);
    
    if (stats.isDirectory()) {
      await importDirectory(filePath, category, priority);
    } else {
      await importFile(filePath, category, priority);
    }
    
  } catch (error) {
    console.error('❌ Import failed:', error.message);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = {
  importFile,
  importDirectory,
  parseFileContent,
  extractContent,
  extractTags
};
