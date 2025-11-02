# Environment Variables Configuration

This document lists all environment variables used in the CareerQuest project.

## Required Variables

### `VITE_GEMINI_API_KEY`
- **Description**: Google Gemini API key for AI-powered features
- **Required**: Yes
- **Format**: String starting with `AIza`
- **Location**: `.env.local` file
- **Example**: `VITE_GEMINI_API_KEY=AIzaSyDxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`
- **Where to get it**: https://makersuite.google.com/app/apikey
- **Note**: Must be prefixed with `VITE_` for Vite to expose it to client-side code

## Optional Variables

### `JWT_SECRET`
- **Description**: Secret key for JWT token signing (used in MongoDB service)
- **Required**: No (only if using MongoDB authentication)
- **Format**: Secure random string
- **Location**: `.env.local` or server environment
- **Example**: `JWT_SECRET=your_secure_random_string_here`
- **Note**: Generate a secure random string (at least 32 characters)

### `MONGODB_URI`
- **Description**: MongoDB connection string
- **Required**: No (only if using MongoDB service)
- **Format**: `mongodb://username:password@host:port/database`
- **Location**: `.env.local` or server environment
- **Example**: `MONGODB_URI=mongodb://localhost:27017/careerquest`

## Setup Instructions

1. **Create `.env.local` file** in the `CareerQuest` folder (same directory as `package.json`)

2. **Add your environment variables**:
   ```env
   # Required
   VITE_GEMINI_API_KEY=your_gemini_api_key_here

   # Optional (for MongoDB service)
   JWT_SECRET=your_secure_random_string_here
   MONGODB_URI=mongodb://localhost:27017/careerquest
   ```

3. **Important Notes**:
   - `.env.local` is gitignored and will not be committed to version control
   - No spaces around the `=` sign
   - No quotes needed (unless the value contains spaces)
   - Variables prefixed with `VITE_` are exposed to the browser
   - **Restart the dev server** after modifying `.env.local`

## Security Best Practices

1. ✅ **Never commit `.env.local`** - It's already in `.gitignore`
2. ✅ **Use different keys for development and production**
3. ✅ **Rotate API keys regularly**
4. ✅ **Use strong, random strings for JWT_SECRET**
5. ⚠️ **Note**: `VITE_` prefixed variables are visible in browser - use server-side routes for sensitive keys in production

## Verification

Run the diagnostic tool to verify your environment setup:

```bash
npm run check-env
```

## Troubleshooting

### Environment variable not loading?

1. Make sure the file is named exactly `.env.local` (not `.env` or `.env.local.txt`)
2. Check the file location - should be in `CareerQuest/.env.local` (same folder as `package.json`)
3. **Restart your dev server** - Vite only loads env vars on startup
4. Verify the variable name has the correct prefix (`VITE_` for client-side)

### API key not working?

1. Verify the key format starts with `AIza`
2. Check if the key is valid at: https://makersuite.google.com/app/apikey
3. Ensure Gemini API is enabled in your Google Cloud project
4. Check browser console for specific error messages

---

**Last Updated**: Environment variables properly configured  
**Status**: ✅ All sensitive keys moved to environment variables


