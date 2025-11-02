import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

// Progress bar component with proper TypeScript types
interface ProgressBarProps {
  value: number;
  className?: string;
}

const ProgressBar = ({ value, className = '' }: ProgressBarProps) => {
  return (
    <div className={`w-full bg-gray-200 rounded-full h-2.5 ${className}`}>
      <div
        className="bg-primary h-2.5 rounded-full transition-all duration-300 ease-in-out"
        style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
      />
    </div>
  );
};

import { ScenarioQuiz } from "@/components/ScenarioQuiz";
import { ResultsDisplay } from "@/components/ResultsDisplay";
import { geminiService } from "@/services/geminiService";
import { useToast } from "@/hooks/use-toast";

interface ScenariosPathProps {
  userName: string;
  onBack: () => void;
  onNavigateToExpertConnect?: () => void;
}

interface PersonalityTrait {
  trait: string;
  score: number;
  description: string;
  careerImplications: string;
}

interface SkillGap {
  skill: string;
  currentLevel: number;
  targetLevel: number;
  importance: number;
}

interface LearningPathItem {
  skill: string;
  resources: string[];
  action: string;
  timeline: string;
  measurableOutcome: string;
}

interface CareerAnalysis {
  personalityProfile?: PersonalityTrait[];
  skillGaps?: SkillGap[];
  learningPath?: LearningPathItem[];
}

interface CareerRecommendation {
  title: string;
  description: string;
  fitScore: number;
  reasons: string[];
  growthPotential: string;
  salaryRange: string;
  requiredSkills: string[];
  recommendedCertifications: string[];
}

interface FieldCardProps {
  field: {
    id: string;
    name: string;
    icon: string;
    description: string;
  };
  isSelected: boolean;
  onClick: () => void;
  className?: string;
}

const FieldCard = ({ field, isSelected, onClick, className = '' }: FieldCardProps) => (
  <div
    onClick={onClick}
    className={`relative p-6 rounded-xl border-2 transition-all duration-300 cursor-pointer hover:shadow-lg overflow-hidden group ${isSelected ? 'border-primary bg-primary/5' : 'border-border/50 hover:border-primary/50'} ${className}`}
  >
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between mb-3">
        <div className="text-3xl">{field.icon}</div>
        {isSelected && (
          <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center">
            <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          </div>
        )}
      </div>
      <h3 className="text-lg font-semibold mb-1">{field.name}</h3>
      <p className="text-sm text-muted-foreground">{field.description}</p>
      <div className={`absolute inset-0 bg-gradient-to-t from-background/90 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4`}>
        <span className="text-sm font-medium text-primary">Select {field.name}</span>
      </div>
    </div>
  </div>
);

