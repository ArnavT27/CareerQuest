#!/usr/bin/env node

/**
 * Quick diagnostic script to check if .env.local is being loaded correctly
 * Run with: node check-env.js
 */

import { readFileSync } from 'fs';
import { existsSync } from 'fs';
import { join } from 'path';

const envPath = join(process.cwd(), '.env.local');

console.log('\n🔍 Environment Variable Diagnostic Tool\n');
console.log('=' .repeat(50));

// Check if file exists
if (!existsSync(envPath)) {
  console.log('❌ .env.local file NOT FOUND');
  console.log(`   Expected at: ${envPath}`);
  console.log('\n💡 Solution: Create .env.local file in the project root');
  process.exit(1);
}

console.log('✅ .env.local file exists');
console.log(`   Location: ${envPath}\n`);

// Read and parse file
try {
  const content = readFileSync(envPath, 'utf-8');
  const lines = content.split('\n').filter(line => {
    const trimmed = line.trim();
    return trimmed && !trimmed.startsWith('#');
  });

  console.log(`📄 Found ${lines.length} environment variable(s):\n`);

  let hasVitePrefix = false;
  let hasGeminiKey = false;

  lines.forEach((line, index) => {
    const match = line.match(/^([^=]+)=(.*)$/);
    if (match) {
      const key = match[1].trim();
      const value = match[2].trim();
      const isVite = key.startsWith('VITE_');
      
      if (isVite) hasVitePrefix = true;
      if (key === 'VITE_GEMINI_API_KEY') hasGeminiKey = true;

      console.log(`   ${index + 1}. ${key}`);
      console.log(`      Value: ${value ? (value.length > 20 ? value.substring(0, 20) + '...' : value) : '(empty)'}`);
      console.log(`      Has VITE_ prefix: ${isVite ? '✅' : '❌'}`);
      
      // Check for common issues
      const issues = [];
      if (!isVite && key.includes('API')) {
        issues.push('Missing VITE_ prefix');
      }
      if (key.includes(' ')) {
        issues.push('Contains spaces');
      }
      if (value === '') {
        issues.push('Empty value');
      }
      if (value.startsWith('"') && value.endsWith('"')) {
        issues.push('Unnecessary quotes');
      }
      
      if (issues.length > 0) {
        console.log(`      ⚠️  Issues: ${issues.join(', ')}`);
      }
      console.log('');
    }
  });

  console.log('='.repeat(50));
  console.log('\n📊 Summary:\n');
  
  if (!hasVitePrefix && lines.length > 0) {
    console.log('❌ No variables found with VITE_ prefix');
    console.log('   Vite only exposes variables that start with VITE_');
    console.log('   Solution: Add VITE_ prefix to your variables\n');
  } else if (hasVitePrefix) {
    console.log('✅ Found variables with VITE_ prefix\n');
  }

  if (!hasGeminiKey) {
    console.log('❌ VITE_GEMINI_API_KEY not found');
    console.log('   Solution: Add VITE_GEMINI_API_KEY=your_key_here to .env.local\n');
  } else {
    console.log('✅ VITE_GEMINI_API_KEY found\n');
  }

  console.log('💡 Next Steps:');
  console.log('   1. Fix any issues shown above');
  console.log('   2. Restart your dev server (npm run dev)');
  console.log('   3. Check browser console for any errors\n');

} catch (error) {
  console.log('❌ Error reading .env.local file:');
  console.log(`   ${error.message}\n`);
  process.exit(1);
}

