import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';

interface AuthFormProps {
  mode: 'login' | 'signup';
  onSubmit: (data: AuthFormData) => Promise<void>;
  onToggleMode: () => void;
  loading?: boolean;
  showHeader?: boolean;
}

interface AuthFormData {
  name?: string;
  email: string;
  password: string;
}

export const AuthForm = ({ mode, onSubmit, onToggleMode, loading = false, showHeader = true }: AuthFormProps) => {
  const [formData, setFormData] = useState<AuthFormData>({
    name: '',
    email: '',
    password: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.email || !formData.password) {
      toast({
        title: 'Validation Error',
        description: 'Please fill in all required fields',
        variant: 'destructive',
      });
      return;
    }

    if (mode === 'signup' && !formData.name) {
      toast({
        title: 'Validation Error',
        description: 'Please enter your name',
        variant: 'destructive',
      });
      return;
    }

    if (formData.password.length < 6) {
      toast({
        title: 'Validation Error',
        description: 'Password must be at least 6 characters long',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit(formData);
      toast({
        title: 'Success!',
        description: mode === 'login' ? 'Welcome back!' : 'Account created successfully!',
      });
    } catch (error) {
      toast({
        title: 'Authentication Error',
        description: error instanceof Error ? error.message : 'Something went wrong',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: keyof AuthFormData) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [field]: e.target.value,
    }));
  };

  return (
    <Card className="gradient-glass max-w-lg mx-auto border-0 relative overflow-hidden group">
      {/* Card glow effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-primary/20 via-transparent to-secondary/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      
      <div className="p-8 relative z-10">
        <form onSubmit={handleSubmit} className="space-y-6">
          {showHeader && (
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold mb-3 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                {mode === 'login' ? 'Welcome Back' : 'Join Career Quest'}
              </h2>
              <p className="text-muted-foreground text-lg">
                {mode === 'login' 
                  ? 'Sign in to continue your career journey' 
                  : 'Create your account to start discovering your career path'
                }
              </p>
            </div>
          )}
          
          <div className="space-y-4">
            {mode === 'signup' && (
              <div className="relative">
                <Input
                  type="text"
                  placeholder="Full Name"
                  value={formData.name}
                  onChange={handleInputChange('name')}
                  className="text-lg h-14 bg-background/50 border-border/50 focus:border-primary/60 transition-all duration-300 rounded-xl backdrop-blur-sm px-6"
                  required={mode === 'signup'}
                />
                <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-secondary/10 rounded-xl opacity-0 focus-within:opacity-100 transition-opacity duration-300 pointer-events-none" />
              </div>
            )}
            
            <div className="relative">
              <Input
                type="email"
                placeholder="Email Address"
                value={formData.email}
                onChange={handleInputChange('email')}
                className="text-lg h-14 bg-background/50 border-border/50 focus:border-primary/60 transition-all duration-300 rounded-xl backdrop-blur-sm px-6"
                required
              />
              <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-secondary/10 rounded-xl opacity-0 focus-within:opacity-100 transition-opacity duration-300 pointer-events-none" />
            </div>
            
            <div className="relative">
              <Input
                type="password"
                placeholder="Password (min. 6 characters)"
                value={formData.password}
                onChange={handleInputChange('password')}
                className="text-lg h-14 bg-background/50 border-border/50 focus:border-primary/60 transition-all duration-300 rounded-xl backdrop-blur-sm px-6"
                required
                minLength={6}
              />
              <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-secondary/10 rounded-xl opacity-0 focus-within:opacity-100 transition-opacity duration-300 pointer-events-none" />
            </div>
          </div>
          
          <Button
            type="submit"
            size="lg"
            disabled={isSubmitting || loading}
            className="w-full h-14 text-lg font-semibold gradient-primary hover:shadow-primary transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] rounded-xl relative overflow-hidden group"
          >
            <span className="relative z-10">
              {isSubmitting 
                ? (mode === 'login' ? 'Signing In...' : 'Creating Account...') 
                : (mode === 'login' ? 'Sign In' : 'Create Account')
              }
            </span>
            <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
          </Button>
          
          <div className="text-center pt-4">
            <p className="text-muted-foreground">
              {mode === 'login' ? "Don't have an account?" : 'Already have an account?'}
              <button
                type="button"
                onClick={onToggleMode}
                className="ml-2 text-primary hover:text-primary/80 font-medium transition-colors duration-200"
              >
                {mode === 'login' ? 'Sign Up' : 'Sign In'}
              </button>
            </p>
          </div>
          
          {/* Decorative elements */}
          <div className="flex justify-center space-x-8 text-xs text-muted-foreground/60 pt-4">
            <div className="flex items-center gap-1">
              <div className="w-1 h-1 bg-primary rounded-full animate-pulse" />
              <span>Secure</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-1 h-1 bg-secondary rounded-full animate-pulse" style={{ animationDelay: '0.5s' }} />
              <span>Private</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-1 h-1 bg-tertiary rounded-full animate-pulse" style={{ animationDelay: '1s' }} />
              <span>Protected</span>
            </div>
          </div>
        </form>
      </div>
    </Card>
  );
};