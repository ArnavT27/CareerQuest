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
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

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
    if (score >= 90) return "text-green-600";
    if (score >= 80) return "text-blue-600";
    if (score >= 70) return "text-amber-600";
    return "text-gray-600";
  };

  // Calculate overall score
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
    .sort((a, b) => (b.matchScore || b.match || 0) - (a.matchScore || a.match || 0))
    .slice(0, 5);

  // Skill distribution data
  const skillDistribution = (analysis.skillGaps || []).map(gap => ({
    name: gap.skill.length > 15 ? gap.skill.substring(0, 15) + '...' : gap.skill,
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

    if (navigator.share) {
      try {
        await navigator.share({
          title: `${userName}'s Career Analysis`,
          text: summaryText,
        });
      } catch (error) {
        console.log('Error sharing:', error);
      }
    } else {
      // Fallback: Copy to clipboard
      navigator.clipboard.writeText(summaryText);
      alert('Summary copied to clipboard!');
    }
  };

  // Summarized View Component
  const SummarizedView = () => (
    <div className="space-y-6 animate-fade-in">
      {/* Header Summary */}
      <Card className="border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-secondary/5">
        <CardHeader className="text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 mb-4">
            <span className={`text-3xl font-bold ${scoreColor}`}>
              {overallScore}
            </span>
          </div>
          <CardTitle className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            {userName}'s Career Analysis Summary
          </CardTitle>
          <CardDescription className="text-base">
            Key insights at a glance
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-2 gap-4">
        <Card className="border-l-4 border-blue-500">
          <CardContent className="pt-4">
            <div className="text-2xl font-bold">{overallScore}%</div>
            <p className="text-xs text-muted-foreground mt-1">Career Match</p>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-green-500">
          <CardContent className="pt-4">
            <div className="text-2xl font-bold">{summary.topStrengths.length}</div>
            <p className="text-xs text-muted-foreground mt-1">Top Strengths</p>
          </CardContent>
        </Card>
      </div>

      {/* Top Career Match */}
      {summary.topCareer && (
        <Card className="border-2 border-primary/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="w-5 h-5 text-amber-500" />
              Top Career Match
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-bold">{summary.topCareer.title}</h3>
                <Badge className={cn("text-lg px-3 py-1", getMatchScoreColor(summary.topCareer.matchScore))}>
                  {summary.topCareer.matchScore}% Match
                </Badge>
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-green-500" />
                  <span>{summary.topCareer.salaryRange}</span>
                </div>
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-blue-500" />
                  <span>{summary.topCareer.growthProspects}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Top Strengths */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="w-5 h-5 text-green-500" />
            Top Strengths
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {summary.topStrengths.map((strength, i) => (
              <Badge key={i} variant="secondary" className="text-sm py-1.5 px-3">
                <CheckCircle2 className="w-3 h-3 mr-1" />
                {strength}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Priority Skill Gaps */}
      {summary.topGaps.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-500" />
              Priority Skill Gaps
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {summary.topGaps.map((gap, i) => (
              <div key={i} className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="font-medium">{gap.skill}</span>
                  <Badge variant={gap.priority === 'high' ? 'destructive' : gap.priority === 'medium' ? 'default' : 'secondary'}>
                    {gap.priority}
                  </Badge>
                </div>
                <Progress value={(gap.currentLevel / gap.requiredLevel) * 100} className="h-2" />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>{gap.currentLevel}/{gap.requiredLevel}</span>
                  <span>{gap.developmentTime}</span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Personality Traits */}
      {summary.topPersonalityTraits.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5 text-purple-500" />
              Top Personality Traits
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {summary.topPersonalityTraits.map((trait, i) => (
              <div key={i} className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="font-medium">{trait.trait}</span>
                  <span className="text-muted-foreground">{trait.score}/100</span>
                </div>
                <Progress value={trait.score} className="h-2" />
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Market Insights */}
      {summary.marketInsights && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart2 className="w-5 h-5 text-indigo-500" />
              Market Insights
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <div>
                <span className="font-medium">Demand Level: </span>
                <Badge variant="outline">{summary.marketInsights.demandLevel}</Badge>
              </div>
              {summary.marketInsights.trendingSkills && summary.marketInsights.trendingSkills.length > 0 && (
                <div>
                  <span className="font-medium">Trending Skills: </span>
                  <span className="text-muted-foreground">
                    {summary.marketInsights.trendingSkills.slice(0, 3).join(', ')}
                  </span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6" ref={contentRef}>
      {/* Enhanced Header with Action Buttons */}
      <div className="text-center space-y-4">
        <div className="flex justify-center items-center gap-4 mb-4">
          <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-br from-primary/10 to-secondary/10">
            <span className={`text-3xl font-bold ${scoreColor}`}>
              {overallScore}
            </span>
          </div>
        </div>
        <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
          {userName}'s Career Analysis
        </h1>
        <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
          Your personalized career roadmap with AI-powered insights and actionable recommendations
        </p>
        
        {/* Action Buttons Row */}
        <div className="flex flex-wrap justify-center gap-3 pt-4">
          <Button 
            variant="outline" 
            className="gap-2" 
            onClick={onRestart}
          >
            <RefreshCw className="h-4 w-4" />
            Retake Assessment
          </Button>
          
          <Button 
            variant={isSummarizedView ? "default" : "outline"}
            className="gap-2"
            onClick={() => setIsSummarizedView(!isSummarizedView)}
          >
            {isSummarizedView ? (
              <>
                <Maximize2 className="h-4 w-4" />
                Full View
              </>
            ) : (
              <>
                <Minimize2 className="h-4 w-4" />
                Summary View
              </>
            )}
          </Button>
          
          <Button 
            className="gap-2"
            onClick={handleExportPDF}
            disabled={isExporting}
          >
            {isExporting ? (
              <>
                <RefreshCw className="h-4 w-4 animate-spin" />
                Generating PDF...
              </>
            ) : (
              <>
                <FileText className="h-4 w-4" />
                Export PDF
              </>
            )}
          </Button>
          
          <Button 
            variant="outline"
            className="gap-2"
            onClick={handlePrint}
          >
            <Printer className="h-4 w-4" />
            Print
          </Button>
          
          <Button 
            variant="outline"
            className="gap-2"
            onClick={handleShare}
          >
            <Share2 className="h-4 w-4" />
            Share
          </Button>
        </div>
      </div>

      {/* Content: Summarized or Full View */}
      {isSummarizedView ? (
        <SummarizedView />
      ) : (
        <>
          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="border-l-4 border-blue-500 hover:shadow-lg transition-shadow">
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

            <Card className="border-l-4 border-green-500 hover:shadow-lg transition-shadow">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Top Skills</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  {analysis.topStrengths?.length || 0}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {analysis.topStrengths?.slice(0, 2).join(', ')}...
                </p>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-purple-500 hover:shadow-lg transition-shadow">
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

            <Card className="border-l-4 border-amber-500 hover:shadow-lg transition-shadow">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Time to Proficiency</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-sm">
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

            {/* Personality Tab */}
            <TabsContent value="personality" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="w-5 h-5 text-purple-500" />
                    Personality Profile
                  </CardTitle>
                  <CardDescription>
                    Your personality traits and their career implications
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {analysis.personalityProfile?.map((trait, index) => (
                      <div key={index} className="space-y-3 p-4 border rounded-lg">
                        <div className="flex justify-between items-center">
                          <h3 className="text-lg font-semibold">{trait.trait}</h3>
                          <Badge variant="secondary" className="text-lg px-3">
                            {trait.score}/100
                          </Badge>
                        </div>
                        <Progress value={trait.score} className="h-3" />
                        <p className="text-sm text-muted-foreground">{trait.description}</p>
                        {trait.careerImplications && (
                          <div className="mt-2">
                            <p className="text-xs font-medium mb-1">Career Implications:</p>
                            <ul className="text-xs text-muted-foreground space-y-1">
                              {Array.isArray(trait.careerImplications) ? (
                                trait.careerImplications.map((impl, i) => (
                                  <li key={i}>• {impl}</li>
                                ))
                              ) : (
                                <li>• {trait.careerImplications}</li>
                              )}
                            </ul>
                          </div>
                        )}
                      </div>
                    ))}
                    {(!analysis.personalityProfile || analysis.personalityProfile.length === 0) && (
                      <div className="text-center text-muted-foreground py-8">
                        No personality profile data available
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Learning Path Tab */}
            <TabsContent value="roadmap" className="space-y-6">
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
                  {analysis.learningPath && analysis.learningPath.length > 0 ? (
                    <div className="space-y-8">
                      {(Array.isArray(analysis.learningPath) ? analysis.learningPath : []).map((item: LearningPathItem, index: number) => (
                        <Card key={index} className="border-l-4 border-primary">
                          <CardHeader>
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary">
                                  {index + 1}
                                </div>
                                <CardTitle>{item.skill}</CardTitle>
                              </div>
                              {item.difficultyLevel && (
                                <Badge variant="outline">{item.difficultyLevel}</Badge>
                              )}
                            </div>
                          </CardHeader>
                          <CardContent className="space-y-4">
                            <div>
                              <h5 className="font-semibold text-sm mb-2">Action Plan</h5>
                              <p className="text-sm text-muted-foreground">{item.action}</p>
                            </div>
                            <div className="grid md:grid-cols-2 gap-4">
                              <div>
                                <h5 className="font-semibold text-sm mb-2">Timeline</h5>
                                <p className="text-sm text-muted-foreground">{item.timeline}</p>
                              </div>
                              <div>
                                <h5 className="font-semibold text-sm mb-2">Expected Outcome</h5>
                                <p className="text-sm text-muted-foreground">{item.measurableOutcome}</p>
                              </div>
                            </div>
                            {item.resources && item.resources.length > 0 && (
                              <div>
                                <h5 className="font-semibold text-sm mb-2">Resources</h5>
                                <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                                  {item.resources.map((resource, resIndex) => (
                                    <li key={resIndex}>{resource}</li>
                                  ))}
                                </ul>
                              </div>
                            )}
                            {item.prerequisites && (
                              <div className="p-3 bg-amber-50 dark:bg-amber-950 rounded-lg border border-amber-200 dark:border-amber-800">
                                <h5 className="font-semibold text-sm mb-1">Prerequisites</h5>
                                <p className="text-sm text-muted-foreground">{item.prerequisites}</p>
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center text-muted-foreground py-8">
                      No learning path data available
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* AI Insights Tab */}
            <TabsContent value="insights" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BarChart2 className="w-5 h-5 text-indigo-500" />
                      Market Insights
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {analysis.marketInsights ? (
                      <>
                        <div>
                          <span className="font-medium">Demand Level: </span>
                          <Badge variant="outline">{analysis.marketInsights.demandLevel}</Badge>
                        </div>
                        <div>
                          <span className="font-medium">Competition: </span>
                          <Badge variant="outline">{analysis.marketInsights.competitionLevel}</Badge>
                        </div>
                        {analysis.marketInsights.trendingSkills && analysis.marketInsights.trendingSkills.length > 0 && (
                          <div>
                            <span className="font-medium">Trending Skills: </span>
                            <div className="flex flex-wrap gap-1 mt-2">
                              {analysis.marketInsights.trendingSkills.map((skill, i) => (
                                <Badge key={i} variant="secondary" className="text-xs">
                                  {skill}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                      </>
                    ) : (
                      <div className="text-muted-foreground text-sm">No market insights available</div>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Target className="w-5 h-5 text-emerald-500" />
                      Development Plan
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {analysis.developmentPlan ? (
                      <>
                        {analysis.developmentPlan.immediate && analysis.developmentPlan.immediate.length > 0 && (
                          <div>
                            <h4 className="font-semibold text-sm mb-2">Immediate Actions</h4>
                            <ul className="space-y-1 text-sm text-muted-foreground">
                              {analysis.developmentPlan.immediate.map((action, i) => (
                                <li key={i}>• {action}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                        {analysis.developmentPlan.shortTerm && analysis.developmentPlan.shortTerm.length > 0 && (
                          <div>
                            <h4 className="font-semibold text-sm mb-2">Short-term Goals</h4>
                            <ul className="space-y-1 text-sm text-muted-foreground">
                              {analysis.developmentPlan.shortTerm.map((goal, i) => (
                                <li key={i}>• {goal}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                        {analysis.developmentPlan.longTerm && analysis.developmentPlan.longTerm.length > 0 && (
                          <div>
                            <h4 className="font-semibold text-sm mb-2">Long-term Goals</h4>
                            <ul className="space-y-1 text-sm text-muted-foreground">
                              {analysis.developmentPlan.longTerm.map((goal, i) => (
                                <li key={i}>• {goal}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </>
                    ) : (
                      <div className="text-muted-foreground text-sm">No development plan available</div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </>
      )}
    </div>
  );
};
