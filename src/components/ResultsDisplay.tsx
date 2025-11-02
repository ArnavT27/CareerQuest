import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent, CardFooter, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CareerAnalysis, CareerRecommendation, PersonalityTrait, SkillDetail, geminiService } from "@/services/geminiService";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Legend, Cell } from 'recharts';
import { CheckCircle, Clock, TrendingUp, Award, Zap, Lightbulb, ArrowRight, BookOpen, Users, Briefcase, Star, BarChart2, BarChart as BarChartIcon, PieChart, Target, Activity, AlertTriangle, CheckCircle2, Download, RefreshCw, Scale, DollarSign, Rocket, Building2, FileText, DollarSign as DollarIcon } from 'lucide-react';
import { cn } from "@/lib/utils";

// Define types for learning path items
interface LearningPathItem {
  skill: string;
  action: string;
  timeline: string;
  difficultyLevel?: string;
  measurableOutcome?: string;
  prerequisites?: string;
  resources?: string[];
}

// Define startup roadmap types
interface StartupRoadmap {
  businessIdea: {
    concept: string;
    targetMarket: string;
    uniqueValueProposition: string;
    problemStatement: string;
    solution: string;
  };
  businessPlan: {
    executiveSummary: string;
    marketAnalysis: string;
    competitiveAdvantage: string;
    revenueModel: string;
    goToMarketStrategy: string;
  };
  fundingStrategy: {
    totalRequired: string;
    fundingStages: Array<{
      stage: string;
      amount: string;
      purpose: string;
      timeline: string;
      investorType: string;
    }>;
    sources: string[];
  };
  teamBuilding: {
    coreTeam: Array<{
      role: string;
      skills: string[];
      responsibilities: string[];
    }>;
    hiringPlan: Array<{
      phase: string;
      positions: string[];
      timeline: string;
    }>;
  };
  milestones: Array<{
    milestone: string;
    timeline: string;
    keyDeliverables: string[];
    successMetrics: string[];
  }>;
  resources: {
    tools: string[];
    platforms: string[];
    mentorship: string[];
    communities: string[];
  };
}

// Helper function to generate color shades
const getColorShades = (baseColor: string) => ({
  light: `bg-${baseColor}-100 text-${baseColor}-800`,
  medium: `bg-${baseColor}-500`,
  dark: `bg-${baseColor}-700`,
  text: `text-${baseColor}-700`
});

const priorityColors = {
  high: getColorShades('red'),
  medium: getColorShades('amber'),
  low: getColorShades('emerald')
};

// Mock data for skills radar chart
const skillsData = [
  { subject: 'Technical', A: 85, fullMark: 100 },
  { subject: 'Problem Solving', A: 78, fullMark: 100 },
  { subject: 'Communication', A: 90, fullMark: 100 },
  { subject: 'Leadership', A: 70, fullMark: 100 },
  { subject: 'Creativity', A: 82, fullMark: 100 },
  { subject: 'Teamwork', A: 88, fullMark: 100 },
];

// Mock data for career growth potential
const careerGrowthData = [
  { name: 'Entry Level', value: 25 },
  { name: 'Mid Level', value: 50 },
  { name: 'Senior Level', value: 75 },
  { name: 'Leadership', value: 90 },
];

interface ResultsDisplayProps {
  analysis: CareerAnalysis;
  userName: string;
  onRestart: () => void;
}

