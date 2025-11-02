import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Phone, Clock, Video, Users } from "lucide-react";

export const Call = () => {
  const upcomingCalls = [
    {
      id: 1,
      title: "Career Consultation",
      type: "Video Call",
      date: "2024-12-20",
      time: "10:00 AM",
      duration: "30 minutes",
      with: "Career Counselor",
    },
  ];

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Schedule a Call
          </h1>
          <p className="text-lg text-muted-foreground mt-2">
            Book a consultation with career experts
          </p>
        </div>
        <Button className="gap-2">
          <Calendar className="h-4 w-4" />
          Schedule New Call
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Video className="h-5 w-5 text-primary" />
              <CardTitle>Upcoming Calls</CardTitle>
            </div>
            <CardDescription>Your scheduled consultations</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {upcomingCalls.length > 0 ? (
              upcomingCalls.map((call) => (
                <div key={call.id} className="p-4 border rounded-lg space-y-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold">{call.title}</h3>
                      <p className="text-sm text-muted-foreground">With {call.with}</p>
                    </div>
                    <Badge variant="outline">{call.type}</Badge>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {call.date}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {call.time}
                    </span>
                    <span>{call.duration}</span>
                  </div>
                  <div className="flex gap-2 mt-3">
                    <Button size="sm" variant="outline" className="flex-1">
                      <Phone className="h-3 w-3 mr-1" />
                      Join Call
                    </Button>
                    <Button size="sm" variant="outline">Cancel</Button>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-muted-foreground text-center py-4">No upcoming calls</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-secondary" />
              <CardTitle>Available Experts</CardTitle>
            </div>
            <CardDescription>Connect with career professionals</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="p-4 border rounded-lg">
              <h3 className="font-semibold">Career Counselors</h3>
              <p className="text-sm text-muted-foreground">Get personalized career guidance</p>
              <Button size="sm" className="mt-3" variant="outline">
                View Availability
              </Button>
            </div>
            <div className="p-4 border rounded-lg">
              <h3 className="font-semibold">Industry Mentors</h3>
              <p className="text-sm text-muted-foreground">Connect with experienced professionals</p>
              <Button size="sm" className="mt-3" variant="outline">
                View Availability
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

