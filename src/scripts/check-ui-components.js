/**
 * Script to verify that UI components are accessible
 */

const fs = require('fs');
const path = require('path');

// Define paths to check
const projectRoot = path.resolve(__dirname, '../..');
const uiComponentsDir = path.join(projectRoot, 'src/components/ui');
const convertNoteModalPath = path.join(projectRoot, 'src/components/ConvertNoteModal.tsx');

console.log('🔍 Checking UI components...');

// Check if directories exist
console.log(`\nChecking if UI components directory exists: ${uiComponentsDir}`);
if (fs.existsSync(uiComponentsDir)) {
  console.log('✅ UI components directory exists.');
  
  // List all UI component files
  const uiComponents = fs.readdirSync(uiComponentsDir);
  console.log('\nUI Components found:');
  uiComponents.forEach(file => {
    console.log(`- ${file}`);
  });
  
  // Check for specific UI components
  const requiredComponents = ['dialog.tsx', 'toast.tsx', 'use-toast.ts', 'toaster.tsx'];
  const missingComponents = requiredComponents.filter(comp => !uiComponents.includes(comp));
  
  if (missingComponents.length === 0) {
    console.log('\n✅ All required UI components exist.');
  } else {
    console.log('\n❌ Missing UI components:');
    missingComponents.forEach(comp => {
      console.log(`- ${comp}`);
    });
  }
} else {
  console.log('❌ UI components directory does not exist.');
}

// Check ConvertNoteModal.tsx imports
console.log(`\nChecking ConvertNoteModal.tsx imports: ${convertNoteModalPath}`);
if (fs.existsSync(convertNoteModalPath)) {
  const content = fs.readFileSync(convertNoteModalPath, 'utf8');
  console.log('✅ ConvertNoteModal.tsx exists.');
  
  // Check for imports
  if (content.includes("import { useToast } from './ui/use-toast'")) {
    console.log('✅ Import for useToast found.');
  } else {
    console.log('❌ Import for useToast not found or incorrect.');
  }
  
  if (content.includes("import {") && content.includes("Dialog,") && content.includes("} from './ui/dialog'")) {
    console.log('✅ Import for Dialog components found.');
  } else {
    console.log('❌ Import for Dialog components not found or incorrect.');
  }
  
} else {
  console.log('❌ ConvertNoteModal.tsx does not exist.');
}

console.log('\n📦 Checking package.json for required dependencies...');
const packageJsonPath = path.join(projectRoot, 'package.json');
if (fs.existsSync(packageJsonPath)) {
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
  console.log('✅ package.json exists.');
  
  // Check for required dependencies
  const requiredDeps = ['@radix-ui/react-dialog', '@radix-ui/react-toast'];
  const missingDeps = requiredDeps.filter(dep => !Object.keys(packageJson.dependencies || {}).includes(dep));
  
  if (missingDeps.length === 0) {
    console.log('✅ All required dependencies exist in package.json.');
  } else {
    console.log('❌ Missing dependencies in package.json:');
    missingDeps.forEach(dep => {
      console.log(`- ${dep}`);
    });
  }
} else {
  console.log('❌ package.json does not exist.');
}

console.log('\n✨ UI component check complete!');
