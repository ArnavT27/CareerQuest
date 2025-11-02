// MongoDB integration service for production use
// This service provides MongoDB-ready authentication functions

import { User, AuthResponse } from './authService';

// MongoDB connection configuration
export const MONGODB_CONFIG = {
  // Replace with your actual MongoDB connection string
  connectionString: process.env.MONGODB_URI || 'mongodb://localhost:27017/career-quest',
  databaseName: 'career-quest',
  usersCollection: 'users'
};

// Types for MongoDB operations
export interface MongoUser {
  _id?: string;
  name: string;
  email: string;
  password: string; // hashed password
  createdAt: Date;
  updatedAt: Date;
  lastLogin?: Date;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface SignupCredentials {
  name: string;
  email: string;
  password: string;
}

/**
 * MongoDB Authentication Service
 * 
 * This service provides production-ready authentication functions
 * that can be easily integrated with a real MongoDB database.
 * 
 * To use this service in production:
 * 1. Install required dependencies: npm install mongodb bcryptjs jsonwebtoken
 * 2. Set up environment variables for MongoDB connection and JWT secret
 * 3. Replace the simulated functions below with actual MongoDB operations
 * 4. Update authService.ts to use these functions instead of localStorage
 */

// Simulated MongoDB operations (replace with actual MongoDB client calls)
export class MongoAuthService {
  // Initialize MongoDB connection
  static async connect() {
    // TODO: Initialize MongoDB client
    console.log('Connecting to MongoDB:', MONGODB_CONFIG.connectionString);
    // const client = new MongoClient(MONGODB_CONFIG.connectionString);
    // await client.connect();
    // return client.db(MONGODB_CONFIG.databaseName);
  }

  // Create a new user account
  static async createUser(userData: SignupCredentials): Promise<User> {
    // TODO: Replace with actual MongoDB insertion
    /*
    const bcrypt = require('bcryptjs');
    const hashedPassword = await bcrypt.hash(userData.password, 10);
    
    const newUser: MongoUser = {
      name: userData.name,
      email: userData.email,
      password: hashedPassword,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    const db = await this.connect();
    const result = await db.collection(MONGODB_CONFIG.usersCollection).insertOne(newUser);
    
    return {
      id: result.insertedId.toString(),
      name: userData.name,
      email: userData.email,
      createdAt: new Date()
    };
    */
    
    // Simulated response for demo
    return {
      id: Date.now().toString(),
      name: userData.name,
      email: userData.email,
      createdAt: new Date()
    };
  }

  // Authenticate user login
  static async authenticateUser(credentials: LoginCredentials): Promise<User | null> {
    // TODO: Replace with actual MongoDB query and password verification
    /*
    const bcrypt = require('bcryptjs');
    const db = await this.connect();
    
    const user = await db.collection(MONGODB_CONFIG.usersCollection)
      .findOne({ email: credentials.email });
    
    if (!user) {
      return null;
    }
    
    const isPasswordValid = await bcrypt.compare(credentials.password, user.password);
    if (!isPasswordValid) {
      return null;
    }
    
    // Update last login
    await db.collection(MONGODB_CONFIG.usersCollection)
      .updateOne(
        { _id: user._id },
        { $set: { lastLogin: new Date(), updatedAt: new Date() } }
      );
    
    return {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      createdAt: user.createdAt
    };
    */
    
    // Simulated authentication for demo
    const storedUsers = JSON.parse(localStorage.getItem('users') || '[]') as MongoUser[];
    const user = storedUsers.find((u: MongoUser) => u.email === credentials.email);
    
    if (user && user.password === credentials.password) {
      return {
        id: user._id || user.email, // fallback to email if _id not present
        name: user.name,
        email: user.email,
        createdAt: new Date(user.createdAt)
      };
    }
    
    return null;
  }

  // Check if email already exists
  static async emailExists(email: string): Promise<boolean> {
    // TODO: Replace with actual MongoDB query
    /*
    const db = await this.connect();
    const user = await db.collection(MONGODB_CONFIG.usersCollection)
      .findOne({ email });
    
    return user !== null;
    */
    
    // Simulated check for demo
    const storedUsers = JSON.parse(localStorage.getItem('users') || '[]') as MongoUser[];
    return storedUsers.some((u: MongoUser) => u.email === email);
  }

  // Generate JWT token
  static generateToken(user: User): string {
    // TODO: Replace with actual JWT generation
    /*
    const jwt = require('jsonwebtoken');
    const secret = process.env.JWT_SECRET || 'your-secret-key';
    
    return jwt.sign(
      { 
        userId: user.id, 
        email: user.email 
      }, 
      secret, 
      { expiresIn: '7d' }
    );
    */
    
    // Simulated token for demo
    return btoa(JSON.stringify({ userId: user.id, email: user.email, exp: Date.now() + 7 * 24 * 60 * 60 * 1000 }));
  }

  // Verify JWT token
  static verifyToken(token: string): { userId: string; email: string } | null {
    // TODO: Replace with actual JWT verification
    /*
    const jwt = require('jsonwebtoken');
    const secret = process.env.JWT_SECRET || 'your-secret-key';
    
    try {
      const decoded = jwt.verify(token, secret);
      return decoded;
    } catch (error) {
      return null;
    }
    */
    
    // Simulated verification for demo
    try {
      const decoded = JSON.parse(atob(token));
      if (decoded.exp > Date.now()) {
        return { userId: decoded.userId, email: decoded.email };
      }
    } catch (error) {
      // Invalid token
    }
    return null;
  }
}

// Production setup instructions
export const PRODUCTION_SETUP = {
  dependencies: [
    'mongodb',           // MongoDB driver
    'bcryptjs',         // Password hashing
    'jsonwebtoken',     // JWT token management
    'express',          // Backend server framework
    'cors',             // Cross-origin resource sharing
    'helmet',           // Security headers
    'express-rate-limit' // Rate limiting for security
  ],
  
  environmentVariables: {
    MONGODB_URI: 'Your MongoDB connection string',
    JWT_SECRET: 'A secure random string for JWT signing',
    NODE_ENV: 'production',
    PORT: '3001'
  },
  
  securityConsiderations: [
    'Use HTTPS in production',
    'Implement rate limiting for auth endpoints',
    'Add input validation and sanitization',
    'Use secure HTTP headers (helmet.js)',
    'Implement proper error handling without exposing sensitive information',
    'Add logging for security events',
    'Consider implementing 2FA for enhanced security'
  ]
};