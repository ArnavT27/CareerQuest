import { GoogleGenerativeAI } from '@google/generative-ai';

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(API_KEY || '');

export interface TrendingJob {
  title: string;
  field: string;
  demand: string;
  salaryRange: string;
  growth: string;
  searchVolume?: number;
  rank: number;
}

export interface TrendingSkill {
  skill: string;
  demand: 'Very High' | 'High' | 'Moderate' | 'Low';
  industries: string[];
  averageSalary: string;
  growthRate: string;
  rank: number;
}

export interface TrendingCareer {
  title: string;
  matchScore: number;
  field: string;
  description: string;
  salaryRange: string;
  growthProspects: string;
  rank: number;
}

export interface JobCreationArea {
  field: string;
  jobGrowth: string;
  jobCount: string;
  newRoles: string[];
  keyCompanies: string[];
  trend: string;
}

export interface StartupIdea {
  idea: string;
  field: string;
  marketSize: string;
  competition: string;
  fundingPotential: string;
  description: string;
}

export interface FundingArea {
  sector: string;
  totalFunding: string;
  recentRounds: number;
  topInvestors: string[];
  trend: string;
  keyStartups: string[];
}

export interface CareerNews {
  title: string;
  source: string;
  date: string;
  summary: string;
  category: string;
  url?: string;
}

export interface LeaderboardData {
  topJobs: TrendingJob[];
  topSkills: TrendingSkill[];
  topCareers: TrendingCareer[];
  jobCreationAreas: JobCreationArea[];
  startupIdeas: StartupIdea[];
  fundingAreas: FundingArea[];
  news: CareerNews[];
  lastUpdated: string;
}

class LeaderboardService {
  private async generateTrendingData(): Promise<LeaderboardData> {
    const prompt = `You are a career market intelligence analyst. Generate comprehensive, current market trend data for 2024-2025. Provide data in this EXACT JSON format:

{
  "topJobs": [
    {
      "title": "Job Title",
      "field": "Field Name",
      "demand": "Very High/High/Moderate",
      "salaryRange": "$XX,XXX - $XX,XXX",
      "growth": "XX% annually",
      "searchVolume": 1000000,
      "rank": 1
    }
  ],
  "topSkills": [
    {
      "skill": "Skill Name",
      "demand": "Very High/High/Moderate/Low",
      "industries": ["Industry1", "Industry2"],
      "averageSalary": "$XX,XXX",
      "growthRate": "XX%",
      "rank": 1
    }
  ],
  "topCareers": [
    {
      "title": "Career Title",
      "matchScore": 95,
      "field": "Field Name",
      "description": "Brief description",
      "salaryRange": "$XX,XXX - $XX,XXX",
      "growthProspects": "Excellent/Good/Moderate",
      "rank": 1
    }
  ],
  "jobCreationAreas": [
    {
      "field": "Field Name",
      "jobGrowth": "XX% growth",
      "jobCount": "XXX,XXX new jobs",
      "newRoles": ["Role1", "Role2"],
      "keyCompanies": ["Company1", "Company2"],
      "trend": "Rising/Stable/Declining"
    }
  ],
  "startupIdeas": [
    {
      "idea": "Idea Name",
      "field": "Field Name",
      "marketSize": "$XX billion",
      "competition": "Low/Moderate/High",
      "fundingPotential": "High/Moderate/Low",
      "description": "Brief description"
    }
  ],
  "fundingAreas": [
    {
      "sector": "Sector Name",
      "totalFunding": "$XX billion in 2024",
      "recentRounds": 150,
      "topInvestors": ["Investor1", "Investor2"],
      "trend": "Rising/Stable/Declining",
      "keyStartups": ["Startup1", "Startup2"]
    }
  ],
  "news": [
    {
      "title": "News Headline",
      "source": "Source Name",
      "date": "YYYY-MM-DD",
      "summary": "Brief summary",
      "category": "Category",
      "url": "Optional URL"
    }
  ]
}

Generate at least:
- 15 top jobs (current trending jobs in 2024-2025) - MUST include at least 3-4 art-related jobs such as: Graphic Designer, UI/UX Designer, Digital Artist, Creative Director, Art Director, Illustrator, Animator, Art Curator, Art Therapist, Game Artist, or similar creative/artistic roles
- 15 top skills (most in-demand skills)
- 10 top careers (most searched/recommended) - Include at least 2-3 art/creative careers
- 8 startup ideas (hot startup opportunities)
- 8 funding areas (sectors receiving most investment)
- 10 news items (latest career/job market news)

IMPORTANT: Ensure art-related fields are well represented in the top jobs list. Include jobs like:
- Graphic Designer, UI/UX Designer, Digital Artist, Creative Director, Art Director
- Illustrator, Animator, Art Curator, Art Therapist, Game Artist
- Fashion Designer, Interior Designer, Product Designer, Visual Designer

Focus on CURRENT 2024-2025 trends, NOT historical data. Make data realistic and based on actual market conditions.`;

    try {
      const model = genAI.getGenerativeModel({ 
        model: 'gemini-2.5-flash',
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
        }
      });
      const result = await model.generateContent(prompt);
      const response = result.response.text();
      
      // Extract JSON from response
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No JSON found in response');
      }
      
