import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Users, Search, UserPlus, MessageCircle } from "lucide-react";

export const Connections = () => {
  const connections = [
    { id: 1, name: "Sarah Johnson", role: "Product Manager", company: "Tech Corp", mutual: 5 },
    { id: 2, name: "Mike Chen", role: "Software Engineer", company: "StartupXYZ", mutual: 3 },
    { id: 3, name: "Emily Davis", role: "Data Scientist", company: "DataCo", mutual: 8 },
  ];

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
          Connections
        </h1>
        <Button className="gap-2">
          <UserPlus className="h-4 w-4" />
          Find Connections
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Search className="h-5 w-5 text-muted-foreground" />
            <CardTitle>Search Connections</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <Input placeholder="Search by name, role, or company..." className="max-w-md" />
        </CardContent>
      </Card>

      <div>
        <h2 className="text-2xl font-semibold mb-4">Your Network</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {connections.map((connection) => (
            <Card key={connection.id} className="hover:shadow-lg transition-all">
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  <Avatar>
                    <AvatarFallback>
                      {connection.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <h3 className="font-semibold">{connection.name}</h3>
                    <p className="text-sm text-muted-foreground">{connection.role}</p>
                    <p className="text-xs text-muted-foreground">{connection.company}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge variant="secondary" className="text-xs">
                        {connection.mutual} mutual
                      </Badge>
                    </div>
                    <div className="flex gap-2 mt-3">
                      <Button size="sm" variant="outline" className="flex-1 gap-1">
                        <MessageCircle className="h-3 w-3" />
                        Message
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

