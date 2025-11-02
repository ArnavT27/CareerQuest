# MongoDB Integration Guide for Career Quest

This guide explains how to set up MongoDB authentication for the Career Quest application.

## Current Status

The application currently uses localStorage for demonstration purposes. The authentication system is fully functional with:

- ✅ User signup/login forms
- ✅ Authentication context management
- ✅ JWT-like token simulation
- ✅ User session persistence
- ✅ Integration with all app components

## MongoDB Integration Setup

### 1. Install Required Dependencies

```bash
npm install mongodb bcryptjs jsonwebtoken
npm install --save-dev @types/bcryptjs @types/jsonwebtoken
```

### 2. Environment Variables

Create a `.env` file in your project root:

```env
MONGODB_URI=mongodb://localhost:27017/career-quest
JWT_SECRET=super-secure-random-string-here
NODE_ENV=development
PORT=3001
```

### 3. Replace Simulated Services

The `mongoService.ts` file contains production-ready code templates. To activate MongoDB:

1. Uncomment the MongoDB implementation code in `mongoService.ts`
2. Comment out the localStorage simulation code
3. Update `authService.ts` to use `MongoAuthService` methods

### 4. Database Schema

The application uses this user schema:

```javascript
{
  _id: ObjectId,
  name: String,
  email: String (unique),
  password: String (hashed),
  createdAt: Date,
  updatedAt: Date,
  lastLogin: Date
}
```

### 5. Security Considerations

- ✅ Passwords are hashed using bcryptjs
- ✅ JWT tokens for session management
- ✅ Email uniqueness validation
- ⚠️ Add rate limiting in production
- ⚠️ Use HTTPS in production
- ⚠️ Implement proper error handling

## Current Demo Features

### Authentication Flow

1. **Landing Page**: Shows login/signup forms instead of name input
2. **User Registration**: Creates account with name, email, password
3. **User Login**: Authenticates with email and password
4. **Session Management**: Maintains login state across page refreshes
5. **Name Display**: Uses authenticated user's name throughout the app
6. **Logout**: Clears session and returns to landing page

### Form Validation

- Email format validation
- Password minimum length (6 characters)
- Name requirement for signup
- Error handling with toast notifications

### UI/UX Enhancements

- Toggle between login and signup modes
- Loading states during authentication
- Responsive design with animations
- Professional styling with shadcn/ui components

## File Structure

```
src/
├── components/
│   └── AuthForm.tsx          # Login/signup form component
├── contexts/
│   └── AuthContext.tsx       # Authentication state management
├── services/
│   ├── authService.ts        # Current localStorage-based auth
│   └── mongoService.ts       # Production MongoDB templates
└── pages/
    ├── Landing.tsx           # Updated with auth forms
    └── Index.tsx             # Updated to use auth context
```

## Testing the Current Implementation

1. Start the development server: `npm run dev`
2. Navigate to the application
3. Try creating a new account with signup
4. Test login with the created credentials
5. Verify the user's name appears throughout the app
6. Test logout functionality

The authentication system is fully functional and ready for production use with minimal changes to integrate with a real MongoDB database.
