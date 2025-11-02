import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FileText, Clock, Award, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

export const Test = () => {
  const navigate = useNavigate();

  const tests = [
    {
      id: "talents",
      title: "Talents Path Assessment",
      description: "Skill-based career assessment with adaptive questions",
      duration: "20-30 minutes",
      questions: 50,
      type: "Skills Assessment",
    },
    {
      id: "scenarios",
      title: "Scenarios Path Assessment",
      description: "Personality and work-style assessment through scenarios",
      duration: "15-20 minutes",
      questions: "Variable",
      type: "Personality Assessment",
    },
  ];

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      <div>
        <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent mb-2">
          Assessment Tests
        </h1>
        <p className="text-lg text-muted-foreground">
          Choose an assessment path to discover your ideal career direction
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {tests.map((test) => (
          <Card key={test.id} className="hover:shadow-lg transition-all group">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                    <FileText className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-xl">{test.title}</CardTitle>
                    <CardDescription className="mt-1">
                      <Badge variant="outline">{test.type}</Badge>
                    </CardDescription>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">{test.description}</p>
              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Duration:</span>
                  <span className="font-medium">{test.duration}</span>
                </div>
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Questions:</span>
                  <span className="font-medium">{test.questions}</span>
                </div>
              </div>
              <Button
                onClick={() => navigate(`/${test.id === "talents" ? "talents" : "scenarios"}`)}
                className="w-full gap-2 group-hover:gap-3 transition-all"
              >
                Start Assessment
                <ArrowRight className="h-4 w-4" />
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Award className="h-5 w-5 text-primary" />
            <CardTitle>Assessment Results</CardTitle>
          </div>
          <CardDescription>View your previous assessment results</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">No previous assessments found</p>
        </CardContent>
      </Card>
    </div>
  );
};

