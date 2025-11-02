import { GoogleGenerativeAI } from '@google/generative-ai';

// Try to access the API key from environment variables
const API_KEY = process.env.VITE_GEMINI_API_KEY;

if (!API_KEY) {
  console.log('❌ VITE_GEMINI_API_KEY not found in environment variables');
  console.log('Please set VITE_GEMINI_API_KEY in your .env.local file');
  process.exit(1);
}

console.log('🔑 API Key found (first 10 characters):', API_KEY.substring(0, 10) + '...');

// Initialize the Gemini API
try {
  const genAI = new GoogleGenerativeAI(API_KEY);
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
  
  console.log('✅ Gemini API initialized successfully');
  
  // Test with a simple prompt
  const prompt = "Say hello in 3 different languages";
  
  console.log('📡 Sending test request...');
  const result = await model.generateContent(prompt);
  const response = await result.response;
  const text = response.text();
  
  console.log('✅ Test successful!');
  console.log('Response:', text);
} catch (error) {
  console.log('❌ Error testing Gemini API:', error.message);
  
  if (error.message.includes('429')) {
    console.log('⚠️ API quota exceeded');
  } else if (error.message.includes('503')) {
    console.log('⚠️ API service temporarily unavailable');
  } else if (error.message.includes('API_KEY')) {
    console.log('⚠️ Invalid API key');
  } else {
    console.log('⚠️ Other API error');
  }
}