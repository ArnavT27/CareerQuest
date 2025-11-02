import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { AuthForm } from "@/components/AuthForm";
import { useAuth } from "@/contexts/AuthContext";
import heroImage from "@/assets/hero-image.jpg";

interface LandingProps {
  onStart: () => void;
}

export const Landing = ({ onStart }: LandingProps) => {
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const [isLoaded, setIsLoaded] = useState(false);
  const { login, signup, user, loading } = useAuth();

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    // Auto-redirect handled by Index.tsx and App.tsx routing
    // No need to call onStart here
  }, [user]);

  const handleAuth = async (data: { name?: string; email: string; password: string }) => {
    if (authMode === 'login') {
      await login(data.email, data.password);
    } else {
      if (!data.name) throw new Error('Name is required for signup');
      await signup(data.name, data.email, data.password);
    }
  };

  const toggleAuthMode = () => {
    setAuthMode(prev => prev === 'login' ? 'signup' : 'login');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/10 rounded-full blur-3xl animate-pulse-glow" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-secondary/10 rounded-full blur-3xl animate-pulse-glow" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-tertiary/5 rounded-full blur-3xl" />
      </div>
      
      <div className="w-full max-w-5xl relative z-10">
        <div className={`text-center mb-16 transition-all duration-1000 ${
          isLoaded ? 'animate-fade-in-up opacity-100' : 'opacity-0 translate-y-8'
        }`}>
          <div className="mb-12 relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-secondary/20 rounded-3xl blur-2xl group-hover:blur-xl transition-all duration-700" />
            <img
              src={heroImage}
              alt="Career exploration journey"
              className="w-full max-w-3xl mx-auto rounded-3xl shadow-card-hover relative z-10 group-hover:scale-[1.02] transition-transform duration-700"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-background/20 to-transparent rounded-3xl z-20" />
            
            {/* Floating elements */}
            <div className="absolute top-8 left-8 w-4 h-4 bg-primary rounded-full animate-pulse" />
            <div className="absolute top-16 right-12 w-3 h-3 bg-secondary rounded-full animate-pulse" style={{ animationDelay: '0.5s' }} />
            <div className="absolute bottom-12 left-16 w-2 h-2 bg-tertiary rounded-full animate-pulse" style={{ animationDelay: '1s' }} />
          </div>
          
          <div className="space-y-6">
            <h1 className="text-6xl md:text-7xl lg:text-8xl font-bold mb-8 bg-gradient-to-r from-primary via-secondary to-tertiary bg-clip-text text-transparent leading-none">
              Career Quest
            </h1>
            
            <div className="max-w-3xl mx-auto space-y-4">
              <p className="text-xl md:text-2xl text-muted-foreground leading-relaxed">
                Embark on an <span className="text-primary font-semibold">interactive journey</span> to discover your perfect career path through 
                personalized assessments and <span className="text-secondary font-semibold">AI-powered insights</span>.
              </p>
              
              <div className="flex flex-wrap justify-center gap-4 text-sm md:text-base text-muted-foreground/80">
                <div className="flex items-center gap-2 bg-primary/10 px-4 py-2 rounded-full">
                  <span className="w-2 h-2 bg-primary rounded-full"></span>
                  <span>15-20 min assessment</span>
                </div>
                <div className="flex items-center gap-2 bg-secondary/10 px-4 py-2 rounded-full">
                  <span className="w-2 h-2 bg-secondary rounded-full"></span>
                  <span>Personalized recommendations</span>
                </div>
                <div className="flex items-center gap-2 bg-tertiary/10 px-4 py-2 rounded-full">
                  <span className="w-2 h-2 bg-tertiary rounded-full"></span>
                  <span>Real industry insights</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className={`transition-all duration-1000 delay-300 ${
          isLoaded ? 'animate-scale-in opacity-100' : 'opacity-0 scale-95'
        }`}>
          <Card className="gradient-glass max-w-lg mx-auto border-0 relative overflow-hidden group">
            {/* Card glow effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-primary/20 via-transparent to-secondary/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            
            <div className="p-8 relative z-10">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold mb-3 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                  {authMode === 'login' ? 'Welcome Back' : 'Start Your Quest'}
                </h2>
                <p className="text-muted-foreground text-lg">
                  {authMode === 'login' 
                    ? 'Sign in to continue your career journey' 
                    : 'Create an account to begin your adventure'}
                </p>
              </div>
              
              <AuthForm 
                mode={authMode} 
                onSubmit={handleAuth}
                onToggleMode={toggleAuthMode}
                showHeader={false}
              />
              
              {/* Decorative elements */}
              <div className="flex justify-center space-x-8 text-xs text-muted-foreground/60 pt-4">
                <div className="flex items-center gap-1">
                  <div className="w-1 h-1 bg-primary rounded-full animate-pulse" />
                  <span>AI-Powered</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-1 h-1 bg-secondary rounded-full animate-pulse" style={{ animationDelay: '0.5s' }} />
                  <span>Personalized</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-1 h-1 bg-tertiary rounded-full animate-pulse" style={{ animationDelay: '1s' }} />
                  <span>Professional</span>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};