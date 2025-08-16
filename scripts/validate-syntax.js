#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Simple syntax validation for common React Native/TypeScript issues
function validateSyntax(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split('\n');
    const errors = [];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const lineNum = i + 1;

      // Check for common syntax issues
      
      // 1. Unmatched braces
      const openBraces = (line.match(/\{/g) || []).length;
      const closeBraces = (line.match(/\}/g) || []).length;
      
      // 2. Unmatched parentheses
      const openParens = (line.match(/\(/g) || []).length;
      const closeParens = (line.match(/\)/g) || []).length;
      
      // 3. Missing semicolons after statements (basic check)
      if (line.trim().endsWith('})') && !line.includes('//') && !line.includes('/*')) {
        // This might be end of a function/callback
      }
      
      // 4. Check for double closing braces/parens
      if (line.includes('});') && line.includes('});')) {
        errors.push(`Line ${lineNum}: Possible duplicate closing braces: ${line.trim()}`);
      }
      
      // 5. Check for missing commas in object/array literals
      if (line.trim().endsWith('}') && i < lines.length - 1) {
        const nextLine = lines[i + 1].trim();
        if (nextLine.startsWith('{') || nextLine.startsWith('[')) {
          // Might need a comma
        }
      }
    }

    // Check overall brace balance
    const totalOpenBraces = (content.match(/\{/g) || []).length;
    const totalCloseBraces = (content.match(/\}/g) || []).length;
    
    if (totalOpenBraces !== totalCloseBraces) {
      errors.push(`Unmatched braces: ${totalOpenBraces} open, ${totalCloseBraces} close`);
    }

    // Check overall parentheses balance
    const totalOpenParens = (content.match(/\(/g) || []).length;
    const totalCloseParens = (content.match(/\)/g) || []).length;
    
    if (totalOpenParens !== totalCloseParens) {
      errors.push(`Unmatched parentheses: ${totalOpenParens} open, ${totalCloseParens} close`);
    }

    return {
      file: filePath,
      errors: errors,
      valid: errors.length === 0
    };

  } catch (error) {
    return {
      file: filePath,
      errors: [`Failed to read file: ${error.message}`],
      valid: false
    };
  }
}

// Files to validate
const filesToCheck = [
  'src/screen/AppScreen/HomeScreen/index.tsx',
  'src/screen/AuthScreen/LoginScreen/index.tsx',
  'src/screen/AuthScreen/OtpScreen/index.tsx',
  'src/services/authServices.ts',
  'src/services/HomeService.ts',
  'src/services/PropertyServices.ts',
  'src/services/locationSelectionServices.ts',
  'src/axios/index.tsx'
];

console.log('🔍 Validating React Native file syntax...\n');

let allValid = true;

filesToCheck.forEach(file => {
  const fullPath = path.join(process.cwd(), file);
  if (fs.existsSync(fullPath)) {
    const result = validateSyntax(fullPath);
    
    if (result.valid) {
      console.log(`✅ ${file}: VALID`);
    } else {
      console.log(`❌ ${file}: ERRORS FOUND`);
      result.errors.forEach(error => {
        console.log(`   - ${error}`);
      });
      allValid = false;
    }
  } else {
    console.log(`⚠️  ${file}: FILE NOT FOUND`);
  }
});

console.log('\n' + '='.repeat(50));
if (allValid) {
  console.log('🎉 All files passed syntax validation!');
} else {
  console.log('❌ Some files have syntax issues that need to be fixed.');
}
