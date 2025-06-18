/**
 * Simple script to verify the route structure
 * Run with: node src/scripts/verify-routes.js
 */

const fs = require('fs');
const path = require('path');

// Define the project root
const projectRoot = path.resolve(__dirname, '../..');

// Function to list directories in a recursive way
function listDirectoriesRecursive(dirPath, relativeBase, depth = 0) {
  const entries = fs.readdirSync(dirPath, { withFileTypes: true });
  
  const relativePath = path.relative(relativeBase, dirPath);
  
  console.log(`${' '.repeat(depth * 2)}📂 ${relativePath || '/'}`);
  
  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry.name);
    
    if (entry.isDirectory()) {
      // Skip node_modules and other irrelevant directories
      if (['node_modules', '.git', '.next'].includes(entry.name)) continue;
      
      listDirectoriesRecursive(fullPath, relativeBase, depth + 1);
    } else {
      // Only show .ts, .tsx, .js, .jsx files
      if (!['.ts', '.tsx', '.js', '.jsx'].includes(path.extname(entry.name))) continue;
      
      console.log(`${' '.repeat((depth + 1) * 2)}📄 ${entry.name}`);
    }
  }
}

// Check the app directory structure
console.log('\n🔍 Checking app directory structure...');
listDirectoriesRecursive(path.join(projectRoot, 'src/app'), path.join(projectRoot, 'src'));

// Check if root page.tsx contains redirection logic
console.log('\n🔍 Checking root page.tsx for redirection...');
const rootPagePath = path.join(projectRoot, 'src/app/page.tsx');
const rootPageContent = fs.readFileSync(rootPagePath, 'utf8');

if (rootPageContent.includes('router.push') || rootPageContent.includes('redirect')) {
  console.log('✅ Root page.tsx contains redirection logic.');
} else {
  console.log('❌ Root page.tsx does not appear to contain redirection logic.');
}

// Check if the project layout is set up correctly
console.log('\n🔍 Checking app-layout structure...');
const appLayoutPath = path.join(projectRoot, 'src/app/(app-layout)/layout.tsx');
if (fs.existsSync(appLayoutPath)) {
  console.log('✅ (app-layout)/layout.tsx exists.');
  
  const layoutContent = fs.readFileSync(appLayoutPath, 'utf8');
  if (layoutContent.includes('MainNavigation')) {
    console.log('✅ Layout includes MainNavigation component.');
  } else {
    console.log('❌ Layout does not include MainNavigation component.');
  }
} else {
  console.log('❌ (app-layout)/layout.tsx does not exist.');
}

// Check if projects page exists
console.log('\n🔍 Checking projects page structure...');
const projectsPagePath = path.join(projectRoot, 'src/app/(app-layout)/projects/page.tsx');
if (fs.existsSync(projectsPagePath)) {
  console.log('✅ Projects page exists.');
} else {
  console.log('❌ Projects page does not exist.');
}

// Check for API endpoints
console.log('\n🔍 Checking Catalyst API endpoints...');
const apiPaths = [
  'src/app/api/projects/plan/route.ts',
  'src/app/api/projects/convert-note/route.ts',
  'src/app/api/projects/update-streak/route.ts'
];

for (const apiPath of apiPaths) {
  const fullPath = path.join(projectRoot, apiPath);
  if (fs.existsSync(fullPath)) {
    console.log(`✅ ${apiPath} exists.`);
  } else {
    console.log(`❌ ${apiPath} does not exist.`);
  }
}

console.log('\n✨ Route verification complete!');
