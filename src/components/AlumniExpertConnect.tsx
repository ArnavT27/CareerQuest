import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Search, Mail, MessageCircle, Calendar, MapPin, Briefcase, GraduationCap, Star, Clock, CheckCircle2, Sparkles, TrendingUp, Award } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

export interface Expert {
  id: string;
  name: string;
  title: string;
  company: string;
  field: string;
  location: string;
  experience: string;
  education: string;
  expertise: string[];
  rating: number;
  availability: "Available" | "Busy" | "Away";
  contactMethods: {
    phone?: string;
    email?: string;
    linkedin?: string;
    calendly?: string;
  };
  bio: string;
  languages: string[];
  responseTime: string;
}

interface AlumniExpertConnectProps {
  fieldOfInterest?: string;
  userName?: string;
}

// Mock expert data - In production, this would come from an API
// Each field has unique names
const FIELD_SPECIFIC_EXPERTS: Record<string, Array<{first: string; last: string; title: string; company: string}>> = {
  "Technology": [
    { first: "Alex", last: "Kumar", title: "Senior Software Engineer", company: "Google" },
    { first: "Priya", last: "Sharma", title: "Cloud Architect", company: "AWS" },
    { first: "Ryan", last: "Thompson", title: "DevOps Engineer", company: "Microsoft" },
    { first: "Lisa", last: "Zhang", title: "AI/ML Engineer", company: "OpenAI" },
    { first: "Jordan", last: "Martinez", title: "Full Stack Developer", company: "Meta" },
    { first: "Taylor", last: "Anderson", title: "Cybersecurity Specialist", company: "CrowdStrike" },
  ],
  "Business": [
    { first: "Victoria", last: "Chen", title: "Business Strategy Consultant", company: "McKinsey" },
    { first: "Robert", last: "Johnson", title: "Operations Director", company: "Deloitte" },
    { first: "Sophia", last: "Williams", title: "Product Manager", company: "Amazon" },
    { first: "Daniel", last: "Brown", title: "Management Consultant", company: "BCG" },
    { first: "Emma", last: "Davis", title: "Business Analyst", company: "Accenture" },
    { first: "Christopher", last: "Miller", title: "Strategic Advisor", company: "Bain" },
  ],
  "Healthcare": [
    { first: "Dr. Maya", last: "Patel", title: "Healthcare Administrator", company: "Mayo Clinic" },
    { first: "Dr. James", last: "Wilson", title: "Clinical Director", company: "Johns Hopkins" },
    { first: "Dr. Sarah", last: "Lee", title: "Health Informatics Specialist", company: "Epic Systems" },
    { first: "Dr. Michael", last: "Garcia", title: "Public Health Expert", company: "CDC" },
    { first: "Dr. Jennifer", last: "Moore", title: "Healthcare Consultant", company: "Cleveland Clinic" },
    { first: "Dr. Kevin", last: "Taylor", title: "Medical Research Director", company: "Stanford Health" },
  ],
  "Finance": [
    { first: "Amanda", last: "Roberts", title: "Investment Banker", company: "Goldman Sachs" },
    { first: "Marcus", last: "Jackson", title: "Financial Analyst", company: "JPMorgan" },
    { first: "Olivia", last: "White", title: "Wealth Manager", company: "Morgan Stanley" },
    { first: "Nathan", last: "Harris", title: "Risk Manager", company: "BlackRock" },
    { first: "Isabella", last: "Clark", title: "Financial Planner", company: "Fidelity" },
    { first: "Ethan", last: "Lewis", title: "FinTech Advisor", company: "Stripe" },
  ],
  "Engineering": [
    { first: "Rachel", last: "Green", title: "Mechanical Engineer", company: "Tesla" },
    { first: "Lucas", last: "Adams", title: "Electrical Engineer", company: "General Electric" },
    { first: "Mia", last: "Baker", title: "Systems Engineer", company: "Boeing" },
    { first: "Noah", last: "Gonzalez", title: "Civil Engineer", company: "AECOM" },
    { first: "Ava", last: "Nelson", title: "Biomedical Engineer", company: "Medtronic" },
    { first: "William", last: "Carter", title: "Software Architect", company: "NVIDIA" },
  ],
  "Education": [
    { first: "Charlotte", last: "Mitchell", title: "Curriculum Director", company: "Khan Academy" },
    { first: "Benjamin", last: "Perez", title: "Educational Technologist", company: "Coursera" },
    { first: "Harper", last: "Roberts", title: "Learning Designer", company: "edX" },
    { first: "Mason", last: "Turner", title: "Academic Coordinator", company: "Harvard Extension" },
    { first: "Evelyn", last: "Phillips", title: "Training Manager", company: "LinkedIn Learning" },
    { first: "Henry", last: "Campbell", title: "Education Consultant", company: "Pearson" },
  ],
  "Marketing": [
    { first: "Luna", last: "Parker", title: "Digital Marketing Director", company: "HubSpot" },
    { first: "Jackson", last: "Evans", title: "Brand Strategist", company: "Ogilvy" },
    { first: "Aria", last: "Edwards", title: "Content Marketing Lead", company: "Salesforce" },
    { first: "Aiden", last: "Collins", title: "SEO Specialist", company: "Moz" },
    { first: "Zoe", last: "Stewart", title: "Social Media Manager", company: "Twitter" },
    { first: "Carter", last: "Sanchez", title: "Marketing Analytics", company: "Adobe" },
  ],
  "Data Science": [
    { first: "Nora", last: "Morris", title: "Data Scientist", company: "Palantir" },
    { first: "Leo", last: "Rogers", title: "Machine Learning Engineer", company: "DataRobot" },
    { first: "Layla", last: "Reed", title: "Analytics Director", company: "Tableau" },
    { first: "Owen", last: "Cook", title: "Data Engineer", company: "Databricks" },
    { first: "Scarlett", last: "Morgan", title: "BI Analyst", company: "Power BI" },
    { first: "Logan", last: "Bell", title: "AI Research Scientist", company: "DeepMind" },
  ],
  "Design": [
    { first: "Stella", last: "Murphy", title: "UX/UI Designer", company: "Figma" },
    { first: "Grace", last: "Bailey", title: "Product Designer", company: "Apple" },
    { first: "Lily", last: "Rivera", title: "Creative Director", company: "Adobe" },
    { first: "Chloe", last: "Cooper", title: "Interaction Designer", company: "IDEO" },
    { first: "Penelope", last: "Richardson", title: "Visual Designer", company: "Behance" },
    { first: "Eleanor", last: "Cox", title: "Design Systems Lead", company: "Airbnb" },
  ],
};

