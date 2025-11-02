// @ts-expect-error: Vite environment variables not recognized by TypeScript
const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

console.log('API Key available:', !!API_KEY);
if (API_KEY) {
  console.log('API Key length:', API_KEY.length);
}

// Initialize the Gemini API
try {
  // @ts-expect-error: Vite environment variables not recognized by TypeScript
  const genAI = new GoogleGenerativeAI(API_KEY);
  console.log('✅ Gemini API initialized successfully');
} catch (error: unknown) {
  if (error instanceof Error) {
    console.log('❌ Error initializing Gemini API:', error.message);
  } else {
    console.log('❌ Error initializing Gemini API:', String(error));
  }
}