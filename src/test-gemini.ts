import { geminiService } from './services/geminiService';

console.log('🧪 Testing Gemini Service...');

// Test the Gemini API connectivity
geminiService.testGeminiAPI()
  .then(result => {
    console.log('Test Result:', result);
    if (result.success) {
      console.log('✅ Gemini API test successful!');
      console.log(`Generated ${result.questionsCount} test questions`);
    } else {
      console.log('❌ Gemini API test failed!');
      console.log('Error:', result.error);
    }
  })
  .catch(error => {
    console.log('❌ Unexpected error during test:', error);
  });