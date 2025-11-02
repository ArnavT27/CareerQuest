# Quick Setup Instructions - Fix API Configuration Issue

## 🚨 Current Issue
You're seeing: "I'm having trouble connecting to the AI service"

This means the Gemini API key is not configured.

## ✅ Solution - 3 Simple Steps

### Step 1: Get Your Free Gemini API Key

1. **Visit**: https://aistudio.google.com/app/apikey
2. **Sign in** with your Google account
3. **Click** "Create API Key"
4. **Copy** the API key (it looks like: `AIzaSy...`)

**Note**: The free tier is very generous - no credit card needed!

---

### Step 2: Add API Key to Your Project

1. **Open** the file: `CareerQuest/.env.local`
2. **Replace** `your_gemini_api_key_here` with your actual API key
3. **Save** the file

The file should look like this:
```env
VITE_GEMINI_API_KEY=AIzaSyYourActualKeyHere
```

---

### Step 3: Restart the Server

**Important**: You MUST restart the server for changes to take effect.

1. **Stop** the current server (press `Ctrl+C` in terminal)
2. **Start** it again:
   ```bash
   npm run dev
   ```

---

## ✅ Verification

After restarting:
1. Open http://localhost:8080
2. Log in to your account
3. Look for the chatbot in the bottom-right corner
4. Send a test message like "Hello"
5. You should get an AI response instead of the error message

---

## 🔍 Still Not Working?

### Check These:

1. **File Location**: Make sure `.env.local` is in the `CareerQuest` folder (not in `src` or `public`)
2. **File Name**: Must be exactly `.env.local` (not `.env` or `env.local`)
3. **API Key Format**: Should start with `AIzaSy` and have no spaces
4. **Server Restart**: Did you restart after adding the key?
5. **Browser Console**: Press F12 → Console tab to see detailed errors

### Common Issues:

**"File not found"**
- Create `.env.local` in the `CareerQuest` directory
- Copy from `.env.local.example` if it exists

**"Still showing error"**
- Check that variable name is exactly: `VITE_GEMINI_API_KEY`
- No quotes around the API key value
- Make sure server was restarted

**"Invalid API key"**
- Verify key is active at https://aistudio.google.com/app/apikey
- Check if key was copied completely (no truncation)

---

## 📚 More Help

- See `API_SETUP.md` for detailed documentation
- Check browser console (F12) for specific error messages
- Verify API key at: https://aistudio.google.com/app/apikey

---

**Need Help?** Check the error message in the chatbot - it will now give you specific guidance based on the type of error!

