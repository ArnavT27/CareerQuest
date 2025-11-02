export interface User {
  id: string;
  name: string;
  email: string;
  createdAt: Date;
}

export interface AuthResponse {
  user: User;
  token: string;
}

// Mock API base URL - in production, this would be your actual backend URL
const API_BASE_URL = 'http://localhost:3001/api';

class AuthService {
  private async makeRequest(endpoint: string, options: RequestInit = {}) {
    const token = localStorage.getItem('token');
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Request failed');
      }
      
      return await response.json();
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Network error occurred');
    }
  }

  async login(email: string, password: string): Promise<AuthResponse> {
    // For demo purposes, simulate API call with localStorage
    return this.simulateAuth(email, password, 'login');
  }

  async signup(name: string, email: string, password: string): Promise<AuthResponse> {
    // For demo purposes, simulate API call with localStorage
    return this.simulateAuth(email, password, 'signup', name);
  }

  async getCurrentUser(): Promise<User> {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('No token found');
    }

    // For demo purposes, get user from localStorage
    const userData = localStorage.getItem('user');
    if (!userData) {
      throw new Error('User data not found');
    }

    return JSON.parse(userData);
  }

  // Simulate authentication with localStorage (for demo purposes)
  private async simulateAuth(
    email: string, 
    password: string, 
    type: 'login' | 'signup', 
    name?: string
  ): Promise<AuthResponse> {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        try {
          if (type === 'signup') {
            // Simulate signup
            if (!name || !email || !password) {
              reject(new Error('All fields are required'));
              return;
            }

            if (password.length < 6) {
              reject(new Error('Password must be at least 6 characters'));
              return;
            }

            // Check if user already exists
            const existingUsers = JSON.parse(localStorage.getItem('users') || '[]');
            if (existingUsers.some((u: User) => u.email === email)) {
              reject(new Error('User already exists with this email'));
              return;
            }

            // Create new user
            const newUser: User = {
              id: Date.now().toString(),
              name,
              email,
              createdAt: new Date(),
            };

            // Save to localStorage
            existingUsers.push(newUser);
            localStorage.setItem('users', JSON.stringify(existingUsers));
            localStorage.setItem('user', JSON.stringify(newUser));

            const token = this.generateToken(newUser.id);
            resolve({ user: newUser, token });
          } else {
            // Simulate login
            if (!email || !password) {
              reject(new Error('Email and password are required'));
              return;
            }

            const existingUsers = JSON.parse(localStorage.getItem('users') || '[]');
            const user = existingUsers.find((u: User) => u.email === email);

            if (!user) {
              reject(new Error('User not found'));
              return;
            }

            // In real app, you'd verify password hash
            if (password.length < 6) {
              reject(new Error('Invalid credentials'));
              return;
            }

            localStorage.setItem('user', JSON.stringify(user));
            const token = this.generateToken(user.id);
            resolve({ user, token });
          }
        } catch (error) {
          reject(new Error('Authentication failed'));
        }
      }, 1000); // Simulate network delay
    });
  }

  private generateToken(userId: string): string {
    // Simple token generation for demo - use proper JWT in production
    return btoa(`${userId}:${Date.now()}`);
  }

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }
}

export const authService = new AuthService();