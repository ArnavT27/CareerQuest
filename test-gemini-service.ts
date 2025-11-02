import { geminiService } from './src/services/geminiService';

async function testGeminiService() {
  console.log('Testing Gemini Service...');
  
  try {
    // Test generating initial questions
    console.log('Generating test questions...');
    const questions = await geminiService.generateInitialQuestions(['communication', 'leadership']);
    console.log('Generated questions:', questions.length);
    console.log('First question:', questions[0]?.question);
  } catch (error) {
    console.error('Error generating questions:', error);
  }
}

testGeminiService();