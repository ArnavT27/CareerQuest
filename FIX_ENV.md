# 🔧 Fix: .env.local Not Loading API Key

## Problem
Your `.env.local` file exists but is **empty** (0 bytes). That's why Vite can't find your API key.

## Quick Fix Steps

### Step 1: Open `.env.local` File
Open the file in any text editor:
- VS Code: `code .env`
- Notepad: `notepad .env.local`
- Or navigate to: `C:\Users\hp\Downloads\GENAI\CareerQuest\.env.local`

### Step 2: Add Your API Key
Add this line to the file (replace with your actual key):

```env
VITE_GEMINI_API_KEY=AIzaSyDxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

**Important:**
- ✅ Use `VITE_` prefix (required by Vite)
- ✅ No spaces around the `=` sign
- ✅ No quotes unless your key has spaces (it shouldn't)
- ✅ No empty lines before or after

### Step 3: Get Your Gemini API Key (if you don't have one)

1. Visit: https://makersuite.google.com/app/apikey
2. Sign in with your Google account
3. Click "Create API Key" or "Get API Key"
4. Copy the generated key
5. Paste it in `.env.local` after `VITE_GEMINI_API_KEY=`

### Step 4: Save and Restart

1. **Save** the `.env.local` file
2. **Stop** your dev server (press Ctrl+C in the terminal)
3. **Restart** it: `npm run dev`

### Step 5: Verify It Works

After restarting, you should:
- ✅ No error messages about missing API key
- ✅ Check browser console - should not show the "❌ VITE_GEMINI_API_KEY not found" error

## Verify Your File Format

Your `.env.local` should look exactly like this:

```env
VITE_GEMINI_API_KEY=AIzaSyDYourActualKeyHere
```

**Common Mistakes to Avoid:**
```env
# ❌ Wrong - no VITE_ prefix
GEMINI_API_KEY=key

# ❌ Wrong - spaces around =
VITE_GEMINI_API_KEY = key

# ❌ Wrong - quotes (not needed)
VITE_GEMINI_API_KEY="key"

# ❌ Wrong - empty
VITE_GEMINI_API_KEY=

# ❌ Wrong - comment on same line
VITE_GEMINI_API_KEY=key # my key
```

## Still Not Working?

Run this diagnostic:
```bash
npm run check-env
```

This will show you exactly what's wrong with your `.env.local` file.

## Quick Command to Create It

If you want to create it via command line (PowerShell):

```powershell
cd "C:\Users\hp\Downloads\GENAI\CareerQuest"
Add-Content -Path .env.local -Value "VITE_GEMINI_API_KEY=YOUR_ACTUAL_KEY_HERE"
```

Then edit it and replace `YOUR_ACTUAL_KEY_HERE` with your real key.