const NICHE_FIELDS: Record<string, Array<{ id: string; name: string; description: string; icon: string }>> = {
  technology: [
    { id: "web-development", name: "Web Development", description: "Frontend, backend, full-stack development", icon: "🌐" },
    { id: "mobile-development", name: "Mobile Development", description: "iOS, Android, cross-platform apps", icon: "📱" },
    { id: "devops", name: "DevOps & Cloud", description: "CI/CD, cloud infrastructure, automation", icon: "☁️" },
    { id: "data-science", name: "Data Science", description: "ML, AI, data analysis, predictive modeling", icon: "🤖" },
    { id: "cybersecurity", name: "Cybersecurity", description: "Security, threat analysis, risk management", icon: "🔒" },
    { id: "game-development", name: "Game Development", description: "Game design, game engines, interactive media", icon: "🎮" }
  ],
  business: [
    { id: "strategy", name: "Business Strategy", description: "Strategic planning, market analysis, competitive intelligence", icon: "🎯" },
    { id: "operations-management", name: "Operations Management", description: "Process optimization, supply chain, efficiency", icon: "⚙️" },
    { id: "project-management", name: "Project Management", description: "Agile, Scrum, project coordination", icon: "📋" },
    { id: "business-analysis", name: "Business Analysis", description: "Requirements, process improvement, stakeholder management", icon: "📊" },
    { id: "entrepreneurship", name: "Entrepreneurship", description: "Startups, business development, innovation", icon: "🚀" },
    { id: "product-management", name: "Product Management", description: "Product strategy, roadmap, go-to-market", icon: "📦" }
  ],
  healthcare: [
    { id: "clinical-management", name: "Clinical Management", description: "Hospital operations, patient care coordination", icon: "🏥" },
    { id: "health-informatics", name: "Health Informatics", description: "Healthcare data, EHR systems, digital health", icon: "💻" },
    { id: "public-health", name: "Public Health", description: "Health policy, epidemiology, community health", icon: "🌍" },
    { id: "healthcare-administration", name: "Healthcare Administration", description: "Healthcare operations, finance, compliance", icon: "📋" },
    { id: "nursing-leadership", name: "Nursing Leadership", description: "Nurse management, care coordination, staff development", icon: "👩‍⚕️" },
    { id: "healthcare-consulting", name: "Healthcare Consulting", description: "Healthcare strategy, process improvement", icon: "💼" }
  ],
  education: [
    { id: "k12-education", name: "K-12 Education", description: "Elementary, middle, high school teaching and administration", icon: "🎒" },
    { id: "higher-education", name: "Higher Education", description: "College, university administration, academic affairs", icon: "🎓" },
    { id: "educational-technology", name: "Educational Technology", description: "EdTech, learning platforms, digital curriculum", icon: "💻" },
    { id: "corporate-training", name: "Corporate Training", description: "Employee development, L&D, training programs", icon: "🏢" },
    { id: "curriculum-design", name: "Curriculum Design", description: "Course development, instructional design", icon: "📚" },
    { id: "education-administration", name: "Education Administration", description: "School management, policy, operations", icon: "📊" }
  ],
  creative: [
    { id: "ux-ui-design", name: "UX/UI Design", description: "User experience, interface design, usability", icon: "🎨" },
    { id: "graphic-design", name: "Graphic Design", description: "Branding, visual identity, print design", icon: "🖼️" },
    { id: "digital-marketing", name: "Digital Marketing", description: "SEO, social media, content marketing", icon: "📱" },
    { id: "content-creation", name: "Content Creation", description: "Writing, video production, storytelling", icon: "✍️" },
    { id: "brand-management", name: "Brand Management", description: "Brand strategy, brand identity, positioning", icon: "🏷️" },
    { id: "advertising", name: "Advertising", description: "Campaign management, creative direction", icon: "📢" }
  ],
  finance: [
    { id: "corporate-finance", name: "Corporate Finance", description: "Financial planning, analysis, treasury", icon: "💼" },
    { id: "investment-banking", name: "Investment Banking", description: "M&A, capital markets, deals", icon: "🏦" },
    { id: "financial-planning", name: "Financial Planning", description: "Wealth management, retirement planning", icon: "💰" },
    { id: "risk-management", name: "Risk Management", description: "Credit risk, market risk, operational risk", icon: "⚠️" },
    { id: "accounting", name: "Accounting", description: "Financial accounting, auditing, tax", icon: "📊" },
    { id: "fintech", name: "FinTech", description: "Financial technology, digital banking, payments", icon: "💳" }
  ],
  engineering: [
    { id: "software-engineering", name: "Software Engineering", description: "Software development, architecture, systems", icon: "💻" },
    { id: "mechanical-engineering", name: "Mechanical Engineering", description: "Product design, manufacturing, systems", icon: "⚙️" },
    { id: "electrical-engineering", name: "Electrical Engineering", description: "Power systems, electronics, controls", icon: "⚡" },
    { id: "civil-engineering", name: "Civil Engineering", description: "Infrastructure, construction, structural design", icon: "🏗️" },
    { id: "systems-engineering", name: "Systems Engineering", description: "System integration, architecture, optimization", icon: "🔧" },
    { id: "biomedical-engineering", name: "Biomedical Engineering", description: "Medical devices, biotechnology, healthcare tech", icon: "🏥" }
  ],
  sales: [
    { id: "b2b-sales", name: "B2B Sales", description: "Enterprise sales, account management", icon: "🏢" },
    { id: "b2c-sales", name: "B2C Sales", description: "Retail sales, customer-facing sales", icon: "🛒" },
    { id: "saas-sales", name: "SaaS Sales", description: "Software sales, subscription models", icon: "💻" },
    { id: "sales-management", name: "Sales Management", description: "Sales team leadership, strategy, operations", icon: "👥" },
    { id: "business-development", name: "Business Development", description: "Partnerships, strategic alliances", icon: "🤝" },
    { id: "inside-sales", name: "Inside Sales", description: "Remote sales, phone/email sales", icon: "📞" }
  ],
  operations: [
    { id: "supply-chain", name: "Supply Chain", description: "Logistics, procurement, distribution", icon: "🚚" },
    { id: "operations-excellence", name: "Operations Excellence", description: "Lean, Six Sigma, process improvement", icon: "📈" },
    { id: "quality-management", name: "Quality Management", description: "QA, quality control, compliance", icon: "✅" },
    { id: "facilities-management", name: "Facilities Management", description: "Building operations, maintenance, services", icon: "🏢" },
    { id: "production-management", name: "Production Management", description: "Manufacturing, production planning", icon: "🏭" },
    { id: "inventory-management", name: "Inventory Management", description: "Stock control, warehousing, optimization", icon: "📦" }
  ],
  hr: [
    { id: "talent-acquisition", name: "Talent Acquisition", description: "Recruiting, sourcing, hiring", icon: "🔍" },
    { id: "hr-operations", name: "HR Operations", description: "HRIS, payroll, benefits administration", icon: "⚙️" },
    { id: "organizational-development", name: "Organizational Development", description: "Change management, culture, transformation", icon: "🔄" },
    { id: "employee-relations", name: "Employee Relations", description: "Labor relations, conflict resolution", icon: "🤝" },
    { id: "compensation-benefits", name: "Compensation & Benefits", description: "Total rewards, compensation design", icon: "💵" },
    { id: "hr-business-partner", name: "HR Business Partner", description: "Strategic HR, business alignment", icon: "💼" }
  ],
  legal: [
    { id: "corporate-law", name: "Corporate Law", description: "Corporate transactions, M&A, securities", icon: "🏢" },
    { id: "litigation", name: "Litigation", description: "Dispute resolution, trial advocacy", icon: "⚖️" },
    { id: "compliance", name: "Compliance", description: "Regulatory compliance, risk management", icon: "✅" },
    { id: "contract-law", name: "Contract Law", description: "Contract negotiation, drafting", icon: "📄" },
    { id: "intellectual-property", name: "Intellectual Property", description: "Patents, trademarks, IP protection", icon: "💡" },
    { id: "employment-law", name: "Employment Law", description: "Labor law, employment compliance", icon: "👔" }
  ],
  consulting: [
    { id: "strategy-consulting", name: "Strategy Consulting", description: "Strategic planning, business strategy", icon: "🎯" },
    { id: "technology-consulting", name: "Technology Consulting", description: "IT strategy, digital transformation", icon: "💻" },
    { id: "management-consulting", name: "Management Consulting", description: "Operations, organizational effectiveness", icon: "📊" },
    { id: "financial-consulting", name: "Financial Consulting", description: "Financial advisory, restructuring", icon: "💰" },
    { id: "hr-consulting", name: "HR Consulting", description: "Talent, organizational design", icon: "👥" },
    { id: "change-management", name: "Change Management", description: "Organizational change, transformation", icon: "🔄" }
  ],
  data: [
    { id: "data-science", name: "Data Science", description: "ML, predictive analytics, modeling", icon: "🧪" },
    { id: "data-engineering", name: "Data Engineering", description: "Data pipelines, ETL, infrastructure", icon: "🔧" },
    { id: "business-intelligence", name: "Business Intelligence", description: "Reporting, dashboards, analytics", icon: "📊" },
    { id: "data-analytics", name: "Data Analytics", description: "Statistical analysis, insights", icon: "📈" },
    { id: "ai-ml", name: "AI/ML Engineering", description: "Machine learning, AI systems", icon: "🤖" },
    { id: "data-governance", name: "Data Governance", description: "Data quality, privacy, compliance", icon: "🛡️" }
  ]
};

