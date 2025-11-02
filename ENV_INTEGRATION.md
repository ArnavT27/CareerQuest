# Environment Variable Integration Guide

## ✅ Complete Integration

The `geminiService.ts` file is now fully integrated with environment variables using Vite's built-in environment variable system.

## 📋 Setup Instructions

### Step 1: Create `.env.local` File

Create a file named `.env.local` in the **CareerQuest** folder (same directory as `package.json`):

```
CareerQuest/
  ├── .env.local      ← Create this file here
  ├── package.json
  ├── vite.config.ts
  └── src/
```

### Step 2: Add Your API Key

Open `.env.local` and add your Gemini API key:

```env
VITE_GEMINI_API_KEY=AIzaSyDyour_actual_api_key_here
```

**Important Formatting Rules:**
- ✅ Must start with `VITE_` prefix (required by Vite)
- ✅ No spaces around `=` sign
- ✅ No quotes (unless absolutely necessary)
- ✅ No trailing spaces

### Step 3: Get Your API Key

1. Visit: https://makersuite.google.com/app/apikey
2. Sign in with your Google account
3. Click "Create API Key" or "Get API Key"
4. Copy the generated key
5. Paste it in `.env.local` after `VITE_GEMINI_API_KEY=`

### Step 4: Restart Dev Server

**CRITICAL:** Environment variables are only loaded when Vite starts!

1. Stop your dev server (press `Ctrl+C`)
2. Start it again: `npm run dev`

## 🔍 How It Works

The integration uses Vite's `import.meta.env` which automatically:
1. Loads variables from `.env.local` file
2. Only exposes variables prefixed with `VITE_`
3. Makes them available via `import.meta.env.VITE_GEMINI_API_KEY`

### Code Implementation

```typescript
// In geminiService.ts
const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

// Enhanced features:
// - Automatic validation
// - Development mode debugging
// - Clear error messages
// - Helper function: isGeminiConfigured()
```

## ✅ Verification

After setup, you should see in the browser console (development mode):

```
✅ Gemini API Key loaded successfully
   Key format: AIzaSyDxxx...xxxx
```

If you see errors instead, check the troubleshooting section below.

## 🛠️ Troubleshooting

### Problem: "VITE_GEMINI_API_KEY not found"

**Solutions:**
1. ✅ Check file is named exactly `.env.local` (not `.env.local.txt`)
2. ✅ Verify file is in `CareerQuest/` folder (project root)
3. ✅ Ensure variable starts with `VITE_` prefix
4. ✅ Restart dev server after creating/modifying the file
5. ✅ Run `npm run check-env` to diagnose issues

### Problem: Variables work but API calls fail

**Solutions:**
1. ✅ Verify API key is correct (get a new one from Google)
2. ✅ Check API key hasn't expired
3. ✅ Ensure Gemini API is enabled in your Google Cloud project
4. ✅ Check browser console for specific API errors

### Problem: File exists but variables aren't loaded

**Common Causes:**
- File encoding issues (use UTF-8)
- Hidden characters or BOM
- File in wrong location
- Dev server not restarted

**Fix:**
```bash
# Run diagnostic tool
npm run check-env

# Or use PowerShell helper
.\setup-env.ps1
```

## 📁 File Structure

Your project should look like this:

```
CareerQuest/
  ├── .env.local              ← Your secrets here (gitignored)
  ├── .env.example            ← Template (optional)
  ├── package.json
  ├── vite.config.ts
  ├── src/
  │   └── services/
  │       └── geminiService.ts ← Uses import.meta.env.VITE_GEMINI_API_KEY
  └── ...
```

## 🔒 Security Notes

1. **Never commit `.env.local`** - It's in `.gitignore` for a reason
2. **Use `.env.example`** - Create a template without actual keys
3. **VITE_ prefix** - These variables are exposed to the browser
4. **Production** - Use different keys for production builds

## 🧪 Testing the Integration

After setup, you can test if it's working:

```typescript
import { isGeminiConfigured } from '@/services/geminiService';

if (isGeminiConfigured()) {
  console.log('✅ Gemini is configured');
} else {
  console.error('❌ Gemini is not configured');
}
```

## 📚 Additional Resources

- Vite Environment Variables: https://vitejs.dev/guide/env-and-mode.html
- Google Gemini API: https://makersuite.google.com/app/apikey
- Setup Helper Script: `.\setup-env.ps1`
- Diagnostic Tool: `npm run check-env`

## 💡 Quick Reference

```bash
# Check environment variables
npm run check-env

# Setup via helper script
.\setup-env.ps1

# Manual verification
# Open browser console and check for:
# ✅ Gemini API Key loaded successfully
```

---

**Remember:** Always restart your dev server after modifying `.env.local`!