      const data = JSON.parse(jsonMatch[0]);
      
      // Add rank numbers and timestamps
      data.topJobs = (data.topJobs || []).map((job: TrendingJob, idx: number) => ({
        ...job,
        rank: idx + 1,
      }));
      
      data.topSkills = (data.topSkills || []).map((skill: TrendingSkill, idx: number) => ({
        ...skill,
        rank: idx + 1,
      }));
      
      data.topCareers = (data.topCareers || []).map((career: TrendingCareer, idx: number) => ({
        ...career,
        rank: idx + 1,
      }));
      
      data.lastUpdated = new Date().toISOString();
      
      return data as LeaderboardData;
    } catch (error) {
      console.error('Error generating trending data:', error);
      return this.getFallbackData();
    }
  }

  private getFallbackData(): LeaderboardData {
    return {
      topJobs: [
        { title: "AI/ML Engineer", field: "Technology", demand: "Very High", salaryRange: "$120,000 - $180,000", growth: "25%", searchVolume: 2500000, rank: 1 },
        { title: "UI/UX Designer", field: "Art & Design", demand: "Very High", salaryRange: "$85,000 - $130,000", growth: "20%", searchVolume: 2100000, rank: 2 },
        { title: "Graphic Designer", field: "Art & Design", demand: "High", salaryRange: "$60,000 - $95,000", growth: "18%", searchVolume: 1800000, rank: 3 },
        { title: "Data Scientist", field: "Technology", demand: "Very High", salaryRange: "$110,000 - $160,000", growth: "22%", searchVolume: 2200000, rank: 4 },
        { title: "Digital Artist", field: "Art & Design", demand: "High", salaryRange: "$70,000 - $110,000", growth: "25%", searchVolume: 1500000, rank: 5 },
        { title: "Cloud Architect", field: "Technology", demand: "Very High", salaryRange: "$130,000 - $190,000", growth: "28%", searchVolume: 1800000, rank: 6 },
        { title: "Creative Director", field: "Art & Design", demand: "High", salaryRange: "$100,000 - $160,000", growth: "15%", searchVolume: 1400000, rank: 7 },
        { title: "Cybersecurity Analyst", field: "Technology", demand: "Very High", salaryRange: "$95,000 - $140,000", growth: "33%", searchVolume: 1500000, rank: 8 },
        { title: "Product Manager", field: "Business", demand: "High", salaryRange: "$115,000 - $165,000", growth: "15%", searchVolume: 2000000, rank: 9 },
      ],
      topSkills: [
        { skill: "AI/Machine Learning", demand: "Very High", industries: ["Technology", "Healthcare", "Finance"], averageSalary: "$140,000", growthRate: "35%", rank: 1 },
        { skill: "Cloud Computing", demand: "Very High", industries: ["Technology", "Consulting"], averageSalary: "$135,000", growthRate: "30%", rank: 2 },
        { skill: "Data Analysis", demand: "Very High", industries: ["Technology", "Finance", "Healthcare"], averageSalary: "$115,000", growthRate: "25%", rank: 3 },
        { skill: "Cybersecurity", demand: "Very High", industries: ["Technology", "Finance"], averageSalary: "$120,000", growthRate: "33%", rank: 4 },
        { skill: "Product Management", demand: "High", industries: ["Technology", "Business"], averageSalary: "$140,000", growthRate: "18%", rank: 5 },
      ],
      topCareers: [
        { title: "AI Engineer", matchScore: 98, field: "Technology", description: "Building intelligent systems", salaryRange: "$120,000 - $180,000", growthProspects: "Excellent", rank: 1 },
        { title: "Data Scientist", matchScore: 95, field: "Technology", description: "Extracting insights from data", salaryRange: "$110,000 - $160,000", growthProspects: "Excellent", rank: 2 },
        { title: "Cloud Solutions Architect", matchScore: 93, field: "Technology", description: "Designing cloud infrastructure", salaryRange: "$130,000 - $190,000", growthProspects: "Excellent", rank: 3 },
      ],
      jobCreationAreas: [
        { field: "Artificial Intelligence", jobGrowth: "40% growth", jobCount: "500,000+ new jobs", newRoles: ["AI Engineer", "ML Ops", "AI Ethics Specialist"], keyCompanies: ["OpenAI", "Google", "Microsoft"], trend: "Rising" },
        { field: "Cloud Computing", jobGrowth: "28% growth", jobCount: "300,000+ new jobs", newRoles: ["Cloud Architect", "DevOps Engineer"], keyCompanies: ["AWS", "Microsoft Azure", "Google Cloud"], trend: "Rising" },
        { field: "Cybersecurity", jobGrowth: "35% growth", jobCount: "400,000+ new jobs", newRoles: ["Security Analyst", "Penetration Tester"], keyCompanies: ["Palo Alto", "CrowdStrike"], trend: "Rising" },
      ],
      startupIdeas: [
        { idea: "AI-Powered Healthcare Diagnostics", field: "Healthcare", marketSize: "$50 billion", competition: "Moderate", fundingPotential: "High", description: "Using AI for early disease detection" },
        { idea: "Sustainable Tech Solutions", field: "Environment", marketSize: "$30 billion", competition: "Low", fundingPotential: "High", description: "Green technology innovations" },
      ],
      fundingAreas: [
        { sector: "AI & Machine Learning", totalFunding: "$25 billion in 2024", recentRounds: 450, topInvestors: ["Andreessen Horowitz", "Sequoia Capital"], trend: "Rising", keyStartups: ["OpenAI", "Anthropic"] },
        { sector: "FinTech", totalFunding: "$18 billion in 2024", recentRounds: 320, topInvestors: ["Tiger Global", "Insight Partners"], trend: "Rising", keyStartups: ["Stripe", "Chime"] },
      ],
      news: [
        { title: "AI Jobs Surge 40% in 2024", source: "TechCrunch", date: "2024-12-15", summary: "Artificial intelligence sector sees unprecedented job growth", category: "Job Market", url: "#" },
        { title: "Remote Work Trends in 2025", source: "Forbes", date: "2024-12-10", summary: "Latest trends in remote work and hybrid models", category: "Work Trends", url: "#" },
      ],
      lastUpdated: new Date().toISOString(),
    };
  }

  async getLeaderboardData(forceRefresh: boolean = false): Promise<LeaderboardData> {
    // Cache data for 1 hour
    const cacheKey = 'leaderboard_data';
    const cacheTime = 'leaderboard_time';
    
    if (!forceRefresh) {
      const cached = localStorage.getItem(cacheKey);
      const cachedTime = localStorage.getItem(cacheTime);
      
      if (cached && cachedTime) {
        const age = Date.now() - parseInt(cachedTime);
        if (age < 3600000) { // 1 hour
          return JSON.parse(cached);
        }
      }
    }
    
    try {
      const data = await this.generateTrendingData();
      localStorage.setItem(cacheKey, JSON.stringify(data));
      localStorage.setItem(cacheTime, Date.now().toString());
      return data;
    } catch (error) {
      console.error('Error fetching leaderboard data:', error);
      const fallback = this.getFallbackData();
      localStorage.setItem(cacheKey, JSON.stringify(fallback));
      localStorage.setItem(cacheTime, Date.now().toString());
      return fallback;
    }
  }
}

export const leaderboardService = new LeaderboardService();