const FIELDS = [
  {
    id: "technology",
    name: "Technology",
    icon: "💻",
    description: "Software, IT, engineering, and tech innovation",
    marketDemand: "Very High",
    avgSalary: "$85,000 - $130,000",
    growthRate: "18% annually",
    idealFor: ["Problem solvers", "Logical thinkers", "Innovation enthusiasts", "Continuous learners"],
    commonRoles: ["Software Engineer", "Data Scientist", "Product Manager", "DevOps Engineer"],
    keySkills: ["Programming", "System Design", "Data Analysis", "Technical Leadership"]
  },
  {
    id: "business",
    name: "Business",
    icon: "💼",
    description: "Management, consulting, operations, and strategy",
    marketDemand: "High",
    avgSalary: "$75,000 - $120,000",
    growthRate: "12% annually",
    idealFor: ["Strategic thinkers", "People leaders", "Goal-oriented individuals", "Communication experts"],
    commonRoles: ["Business Analyst", "Operations Manager", "Strategy Consultant", "Project Manager"],
    keySkills: ["Strategic Planning", "Leadership", "Financial Analysis", "Stakeholder Management"]
  },
  {
    id: "healthcare",
    name: "Healthcare",
    icon: "🏥",
    description: "Medical, nursing, healthcare administration",
    marketDemand: "Very High",
    avgSalary: "$70,000 - $110,000",
    growthRate: "15% annually",
    idealFor: ["Compassionate caregivers", "Detail-oriented individuals", "Team collaborators", "Lifelong learners"],
    commonRoles: ["Healthcare Administrator", "Clinical Manager", "Health Informatics", "Quality Coordinator"],
    keySkills: ["Patient Care", "Regulatory Compliance", "Healthcare Operations", "Quality Management"]
  },
  {
    id: "education",
    name: "Education",
    icon: "🎓",
    description: "Teaching, training, educational leadership",
    marketDemand: "Moderate",
    avgSalary: "$50,000 - $85,000",
    growthRate: "8% annually",
    idealFor: ["Natural teachers", "Patient mentors", "Curriculum developers", "Community builders"],
    commonRoles: ["Educational Administrator", "Training Manager", "Curriculum Developer", "Academic Coordinator"],
    keySkills: ["Teaching", "Curriculum Design", "Educational Technology", "Student Assessment"]
  },
  {
    id: "creative",
    name: "Creative",
    icon: "🎨",
    description: "Design, marketing, content creation",
    marketDemand: "High",
    avgSalary: "$60,000 - $95,000",
    growthRate: "10% annually",
    idealFor: ["Visual thinkers", "Brand storytellers", "Trend followers", "Artistic innovators"],
    commonRoles: ["UX Designer", "Marketing Manager", "Content Strategist", "Brand Manager"],
    keySkills: ["Design Thinking", "Brand Strategy", "Content Creation", "Digital Marketing"]
  },
  {
    id: "finance",
    name: "Finance",
    icon: "💰",
    description: "Banking, investment, financial planning",
    marketDemand: "High",
    avgSalary: "$80,000 - $125,000",
    growthRate: "11% annually",
    idealFor: ["Analytical minds", "Risk assessors", "Detail-oriented planners", "Numbers enthusiasts"],
    commonRoles: ["Financial Analyst", "Investment Advisor", "Risk Manager", "Financial Planner"],
    keySkills: ["Financial Analysis", "Risk Management", "Investment Strategy", "Regulatory Knowledge"]
  },
  {
    id: "engineering",
    name: "Engineering",
    icon: "⚙️",
    description: "Mechanical, civil, electrical, and systems engineering",
    marketDemand: "Very High",
    avgSalary: "$80,000 - $135,000",
    growthRate: "16% annually",
    idealFor: ["Technical problem solvers", "Precision-focused individuals", "Systems thinkers", "Innovation drivers"],
    commonRoles: ["Project Engineer", "Systems Engineer", "Engineering Manager", "Technical Consultant"],
    keySkills: ["Technical Design", "Project Management", "Quality Assurance", "Systems Integration"]
  },
  {
    id: "sales",
    name: "Sales & Business Development",
    icon: "📈",
    description: "Sales, account management, business development",
    marketDemand: "High",
    avgSalary: "$65,000 - $150,000",
    growthRate: "14% annually",
    idealFor: ["Relationship builders", "Persuasive communicators", "Goal-driven achievers", "Competitive spirits"],
    commonRoles: ["Sales Manager", "Account Executive", "Business Development Manager", "Sales Director"],
    keySkills: ["Relationship Building", "Negotiation", "Market Analysis", "Revenue Generation"]
  },
  {
    id: "operations",
    name: "Operations & Supply Chain",
    icon: "🔗",
    description: "Operations management, logistics, supply chain optimization",
    marketDemand: "High",
    avgSalary: "$70,000 - $115,000",
    growthRate: "13% annually",
    idealFor: ["Process optimizers", "Detail-oriented planners", "Efficiency experts", "Coordination specialists"],
    commonRoles: ["Operations Manager", "Supply Chain Analyst", "Logistics Coordinator", "Process Improvement Manager"],
    keySkills: ["Process Optimization", "Logistics Management", "Data Analysis", "Vendor Management"]
  },
  {
    id: "hr",
    name: "Human Resources",
    icon: "👥",
    description: "HR management, talent acquisition, organizational development",
    marketDemand: "Moderate",
    avgSalary: "$65,000 - $105,000",
    growthRate: "9% annually",
    idealFor: ["People advocates", "Empathetic communicators", "Policy implementers", "Culture builders"],
    commonRoles: ["HR Manager", "Talent Acquisition Specialist", "Organizational Development Consultant", "Compensation Analyst"],
    keySkills: ["Employee Relations", "Talent Management", "Policy Development", "Performance Management"]
  },
  {
    id: "legal",
    name: "Legal & Compliance",
    icon: "⚖️",
    description: "Legal services, compliance, risk management",
    marketDemand: "Moderate",
    avgSalary: "$85,000 - $160,000",
    growthRate: "7% annually",
    idealFor: ["Detail-oriented analysts", "Ethical advocates", "Critical thinkers", "Research specialists"],
    commonRoles: ["Legal Counsel", "Compliance Officer", "Contract Manager", "Legal Operations Manager"],
    keySkills: ["Legal Research", "Regulatory Compliance", "Contract Negotiation", "Risk Assessment"]
  },
  {
    id: "consulting",
    name: "Management Consulting",
    icon: "🎯",
    description: "Strategic consulting, change management, business transformation",
    marketDemand: "High",
    avgSalary: "$90,000 - $180,000",
    growthRate: "15% annually",
    idealFor: ["Strategic thinkers", "Problem solvers", "Change agents", "Client-focused professionals"],
    commonRoles: ["Management Consultant", "Strategy Advisor", "Change Management Specialist", "Business Transformation Lead"],
    keySkills: ["Strategic Analysis", "Change Management", "Client Relations", "Business Process Design"]
  },
  {
    id: "data",
    name: "Data & Analytics",
    icon: "📊",
    description: "Data science, business intelligence, analytics",
    marketDemand: "Very High",
    avgSalary: "$85,000 - $140,000",
    growthRate: "22% annually",
    idealFor: ["Analytical thinkers", "Pattern recognizers", "Statistical minds", "Story tellers with data"],
    commonRoles: ["Data Scientist", "Business Intelligence Analyst", "Data Engineer", "Analytics Manager"],
    keySkills: ["Statistical Analysis", "Data Visualization", "Machine Learning", "Business Intelligence"]
  }
];

