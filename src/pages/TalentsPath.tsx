import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { QuestCard } from "@/components/QuestCard";
import { ProgressBar } from "@/components/ProgressBar";
import { AdaptiveQuiz, QuizResponse } from "@/components/AdaptiveQuiz";
import { ResultsDisplay } from "@/components/ResultsDisplay";
import { geminiService, CareerAnalysis, testGeminiAPI } from "@/services/geminiService";
import { useToast } from "@/hooks/use-toast";

interface TalentsPathProps {
  userName: string;
  onBack: () => void;
}

const SKILLS = [
  { id: "leadership", name: "Leadership", icon: "👥" },
  { id: "communication", name: "Communication", icon: "💬" },
  { id: "problem-solving", name: "Problem Solving", icon: "🧩" },
  { id: "creativity", name: "Creativity", icon: "🎨" },
  { id: "technical", name: "Technical Skills", icon: "⚙️" },
  { id: "analytics", name: "Data Analytics", icon: "📊" },
  { id: "design", name: "Design", icon: "✨" },
  { id: "writing", name: "Writing", icon: "✍️" },
  { id: "marketing", name: "Marketing", icon: "📢" },
  { id: "sales", name: "Sales", icon: "💼" },
  { id: "project-management", name: "Project Management", icon: "📋" },
  { id: "research", name: "Research", icon: "🔍" },
  { id: "teaching", name: "Teaching", icon: "🎓" },
  { id: "finance", name: "Finance", icon: "💰" },
  { id: "strategy", name: "Strategy", icon: "🎯" },
];

type Phase = "skill-selection" | "quiz-phase-1" | "analysis" | "quiz-phase-2" | "final-analysis" | "results";