const generateMockExperts = (field?: string): Expert[] => {
  const fields = field 
    ? [field]
    : ["Technology", "Business", "Healthcare", "Finance", "Engineering", "Education", "Marketing", "Data Science", "Design"];
  
  const experts: Expert[] = [];
  const locations = ["San Francisco, CA", "New York, NY", "Seattle, WA", "Austin, TX", "Boston, MA", "Chicago, IL", "Los Angeles, CA"];
  const languages = ["English", "Spanish", "Mandarin", "French", "German", "Japanese"];

  fields.forEach((f, fieldIdx) => {
    const fieldExperts = FIELD_SPECIFIC_EXPERTS[f] || FIELD_SPECIFIC_EXPERTS["Technology"];
    
    fieldExperts.forEach((expertData, idx) => {
      const locationIdx = (fieldIdx * fieldExperts.length + idx) % locations.length;
      const languageIdx = idx % languages.length;
      const secondLangIdx = (idx + 1) % languages.length;
      
      // Assign realistic ratings between 4.5-4.9
      const ratingMap = [4.8, 4.7, 4.9, 4.6, 4.8, 4.9, 4.7, 4.5, 4.8, 4.9, 4.6, 4.7]; // Cycle through realistic ratings 4.5-4.9
      const rating = ratingMap[idx % ratingMap.length];
      
      experts.push({
        id: `expert-${f.toLowerCase()}-${idx}`,
        name: `${expertData.first} ${expertData.last}`,
        title: expertData.title,
        company: expertData.company,
        field: f,
        location: locations[locationIdx],
        experience: `${5 + idx * 2}+ years`,
        education: idx % 2 === 0 ? "Master's Degree" : "Ph.D.",
        expertise: [f, `${f} Strategy`, `${f} Consulting`, `${f} Innovation`],
        rating: rating, // Decent ratings between 4.6-4.9
        availability: idx % 3 === 0 ? "Available" : idx % 3 === 1 ? "Busy" : "Away",
        contactMethods: {
          email: `${expertData.first.toLowerCase()}.${expertData.last.toLowerCase()}@${expertData.company.toLowerCase().replace(/\s+/g, '')}.com`,
          linkedin: `linkedin.com/in/${expertData.first.toLowerCase()}-${expertData.last.toLowerCase()}`,
          calendly: `calendly.com/${expertData.first.toLowerCase()}-${expertData.last.toLowerCase()}`,
        },
        bio: `Experienced ${expertData.title} with ${5 + idx * 2} years in ${f}. Passionate about mentoring professionals and sharing industry insights to help you succeed in your career journey.`,
        languages: [languages[0], languages[languageIdx === 0 ? secondLangIdx : languageIdx]],
        responseTime: idx % 2 === 0 ? "Within 24 hours" : "Within 48 hours",
      });
    });
  });

  return experts;
};