const ScenariosPath = ({ userName, onBack, onNavigateToExpertConnect }: ScenariosPathProps) => {
  const [fieldOfInterest, setFieldOfInterest] = useState<string>("");
  const [selectedNiche, setSelectedNiche] = useState<string>("");
  const [phase, setPhase] = useState<"field-selection" | "niche-selection" | "scenario-quiz" | "results">("field-selection");
  const [careerAnalysis, setCareerAnalysis] = useState<CareerAnalysis | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const { toast } = useToast();

  const handleFieldSelect = (fieldId: string) => {
    setFieldOfInterest(fieldId === fieldOfInterest ? "" : fieldId);
  };

  const handleProceedToNicheSelection = () => {
    if (fieldOfInterest) {
      setPhase("niche-selection");
    } else {
      toast({
        title: "Please select a field first",
        description: "You need to select a field before proceeding to niche selection.",
        variant: "destructive",
      });
    }
  };

  const handleNicheSelect = (nicheId: string) => {
    setSelectedNiche(nicheId === selectedNiche ? "" : nicheId);
  };

  const handleScenarioComplete = (results: any) => {
    setIsAnalyzing(true);
    // Create a mock analysis with proper types
    const mockAnalysis: CareerAnalysis = {
      personalityProfile: [
        {
          trait: "Analytical",
          score: 85,
          description: "Strong ability to analyze complex problems and data",
          careerImplications: "Thrives in roles requiring critical thinking and data analysis"
        },
        {
          trait: "Leadership",
          score: 78,
          description: "Demonstrates leadership potential and team coordination",
          careerImplications: "Well-suited for leadership and management positions"
        },
        {
          trait: "Creativity",
          score: 65,
          description: "Moderate creative problem-solving abilities",
          careerImplications: "Can contribute innovative ideas in structured environments"
        },
        {
          trait: "Teamwork",
          score: 90,
          description: "Excellent team player and collaborator",
          careerImplications: "Thrives in collaborative work environments"
        },
        {
          trait: "Adaptability",
          score: 82,
          description: "Adapts well to change and new challenges",
          careerImplications: "Suitable for dynamic and evolving roles"
        }
      ],
      skillGaps: [
        {
          skill: "Advanced Data Analysis",
          currentLevel: 3,
          targetLevel: 5,
          importance: 4.5
        },
        {
          skill: "Cloud Architecture",
          currentLevel: 2,
          targetLevel: 4,
          importance: 4.0
        },
        {
          skill: "Project Management",
          currentLevel: 4,
          targetLevel: 5,
          importance: 4.2
        }
      ],
      learningPath: [
        {
          skill: "Advanced Data Analysis",
          resources: [
            "Data Science Specialization on Coursera",
            "Advanced SQL Course"
          ],
          action: "Complete online courses and apply skills to real-world projects",
          timeline: "3-6 months",
          measurableOutcome: "Ability to perform complex data analysis and visualization"
        },
        {
          skill: "Cloud Architecture",
          resources: [
            "AWS Certified Solutions Architect",
            "Cloud Design Patterns"
          ],
          action: "Obtain AWS certification and implement cloud solutions",
          timeline: "4-8 months",
          measurableOutcome: "Ability to design and deploy cloud infrastructure"
        }
      ]
    };

    // Simulate API call
    setTimeout(() => {
      setCareerAnalysis(mockAnalysis);
      setIsAnalyzing(false);
      setPhase("results");
    }, 1500);
  };

  const handleRestart = () => {
    setFieldOfInterest("");
    setSelectedNiche("");
    setPhase("field-selection");
    setCareerAnalysis(null);
  };

  const getPhaseProgress = () => {
    switch (phase) {
      case "field-selection":
        return 0;
      case "niche-selection":
        return 25;
      case "scenario-quiz":
        return 50;
      case "results":
        return 100;
      default:
        return 0;
    }
  };

  const renderFieldSelection = () => (
    <div className="container mx-auto px-4 py-12 max-w-6xl">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-3">Choose Your Field of Interest</h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Select a major field to explore specific career niches and scenarios tailored to your interests.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {FIELDS.map((field) => (
          <FieldCard
            key={field.id}
            field={field}
            isSelected={fieldOfInterest === field.id}
            onClick={() => handleFieldSelect(field.id)}
            className="transition-all duration-300 hover:scale-105"
          />
        ))}
      </div>

      {fieldOfInterest && (
        <div className="mt-12 text-center">
          <Button
            onClick={handleProceedToNicheSelection}
            className="px-8 py-6 text-lg"
            size="lg"
          >
            Continue to Niche Selection
            <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </Button>
        </div>
      )}
    </div>
  );

  const renderNicheSelection = () => {
    const selectedField = FIELDS.find(f => f.id === fieldOfInterest);
    const niches = NICHE_FIELDS[fieldOfInterest] || [];

    return (
      <div className="container mx-auto px-4 py-12 max-w-6xl">
        <div className="text-center mb-8">
          <button
            onClick={() => setPhase("field-selection")}
            className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors"
          >
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Fields
          </button>
          <h1 className="text-4xl font-bold mb-3">Choose a Niche in {selectedField?.name}</h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Select a specific area of interest within {selectedField?.name} to explore tailored scenarios and questions.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {niches.map((niche) => (
            <FieldCard
              key={niche.id}
              field={niche}
              isSelected={selectedNiche === niche.id}
              onClick={() => handleNicheSelect(niche.id)}
              className="transition-all duration-300 hover:scale-105"
            />
          ))}
        </div>

        <div className="mt-12 text-center">
          <Button
            onClick={() => {
              if (selectedNiche) {
                setPhase("scenario-quiz");
              } else {
                toast({
                  title: "Please select a niche",
                  description: "You need to select a niche to continue.",
                  variant: "destructive",
                });
              }
            }}
            disabled={!selectedNiche}
            className={`px-8 py-6 text-lg transition-all duration-300 ${selectedNiche ? 'opacity-100' : 'opacity-70 cursor-not-allowed'}`}
            size="lg"
          >
            Continue with {selectedNiche ? niches.find(n => n.id === selectedNiche)?.name : 'Niche'}
            <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </Button>
        </div>
      </div>
    );
  };

  const renderScenarioPhase = () => {
    const selectedField = FIELDS.find(f => f.id === fieldOfInterest);
    const niche = selectedNiche ? NICHE_FIELDS[fieldOfInterest]?.find(n => n.id === selectedNiche) : null;

    return (
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold mb-4">
            🏢 Real-World Scenarios
          </h2>
          <p className="text-lg text-muted-foreground">
            Navigate workplace challenges in {niche ? niche.name : selectedField?.name} to reveal your professional style
          </p>
          {niche && (
            <Badge variant="secondary" className="mt-2">
              {niche.icon} {niche.name}
            </Badge>
          )}
        </div>

        <ScenarioQuiz
          fieldOfInterest={selectedNiche || fieldOfInterest}
          nicheField={selectedNiche}
          majorField={fieldOfInterest}
          userName={userName}
          onComplete={handleScenarioComplete}
        />
      </div>
    );
  };

  const renderResults = () => {
    if (!careerAnalysis || !careerAnalysis.personalityProfile) {
      return (
        <div className="text-center py-12">
          <div className="text-4xl mb-4">😕</div>
          <h2 className="text-2xl font-bold mb-2">No Results Found</h2>
          <p className="text-muted-foreground mb-6">We couldn&apos;t generate your career analysis. Please try again.</p>
          <Button onClick={() => setPhase("field-selection")}>
            Start Over
          </Button>
        </div>
      );
    }

    return (
      <div className="container mx-auto px-4 py-12 max-w-6xl">
        <div className="space-y-8">
          {/* Personality Profile Section */}
          <Card className="p-6">
            <h2 className="text-2xl font-bold mb-4">Personality Profile</h2>
            <div className="space-y-4">
              {careerAnalysis.personalityProfile?.map((trait, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <h3 className="font-medium">{trait.trait}</h3>
                    <span className="text-sm text-muted-foreground">{trait.score}/100</span>
                  </div>
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary rounded-full"
                      style={{ width: `${trait.score}%` }}
                    />
                  </div>
                  <p className="text-sm text-muted-foreground">{trait.description}</p>
                  <p className="text-xs text-muted-foreground">
                    <span className="font-medium">Career Implications:</span> {trait.careerImplications}
                  </p>
                </div>
              ))}
            </div>
          </Card>

          {/* Skill Gaps Section */}
          {careerAnalysis.skillGaps && careerAnalysis.skillGaps.length > 0 && (
            <Card className="p-6">
              <h2 className="text-2xl font-bold mb-4">Skill Gaps</h2>
              <div className="space-y-4">
                {careerAnalysis.skillGaps.map((gap, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <h3 className="font-medium">{gap.skill}</h3>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm">
                          {gap.currentLevel} → {gap.targetLevel}
                        </span>
                        <span className="text-xs px-2 py-1 bg-primary/10 text-primary rounded-full">
                          {gap.importance}/5 Importance
                        </span>
                      </div>
                    </div>
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary rounded-full"
                        style={{
                          width: `${(gap.currentLevel / gap.targetLevel) * 100}%`,
                          maxWidth: '100%'
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Learning Path Section */}
          {careerAnalysis.learningPath && careerAnalysis.learningPath.length > 0 && (
            <Card className="p-6">
              <h2 className="text-2xl font-bold mb-4">Recommended Learning Path</h2>
              <div className="space-y-6">
                {careerAnalysis.learningPath.map((item, index) => (
                  <div key={index} className="space-y-3">
                    <div className="flex items-center space-x-3">
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="text-primary font-medium">{index + 1}</span>
                      </div>
                      <h3 className="text-lg font-medium">{item.skill}</h3>
                    </div>

                    <div className="pl-11 space-y-3">
                      <div>
                        <h4 className="text-sm font-medium text-muted-foreground">Action Items</h4>
                        <p className="text-sm">{item.action}</p>
                      </div>

                      <div>
                        <h4 className="text-sm font-medium text-muted-foreground">Timeline</h4>
                        <p className="text-sm">{item.timeline}</p>
                      </div>

                      <div>
                        <h4 className="text-sm font-medium text-muted-foreground">Resources</h4>
                        <ul className="list-disc list-inside space-y-1 mt-1">
                          {item.resources.map((resource, resIndex) => (
                            <li key={resIndex} className="text-sm">{resource}</li>
                          ))}
                        </ul>
                      </div>

                      <div>
                        <h4 className="text-sm font-medium text-muted-foreground">Expected Outcome</h4>
                        <p className="text-sm">{item.measurableOutcome}</p>
                      </div>
                    </div>

                    {index < careerAnalysis.learningPath!.length - 1 && (
                      <div className="pl-11 pt-2">
                        <div className="h-6 w-px bg-border mx-auto"></div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Action Buttons */}
          <div className="flex justify-center space-x-4 pt-6">
            <Button
              variant="outline"
              onClick={() => {
                setFieldOfInterest("");
                setSelectedNiche("");
                setPhase("field-selection");
              }}
            >
              Start New Analysis
            </Button>
            <Button>Save Results</Button>
          </div>
        </div>
      </div>
    );
  };

  // Component's return statement
  return (
    <div className="min-h-screen p-4 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 right-20 w-40 h-40 bg-secondary/5 rounded-full blur-3xl animate-pulse-glow" />
        <div className="absolute bottom-20 left-20 w-40 h-40 bg-primary/5 rounded-full blur-3xl animate-pulse-glow" style={{ animationDelay: '1s' }} />
      </div>

      <div className="w-full max-w-7xl mx-auto relative z-10">
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
                {userName}'s Scenario Analysis
              </h1>
            </div>

            <div className="w-32"></div>
          </div>

          <div className="space-y-4">
            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-2">
                Phase: {phase.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
              </p>
            </div>
            <div className="mb-4">
              <ProgressBar
                value={getPhaseProgress()}
                className="h-2"
              />
            </div>

            <div className="text-center text-sm text-muted-foreground">
              <p>🎭 Discover your career path through realistic workplace scenarios</p>
            </div>
          </div>
        </div>

        {/* Main content */}
        <div className="bg-background/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg">
          {isAnalyzing ? (
            <div className="text-center py-20">
              <div className="inline-flex items-center justify-center mb-6">
                <div className="relative">
                  <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                    <svg className="w-8 h-8 text-primary animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <div className="absolute -inset-1.5 bg-primary/20 rounded-full -z-10 animate-ping"></div>
                </div>
              </div>
              <h2 className="text-2xl font-semibold">Analyzing your responses...</h2>
              <p className="text-muted-foreground mt-2">We're generating your personalized career insights</p>
              <div className="mt-6 max-w-md mx-auto h-1.5 bg-gray-200 rounded-full overflow-hidden">
                <div className="h-full bg-primary rounded-full animate-progress"></div>
              </div>
            </div>
          ) : (
            <>
              {phase === "field-selection" && renderFieldSelection()}
              {phase === "niche-selection" && renderNicheSelection()}
              {phase === "scenario-quiz" && renderScenarioPhase()}
              {phase === "results" && renderResults()}
            </>
          )}
        </div>
      </div>
    </div>
  );
};
export default ScenariosPath;