export const TalentsPath = ({ userName, onBack }: TalentsPathProps) => {
  const [phase, setPhase] = useState<Phase>("skill-selection");
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [phase1Responses, setPhase1Responses] = useState<QuizResponse[]>([]);
  const [phase2Responses, setPhase2Responses] = useState<QuizResponse[]>([]);
  const [topSkills, setTopSkills] = useState<string[]>([]);
  const [careerAnalysis, setCareerAnalysis] = useState<CareerAnalysis | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const { toast } = useToast();

  const handleSkillToggle = (skillId: string) => {
    setSelectedSkills(prev => {
      if (prev.includes(skillId)) {
        return prev.filter(id => id !== skillId);
      } else if (prev.length < 5) {
        return [...prev, skillId];
      }
      return prev;
    });
  };

  const handleContinueToQuiz = () => {
    if (selectedSkills.length === 5) {
      setPhase("quiz-phase-1");
    }
  };

  const handlePhase1Complete = async (responses: QuizResponse[]) => {
    console.log('✅ Phase 1 complete with', responses.length, 'responses');
    setPhase1Responses(responses);
    setIsAnalyzing(true);
    setPhase("analysis");

    try {
      // Find top 2 skills from the 20 responses
      console.log('🧠 Analyzing responses to find top skills...');
      const topTwoSkills = await geminiService.findTopSkills(responses);
      
      console.log('🏆 Analysis result:', topTwoSkills);
      
      // Validate that we have exactly 2 skills
      if (!topTwoSkills || topTwoSkills.length < 2) {
        console.log('⚠️ Invalid skills result, using fallback');
        const fallbackSkills = geminiService.getFallbackTopSkills(responses);
        setTopSkills(fallbackSkills);
        
        toast({
          title: "⚠️ Analysis Complete (Fallback)",
          description: `Using backup analysis. Your top skills: ${fallbackSkills.join(' & ')}`,
          variant: "default",
        });
      } else {
        setTopSkills(topTwoSkills);
        
        toast({
          title: "✅ Analysis Complete!",
          description: `Your top skills are: ${topTwoSkills.join(' & ')}`,
        });
      }

      // Always proceed to phase 2
      console.log('➡️ Proceeding to Phase 2...');
      setPhase("quiz-phase-2");
    } catch (error) {
      console.error('❌ Phase 1 analysis error:', error);
      
      // Use fallback skills analysis
      console.log('🔄 Using emergency fallback analysis...');
      const emergencySkills = geminiService.getFallbackTopSkills(responses);
      setTopSkills(emergencySkills);
      
      toast({
        title: "Analysis Complete (Backup)", 
        description: `Using offline analysis. Your top skills: ${emergencySkills.join(' & ')}`,
        variant: "default",
      });
      
      // Still proceed to phase 2 with fallback skills
      setPhase("quiz-phase-2");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handlePhase2Complete = async (responses: QuizResponse[]) => {
    setPhase2Responses(responses);
    setIsAnalyzing(true);
    setPhase("final-analysis");

    try {
      toast({
        title: "🤖 Generating Your Career Report",
        description: "AI is creating your comprehensive career analysis...",
      });
      
      const allResponses = [...phase1Responses, ...responses];
      const analysis = await geminiService.analyzeCareerFit(
        topSkills,
        allResponses,
        { name: userName }
      );
      setCareerAnalysis(analysis);
      setPhase("results");
      
      toast({
        title: "✅ Analysis Complete!",
        description: "Your personalized career report is ready to view.",
      });
    } catch (error) {
      console.error('Career analysis error:', error);
      toast({
        title: "Analysis Error",
        description: "The AI service is currently overloaded. Your report will be generated with backup data.",
        variant: "destructive",
      });
      
      // Don't prevent showing results - the service should return fallback data
      setPhase("results");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleRestart = () => {
    setPhase("skill-selection");
    setSelectedSkills([]);
    setPhase1Responses([]);
    setPhase2Responses([]);
    setTopSkills([]);
    setCareerAnalysis(null);
  };

  const getProgress = () => {
    switch (phase) {
      case "skill-selection": return 10;
      case "quiz-phase-1": return 10 + (phase1Responses.length / 20) * 30;
      case "analysis": return 40;
      case "quiz-phase-2": return 45 + (phase2Responses.length / 30) * 35;
      case "final-analysis": return 80;
      case "results": return 100;
      default: return 0;
    }
  };

  const renderSkillSelection = () => (
    <div className="max-w-5xl mx-auto">
      <div className="text-center mb-16">
        <div className="space-y-8">
          {/* Main title with enhanced styling */}
          <div className="relative">
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold bg-gradient-to-r from-primary via-secondary to-tertiary bg-clip-text text-transparent mb-4">
              Select Your Top 5 Skills
            </h2>
            <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 w-24 h-1 bg-gradient-to-r from-primary to-secondary rounded-full opacity-60" />
          </div>
          
          {/* Enhanced description */}
          <div className="max-w-3xl mx-auto">
            <p className="text-xl md:text-2xl text-muted-foreground leading-relaxed">
              Choose the abilities that best represent your{' '}
              <span className="text-primary font-semibold bg-primary/10 px-3 py-1 rounded-full border border-primary/20">
                strengths
              </span>{' '}
              and{' '}
              <span className="text-secondary font-semibold bg-secondary/10 px-3 py-1 rounded-full border border-secondary/20">
                interests
              </span>
            </p>
          </div>
          
          {/* Enhanced progress indicator */}
          <div className="flex justify-center items-center gap-6 bg-gradient-card rounded-2xl p-6 border border-border/30 backdrop-blur-sm">
            <span className="text-sm font-medium text-muted-foreground">Progress:</span>
            <div className="flex gap-3">
              {Array.from({ length: 5 }, (_, i) => {
                const isCompleted = i < selectedSkills.length;
                const isActive = i === selectedSkills.length;
                
                return (
                  <div 
                    key={i} 
                    className={`relative transition-all duration-500 ${
                      isCompleted 
                        ? 'w-4 h-4 bg-gradient-to-br from-primary to-secondary rounded-full scale-110 shadow-primary' 
                        : isActive
                        ? 'w-3 h-3 bg-gradient-to-br from-primary/50 to-secondary/50 rounded-full scale-105 animate-pulse'
                        : 'w-3 h-3 bg-muted rounded-full'
                    }`} 
                  >
                    {isCompleted && (
                      <div className="absolute inset-0 bg-gradient-to-br from-primary to-secondary rounded-full animate-scale-in" />
                    )}
                  </div>
                );
              })}
            </div>
            <div className="flex items-center gap-2">
              <span className={`text-sm font-bold transition-colors duration-300 ${
                selectedSkills.length === 5 ? 'text-primary' : 'text-muted-foreground'
              }`}>
                {selectedSkills.length}/5
              </span>
              {selectedSkills.length === 5 && (
                <span className="text-lg animate-bounce">🎉</span>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-5 md:gap-6 lg:gap-8 mb-12 px-2 sm:px-4">
        {SKILLS.map((skill, index) => {
          const isSelected = selectedSkills.includes(skill.id);
          const selectionIndex = selectedSkills.indexOf(skill.id);
          
          return (
            <div
              key={skill.id}
              className={`skill-circle group relative ${
                isSelected ? 'selected animate-skill-bounce' : ''
              } hover:animate-skill-wiggle focus-primary`}
              onClick={() => {
                handleSkillToggle(skill.id);
                // Add a small bounce animation on click
                const element = document.querySelector(`[data-skill="${skill.id}"]`);
                if (element) {
                  element.classList.add('animate-skill-bounce');
                  setTimeout(() => {
                    element.classList.remove('animate-skill-bounce');
                  }, 1200);
                }
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  handleSkillToggle(skill.id);
                }
              }}
              data-skill={skill.id}
              tabIndex={0}
              role="button"
              aria-pressed={isSelected}
              aria-label={`${skill.name} skill - ${isSelected ? 'selected' : 'not selected'}`}
              style={{ 
                animationDelay: `${index * 80}ms`,
                willChange: 'transform'
              }}
            >
              {/* Enhanced selection indicator with order number */}
              {isSelected && (
                <div className="absolute -top-2 -right-2 w-6 h-6 sm:w-7 sm:h-7 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center text-white text-xs font-bold shadow-lg border-2 border-background animate-scale-in z-20">
                  {selectionIndex + 1}
                </div>
              )}
              
              {/* Icon and text container */}
              <div className="text-center">
                <div className="skill-icon">
                  {skill.icon}
                </div>
                <div className="skill-label">
                  {skill.name}
                </div>
              </div>
              
              {/* Enhanced ripple effect */}
              <div className="absolute inset-0 rounded-inherit opacity-0 group-active:opacity-100 bg-gradient-to-br from-primary/20 via-secondary/10 to-transparent animate-ping pointer-events-none" />
              
              {/* Floating particles for selected state */}
              {isSelected && (
                <>
                  <div className="absolute -top-1 -left-1 w-1.5 h-1.5 bg-primary/60 rounded-full animate-float" style={{ animationDelay: '0s', animationDuration: '2s' }} />
                  <div className="absolute -bottom-1 -right-1 w-1 h-1 bg-secondary/60 rounded-full animate-float" style={{ animationDelay: '0.7s', animationDuration: '2.5s' }} />
                  <div className="absolute top-1 -right-1 w-0.5 h-0.5 bg-tertiary/60 rounded-full animate-float" style={{ animationDelay: '1.2s', animationDuration: '1.8s' }} />
                </>
              )}
            </div>
          );
        })}
      </div>

      <div className="text-center space-y-10">
        {/* Enhanced continue section */}
        <div className="relative max-w-md mx-auto">
          <div className="gradient-glass p-8 rounded-3xl border border-border/30 backdrop-blur-sm">
            <Button
              onClick={handleContinueToQuiz}
              disabled={selectedSkills.length !== 5}
              size="lg"
              className={`w-full px-8 py-6 text-lg font-bold rounded-2xl transition-all duration-700 relative overflow-hidden group ${
                selectedSkills.length === 5 
                  ? 'gradient-primary hover:shadow-2xl hover:shadow-primary/25 hover:scale-105 border-2 border-primary/50' 
                  : 'bg-muted/50 text-muted-foreground cursor-not-allowed border-2 border-muted/30'
              }`}
            >
              <span className="relative z-10 flex items-center justify-center gap-4">
                <span>Continue to Assessment</span>
                {selectedSkills.length === 5 ? (
                  <span className="text-2xl animate-bounce">🚀</span>
                ) : (
                  <span className="text-lg opacity-50">🔒</span>
                )}
              </span>
              
              {/* Enhanced shimmer effect */}
              {selectedSkills.length === 5 && (
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 ease-out" />
              )}
              
              {/* Glow effect */}
              {selectedSkills.length === 5 && (
                <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-secondary/20 rounded-2xl blur-xl scale-110 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              )}
            </Button>
            
            {/* Status message */}
            <div className="mt-6 min-h-[2rem] flex items-center justify-center">
              {selectedSkills.length < 5 ? (
                <p className="text-sm text-muted-foreground flex items-center gap-2">
                  <span className="w-2 h-2 bg-muted rounded-full animate-pulse" />
                  Select {5 - selectedSkills.length} more skill{5 - selectedSkills.length !== 1 ? 's' : ''} to continue
                </p>
              ) : (
                <p className="text-sm text-primary font-medium flex items-center gap-2">
                  <span className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                  Ready to begin your assessment! 🎯
                </p>
              )}
            </div>
          </div>
          
          {/* Decorative elements */}
          {selectedSkills.length === 5 && (
            <>
              <div className="absolute -top-2 -left-2 w-4 h-4 bg-primary/30 rounded-full animate-float" style={{ animationDuration: '3s' }} />
              <div className="absolute -bottom-2 -right-2 w-3 h-3 bg-secondary/30 rounded-full animate-float" style={{ animationDuration: '2.5s', animationDelay: '0.5s' }} />
              <div className="absolute top-1/2 -left-4 w-2 h-2 bg-tertiary/30 rounded-full animate-float" style={{ animationDuration: '2s', animationDelay: '1s' }} />
            </>
          )}
        </div>
      </div>
    </div>
  );

  const renderAnalyzing = () => {
    const isInitialAnalysis = phase === "analysis";
    const isFinalAnalysis = phase === "final-analysis";
    
    // Enhanced animation for final analysis (after deep dive phase)
    if (isFinalAnalysis) {
      return (
        <div className="max-w-4xl mx-auto text-center">
          <div className="gradient-glass p-16 rounded-3xl border-0 relative overflow-hidden">
            {/* Enhanced Background animation for final analysis */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-secondary/10 to-tertiary/10 animate-pulse" />
            <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-primary/5 to-transparent animate-pulse" style={{ animationDelay: '1s' }} />
            
            {/* Floating particles effect */}
            <div className="absolute inset-0 overflow-hidden">
              {Array.from({ length: 12 }, (_, i) => (
                <div 
                  key={i}
                  className="absolute w-2 h-2 bg-primary/30 rounded-full animate-float"
                  style={{
                    left: `${10 + (i * 7)}%`,
                    top: `${20 + (i % 3) * 20}%`,
                    animationDelay: `${i * 0.5}s`,
                    animationDuration: `${3 + (i % 3)}s`
                  }}
                />
              ))}
            </div>
            
            <div className="relative z-10 space-y-10">
              {/* Enhanced animated icon with rotation */}
              <div className="relative">
                <div className="w-24 h-24 bg-gradient-to-br from-primary to-secondary rounded-full mx-auto flex items-center justify-center animate-spin-slow shadow-2xl">
                  <div className="w-20 h-20 bg-gradient-to-tr from-white/20 to-transparent rounded-full flex items-center justify-center">
                    <span className="text-4xl animate-bounce">🤖</span>
                  </div>
                </div>
                <div className="absolute inset-0 w-24 h-24 bg-primary/20 rounded-full mx-auto animate-ping" />
                <div className="absolute -inset-4 w-32 h-32 bg-gradient-to-r from-primary/10 to-secondary/10 rounded-full mx-auto animate-pulse" style={{ animationDelay: '0.5s' }} />
              </div>
              
              <div className="space-y-6">
                <div className="space-y-4">
                  <h2 className="text-4xl font-bold bg-gradient-to-r from-primary via-secondary to-tertiary bg-clip-text text-transparent animate-pulse">
                    🤖 Crafting Your Career Blueprint
                  </h2>
                  <p className="text-xl text-muted-foreground leading-relaxed max-w-2xl mx-auto">
                    Our AI is analyzing your <span className="text-primary font-semibold">{topSkills.join(' & ')}</span> expertise 
                    to create a comprehensive career roadmap tailored just for you.
                  </p>
                  <div className="flex justify-center gap-2 mt-4">
                    {topSkills.map((skill, index) => (
                      <div key={skill} className="bg-primary/20 px-4 py-2 rounded-full border border-primary/30 animate-pulse" style={{ animationDelay: `${index * 0.2}s` }}>
                        <span className="text-sm font-medium text-primary">{skill}</span>
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Enhanced status indicator */}
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                  <div className="flex items-center justify-center gap-3 mb-4">
                    <div className="flex gap-2">
                      <div className="w-3 h-3 bg-primary rounded-full animate-pulse" />
                      <div className="w-3 h-3 bg-secondary rounded-full animate-pulse" style={{ animationDelay: '0.3s' }} />
                      <div className="w-3 h-3 bg-tertiary rounded-full animate-pulse" style={{ animationDelay: '0.6s' }} />
                    </div>
                    <span className="text-lg font-medium text-primary">AI Processing...</span>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Analyzing {phase1Responses.length + phase2Responses.length} assessment responses
                  </div>
                </div>
              </div>
              
              {/* Enhanced progress steps with animations */}
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mt-12">
                <div className="bg-gradient-to-br from-primary/20 to-primary/5 p-4 rounded-xl border border-primary/30 animate-slide-in-left">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center animate-spin-slow">
                      <span className="text-sm font-bold text-white">🧠</span>
                    </div>
                    <span className="font-semibold text-primary">Deep Analysis</span>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Processing 50 data points from your responses to understand your unique strengths
                  </p>
                  <div className="mt-3 h-1 bg-primary/20 rounded-full overflow-hidden">
                    <div className="h-full bg-primary rounded-full animate-progress-fill" style={{ width: '85%' }} />
                  </div>
                </div>
                
                <div className="bg-gradient-to-br from-secondary/20 to-secondary/5 p-4 rounded-xl border border-secondary/30 animate-slide-in-left" style={{ animationDelay: '0.2s' }}>
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-8 h-8 bg-secondary rounded-full flex items-center justify-center animate-pulse">
                      <span className="text-sm font-bold text-white">🔍</span>
                    </div>
                    <span className="font-semibold text-secondary">Career Matching</span>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Scanning 1000+ career paths to find your perfect professional matches
                  </p>
                  <div className="mt-3 h-1 bg-secondary/20 rounded-full overflow-hidden">
                    <div className="h-full bg-secondary rounded-full animate-progress-fill" style={{ width: '70%', animationDelay: '0.5s' }} />
                  </div>
                </div>
                
                <div className="bg-gradient-to-br from-tertiary/20 to-tertiary/5 p-4 rounded-xl border border-tertiary/30 animate-slide-in-left" style={{ animationDelay: '0.4s' }}>
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-8 h-8 bg-tertiary rounded-full flex items-center justify-center animate-bounce">
                      <span className="text-sm font-bold text-white">📊</span>
                    </div>
                    <span className="font-semibold text-tertiary">Market Intelligence</span>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Gathering real-time salary data, growth trends, and industry insights
                  </p>
                  <div className="mt-3 h-1 bg-tertiary/20 rounded-full overflow-hidden">
                    <div className="h-full bg-tertiary rounded-full animate-progress-fill" style={{ width: '60%', animationDelay: '1s' }} />
                  </div>
                </div>
                
                <div className="bg-gradient-to-br from-quest-success/20 to-quest-success/5 p-4 rounded-xl border border-quest-success/30 animate-slide-in-left" style={{ animationDelay: '0.6s' }}>
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-8 h-8 bg-quest-success rounded-full flex items-center justify-center animate-pulse">
                      <span className="text-sm font-bold text-white">✨</span>
                    </div>
                    <span className="font-semibold text-quest-success">Report Assembly</span>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Compiling your personalized career roadmap with actionable insights
                  </p>
                  <div className="mt-3 h-1 bg-quest-success/20 rounded-full overflow-hidden">
                    <div className="h-full bg-quest-success rounded-full animate-progress-fill" style={{ width: '45%', animationDelay: '1.5s' }} />
                  </div>
                </div>
              </div>
              
              {/* Estimated time and encouragement */}
              <div className="mt-8 p-4 bg-white/5 rounded-xl border border-white/10">
                <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                  <span className="animate-pulse">⏱️</span>
                  <span>Estimated completion: 15-30 seconds</span>
                  <span className="animate-pulse">|</span>
                  <span className="text-primary font-medium">Hang tight, magic is happening!</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }
    
    // Original initial analysis animation
    return (
      <div className="max-w-3xl mx-auto text-center">
        <div className="gradient-glass p-12 rounded-3xl border-0 relative overflow-hidden">
          {/* Background animation */}
          <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-secondary/5 to-tertiary/5 animate-pulse" />
          
          <div className="relative z-10 space-y-8">
            {/* Animated icon */}
            <div className="relative">
              <div className="w-20 h-20 bg-gradient-primary rounded-full mx-auto flex items-center justify-center animate-bounce">
                <span className="text-3xl">🔍</span>
              </div>
              <div className="absolute inset-0 w-20 h-20 bg-primary/20 rounded-full mx-auto animate-ping" />
            </div>
            
            <div className="space-y-4">
              <h2 className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                🔍 Finding Your Top Skills
              </h2>
              <p className="text-lg text-muted-foreground leading-relaxed">
                AI is analyzing your responses to identify your strongest skills...
              </p>
            </div>
            
            {/* Progress steps */}
            <div className="grid grid-cols-2 gap-6 text-sm mt-8">
              <div className="gradient-card p-4 rounded-xl border border-border/30">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                  <span className="font-medium">Response Analysis</span>
                </div>
                <p className="text-xs text-muted-foreground">Processing your answers</p>
              </div>
              <div className="gradient-card p-4 rounded-xl border border-border/30">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-2 h-2 bg-secondary rounded-full animate-pulse" style={{ animationDelay: '0.5s' }} />
                  <span className="font-medium">Skill Ranking</span>
                </div>
                <p className="text-xs text-muted-foreground">Identifying strengths</p>
              </div>
              <div className="gradient-card p-4 rounded-xl border border-border/30">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-2 h-2 bg-tertiary rounded-full animate-pulse" style={{ animationDelay: '1s' }} />
                  <span className="font-medium">Pattern Matching</span>
                </div>
                <p className="text-xs text-muted-foreground">Finding best matches</p>
              </div>
              <div className="gradient-card p-4 rounded-xl border border-border/30">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-2 h-2 bg-quest-success rounded-full animate-pulse" style={{ animationDelay: '1.5s' }} />
                  <span className="font-medium">Top 2 Selection</span>
                </div>
                <p className="text-xs text-muted-foreground">Final selection</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen p-4 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 right-20 w-40 h-40 bg-primary/5 rounded-full blur-3xl animate-pulse-glow" />
        <div className="absolute bottom-20 left-20 w-40 h-40 bg-secondary/5 rounded-full blur-3xl animate-pulse-glow" style={{ animationDelay: '1s' }} />
      </div>
      
      <div className="w-full max-w-7xl mx-auto relative z-10">
        {/* Enhanced Header */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <Button 
              variant="outline" 
              onClick={onBack}
              className="border-border/50 hover:border-primary/50 hover:bg-primary/5 transition-all duration-300 px-6 py-3 rounded-xl backdrop-blur-sm"
            >
              ← Back to Paths
            </Button>
            
            <div className="text-center">
              <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                {userName}'s Talent Discovery
              </h1>
            </div>
            
            <div className="w-32"></div>
          </div>
          
          <div className="space-y-4">
            <ProgressBar 
              progress={getProgress()} 
              variant="primary" 
              size="lg"
              showPercentage={false}
              className="mb-2" 
            />
            <div className="text-center">
              <p className="text-sm text-muted-foreground">
                <span className="font-medium text-primary">{Math.round(getProgress())}% Complete</span>
                {phase === 'skill-selection' && ' - Choose your strongest skills'}
                {phase === 'quiz-phase-1' && ' - First assessment phase'}
                {phase === 'analysis' && ' - Analyzing your responses'}
                {phase === 'quiz-phase-2' && ' - Deep dive assessment'}
                {phase === 'final-analysis' && ' - Generating your report'}
                {phase === 'results' && ' - Your career profile is ready!'}
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="animate-fade-in-up">
          {phase === "skill-selection" && renderSkillSelection()}
          
          {phase === "quiz-phase-1" && (
            <div className="space-y-8">
              <div className="text-center mb-8">
                <div className="gradient-glass p-8 rounded-3xl max-w-2xl mx-auto border-0">
                  <h2 className="text-3xl font-bold mb-4 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                    Phase 1: Skill Assessment
                  </h2>
                  <p className="text-lg text-muted-foreground leading-relaxed">
                    <span className="text-primary font-medium">20 questions</span> to identify your strongest skills from your selected areas
                  </p>
                  
                  {/* Skills badges */}
                  <div className="flex flex-wrap justify-center gap-2 mt-6">
                    {selectedSkills.map((skillId) => {
                      const skill = SKILLS.find(s => s.id === skillId);
                      return skill ? (
                        <div key={skillId} className="flex items-center gap-2 bg-primary/10 px-3 py-1 rounded-full">
                          <span>{skill.icon}</span>
                          <span className="text-sm font-medium">{skill.name}</span>
                        </div>
                      ) : null;
                    })}
                  </div>
                </div>
              </div>
              
              <AdaptiveQuiz
                selectedSkills={selectedSkills}
                onComplete={handlePhase1Complete}
                phase="initial"
                totalQuestions={20}
                useGeminiGeneration={true}
              />
            </div>
          )}
          
          {(phase === "analysis" || phase === "final-analysis") && renderAnalyzing()}
          
          {phase === "quiz-phase-2" && (
            <div className="space-y-8">
              {topSkills.length > 0 ? (
                <>
                  <div className="text-center mb-8">
                    <div className="gradient-glass p-8 rounded-3xl max-w-2xl mx-auto border-0">
                      <h2 className="text-3xl font-bold mb-4 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                        Phase 2: Deep Dive Assessment
                      </h2>
                      <p className="text-lg text-muted-foreground leading-relaxed mb-6">
                        <span className="text-secondary font-medium">30 advanced questions</span> focused on your top performing skills
                      </p>
                      
                      {/* Top skills display */}
                      <div className="space-y-4">
                        <p className="text-sm text-muted-foreground">Your strongest skills identified:</p>
                        <div className="flex justify-center gap-4">
                          {topSkills.map((skill, index) => (
                            <div key={index} className="gradient-primary px-6 py-3 rounded-full">
                              <span className="text-white font-semibold text-lg">{skill}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <AdaptiveQuiz
                    selectedSkills={topSkills}
                    onComplete={handlePhase2Complete}
                    phase="deep-dive"
                    totalQuestions={30}
                    useGeminiGeneration={true}
                  />
                </>
              ) : (
                <div className="max-w-2xl mx-auto text-center">
                  <Card className="p-8">
                    <h2 className="text-xl font-bold mb-4">🔄 Loading Phase 2</h2>
                    <p className="text-muted-foreground mb-6">
                      We're preparing your deep dive assessment. If this takes too long, please refresh the page.
                    </p>
                    <div className="space-y-4">
                      <div className="animate-pulse bg-muted h-4 rounded w-3/4 mx-auto"></div>
                      <div className="animate-pulse bg-muted h-4 rounded w-1/2 mx-auto"></div>
                    </div>
                    <Button 
                      onClick={() => {
                        console.log('🔄 Retrying Phase 2 analysis...');
                        const fallbackSkills = geminiService.getFallbackTopSkills(phase1Responses);
                        setTopSkills(fallbackSkills);
                        toast({
                          title: "Phase 2 Ready",
                          description: `Proceeding with skills: ${fallbackSkills.join(' & ')}`,
                        });
                      }}
                      className="mt-6"
                      variant="outline"
                    >
                      🔄 Retry Phase 2
                    </Button>
                  </Card>
                </div>
              )}
            </div>
          )}
          
          {phase === "results" && careerAnalysis && (
            <ResultsDisplay
              analysis={careerAnalysis}
              userName={userName}
              onRestart={handleRestart}
            />
          )}
        </div>
      </div>
    </div>
  );
};