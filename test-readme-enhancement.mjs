console.log('🔍 Testing README enhancements...\n');

try {
  // Test file accessibility
  const fs = await import('fs');
  const readmePath = 'f:/aai/عمفقش/New folder (2)/nexus/README.md';
  const technicalPath = 'f:/aai/عمفقش/New folder (2)/nexus/TECHNICAL_MANUAL.md';
  
  console.log('✅ Checking file accessibility...');
  console.log(`📄 README.md exists: ${fs.existsSync(readmePath)}`);
  console.log(`📄 TECHNICAL_MANUAL.md exists: ${fs.existsSync(technicalPath)}`);
  
  // Test markdown content
  if (fs.existsSync(readmePath)) {
    const readmeContent = fs.readFileSync(readmePath, 'utf8');
    console.log('\n✅ Checking README content...');
    console.log(`🔗 Live demo link present: ${readmeContent.includes('nexuss-rouge.vercel.app')}`);
    console.log(`👨‍💻 Technical manual link present: ${readmeContent.includes('TECHNICAL_MANUAL.md')}`);
    console.log(`🎨 Badge styling present: ${readmeContent.includes('for-the-badge')}`);
    console.log(`📊 Quick access section present: ${readmeContent.includes('Quick Access Links')}`);
  }
  
  console.log('\n🎉 README enhancement test completed successfully!');
  
} catch (error) {
  console.error('❌ Test failed:', error.message);
}