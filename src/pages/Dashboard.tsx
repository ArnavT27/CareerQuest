import { useNavigate } from "react-router-dom";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { QuestCard } from "@/components/QuestCard";
import { useAuth } from "@/contexts/AuthContext";
import talentsImage from "@/assets/talents-path.jpg";
import scenariosImage from "@/assets/scenarios-path.jpg";
import { Trophy, TrendingUp, Users } from "lucide-react";

export const Dashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary via-secondary to-tertiary bg-clip-text text-transparent mb-2">
          Welcome back, {user?.name}!
        </h1>
        <p className="text-xl text-muted-foreground">
          Continue your career discovery journey
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Assessments Completed</CardTitle>
            <Trophy className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground">Start your first assessment</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Career Matches</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">-</div>
            <p className="text-xs text-muted-foreground">Complete assessment to see matches</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Connections</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground">Build your network</p>
          </CardContent>
        </Card>
      </div>

      {/* Assessment Paths */}
      <div>
        <h2 className="text-2xl font-bold mb-4">Choose Your Assessment Path</h2>
        <div className="grid lg:grid-cols-2 gap-6">
          <QuestCard
            variant="primary"
            onClick={() => navigate("/talents")}
            className="cursor-pointer"
          >
            <div className="text-center">
              <div className="relative mb-8 overflow-hidden rounded-2xl">
                <img
                  src={talentsImage}
                  alt="Unlock your talents"
                  className="w-full h-56 object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-primary/40 via-transparent to-transparent" />
              </div>
              <h3 className="text-3xl font-bold text-primary mb-4">🎯 Talents Path</h3>
              <p className="text-muted-foreground mb-6">
                Skill-based assessment to discover careers matching your strengths
              </p>
              <Button size="lg" className="gap-2">
                Start Assessment
                <span>→</span>
              </Button>
            </div>
          </QuestCard>

          <QuestCard
            variant="secondary"
            onClick={() => navigate("/scenarios")}
            className="cursor-pointer"
          >
            <div className="text-center">
              <div className="relative mb-8 overflow-hidden rounded-2xl">
                <img
                  src={scenariosImage}
                  alt="Explore scenarios"
                  className="w-full h-56 object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-secondary/40 via-transparent to-transparent" />
              </div>
              <h3 className="text-3xl font-bold text-secondary mb-4">🏢 Scenarios Path</h3>
              <p className="text-muted-foreground mb-6">
                Personality-based assessment through real workplace scenarios
              </p>
              <Button size="lg" variant="secondary" className="gap-2">
                Start Assessment
                <span>→</span>
              </Button>
            </div>
          </QuestCard>
        </div>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Quick access to key features</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <Button variant="outline" onClick={() => navigate("/leaderboard")} className="gap-2">
              <Trophy className="h-4 w-4" />
              View Leaderboard
            </Button>
            <Button variant="outline" onClick={() => navigate("/profile")} className="gap-2">
              <span>👤</span>
              View Profile
            </Button>
            <Button variant="outline" onClick={() => navigate("/connections")} className="gap-2">
              <Users className="h-4 w-4" />
              My Connections
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