export const ResultsDisplay = ({ analysis, userName, onRestart }: ResultsDisplayProps) => {
  // State for career path selection (job opportunities vs startup)
  const [careerPathType, setCareerPathType] = useState<'jobs' | 'startup' | null>(null);
  const [startupRoadmap, setStartupRoadmap] = useState<StartupRoadmap | null>(null);
  const [isGeneratingStartup, setIsGeneratingStartup] = useState(false);

  const getSkillColor = (score: number) => {
    if (score >= 8) return "bg-primary";
    if (score >= 6) return "bg-secondary";
    if (score >= 4) return "bg-warning";
    return "bg-destructive";
  };

  const getMatchScoreColor = (score: number) => {
    if (score >= 90) return "text-primary";
    if (score >= 80) return "text-secondary";
    if (score >= 70) return "text-warning";
    return "text-muted-foreground";
  };

  // Calculate overall score with a more sophisticated formula
  const overallScore = Math.min(100, Math.max(0, analysis.overallScore || 0));
  const scoreColor = overallScore >= 85 ? 'text-green-500' : 
                    overallScore >= 70 ? 'text-blue-500' : 
                    overallScore >= 50 ? 'text-amber-500' : 'text-rose-500';

  // Enhanced personality insights
  const topPersonalityTraits = [...(analysis.personalityProfile || [])]
    .sort((a, b) => b.score - a.score)
    .slice(0, 3);

  // Enhanced career recommendations with match score
  const enhancedCareerRecommendations = [...(analysis.careerRecommendations || [])]
    .sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0))
    .slice(0, 5);

  // Skill distribution data
  const skillDistribution = (analysis.skillGaps || []).map(gap => ({
    name: gap.skill,
    current: gap.currentLevel * 10,
    required: gap.requiredLevel * 10,
    gap: (gap.requiredLevel - gap.currentLevel) * 10,
    priority: gap.priority
  }));

  // Generate startup roadmap using Gemini AI
  const handleGenerateStartup = async () => {
    setIsGeneratingStartup(true);
    try {
      // Get top skills from the analysis
      const topSkills = analysis.topStrengths?.slice(0, 3) || ['Problem Solving', 'Leadership', 'Innovation'];
      
      // Get niche/field from career recommendations if available
      const niche = analysis.careerRecommendations?.[0]?.field || undefined;
      
      console.log('🚀 Generating AI-powered startup roadmap for:', { topSkills, niche });
      
      // Call Gemini AI to generate personalized startup roadmap
      const roadmap = await geminiService.generateStartupRoadmap(
        topSkills,
        analysis,
        niche
      );
      
      console.log('✅ Startup roadmap generated:', roadmap);
      setStartupRoadmap(roadmap as StartupRoadmap);
    } catch (error) {
      console.error('❌ Error generating startup roadmap:', error);
      // Fallback will be handled by the service
      const topSkills = analysis.topStrengths?.slice(0, 3) || ['Problem Solving', 'Leadership'];
      const niche = analysis.careerRecommendations?.[0]?.field || undefined;
      const fallbackRoadmap = geminiService.getFallbackStartupRoadmap(topSkills, niche);
      setStartupRoadmap(fallbackRoadmap as StartupRoadmap);
    } finally {
      setIsGeneratingStartup(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10 animate-fade-in-up">
      {/* Header with Score */}
      <div className="text-center space-y-4">
        <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-br from-primary/10 to-secondary/10 mb-4">
          <span className={`text-3xl font-bold ${scoreColor}`}>
            {overallScore}
          </span>
        </div>
        <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
          {userName}'s Career Analysis
        </h1>
        <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
          Your personalized career roadmap with AI-powered insights and actionable recommendations
        </p>
        <div className="flex justify-center gap-4 pt-4">
          <Button variant="outline" className="gap-2" onClick={onRestart}>
            <RefreshCw className="h-4 w-4" />
            Retake Assessment
          </Button>
          <Button className="gap-2">
            <Download className="h-4 w-4" />
            Download Full Report
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-l-4 border-blue-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Career Match</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{overallScore}%</div>
            <p className="text-xs text-muted-foreground mt-1">
              {overallScore >= 85 ? 'Excellent fit' : overallScore >= 70 ? 'Good fit' : 'Consider alternatives'}
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-green-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Top Skills</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {Math.round((analysis.topStrengths?.length || 0) / 3 * 100)}%
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {analysis.topStrengths?.slice(0, 2).join(', ')}...
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-purple-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Market Demand</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold capitalize">
              {analysis.marketInsights?.demandLevel || 'Moderate'}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {analysis.marketInsights?.trendingSkills?.slice(0, 2).join(', ')}...
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-amber-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Time to Proficiency</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {analysis.skillGaps?.[0]?.developmentTime || '3-6 months'}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              For key skills development
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="w-full space-y-6">
        <div className="border-b">
          <TabsList className="w-full justify-start overflow-x-auto py-0">
            <TabsTrigger value="overview" className="py-4 px-6">
              <BarChartIcon className="w-4 h-4 mr-2" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="careers" className="py-4 px-6">
              <Briefcase className="w-4 h-4 mr-2" />
              Career Paths
              <Badge variant="secondary" className="ml-2">
                {analysis.careerRecommendations?.length || 0}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="skills" className="py-4 px-6">
              <Zap className="w-4 h-4 mr-2" />
              Skills Analysis
              <Badge variant="secondary" className="ml-2">
                {analysis.skillGaps?.length || 0}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="personality" className="py-4 px-6">
              <Users className="w-4 h-4 mr-2" />
              Personality
              {topPersonalityTraits.length > 0 && (
                <Badge variant="secondary" className="ml-2">
                  {topPersonalityTraits.length} Traits
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="roadmap" className="py-4 px-6">
              <Target className="w-4 h-4 mr-2" />
              Learning Path
            </TabsTrigger>
            <TabsTrigger value="insights" className="py-4 px-6">
              <Lightbulb className="w-4 h-4 mr-2" />
              AI Insights
            </TabsTrigger>
          </TabsList>
        </div>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Key Insights */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lightbulb className="w-5 h-5 text-amber-500" />
                  Key Insights & Recommendations
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <h3 className="font-semibold text-lg">Strengths to Leverage</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {analysis.topStrengths?.slice(0, 4).map((strength, i) => (
                      <div key={i} className="flex items-start gap-3 p-3 bg-green-50 rounded-lg border border-green-100">
                        <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                        <div>
                          <h4 className="font-medium text-green-800">{strength}</h4>
                          <p className="text-xs text-green-600 mt-1">
                            {strength.includes('leadership') ? 'Consider management roles' :
                             strength.includes('technical') ? 'Technical roles would be ideal' :
                             'This is a valuable asset in many roles'}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="font-semibold text-lg">Development Areas</h3>
                  <div className="space-y-3">
                    {analysis.skillGaps?.slice(0, 3).map((gap, i) => (
                      <div key={i} className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="font-medium">{gap.skill}</span>
                          <Badge variant={gap.priority === 'high' ? 'destructive' : gap.priority === 'medium' ? 'default' : 'secondary'}>
                            {gap.priority} priority
                          </Badge>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="w-full bg-gray-200 rounded-full h-2.5">
                            <div 
                              className={`h-2.5 rounded-full ${
                                gap.priority === 'high' ? 'bg-red-500' : 
                                gap.priority === 'medium' ? 'bg-amber-500' : 'bg-green-500'
                              }`} 
                              style={{ width: `${(gap.currentLevel / gap.requiredLevel) * 100}%` }}
                            ></div>
                          </div>
                          <span className="text-sm text-muted-foreground whitespace-nowrap">
                            {gap.currentLevel}/{gap.requiredLevel}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Personality Snapshot */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="w-5 h-5 text-purple-500" />
                    Personality Snapshot
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {topPersonalityTraits.map((trait, i) => (
                      <div key={i} className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span className="font-medium">{trait.trait}</span>
                          <span className="text-muted-foreground">{trait.score}/100</span>
                        </div>
                        <Progress value={trait.score} className="h-2" />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChartIcon className="w-5 h-5 text-blue-500" />
                    Skills Radar
                  </CardTitle>
                </CardHeader>
                <CardContent className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart cx="50%" cy="50%" outerRadius="80%" data={skillsData}>
                      <PolarGrid />
                      <PolarAngleAxis dataKey="subject" />
                      <PolarRadiusAxis angle={30} domain={[0, 100]} />
                      <Radar 
                        name="Your Skills" 
                        dataKey="A" 
                        stroke="#3b82f6" 
                        fill="#3b82f6" 
                        fillOpacity={0.6} 
                      />
                      <Tooltip />
                    </RadarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Career Growth Potential */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-emerald-500" />
                Career Growth Potential
              </CardTitle>
              <CardDescription>
                Your projected career trajectory based on current skills and market trends
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={careerGrowthData}
                    layout="vertical"
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" domain={[0, 100]} />
                    <YAxis dataKey="name" type="category" />
                    <Tooltip formatter={(value) => [`${value}%`, 'Growth Potential']} />
                    <Bar dataKey="value" fill="#10b981" name="Growth Potential" radius={[0, 4, 4, 0]}>
                      {careerGrowthData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={`rgba(16, 185, 129, ${0.3 + (index * 0.2)})`} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Career Recommendations Tab */}
        <TabsContent value="careers" className="space-y-6">
          {/* Path Selection UI - show this first if no path selected */}
          {!careerPathType && (
            <div className="space-y-8">
              <div className="text-center space-y-4">
                <h2 className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                  Choose Your Career Path
                </h2>
                <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                  Explore job opportunities or build your own startup based on your unique skills and interests
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
                {/* Job Opportunities Card */}
                <Card 
                  className="group relative overflow-hidden cursor-pointer transition-all duration-500 hover:shadow-2xl border-2 hover:border-primary/50"
                  onClick={() => setCareerPathType('jobs')}
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-500/0 to-blue-500/5 group-hover:from-blue-500/5 group-hover:to-blue-500/10 transition-all duration-500" />
                  <div className="relative p-8">
                    <div className="flex items-center justify-center w-16 h-16 rounded-full bg-blue-500/10 mb-6 group-hover:bg-blue-500/20 transition-colors">
                      <Building2 className="w-8 h-8 text-blue-500" />
                    </div>
                    <h3 className="text-2xl font-bold mb-3 text-center">Job Opportunities</h3>
                    <p className="text-muted-foreground mb-6 text-center">
                      Explore roles at established companies and growing startups
                    </p>
                    <div className="space-y-3 mb-6">
                      <div className="flex items-center gap-3 text-sm">
                        <CheckCircle className="w-5 h-5 text-blue-500" />
                        <span>Stable income and benefits</span>
                      </div>
                      <div className="flex items-center gap-3 text-sm">
                        <CheckCircle className="w-5 h-5 text-blue-500" />
                        <span>Proven career progression</span>
                      </div>
                      <div className="flex items-center gap-3 text-sm">
                        <CheckCircle className="w-5 h-5 text-blue-500" />
                        <span>Established company culture</span>
                      </div>
                      <div className="flex items-center gap-3 text-sm">
                        <CheckCircle className="w-5 h-5 text-blue-500" />
                        <span>Mentorship opportunities</span>
                      </div>
                    </div>
                    <Button className="w-full group-hover:bg-blue-600 transition-colors">
                      Explore Jobs <ArrowRight className="ml-2 w-4 h-4" />
                    </Button>
                  </div>
                </Card>

                {/* Startup Path Card */}
                <Card 
                  className="group relative overflow-hidden cursor-pointer transition-all duration-500 hover:shadow-2xl border-2 hover:border-secondary/50"
                  onClick={() => {
                    setCareerPathType('startup');
                    handleGenerateStartup();
                  }}
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-orange-500/0 to-orange-500/5 group-hover:from-orange-500/5 group-hover:to-orange-500/10 transition-all duration-500" />
                  <div className="relative p-8">
                    <div className="flex items-center justify-center w-16 h-16 rounded-full bg-orange-500/10 mb-6 group-hover:bg-orange-500/20 transition-colors">
                      <Rocket className="w-8 h-8 text-orange-500" />
                    </div>
                    <h3 className="text-2xl font-bold mb-3 text-center">Build Your Startup</h3>
                    <p className="text-muted-foreground mb-6 text-center">
                      Get a complete roadmap to launch your own venture
                    </p>
                    <div className="space-y-3 mb-6">
                      <div className="flex items-center gap-3 text-sm">
                        <Star className="w-5 h-5 text-orange-500" />
                        <span>AI-generated business plan</span>
                      </div>
                      <div className="flex items-center gap-3 text-sm">
                        <Star className="w-5 h-5 text-orange-500" />
                        <span>Funding strategy & milestones</span>
                      </div>
                      <div className="flex items-center gap-3 text-sm">
                        <Star className="w-5 h-5 text-orange-500" />
                        <span>Team building guidance</span>
                      </div>
                      <div className="flex items-center gap-3 text-sm">
                        <Star className="w-5 h-5 text-orange-500" />
                        <span>Resources & mentorship</span>
                      </div>
                    </div>
                    <Button variant="secondary" className="w-full group-hover:bg-orange-600 transition-colors">
                      Get Startup Roadmap <Rocket className="ml-2 w-4 h-4" />
                    </Button>
                  </div>
                </Card>
              </div>
            </div>
          )}

          {/* Loading state for startup generation */}
          {careerPathType === 'startup' && isGeneratingStartup && (
            <div className="text-center py-20">
              <div className="inline-flex items-center justify-center mb-6">
                <div className="relative">
                  <div className="w-16 h-16 rounded-full bg-orange-500/10 flex items-center justify-center animate-spin-slow">
                    <Rocket className="w-8 h-8 text-orange-500" />
                  </div>
                  <div className="absolute -inset-1.5 bg-orange-500/20 rounded-full -z-10 animate-ping" />
                </div>
              </div>
              <h2 className="text-2xl font-bold mb-3">Creating Your Startup Roadmap</h2>
              <p className="text-muted-foreground">Our AI is generating a comprehensive business plan tailored to your skills...</p>
            </div>
          )}

          {/* Job Opportunities Content */}
          {careerPathType === 'jobs' && (
            <>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold">Job Opportunities</h2>
                <Button variant="outline" onClick={() => setCareerPathType(null)}>
                  Change Path
                </Button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {enhancedCareerRecommendations.map((career, index) => {
                  const matchColor = career.matchScore >= 85 ? 'green' : 
                                   career.matchScore >= 70 ? 'blue' : 
                                   career.matchScore >= 50 ? 'amber' : 'gray';
                  
                  return (
                    <Card key={index} className="group overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1 border-t-4 border-primary/20 hover:border-primary/50">
                      <div className="p-6">
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <h3 className="text-xl font-bold text-foreground">{career.title}</h3>
                            <p className="text-sm text-muted-foreground">{career.field}</p>
                          </div>
                          <div className="text-right">
                            <div className={`text-2xl font-bold text-${matchColor}-600`}>
                              {career.matchScore}%
                            </div>
                            <p className="text-xs text-muted-foreground">Match Score</p>
                          </div>
                        </div>
                        
                        <p className="text-sm text-muted-foreground mb-4 line-clamp-3">
                          {career.description}
                        </p>
                        
                        <div className="space-y-3 text-sm mb-4">
                          <div className="flex items-center gap-2">
                            <DollarSign className="w-4 h-4 text-green-500" />
                            <span className="font-medium">Salary:</span>
                            <span className="text-foreground">{career.salaryRange}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <TrendingUp className="w-4 h-4 text-blue-500" />
                            <span className="font-medium">Growth:</span>
                            <span className="text-foreground">{career.growthProspects}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4 text-amber-500" />
                            <span className="font-medium">Transition:</span>
                            <span className="text-foreground">{career.timeToTransition}</span>
                          </div>
                        </div>
                        
                        <div className="mb-4">
                          <h4 className="text-sm font-medium mb-2">Key Skills</h4>
                          <div className="flex flex-wrap gap-1.5">
                            {(Array.isArray(career.requiredSkills) ? career.requiredSkills.slice(0, 5) : []).map((skill, skillIndex) => (
                              <Badge 
                                key={skillIndex} 
                                variant="secondary" 
                                className="text-xs py-1 px-2 font-normal"
                              >
                                {skill}
                              </Badge>
                            ))}
                            {career.requiredSkills?.length > 5 && (
                              <Badge variant="outline" className="text-xs">
                                +{career.requiredSkills.length - 5} more
                              </Badge>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex justify-between items-center pt-4 border-t">
                          <Button variant="outline" size="sm" className="gap-1.5">
                            <BookOpen className="w-4 h-4" />
                            Learn More
                          </Button>
                          <Button size="sm" className="gap-1.5">
                            View Roadmap
                            <ArrowRight className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>
            </>
          )}
          
          {/* Career Comparison Tool */}
          {careerPathType === 'jobs' && (
            <Card className="mt-8">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Scale className="w-5 h-5 text-purple-500" />
                  Career Path Comparison
                </CardTitle>
                <CardDescription>
                  Compare up to 3 career paths to find your best fit
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {[0, 1, 2].map((i) => (
                    <div key={i} className="space-y-4">
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder={`Select Career ${i + 1}`} />
                        </SelectTrigger>
                        <SelectContent>
                          {enhancedCareerRecommendations.map((career, idx) => (
                            <SelectItem key={idx} value={career.title}>
                              {career.title}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      
                      {i < 2 && (
                        <div className="hidden md:flex items-center justify-center h-full">
                          <div className="text-muted-foreground text-sm">
                            vs
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
                
                <div className="mt-6 flex justify-center">
                  <Button variant="outline" className="gap-2">
                    <BarChart2 className="w-4 h-4" />
                    Compare Careers
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Startup Roadmap Content */}
          {careerPathType === 'startup' && startupRoadmap && !isGeneratingStartup && (
            <div className="space-y-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold">Your Startup Roadmap</h2>
                <Button variant="outline" onClick={() => setCareerPathType(null)}>
                  Change Path
                </Button>
              </div>

              {/* Business Idea Section */}
              <Card className="border-t-4 border-orange-500">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-orange-600">
                    <Lightbulb className="w-6 h-6" />
                    Business Concept
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <h4 className="font-semibold text-sm text-muted-foreground">CONCEPT</h4>
                      <p className="text-lg">{startupRoadmap.businessIdea.concept}</p>
                    </div>
                    <div className="space-y-2">
                      <h4 className="font-semibold text-sm text-muted-foreground">TARGET MARKET</h4>
                      <p className="text-lg">{startupRoadmap.businessIdea.targetMarket}</p>
                    </div>
                  </div>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="p-4 bg-red-50 rounded-lg border border-red-200">
                      <h4 className="font-semibold text-red-800 mb-2">⚠️ Problem</h4>
                      <p className="text-sm text-red-700">{startupRoadmap.businessIdea.problemStatement}</p>
                    </div>
                    <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                      <h4 className="font-semibold text-green-800 mb-2">✨ Solution</h4>
                      <p className="text-sm text-green-700">{startupRoadmap.businessIdea.solution}</p>
                    </div>
                  </div>
                  <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <h4 className="font-semibold text-blue-800 mb-2">🎯 Unique Value Proposition</h4>
                    <p className="text-blue-700">{startupRoadmap.businessIdea.uniqueValueProposition}</p>
                  </div>
                </CardContent>
              </Card>

              {/* Business Plan Section */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="w-6 h-6 text-purple-600" />
                    Business Plan Overview
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-semibold mb-2">Executive Summary</h4>
                      <p className="text-sm text-muted-foreground">{startupRoadmap.businessPlan.executiveSummary}</p>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-2">Competitive Advantage</h4>
                      <p className="text-sm text-muted-foreground">{startupRoadmap.businessPlan.competitiveAdvantage}</p>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">Market Analysis</h4>
                    <p className="text-sm text-muted-foreground">{startupRoadmap.businessPlan.marketAnalysis}</p>
                  </div>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-semibold mb-2">💰 Revenue Model</h4>
                      <p className="text-sm text-muted-foreground">{startupRoadmap.businessPlan.revenueModel}</p>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-2">🚀 Go-to-Market Strategy</h4>
                      <p className="text-sm text-muted-foreground">{startupRoadmap.businessPlan.goToMarketStrategy}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Funding Strategy */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <DollarIcon className="w-6 h-6 text-green-600" />
                    Funding Strategy
                  </CardTitle>
                  <CardDescription>Total Funding Required: {startupRoadmap.fundingStrategy.totalRequired}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    {startupRoadmap.fundingStrategy.fundingStages.map((stage, index) => (
                      <div key={index} className="border rounded-lg p-6 hover:shadow-lg transition-shadow">
                        <div className="flex items-center justify-between mb-4">
                          <h4 className="text-lg font-bold">{stage.stage}</h4>
                          <Badge variant="secondary" className="text-lg px-3 py-1">
                            {stage.amount}
                          </Badge>
                        </div>
                        <div className="grid md:grid-cols-3 gap-4 text-sm">
                          <div>
                            <span className="text-muted-foreground">Purpose:</span>
                            <p className="font-medium mt-1">{stage.purpose}</p>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Timeline:</span>
                            <p className="font-medium mt-1">{stage.timeline}</p>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Investors:</span>
                            <p className="font-medium mt-1">{stage.investorType}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="p-4 bg-muted/50 rounded-lg">
                    <h4 className="font-semibold mb-3">Funding Sources to Explore</h4>
                    <div className="flex flex-wrap gap-2">
                      {startupRoadmap.fundingStrategy.sources.map((source, index) => (
                        <Badge key={index} variant="outline">{source}</Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Team Building */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="w-6 h-6 text-blue-600" />
                    Team Building Roadmap
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <h4 className="font-semibold mb-4 text-lg">Core Team Needs</h4>
                    <div className="grid md:grid-cols-2 gap-4">
                      {startupRoadmap.teamBuilding.coreTeam.map((member, index) => (
                        <Card key={index} className="border-2">
                          <CardHeader className="pb-3">
                            <CardTitle className="text-lg">{member.role}</CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-3">
                            <div>
                              <h5 className="text-sm font-medium text-muted-foreground mb-2">Key Skills:</h5>
                              <div className="flex flex-wrap gap-1.5">
                                {member.skills.map((skill, i) => (
                                  <Badge key={i} variant="secondary">{skill}</Badge>
                                ))}
                              </div>
                            </div>
                            <div>
                              <h5 className="text-sm font-medium text-muted-foreground mb-1">Responsibilities:</h5>
                              <ul className="text-sm space-y-1">
                                {member.responsibilities.map((resp, i) => (
                                  <li key={i} className="flex items-start gap-2">
                                    <span className="text-primary">•</span>
                                    <span>{resp}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-4 text-lg">Hiring Plan</h4>
                    <div className="space-y-4">
                      {startupRoadmap.teamBuilding.hiringPlan.map((phase, index) => (
                        <div key={index} className="border-l-4 border-blue-500 pl-4">
                          <div className="flex items-center justify-between mb-2">
                            <h5 className="font-bold">{phase.phase}</h5>
                            <span className="text-sm text-muted-foreground">{phase.timeline}</span>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {phase.positions.map((pos, i) => (
                              <Badge key={i}>{pos}</Badge>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Milestones */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="w-6 h-6 text-indigo-600" />
                    Key Milestones
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {startupRoadmap.milestones.map((milestone, index) => (
                      <div key={index} className="relative">
                        <div className="flex items-start gap-4">
                          <div className="flex-shrink-0 w-10 h-10 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold shadow-lg">
                            {index + 1}
                          </div>
                          <div className="flex-1 border-l-4 border-indigo-200 pl-6 pb-6">
                            <div className="flex items-center justify-between mb-2">
                              <h4 className="text-lg font-bold">{milestone.milestone}</h4>
                              <Badge variant="outline">{milestone.timeline}</Badge>
                            </div>
                            <div className="grid md:grid-cols-2 gap-4 mt-4">
                              <div>
                                <h5 className="font-semibold text-sm mb-2 text-muted-foreground">Key Deliverables</h5>
                                <ul className="space-y-1">
                                  {milestone.keyDeliverables.map((item, i) => (
                                    <li key={i} className="text-sm flex items-start gap-2">
                                      <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                                      <span>{item}</span>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                              <div>
                                <h5 className="font-semibold text-sm mb-2 text-muted-foreground">Success Metrics</h5>
                                <ul className="space-y-1">
                                  {milestone.successMetrics.map((metric, i) => (
                                    <li key={i} className="text-sm flex items-start gap-2">
                                      <Award className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
                                      <span>{metric}</span>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            </div>
                          </div>
                        </div>
                        {index < startupRoadmap.milestones.length - 1 && (
                          <div className="absolute left-5 top-10 w-0.5 h-6 bg-indigo-200" />
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Resources */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BookOpen className="w-6 h-6 text-emerald-600" />
                    Essential Resources
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-semibold mb-3 flex items-center gap-2">
                        <span className="text-xl">🛠️</span>
                        Tools & Platforms
                      </h4>
                      <div className="space-y-2">
                        {startupRoadmap.resources.tools.map((tool, i) => (
                          <div key={i} className="flex items-center gap-2 text-sm p-2 bg-muted/30 rounded">
                            <CheckCircle className="w-4 h-4 text-green-500" />
                            <span>{tool}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-3 flex items-center gap-2">
                        <span className="text-xl">🌟</span>
                        Launch Platforms
                      </h4>
                      <div className="space-y-2">
                        {startupRoadmap.resources.platforms.map((platform, i) => (
                          <div key={i} className="flex items-center gap-2 text-sm p-2 bg-muted/30 rounded">
                            <CheckCircle className="w-4 h-4 text-green-500" />
                            <span>{platform}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-3 flex items-center gap-2">
                        <span className="text-xl">🤝</span>
                        Mentorship Programs
                      </h4>
                      <div className="space-y-2">
                        {startupRoadmap.resources.mentorship.map((program, i) => (
                          <div key={i} className="flex items-center gap-2 text-sm p-2 bg-muted/30 rounded">
                            <CheckCircle className="w-4 h-4 text-green-500" />
                            <span>{program}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-3 flex items-center gap-2">
                        <span className="text-xl">👥</span>
                        Communities
                      </h4>
                      <div className="space-y-2">
                        {startupRoadmap.resources.communities.map((community, i) => (
                          <div key={i} className="flex items-center gap-2 text-sm p-2 bg-muted/30 rounded">
                            <CheckCircle className="w-4 h-4 text-green-500" />
                            <span>{community}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Call to Action */}
              <Card className="border-2 border-orange-500 bg-gradient-to-br from-orange-50 to-amber-50">
                <CardContent className="pt-6">
                  <div className="text-center space-y-4">
                    <h3 className="text-2xl font-bold">Ready to Launch Your Startup?</h3>
                    <p className="text-muted-foreground max-w-2xl mx-auto">
                      You have a comprehensive roadmap to guide your entrepreneurial journey. Start by working on your first milestone!
                    </p>
                    <div className="flex flex-wrap justify-center gap-3 pt-4">
                      <Button size="lg" className="gap-2">
                        <Download className="w-5 h-5" />
                        Download Full Plan
                      </Button>
                      <Button variant="outline" size="lg" className="gap-2">
                        <ArrowRight className="w-5 h-5" />
                        Start Building
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>

        {/* Skills Analysis Tab */}
        <TabsContent value="skills" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Skills Radar Chart */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="w-5 h-5 text-blue-500" />
                  Skills Assessment
                </CardTitle>
                <CardDescription>
                  Your current skill levels compared to industry requirements
                </CardDescription>
              </CardHeader>
              <CardContent className="h-96">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart cx="50%" cy="50%" outerRadius="80%" data={skillDistribution}>
                    <PolarGrid />
                    <PolarAngleAxis dataKey="name" />
                    <PolarRadiusAxis angle={30} domain={[0, 100]} />
                    <Radar 
                      name="Current Level" 
                      dataKey="current" 
                      stroke="#3b82f6" 
                      fill="#3b82f6" 
                      fillOpacity={0.2} 
                    />
                    <Radar 
                      name="Required Level" 
                      dataKey="required" 
                      stroke="#10b981" 
                      fill="#10b981" 
                      fillOpacity={0.1} 
                      strokeDasharray="5 5"
                    />
                    <Tooltip 
                      formatter={(value, name) => [value, name === 'current' ? 'Current Level' : 'Required Level']}
                      labelFormatter={(label) => `Skill: ${label}`}
                    />
                    <Legend />
                  </RadarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Skill Gaps Summary */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-amber-500" />
                    Priority Skill Gaps
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {analysis.skillGaps
                    ?.sort((a, b) => {
                      const priorityOrder = { high: 3, medium: 2, low: 1 };
                      return priorityOrder[b.priority] - priorityOrder[a.priority];
                    })
                    .slice(0, 3)
                    .map((gap, index) => (
                      <div key={index} className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="font-medium">{gap.skill}</span>
                          <Badge 
                            variant={gap.priority === 'high' ? 'destructive' : gap.priority === 'medium' ? 'default' : 'secondary'}
                            className="uppercase"
                          >
                            {gap.priority} priority
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className={`h-2 rounded-full ${
                                gap.priority === 'high' ? 'bg-red-500' : 
                                gap.priority === 'medium' ? 'bg-amber-500' : 'bg-green-500'
                              }`} 
                              style={{ width: `${(gap.currentLevel / gap.requiredLevel) * 100}%` }}
                            ></div>
                          </div>
                          <span className="text-xs text-muted-foreground whitespace-nowrap">
                            {gap.currentLevel}/{gap.requiredLevel}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          <Clock className="inline w-3 h-3 mr-1" />
                          {gap.developmentTime} to improve
                        </p>
                      </div>
                    ))}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Award className="w-5 h-5 text-green-500" />
                    Strongest Skills
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {analysis.topStrengths?.slice(0, 3).map((skill, index) => (
                    <div key={index} className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                      <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
                      <div>
                        <h4 className="font-medium text-green-800">{skill}</h4>
                        <p className="text-xs text-green-600 mt-1">
                          {skill.includes('leadership') ? 'Consider management roles' :
                           skill.includes('technical') ? 'Technical roles would be ideal' :
                           'This is a valuable asset in many roles'}
                        </p>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Learning Path */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-purple-500" />
                Personalized Learning Path
                <Badge variant="outline" className="text-xs">
                  AI-Generated
                </Badge>
              </CardTitle>
              <CardDescription>
                A step-by-step guide to close your skill gaps and advance your career
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-8">
                {(Array.isArray(analysis.learningPath) ? analysis.learningPath : []).map((item: LearningPathItem, index: number) => {
                  // Enhanced color schemes for learning path items
                  const pathColors = [
                    {
                      gradient: 'from-blue-50/80 via-indigo-50/60 to-purple-50/80',
                      border: 'border-blue-300/40',
                      accent: 'text-blue-600',
                      badge: 'bg-blue-100 text-blue-700',
                      sections: {
                        action: 'bg-blue-50/90 border-blue-200/50',
                        timeline: 'bg-indigo-50/90 border-indigo-200/50',
                        success: 'bg-purple-50/90 border-purple-200/50',
                        prerequisites: 'bg-amber-50/90 border-amber-300/50',
                        resources: 'bg-slate-50/90 border-slate-200/50'
                      }
                    },
                    {
                      gradient: 'from-emerald-50/80 via-teal-50/60 to-cyan-50/80',
                      border: 'border-emerald-300/40',
                      accent: 'text-emerald-600',
                      badge: 'bg-emerald-100 text-emerald-700',
                      sections: {
                        action: 'bg-emerald-50/90 border-emerald-200/50',
                        timeline: 'bg-teal-50/90 border-teal-200/50',
                        success: 'bg-cyan-50/90 border-cyan-200/50',
                        prerequisites: 'bg-amber-50/90 border-amber-300/50',
                        resources: 'bg-slate-50/90 border-slate-200/50'
                      }
                    },
                    {
                      gradient: 'from-rose-50/80 via-pink-50/60 to-fuchsia-50/80',
                      border: 'border-rose-300/40',
                      accent: 'text-rose-600',
                      badge: 'bg-rose-100 text-rose-700',
                      sections: {
                        action: 'bg-rose-50/90 border-rose-200/50',
                        timeline: 'bg-pink-50/90 border-pink-200/50',
                        success: 'bg-fuchsia-50/90 border-fuchsia-200/50',
                        prerequisites: 'bg-amber-50/90 border-amber-300/50',
                        resources: 'bg-slate-50/90 border-slate-200/50'
                      }
                    },
                    {
                      gradient: 'from-orange-50/80 via-amber-50/60 to-yellow-50/80',
                      border: 'border-orange-300/40',
                      accent: 'text-orange-600',
                      badge: 'bg-orange-100 text-orange-700',
                      sections: {
                        action: 'bg-orange-50/90 border-orange-200/50',
                        timeline: 'bg-amber-50/90 border-amber-200/50',
                        success: 'bg-yellow-50/90 border-yellow-200/50',
                        prerequisites: 'bg-red-50/90 border-red-300/50',
                        resources: 'bg-slate-50/90 border-slate-200/50'
                      }
                    }
                  ];
                  
                  const scheme = pathColors[index % pathColors.length];
                  
                  return (
                    <div key={index} className={`border-2 rounded-xl p-6 bg-gradient-to-br ${scheme.gradient} ${scheme.border} transition-all duration-300 hover:shadow-lg hover:-translate-y-1`}>
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-full bg-white/70 flex items-center justify-center font-bold ${scheme.accent} text-sm shadow-sm`}>
                            {index + 1}
                          </div>
                          <h4 className={`font-bold text-xl ${scheme.accent}`}>{item.skill}</h4>
                        </div>
                        {item.difficultyLevel && (
                          <Badge className={`${scheme.badge} border-0 shadow-sm`}>
                            {item.difficultyLevel}
                          </Badge>
                        )}
                      </div>
                      
                      <div className="space-y-4">
                        <div className={`${scheme.sections.action} p-4 rounded-lg border backdrop-blur-sm`}>
                          <h5 className="font-semibold text-sm mb-2 flex items-center gap-2">
                            <span className="text-base">📋</span>
                            <span className={scheme.accent}>Comprehensive Action Plan</span>
                          </h5>
                          <p className="text-sm leading-relaxed text-gray-700">{item.action}</p>
                          
                          {/* Enhanced AI insights */}
                          <div className="mt-3 p-3 bg-white/50 rounded-md border border-white/20">
                            <h6 className="text-xs font-semibold text-gray-600 mb-1 flex items-center gap-1">
                              <span>🤖</span>
                              <span>AI Learning Strategy</span>
                            </h6>
                            <p className="text-xs text-gray-600 leading-relaxed">
                              Focus on hands-on application rather than passive learning. Build projects that demonstrate your understanding and can be showcased in your portfolio. Consider finding a study partner or mentor to accelerate your progress.
                            </p>
                          </div>
                        </div>
                        
                        <div className="grid md:grid-cols-2 gap-4">
                          <div className={`${scheme.sections.timeline} p-4 rounded-lg border backdrop-blur-sm`}>
                            <h5 className="font-semibold text-sm mb-2 flex items-center gap-2">
                              <span className="text-base">⏰</span>
                              <span className={scheme.accent}>Smart Timeline</span>
                            </h5>
                            <p className="text-sm text-gray-700 mb-2">{item.timeline}</p>
                            <div className="text-xs text-gray-600">
                              <div className="flex items-center gap-1 mb-1">
                                <span>📅</span>
                                <span>Weekly commitment: 8-12 hours</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <span>🎯</span>
                                <span>Daily practice: 1-2 hours</span>
                              </div>
                            </div>
                          </div>
                          
                          <div className={`${scheme.sections.success} p-4 rounded-lg border backdrop-blur-sm`}>
                            <h5 className="font-semibold text-sm mb-2 flex items-center gap-2">
                              <span className="text-base">🎯</span>
                              <span className={scheme.accent}>Success Metrics</span>
                            </h5>
                            <p className="text-sm text-gray-700 mb-2">{item.measurableOutcome || 'Track your progress through practical applications and assessments.'}</p>
                            <div className="text-xs text-gray-600">
                              <div className="flex items-center gap-1 mb-1">
                                <span>✅</span>
                                <span>Portfolio projects completed</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <span>📈</span>
                                <span>Skill assessment improvements</span>
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        {item.prerequisites && (
                          <div className={`${scheme.sections.prerequisites} p-4 rounded-lg border border-amber-300/40`}>
                            <h5 className="font-semibold text-sm mb-2 flex items-center gap-2">
                              <span className="text-base">⚡</span>
                              <span className="text-amber-700">Prerequisites & Preparation</span>
                            </h5>
                            <p className="text-sm text-gray-700 mb-2">{item.prerequisites}</p>
                            <div className="text-xs text-gray-600">
                              <div className="flex items-center gap-1">
                                <span>📚</span>
                                <span>Recommended prep time: 1-2 weeks</span>
                              </div>
                            </div>
                          </div>
                        )}
                        
                        <div className={`${scheme.sections.resources} p-4 rounded-lg border backdrop-blur-sm`}>
                          <h5 className="font-semibold text-sm mb-3 flex items-center gap-2">
                            <span className="text-base">📚</span>
                            <span className={scheme.accent}>Curated Learning Resources</span>
                          </h5>
                          <div className="grid gap-3">
                            {(Array.isArray(item.resources) ? item.resources : []).map((resource, resourceIndex) => {
                              const resourceTypes = ['🎥', '📚', '💻', '🎯', '✨'];
                              const resourceIcon = resourceTypes[resourceIndex % resourceTypes.length];
                              
                              return (
                                <div key={resourceIndex} className="flex items-start gap-3 text-sm bg-white/40 p-3 rounded-lg border border-white/20">
                                  <span className="text-base flex-shrink-0 mt-0.5">{resourceIcon}</span>
                                  <div className="flex-1">
                                    <span className="text-gray-700 leading-relaxed">{resource}</span>
                                    {resourceIndex === 0 && (
                                      <div className="text-xs text-gray-500 mt-1">
                                        <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded-full text-xs font-medium">
                                          🔥 Most Recommended
                                        </span>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              );
                            })}
                          </div>

                          {/* Success Tips */}
                          <div className="bg-gradient-to-r from-blue-50/80 via-indigo-50/60 to-purple-50/80 p-6 rounded-lg border mt-6">
                            <h3 className="text-lg font-bold mb-3 flex items-center gap-2">
                              <span>✨</span>
                              <span>Success Tips for Your Journey</span>
                            </h3>
                            <div className="grid md:grid-cols-2 gap-4 text-sm">
                              <div className="space-y-2">
                                <h4 className="font-semibold text-primary">📈 Track Progress</h4>
                                <ul className="space-y-1 text-muted-foreground">
                                  <li>• Set monthly review checkpoints</li>
                                  <li>• Document achievements and learnings</li>
                                  <li>• Adjust timelines based on progress</li>
                                </ul>
                              </div>
                              <div className="space-y-2">
                                <h4 className="font-semibold text-secondary">🤝 Network Actively</h4>
                                <ul className="space-y-1 text-muted-foreground">
                                  <li>• Connect with industry professionals</li>
                                  <li>• Join relevant professional communities</li>
                                  <li>• Seek mentorship and guidance</li>
                                </ul>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};