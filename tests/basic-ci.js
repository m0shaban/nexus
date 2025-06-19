// Basic test to ensure CI/CD pipeline works
// This file contains minimal tests that should always pass

import assert from 'assert';

console.log('🧪 Running basic tests...');

// Test 1: Basic assertion
try {
  assert(true === true, 'Basic assertion should pass');
  console.log('✅ Test 1: Basic assertion passed');
} catch (error) {
  console.error('❌ Test 1 failed:', error.message);
  process.exit(1);
}

// Test 2: Environment check
try {
  assert(typeof process === 'object', 'Process should be available');
  console.log('✅ Test 2: Environment check passed');
} catch (error) {
  console.error('❌ Test 2 failed:', error.message);
  process.exit(1);
}

// Test 3: JSON parsing
try {
  const testData = JSON.parse('{"test": true}');
  assert(testData.test === true, 'JSON parsing should work');
  console.log('✅ Test 3: JSON parsing passed');
} catch (error) {
  console.error('❌ Test 3 failed:', error.message);
  process.exit(1);
}

console.log('🎉 All basic tests passed!');
process.exit(0);