export const AlumniExpertConnect = ({ fieldOfInterest, userName }: AlumniExpertConnectProps) => {
  const [experts, setExperts] = useState<Expert[]>([]);
  const [filteredExperts, setFilteredExperts] = useState<Expert[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedField, setSelectedField] = useState<string>(fieldOfInterest || "");
  const [selectedExpert, setSelectedExpert] = useState<Expert | null>(null);
  const [contactDialogOpen, setContactDialogOpen] = useState(false);
  const [contactMethod, setContactMethod] = useState<"email" | "message" | "calendar">("message");
  const [messageText, setMessageText] = useState("");
  const { toast } = useToast();

  const fields = ["Technology", "Business", "Healthcare", "Finance", "Engineering", "Education", "Marketing", "Data Science", "Design"];

  useEffect(() => {
    const mockExperts = generateMockExperts(selectedField || undefined);
    setExperts(mockExperts);
    setFilteredExperts(mockExperts);
  }, [selectedField]);

  useEffect(() => {
    if (fieldOfInterest) {
      setSelectedField(fieldOfInterest);
    }
  }, [fieldOfInterest]);

  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredExperts(experts);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = experts.filter(
      (expert) =>
        expert.name.toLowerCase().includes(query) ||
        expert.title.toLowerCase().includes(query) ||
        expert.company.toLowerCase().includes(query) ||
        expert.field.toLowerCase().includes(query) ||
        expert.expertise.some((e) => e.toLowerCase().includes(query))
    );
    setFilteredExperts(filtered);
  }, [searchQuery, experts]);

  const handleContactExpert = (expert: Expert, method: "email" | "message" | "calendar") => {
    setSelectedExpert(expert);
    setContactMethod(method);
    setContactDialogOpen(true);

    if (method === "email" && expert.contactMethods.email) {
      window.location.href = `mailto:${expert.contactMethods.email}?subject=Career Guidance Request from ${userName || 'Career Quest User'}`;
    } else if (method === "calendar" && expert.contactMethods.calendly) {
      window.open(`https://${expert.contactMethods.calendly}`, "_blank");
    }
  };

  const handleSendMessage = () => {
    if (!messageText.trim()) {
      toast({
        title: "Message Required",
        description: "Please enter a message before sending.",
        variant: "destructive",
      });
      return;
    }

    if (!selectedExpert) return;

    // In production, send message via API
    toast({
      title: "Message Sent!",
      description: `Your message has been sent to ${selectedExpert.name}. You'll receive a response ${selectedExpert.responseTime}.`,
    });

    setMessageText("");
    setContactDialogOpen(false);
  };

  const getAvailabilityColor = (availability: string) => {
    switch (availability) {
      case "Available":
        return "bg-green-500";
      case "Busy":
        return "bg-yellow-500";
      case "Away":
        return "bg-gray-500";
      default:
        return "bg-gray-500";
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 min-h-screen">
      {/* Header */}
      <div className="text-center space-y-4 mb-8">
        <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
          Expert Directory
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Connect with industry professionals and alumni in your field
        </p>
      </div>

      {/* Search and Filter Section */}
      <Card className="p-5 bg-card/60 backdrop-blur-sm border-border/50 shadow-sm">
        <div className="space-y-4">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search experts by name, title, or company..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 h-10 bg-background/50 border-border/50 focus:border-primary/50"
            />
          </div>

          {/* Field Selection */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-medium text-muted-foreground">Fields:</span>
            <Button
              variant={selectedField === "" ? "default" : "ghost"}
              size="sm"
              onClick={() => setSelectedField("")}
              className="h-7 text-xs px-3"
            >
              All
            </Button>
            {fields.map((field) => (
              <Button
                key={field}
                variant={selectedField === field ? "default" : "ghost"}
                size="sm"
                onClick={() => setSelectedField(field)}
                className="h-7 text-xs px-3"
              >
                {field}
              </Button>
            ))}
          </div>

          {/* Results Count */}
          <div className="text-xs text-muted-foreground pt-1 border-t border-border/30">
            {filteredExperts.length} expert{filteredExperts.length !== 1 ? "s" : ""}
            {selectedField && ` in ${selectedField}`}
          </div>
        </div>
      </Card>

      {/* Experts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredExperts.map((expert, index) => (
          <Card 
            key={expert.id} 
            className="group relative overflow-hidden bg-card/80 backdrop-blur-sm border border-border/50 hover:border-primary/40 transition-all duration-300 hover:shadow-xl hover:shadow-primary/10"
            style={{
              animationDelay: `${index * 30}ms`
            }}
          >
            {/* Subtle background gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
            
            <CardHeader className="relative z-10 pb-3">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  <div className="relative flex-shrink-0">
                    <Avatar className="h-12 w-12 border-2 border-primary/20">
                      <AvatarFallback className="bg-gradient-to-br from-primary/90 to-secondary/90 text-white font-semibold text-sm">
                        {expert.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    {/* Status indicator */}
                    <div className={`absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-background ${getAvailabilityColor(expert.availability)}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-base font-semibold mb-0.5 truncate">
                      {expert.name}
                    </CardTitle>
                    <CardDescription className="text-xs text-muted-foreground mb-1.5 line-clamp-1">
                      {expert.title}
                    </CardDescription>
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Briefcase className="h-3 w-3 flex-shrink-0" />
                      <span className="truncate">{expert.company}</span>
                    </div>
                  </div>
                </div>
                {/* Rating */}
                <div className="flex items-center gap-1 bg-yellow-500/10 px-2 py-1 rounded border border-yellow-500/20 flex-shrink-0">
                  <Star className="h-3.5 w-3.5 fill-yellow-500 text-yellow-500" />
                  <span className="text-xs font-bold text-yellow-500">{expert.rating}</span>
                </div>
              </div>

              {/* Field and Availability */}
              <div className="flex items-center justify-between pt-3 mt-3 border-t border-border/30">
                <Badge variant="outline" className="text-xs px-2 py-0.5 bg-primary/10 text-primary border-primary/20">
                  {expert.field}
                </Badge>
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <div className={`w-2 h-2 rounded-full ${getAvailabilityColor(expert.availability)}`} />
                  <span>{expert.availability}</span>
                </div>
              </div>
            </CardHeader>

            <CardContent className="relative z-10 space-y-3 pt-0">
              {/* Location and Response Time */}
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <MapPin className="h-3.5 w-3.5 flex-shrink-0" />
                <span className="truncate">{expert.location}</span>
                <span>•</span>
                <Clock className="h-3.5 w-3.5 flex-shrink-0" />
                <span>{expert.responseTime}</span>
              </div>

              {/* Bio */}
              <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
                {expert.bio}
              </p>

              {/* Expertise Tags */}
              <div className="flex flex-wrap gap-1.5">
                {expert.expertise.slice(0, 3).map((skill, idx) => (
                  <Badge 
                    key={idx} 
                    variant="outline" 
                    className="text-xs px-2 py-0.5 border-border/50 bg-muted/30 text-foreground/70"
                  >
                    {skill}
                  </Badge>
                ))}
                {expert.expertise.length > 3 && (
                  <Badge variant="outline" className="text-xs px-2 py-0.5 border-border/50 bg-muted/30">
                    +{expert.expertise.length - 3}
                  </Badge>
                )}
              </div>

              {/* Experience and Education */}
              <div className="grid grid-cols-2 gap-3 pt-2 border-t border-border/30">
                <div>
                  <p className="text-xs text-muted-foreground mb-0.5">Experience</p>
                  <p className="text-sm font-semibold">{expert.experience}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-0.5">Education</p>
                  <p className="text-sm font-semibold">{expert.education}</p>
                </div>
              </div>

              {/* Contact Buttons */}
              <div className="flex gap-2 pt-3">
                <Button
                  variant="default"
                  size="sm"
                  onClick={() => handleContactExpert(expert, "message")}
                  className="flex-1 text-xs h-8 font-medium"
                >
                  <MessageCircle className="h-3.5 w-3.5 mr-1.5" />
                  Message
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleContactExpert(expert, "calendar")}
                  className="flex-1 text-xs h-8 border-border/50 hover:border-primary/50"
                  disabled={!expert.contactMethods.calendly}
                >
                  <Calendar className="h-3.5 w-3.5 mr-1.5" />
                  Schedule
                </Button>
              </div>

              {/* Email Option */}
              {expert.contactMethods.email && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleContactExpert(expert, "email")}
                  className="w-full text-xs h-8 text-muted-foreground hover:text-foreground"
                >
                  <Mail className="h-3.5 w-3.5 mr-1.5" />
                  Email
                </Button>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {filteredExperts.length === 0 && (
        <Card className="p-12 text-center bg-card/50 border-border/50">
          <div className="space-y-3">
            <div className="text-4xl mb-2">🔍</div>
            <h3 className="text-lg font-semibold">No experts found</h3>
            <p className="text-sm text-muted-foreground">
              Try adjusting your search or field filter
            </p>
          </div>
        </Card>
      )}

      {/* Contact Dialog */}
      <Dialog open={contactDialogOpen} onOpenChange={setContactDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Contact {selectedExpert?.name}</DialogTitle>
            <DialogDescription>
              Choose how you'd like to reach out to {selectedExpert?.title} at {selectedExpert?.company}
            </DialogDescription>
          </DialogHeader>

          {contactMethod === "message" && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="message">Your Message</Label>
                <Textarea
                  id="message"
                  placeholder={`Hi ${selectedExpert?.name}, I'm interested in learning more about ${selectedExpert?.field}...`}
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  className="min-h-[120px]"
                />
                <p className="text-xs text-muted-foreground">
                  {selectedExpert?.responseTime}
                </p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setContactDialogOpen(false)} className="flex-1">
                  Cancel
                </Button>
                <Button onClick={handleSendMessage} className="flex-1">
                  Send Message
                </Button>
              </div>
            </div>
          )}

        </DialogContent>
      </Dialog>
    </div>
  );
};


