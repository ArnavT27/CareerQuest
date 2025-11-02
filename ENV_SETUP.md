# Environment Variables Setup Guide

## Quick Fix for `.env.local` Not Loading

If your `.env.local` file is not being picked up by Vite, follow these steps:

### 1. Verify File Location
The `.env.local` file must be in the **project root** (same directory as `package.json` and `vite.config.ts`):
```
CareerQuest/
  ├── .env.local       ← Must be here
  ├── package.json
  ├── vite.config.ts
  └── src/
```

### 2. Verify File Format
Your `.env.local` file must:
- Use `VITE_` prefix for all variables (required by Vite)
- Have no spaces around the `=` sign
- Not use quotes unless the value contains spaces
- Use proper line endings (LF or CRLF)

**Correct format:**
```env
VITE_GEMINI_API_KEY=your_actual_api_key_here
```

**Incorrect formats:**
```env
# Wrong - no VITE_ prefix
GEMINI_API_KEY=key

# Wrong - spaces around =
VITE_GEMINI_API_KEY = key

# Wrong - unnecessary quotes (unless value has spaces)
VITE_GEMINI_API_KEY="key"

# Wrong - missing value
VITE_GEMINI_API_KEY=
```

### 3. Restart Dev Server
After creating or modifying `.env.local`:
1. **Stop** the dev server (Ctrl+C)
2. **Restart** it with `npm run dev`

Environment variables are only loaded when Vite starts!

### 4. Verify Variables Are Loaded
Add this temporary check in your code to see what's loaded:
```typescript
console.log('Env check:', {
  hasKey: !!import.meta.env.VITE_GEMINI_API_KEY,
  keyLength: import.meta.env.VITE_GEMINI_API_KEY?.length,
  allEnv: import.meta.env
});
```

### 5. Check File Encoding
On Windows, ensure the file is saved as **UTF-8** encoding:
- In VS Code: Bottom right → click encoding → "Save with Encoding" → "UTF-8"
- In Notepad++: Encoding → "Convert to UTF-8" → Save

### 6. Common Issues & Solutions

#### Issue: File exists but variables are undefined
**Solution:** 
- Check variable name matches exactly (case-sensitive)
- Ensure `VITE_` prefix is present
- Restart dev server

#### Issue: Variables work in dev but not in build
**Solution:**
- Use `.env.production` for production builds
- Or use `.env.local` which works in all modes

#### Issue: File is ignored by Git
**Solution:**
- This is normal! `.env.local` should be in `.gitignore`
- Create `.env.example` as a template (without actual keys)
- Document required variables in README

#### Issue: Variables show as empty strings
**Solution:**
- Check for trailing spaces
- Remove any quotes if not needed
- Verify no special characters that need escaping

### 7. File Priority Order
Vite loads env files in this order (later files override earlier ones):
1. `.env`
2. `.env.local`
3. `.env.[mode]` (e.g., `.env.development`)
4. `.env.[mode].local` (e.g., `.env.development.local`)

`.env.local` is loaded in all modes and is the best place for local secrets.

### 8. Testing Your Setup

Run this command to verify your environment variables:
```bash
# In CareerQuest directory
npm run dev
```

Then check the browser console. You should see your API key loaded (but don't log the actual key value in production).

### 9. Alternative: Use .env file
If `.env.local` still doesn't work, try using `.env`:
```env
VITE_GEMINI_API_KEY=your_key_here
```

Note: `.env` files are committed to git by default, so use `.env.local` for secrets.

### Need Help?
If issues persist:
1. Check Vite docs: https://vitejs.dev/guide/env-and-mode.html
2. Verify Node.js version (should be 16+)
3. Clear node_modules and reinstall: `rm -rf node_modules && npm install`
4. Check for typos in variable names

