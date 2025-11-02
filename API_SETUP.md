# API Setup Guide for Career Quest

## Gemini AI API Setup

The chatbot and AI features require a Google Gemini API key.

### Step 1: Get Your API Key

1. Go to [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Sign in with your Google account
3. Click "Create API Key"
4. Copy your API key

### Step 2: Configure Environment Variable

1. Create a file named `.env.local` in the `CareerQuest` directory
2. Add your API key:

```env
VITE_GEMINI_API_KEY=your_actual_api_key_here
```

**Important**: 
- Replace `your_actual_api_key_here` with your actual API key
- Never commit `.env.local` to version control (it's already in .gitignore)
- The file should be in the root `CareerQuest` directory

### Step 3: Restart Development Server

After adding the API key:
1. Stop the current server (Ctrl+C)
2. Start it again: `npm run dev`

The chatbot should now work properly!

### Troubleshooting

#### "I'm having trouble connecting to the AI service"
- Check that `.env.local` exists in the `CareerQuest` directory
- Verify the API key is correct (no extra spaces)
- Make sure the server was restarted after adding the key
- Check browser console for detailed error messages

#### API Key Not Working
- Verify the key is active in Google AI Studio
- Check if you have API quota remaining
- Ensure the key starts with your API key format

#### Still Having Issues?
1. Check browser console (F12) for errors
2. Verify the file is named exactly `.env.local` (not `.env` or `env.local`)
3. Make sure Vite is picking up the variable (restart required)
4. Check that the variable name is exactly `VITE_GEMINI_API_KEY`

### Alternative: Quick Test

You can test if your API key works by creating a test file:

```javascript
// test-api.js
const API_KEY = 'YOUR_API_KEY_HERE';
const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

model.generateContent("Hello")
  .then(result => {
    console.log("✅ API Key is working!");
    console.log(result.response.text());
  })
  .catch(error => {
    console.error("❌ API Key error:", error.message);
  });
```

### Free Tier Limits

Google Gemini API has a free tier with:
- Generous free quota per day
- Rate limiting (requests per minute)
- No credit card required for free tier

Check your usage at: https://aistudio.google.com/app/apikey

