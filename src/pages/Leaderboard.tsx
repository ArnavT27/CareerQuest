import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Trophy, TrendingUp, Briefcase, Zap, DollarSign, 
  Lightbulb, Newspaper, RefreshCw,
  ArrowUpRight, Star, Calendar
} from "lucide-react";
import { leaderboardService, LeaderboardData } from "@/services/leaderboardService";
import { useToast } from "@/hooks/use-toast";

export const Leaderboard = () => {
  const [data, setData] = useState<LeaderboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { toast } = useToast();

  const loadData = async (forceRefresh: boolean = false) => {
    if (forceRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    try {
      const leaderboardData = await leaderboardService.getLeaderboardData(forceRefresh);
      setData(leaderboardData);
      
      if (forceRefresh) {
        toast({
          title: "✅ Data Refreshed",
          description: "Latest trending information loaded successfully",
        });
      }
    } catch (error) {
      console.error("Error loading leaderboard data:", error);
      toast({
        title: "Error",
        description: "Failed to load leaderboard data. Showing cached data.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleRefresh = () => {
    loadData(true);
  };

  if (loading && !data) {
    return (
      <div className="container mx-auto px-4 py-8 space-y-6">
        <div className="space-y-4">
          <Skeleton className="h-12 w-64" />
          <Skeleton className="h-96 w-full" />
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <p className="text-muted-foreground">No data available</p>
        <Button onClick={handleRefresh} className="mt-4">
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent mb-2">
              Career Leaderboard
            </h1>
            <p className="text-lg text-muted-foreground">
              Trending jobs, skills, careers, and market insights
            </p>
            {data.lastUpdated && (
              <p className="text-sm text-muted-foreground mt-1">
                Last updated: {new Date(data.lastUpdated).toLocaleDateString()} at{" "}
                {new Date(data.lastUpdated).toLocaleTimeString()}
              </p>
            )}
          </div>
          <Button
            onClick={handleRefresh}
            disabled={refreshing}
            variant="outline"
            className="gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>

        <Tabs defaultValue="jobs" className="w-full space-y-6">
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-3 lg:grid-cols-6">
            <TabsTrigger value="jobs" className="gap-2">
              <Briefcase className="h-4 w-4" />
              Top Jobs
            </TabsTrigger>
            <TabsTrigger value="skills" className="gap-2">
              <Zap className="h-4 w-4" />
              Top Skills
            </TabsTrigger>
            <TabsTrigger value="careers" className="gap-2">
              <Trophy className="h-4 w-4" />
              Top Careers
            </TabsTrigger>
            <TabsTrigger value="startups" className="gap-2">
              <Lightbulb className="h-4 w-4" />
              Startup Ideas
            </TabsTrigger>
            <TabsTrigger value="funding" className="gap-2">
              <DollarSign className="h-4 w-4" />
              Funding Areas
            </TabsTrigger>
            <TabsTrigger value="news" className="gap-2">
              <Newspaper className="h-4 w-4" />
              News
            </TabsTrigger>
          </TabsList>

          {/* Top Jobs Tab */}
          <TabsContent value="jobs" className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {data.topJobs.map((job) => (
                <Card key={job.rank} className="group hover:shadow-lg transition-all hover:-translate-y-1">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                          <span className="text-lg font-bold text-primary">#{job.rank}</span>
                        </div>
                        <div>
                          <CardTitle className="text-xl">{job.title}</CardTitle>
                          <CardDescription className="flex items-center gap-2 mt-1">
                            <Badge variant="outline">{job.field}</Badge>
                          </CardDescription>
                        </div>
                      </div>
                      <TrendingUp className="h-5 w-5 text-green-500" />
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Demand:</span>
                      <Badge
                        variant={
                          job.demand === "Very High"
                            ? "default"
                            : job.demand === "High"
                            ? "secondary"
                            : "outline"
                        }
                      >
                        {job.demand}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Salary:</span>
                      <span className="font-semibold text-green-600">{job.salaryRange}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Growth:</span>
                      <span className="font-semibold">{job.growth}</span>
                    </div>
                    {job.searchVolume && (
                      <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t">
                        <span>Search Volume:</span>
                        <span>{(job.searchVolume / 1000000).toFixed(1)}M</span>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Top Skills Tab */}
          <TabsContent value="skills" className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {data.topSkills.map((skill) => (
                <Card key={skill.rank} className="group hover:shadow-lg transition-all hover:-translate-y-1">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary/10">
                          <span className="text-lg font-bold text-secondary">#{skill.rank}</span>
                        </div>
                        <div>
                          <CardTitle className="text-xl">{skill.skill}</CardTitle>
                          <CardDescription className="mt-1">
                            Avg Salary: <span className="font-semibold text-foreground">{skill.averageSalary}</span>
                          </CardDescription>
                        </div>
                      </div>
                      <Badge
                        variant={
                          skill.demand === "Very High"
                            ? "default"
                            : skill.demand === "High"
                            ? "secondary"
                            : "outline"
                        }
                      >
                        {skill.demand}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <span className="text-sm text-muted-foreground">Industries:</span>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {skill.industries.map((industry, idx) => (
                          <Badge key={idx} variant="outline" className="text-xs">
                            {industry}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-sm pt-2 border-t">
                      <span className="text-muted-foreground">Growth Rate:</span>
                      <span className="font-semibold text-green-600">{skill.growthRate}</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Top Careers Tab */}
          <TabsContent value="careers" className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {data.topCareers.map((career) => (
                <Card key={career.rank} className="group hover:shadow-lg transition-all hover:-translate-y-1 border-l-4 border-primary">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-primary to-secondary">
                          <Star className="h-5 w-5 text-white" />
                        </div>
                        <div>
                          <CardTitle className="text-xl">{career.title}</CardTitle>
                          <CardDescription className="mt-1">
                            <Badge variant="outline">{career.field}</Badge>
                          </CardDescription>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-primary">{career.matchScore}%</div>
                        <p className="text-xs text-muted-foreground">Match</p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <p className="text-sm text-muted-foreground">{career.description}</p>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Salary:</span>
                      <span className="font-semibold text-green-600">{career.salaryRange}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Growth:</span>
                      <Badge variant="outline">{career.growthProspects}</Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Startup Ideas Tab */}
          <TabsContent value="startups" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              {data.startupIdeas.map((idea, idx) => (
                <Card key={idx} className="hover:shadow-lg transition-all border-l-4 border-secondary">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-xl flex items-center gap-2">
                          <Lightbulb className="h-5 w-5 text-secondary" />
                          {idea.idea}
                        </CardTitle>
                        <CardDescription className="mt-2">
                          <Badge variant="outline">{idea.field}</Badge>
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-sm text-muted-foreground">{idea.description}</p>
                    <div className="grid grid-cols-2 gap-4 pt-2 border-t">
                      <div>
                        <p className="text-xs text-muted-foreground">Market Size</p>
                        <p className="text-lg font-semibold">{idea.marketSize}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Funding Potential</p>
                        <Badge
                          variant={
                            idea.fundingPotential === "High"
                              ? "default"
                              : idea.fundingPotential === "Moderate"
                              ? "secondary"
                              : "outline"
                          }
                        >
                          {idea.fundingPotential}
                        </Badge>
                      </div>
                      <div className="col-span-2">
                        <p className="text-xs text-muted-foreground">Competition</p>
                        <Badge variant="outline">{idea.competition}</Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Funding Areas Tab */}
          <TabsContent value="funding" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              {data.fundingAreas.map((area, idx) => (
                <Card key={idx} className="hover:shadow-lg transition-all border-l-4 border-green-500">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <CardTitle className="text-2xl flex items-center gap-2">
                        <DollarSign className="h-6 w-6 text-green-500" />
                        {area.sector}
                      </CardTitle>
                      <Badge
                        variant={area.trend === "Rising" ? "default" : area.trend === "Stable" ? "secondary" : "outline"}
                      >
                        {area.trend}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Total Funding</p>
                        <p className="text-2xl font-bold text-green-600">{area.totalFunding}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Recent Rounds</p>
                        <p className="text-2xl font-bold">{area.recentRounds}</p>
                      </div>
                    </div>
                    <div>
                      <p className="text-sm font-semibold mb-2">Top Investors:</p>
                      <div className="flex flex-wrap gap-2">
                        {area.topInvestors.map((investor, invIdx) => (
                          <Badge key={invIdx} variant="secondary">
                            {investor}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div>
                      <p className="text-sm font-semibold mb-2">Key Startups:</p>
                      <div className="flex flex-wrap gap-2">
                        {area.keyStartups.map((startup, stIdx) => (
                          <Badge key={stIdx} variant="outline">
                            {startup}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* News Tab */}
          <TabsContent value="news" className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              {data.news.map((article, idx) => (
                <Card key={idx} className="hover:shadow-lg transition-all group cursor-pointer">
                  <CardHeader>
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <CardTitle className="text-lg group-hover:text-primary transition-colors line-clamp-2">
                          {article.title}
                        </CardTitle>
                        <div className="flex items-center gap-3 mt-2 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {new Date(article.date).toLocaleDateString()}
                          </span>
                          <span className="flex items-center gap-1">
                            <Newspaper className="h-3 w-3" />
                            {article.source}
                          </span>
                          <Badge variant="outline" className="text-xs">
                            {article.category}
                          </Badge>
                        </div>
                      </div>
                      <ArrowUpRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors flex-shrink-0" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground line-clamp-3">{article.summary}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

