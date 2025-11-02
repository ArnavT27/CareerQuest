import { useState, useEffect } from "react";
import { QuestCard } from "@/components/QuestCard";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import talentsImage from "@/assets/talents-path.jpg";
import scenariosImage from "@/assets/scenarios-path.jpg";

interface PathSelectionProps {
  userName: string;
  onSelectPath: (path: "talents" | "scenarios") => void;
  onBack: () => void;
  onNavigateToExpertConnect?: () => void;
}

export const PathSelection = ({ userName, onSelectPath, onBack, onNavigateToExpertConnect }: PathSelectionProps) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);
  const { logout } = useAuth();

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  const handleLogout = () => {
    logout();
    onBack(); // This will take them back to the landing page
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      {/* Logout button in top-right corner */}
      <div className="absolute top-4 right-4 z-20">
        <Button
          variant="outline"
          onClick={handleLogout}
          className="border-border/50 hover:border-destructive/50 hover:bg-destructive/5 hover:text-destructive transition-all duration-300 px-4 py-2 rounded-xl backdrop-blur-sm bg-background/80"
        >
          Logout
        </Button>
      </div>

      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-20 w-60 h-60 bg-primary/5 rounded-full blur-3xl animate-pulse-glow" />
        <div className="absolute bottom-20 right-20 w-60 h-60 bg-secondary/5 rounded-full blur-3xl animate-pulse-glow" style={{ animationDelay: '1s' }} />
      </div>
      
      <div className="w-full max-w-7xl relative z-10">
        <div className={`text-center mb-16 transition-all duration-1000 ${
          isLoaded ? 'animate-fade-in-up opacity-100' : 'opacity-0 translate-y-8'
        }`}>
          <div className="space-y-6">
            <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-primary via-secondary to-tertiary bg-clip-text text-transparent leading-tight">
              Welcome, <span className="text-primary relative">
                {userName}
                <div className="absolute -bottom-2 left-0 right-0 h-1 bg-gradient-to-r from-primary/50 to-secondary/50 rounded-full" />
              </span>!
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Choose your <span className="text-primary font-semibold">adventure path</span> to discover your ideal career direction
            </p>
            
            {/* Progress indicators */}
            <div className="flex justify-center space-x-3 pt-4">
              <div className="w-3 h-3 bg-primary rounded-full" />
              <div className="w-3 h-3 bg-muted rounded-full" />
              <div className="w-3 h-3 bg-muted rounded-full" />
            </div>
          </div>
        </div>

        <div className={`grid lg:grid-cols-2 gap-8 mb-12 transition-all duration-1000 delay-300 ${
          isLoaded ? 'animate-scale-in opacity-100' : 'opacity-0 scale-95'
        }`}>
          <QuestCard
            variant="primary"
            onClick={() => onSelectPath("talents")}
            className="group relative overflow-hidden transition-all duration-500 hover:scale-[1.02]"
            onMouseEnter={() => setHoveredCard('talents')}
            onMouseLeave={() => setHoveredCard(null)}
          >
            <div className="text-center relative z-10">
              <div className="relative mb-8 overflow-hidden rounded-2xl group-hover:scale-105 transition-transform duration-700">
                <img
                  src={talentsImage}
                  alt="Unlock your talents"
                  className="w-full h-56 object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-primary/40 via-transparent to-transparent" />
                <div className="absolute top-4 right-4 bg-primary/20 backdrop-blur-sm rounded-full p-3">
                  <span className="text-2xl">🎯</span>
                </div>
                {/* Hover overlay */}
                <div className={`absolute inset-0 bg-gradient-to-t from-primary/60 to-transparent transition-opacity duration-300 ${
                  hoveredCard === 'talents' ? 'opacity-100' : 'opacity-0'
                }`} />
              </div>
              
              <div className="space-y-6">
                <h2 className="text-3xl font-bold text-primary flex items-center justify-center gap-3">
                  <span className="text-4xl">🎯</span>
                  Unlock Your Talents
                </h2>
                
                <p className="text-muted-foreground text-lg leading-relaxed">
                  Discover your unique skills through <span className="text-primary font-medium">interactive assessments</span>. 
                  Select your top abilities and take personalized quizzes to reveal 
                  career paths that match your strengths.
                </p>
                
                <div className="gradient-glass rounded-2xl p-6 space-y-4">
                  <h3 className="font-semibold text-primary mb-4">What You'll Experience:</h3>
                  <div className="grid grid-cols-1 gap-3 text-sm">
                    <div className="flex items-center gap-3 text-left group">
                      <div className="w-2 h-2 bg-primary rounded-full group-hover:scale-125 transition-transform" />
                      <span>Select 5 skills from 15 options</span>
                    </div>
                    <div className="flex items-center gap-3 text-left group">
                      <div className="w-2 h-2 bg-primary rounded-full group-hover:scale-125 transition-transform" />
                      <span>Two-phase quiz system (50 questions)</span>
                    </div>
                    <div className="flex items-center gap-3 text-left group">
                      <div className="w-2 h-2 bg-primary rounded-full group-hover:scale-125 transition-transform" />
                      <span>Personalized career recommendations</span>
                    </div>
                    <div className="flex items-center gap-3 text-left group">
                      <div className="w-2 h-2 bg-primary rounded-full group-hover:scale-125 transition-transform" />
                      <span>Real job listings and industry insights</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center justify-center gap-3">
                  <div className="flex items-center gap-2 bg-primary/10 px-4 py-2 rounded-full">
                    <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                    <span className="text-primary font-medium text-sm">Est. time: 15-20 minutes</span>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Card background effect */}
            <div className={`absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent transition-opacity duration-300 ${
              hoveredCard === 'talents' ? 'opacity-100' : 'opacity-0'
            }`} />
          </QuestCard>

          <QuestCard
            variant="secondary"
            onClick={() => onSelectPath("scenarios")}
            className="group relative overflow-hidden transition-all duration-500 hover:scale-[1.02]"
            onMouseEnter={() => setHoveredCard('scenarios')}
            onMouseLeave={() => setHoveredCard(null)}
          >
            <div className="text-center relative z-10">
              <div className="relative mb-8 overflow-hidden rounded-2xl group-hover:scale-105 transition-transform duration-700">
                <img
                  src={scenariosImage}
                  alt="Real-life scenarios"
                  className="w-full h-56 object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-secondary/40 via-transparent to-transparent" />
                <div className="absolute top-4 right-4 bg-secondary/20 backdrop-blur-sm rounded-full p-3">
                  <span className="text-2xl">🏢</span>
                </div>
                {/* Hover overlay */}
                <div className={`absolute inset-0 bg-gradient-to-t from-secondary/60 to-transparent transition-opacity duration-300 ${
                  hoveredCard === 'scenarios' ? 'opacity-100' : 'opacity-0'
                }`} />
              </div>
              
              <div className="space-y-6">
                <h2 className="text-3xl font-bold text-secondary flex items-center justify-center gap-3">
                  <span className="text-4xl">🏢</span>
                  Real-Life Scenarios
                </h2>
                
                <p className="text-muted-foreground text-lg leading-relaxed">
                  Explore workplace situations in your field of interest. 
                  <span className="text-secondary font-medium">AI generates custom scenarios</span> to reveal your problem-solving style 
                  and professional personality.
                </p>
                
                <div className="gradient-glass rounded-2xl p-6 space-y-4">
                  <h3 className="font-semibold text-secondary mb-4">What You'll Experience:</h3>
                  <div className="grid grid-cols-1 gap-3 text-sm">
                    <div className="flex items-center gap-3 text-left group">
                      <div className="w-2 h-2 bg-secondary rounded-full group-hover:scale-125 transition-transform" />
                      <span>Enter your field of interest</span>
                    </div>
                    <div className="flex items-center gap-3 text-left group">
                      <div className="w-2 h-2 bg-secondary rounded-full group-hover:scale-125 transition-transform" />
                      <span>AI-generated workplace scenarios</span>
                    </div>
                    <div className="flex items-center gap-3 text-left group">
                      <div className="w-2 h-2 bg-secondary rounded-full group-hover:scale-125 transition-transform" />
                      <span>Multiple choice decision-making</span>
                    </div>
                    <div className="flex items-center gap-3 text-left group">
                      <div className="w-2 h-2 bg-secondary rounded-full group-hover:scale-125 transition-transform" />
                      <span>Personality and style analysis</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center justify-center gap-3">
                  <div className="flex items-center gap-2 bg-secondary/10 px-4 py-2 rounded-full">
                    <div className="w-2 h-2 bg-secondary rounded-full animate-pulse" />
                    <span className="text-secondary font-medium text-sm">Est. time: 10-15 minutes</span>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Card background effect */}
            <div className={`absolute inset-0 bg-gradient-to-br from-secondary/5 to-transparent transition-opacity duration-300 ${
              hoveredCard === 'scenarios' ? 'opacity-100' : 'opacity-0'
            }`} />
          </QuestCard>
        </div>

        <div className={`text-center transition-all duration-1000 delay-500 ${
          isLoaded ? 'animate-fade-in-up opacity-100' : 'opacity-0 translate-y-8'
        }`}>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            {onNavigateToExpertConnect && (
              <Button
                onClick={onNavigateToExpertConnect}
                className="gradient-primary hover:shadow-primary transition-all duration-300 px-8 py-3 rounded-xl"
              >
                👥 Connect with Experts
              </Button>
            )}
            <Button
              variant="outline"
              onClick={onBack}
              className="border-border/50 hover:border-primary/50 hover:bg-primary/5 transition-all duration-300 px-8 py-3 rounded-xl backdrop-blur-sm"
            >
              ← Back to Start
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};