import { GoogleGenerativeAI } from '@google/generative-ai';

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(API_KEY);

// System prompts for different analysis types
const SYSTEM_PROMPTS = {
  CAREER_COUNSELOR: `You are a senior career counselor with 20+ years experience. 
    Analyze user responses for: skill patterns, learning preferences, work environment fit, growth potential. 
    Provide actionable insights in JSON format.`,
    
  SKILL_ANALYST: `You are a psychometric analyst specializing in skill assessment. 
    Analyze response patterns to identify underlying competencies, transferable skills, 
    and skill complementarity. Return structured analysis.`,
    
  MARKET_INTELLIGENCE: `You are an industry research analyst. Generate current market 
    insights including: job demand, salary ranges, required skills, emerging opportunities, 
    industry challenges. Focus on actionable data.`,
    
  QUESTION_GENERATOR: `You are an expert assessment designer. Generate adaptive questions 
    that reveal deep insights about skills, preferences, and career fit. 
    Create branching logic for deeper exploration.`,
    
  PERSONAL_COACH: `You are a personal development coach. Create specific, measurable 
    development plans based on user's skill gaps and career goals. 
    Include timelines and actionable steps.`
};

export interface QuizResponse {
  questionId: string;
  question: string;
  answer: string | number | string[];
  reasoning?: string;
  skillsAssessed: string[];
  timestamp: Date;
}

export interface SkillDetail {
  skillName: string;
  overview: string;
  marketDemand: {
    level: string;
    growth: string;
    averageSalary: string;
  };
  industries: {
    name: string;
    demand: string;
    pros: string[];
    cons: string[];
    avgSalary: string;
    jobTitles: string[];
  }[];
  blogPost: {
    title: string;
    content: string;
    keyTakeaways: string[];
  };
  learningResources: {
    type: string;
    title: string;
    description: string;
    difficulty: string;
  }[];
  careerProgression: {
    entry: { title: string; salary: string; requirements: string[] };
    mid: { title: string; salary: string; requirements: string[] };
    senior: { title: string; salary: string; requirements: string[] };
  };
}

export interface CareerAnalysis {
  overallScore: number;
  topStrengths: string[];
  skillGaps: SkillGap[];
  careerRecommendations: CareerRecommendation[];
  developmentPlan: {
    immediate: string[];
    shortTerm: string[];
    longTerm: string[];
  };
  detailedRoadmap?: {
    immediate: Array<{title: string, description: string, timeline: string, priority: string}>;
    shortTerm: Array<{title: string, description: string, timeline: string, priority: string}>;
    longTerm: Array<{title: string, description: string, timeline: string, priority: string}>;
  };
  marketInsights: {
    demandLevel: string;
    competitionLevel: string;
    trendingSkills: string[];
  };
  skillPatterns?: string[];
  learningPath?: LearningPathItem[];
  skillDetails?: SkillDetail[];
  personalityProfile?: PersonalityTrait[];
}

export interface SkillGap {
  skill: string;
  currentLevel: number;
  requiredLevel: number;
  priority: 'high' | 'medium' | 'low';
  developmentTime: string;
}

export interface LearningPathItem {
  skill: string;
  action: string;
  resources: string[];
  timeline: string;
  measurableOutcome: string;
  difficultyLevel?: string;
  prerequisites?: string;
}

export interface PersonalityTrait {
  trait: string;
  score: number;
  description: string;
  careerImplications: string[];
  workplaceExamples?: string[];
}

export interface CareerRecommendation {
  title: string;
  match: number;
  description: string;
  salaryRange: string;
  growthOutlook: string;
  field?: string;
  matchScore?: number;
  growthProspects?: string;
  requiredSkills?: string[];
  timeToTransition?: string;
}

export interface AdaptiveQuestion {
  id: string;
  question: string;
  type: 'multiple-choice' | 'scale' | 'scenario' | 'ranking';
  options?: string[];
  scenario?: string;
  skillsAssessed: string[];
  difficulty: number;
}

class GeminiService {
  private model = genAI.getGenerativeModel({ 
    model: 'gemini-1.5-flash',
    generationConfig: {
      temperature: 0.7,
      topK: 40,
      topP: 0.95,
    }
  });
  private conversationHistory: string[] = [];

  private async makeStructuredRequest(prompt: string, retries: number = 3): Promise<unknown> {
    console.log('🚀 Sending request to Gemini API...');
    console.log('Prompt:', prompt.substring(0, 200) + '...');
    
    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        const result = await this.model.generateContent(prompt);
        const response = result.response.text();
        console.log('✅ Received response from Gemini API');
        console.log('Response preview:', response.substring(0, 200) + '...');
        
        // Clean up response to ensure valid JSON
        const cleanResponse = this.extractJSON(response);
        if (!cleanResponse) {
          throw new Error('No valid JSON found in response');
        }
        const parsed = JSON.parse(cleanResponse);
        console.log('✅ Successfully parsed JSON response');
        
        return parsed;
      } catch (error: unknown) {
        console.error(`❌ Error with Gemini API (attempt ${attempt}/${retries}):`, error);
        
        // Check for quota exceeded error (429)
        if (error instanceof Error && (error.message?.includes('429') || error.message?.includes('quota') || error.message?.includes('exceeded'))) {
          console.log('🚫 API quota exceeded - using fallback data immediately');
          return null;
        }
        
        // Check if it's a 503 overload error
        if (error instanceof Error && (error.message?.includes('503') || error.message?.includes('overloaded'))) {
          if (attempt < retries) {
            const delay = Math.pow(2, attempt) * 1000; // Exponential backoff: 2s, 4s, 8s
            console.log(`⏳ API overloaded, waiting ${delay}ms before retry ${attempt + 1}/${retries}`);
            await new Promise(resolve => setTimeout(resolve, delay));
            continue;
          }
        }
        
        // If it's the last attempt or not a retryable error
        if (attempt === retries) {
          console.log('🔄 All retries exhausted, using fallback data');
          return null;
        }
      }
    }
    return null;
  }

  private extractJSON(text: string): string {
    if (!text || typeof text !== 'string') {
      return '';
    }
    
    // Try to find JSON in the response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return jsonMatch[0];
    }
    
    // If no JSON found, try to clean up the response
    let cleaned = text.trim();
    if (cleaned.startsWith('```json')) {
      cleaned = cleaned.replace(/```json\n?/, '').replace(/```$/, '');
    }
    if (cleaned.startsWith('```')) {
      cleaned = cleaned.replace(/```\n?/, '').replace(/```$/, '');
    }
    
    return cleaned;
  }

  // Add context to conversation history
  addToContext(userInput: string, aiResponse: string) {
    this.conversationHistory.push(`User: ${userInput}`);
    this.conversationHistory.push(`AI: ${aiResponse}`);
    
    console.log('📝 Added to conversation context');
    console.log(`Total context length: ${this.conversationHistory.length} exchanges`);
    
    // Keep only last 10 exchanges to manage context size
    if (this.conversationHistory.length > 20) {
      this.conversationHistory = this.conversationHistory.slice(-20);
      console.log('✂️ Trimmed conversation history to manage size');
    }
  }

  // Generate adaptive questions based on user responses
  async generateAdaptiveQuestions(
    selectedSkills: string[],
    previousAnswers: QuizResponse[],
    phase: 'initial' | 'deep-dive' | 'validation'
  ): Promise<AdaptiveQuestion[]> {
    console.log('🎯 Generating adaptive questions for phase:', phase);
    console.log('Selected skills:', selectedSkills);
    console.log('Previous answers count:', previousAnswers.length);
    
    const context = this.conversationHistory.join('\n');
    const timestamp = Date.now();
    
    const prompt = `
      ${SYSTEM_PROMPTS.QUESTION_GENERATOR}
      
      IMPORTANT: Respond ONLY with valid JSON. No additional text or explanations.
      
      Selected Skills: ${selectedSkills.join(', ')}
      Previous Answers Count: ${previousAnswers.length}
      Assessment Phase: ${phase}
      
      Generate 3 adaptive questions that:
      1. Build on previous responses
      2. Explore ${phase === 'initial' ? 'broad skill assessment' : phase === 'deep-dive' ? 'detailed competencies' : 'validation of insights'}
      3. Use varied question types (scenarios, rankings, scales)
      4. Adapt difficulty based on user engagement
      
      Return ONLY this JSON structure (no markdown, no extra text):
      {
        "questions": [
          {
            "id": "q_${timestamp}_1",
            "question": "What motivates you most when working with ${selectedSkills[0] || 'problem-solving'}?",
            "type": "multiple-choice",
            "options": ["Solving complex problems", "Collaborating with others", "Creating innovative solutions", "Achieving measurable results"],
            "skillsAssessed": ["${selectedSkills[0] || 'motivation'}"],
            "difficultyLevel": 3
          },
          {
            "id": "q_${timestamp}_2", 
            "question": "Rate your confidence in handling unexpected challenges in your field",
            "type": "scale",
            "skillsAssessed": ["adaptability", "confidence"],
            "difficultyLevel": 2
          },
          {
            "id": "q_${timestamp}_3",
            "question": "You're leading a project that's falling behind schedule. What's your first action?",
            "type": "scenario",
            "scenario": "Your team is working on an important project with a tight deadline. You realize you're 20% behind schedule with only 2 weeks left.",
            "options": ["Analyze what's causing delays", "Increase team working hours", "Request deadline extension", "Redistribute tasks among team"],
            "skillsAssessed": ["leadership", "problem-solving"],
            "difficultyLevel": 4
          }
        ]
      }
    `;

    try {
      const result = await this.makeStructuredRequest(prompt);
      
      // Type check the result before returning
      if (result && typeof result === 'object' && 'questions' in result && Array.isArray((result as any).questions)) {
        const questions = (result as any).questions;
        console.log('✅ Generated', questions.length, 'questions from Gemini API');
        this.addToContext(`Generated ${questions.length} questions for ${phase}`, JSON.stringify(questions));
        return questions;
      } else {
        console.log('⚠️ Invalid response from Gemini API, using fallback questions');
        return this.getFallbackQuestions(selectedSkills, phase);
      }
    } catch (error) {
      console.error('Error generating adaptive questions:', error);
      return this.getFallbackDeepDiveQuestions(topSkills.length > 0 ? topSkills : ['Problem Solving', 'Communication']);
    }
  }

  // Generate comprehensive career analysis and recommendations
  async analyzeCareerFit(
    selectedSkills: string[],
    questionResponses: QuizResponse[],
    userProfile: { name: string }
  ): Promise<CareerAnalysis> {
    const context = this.conversationHistory.join('\n');
    const prompt = `
      ${SYSTEM_PROMPTS.CAREER_COUNSELOR}
      
      IMPORTANT: Respond ONLY with valid JSON. No additional text or explanations.
      
      Conversation Context: ${context}
      
      User Profile:
      - Selected Skills: ${selectedSkills.join(', ')}
      - Assessment Responses: ${JSON.stringify(questionResponses)}
      - Additional Info: ${JSON.stringify(userProfile)}
      
      Perform comprehensive career analysis and return ONLY this JSON structure:
      {
        "skillPatterns": ["Strong analytical thinking", "Excellent communication skills", "Creative problem-solving approach"],
        "careerRecommendations": [
          {
            "title": "Data Analyst",
            "field": "Technology",
            "matchScore": 87,
            "description": "Analyze complex data sets to drive business decisions and insights",
            "salaryRange": "$65,000 - $95,000",
            "growthProspects": "High demand with 15% annual growth expected",
            "requiredSkills": ["Python", "SQL", "Statistics", "Data visualization"],
            "timeToTransition": "6-12 months with targeted learning"
          },
          {
            "title": "Product Manager",
            "field": "Technology",
            "matchScore": 82,
            "description": "Lead product development and strategy for digital products",
            "salaryRange": "$80,000 - $120,000",
            "growthProspects": "Strong growth in tech sector",
            "requiredSkills": ["Leadership", "Analytics", "User research", "Agile methodologies"],
            "timeToTransition": "12-18 months with experience building"
          },
          {
            "title": "UX Designer",
            "field": "Design & Technology",
            "matchScore": 78,
            "description": "Design user-centered digital experiences and interfaces",
            "salaryRange": "$70,000 - $105,000", 
            "growthProspects": "Growing demand for digital experiences",
            "requiredSkills": ["Design thinking", "Prototyping", "User research", "Collaboration"],
            "timeToTransition": "8-15 months with portfolio development"
          }
        ],
        "skillGaps": [
          {
            "skill": "Advanced Analytics",
            "currentLevel": 4,
            "requiredLevel": 7,
            "priority": "high",
            "developmentTime": "4-6 months"
          },
          {
            "skill": "Leadership Experience",
            "currentLevel": 3,
            "requiredLevel": 6,
            "priority": "medium",
            "developmentTime": "6-12 months"
          }
        ],
        "learningPath": [
          {
            "skill": "Data Analysis",
            "action": "Complete Google Data Analytics Certificate",
            "resources": ["Coursera Google Certificate", "Kaggle Learn", "Python for Data Analysis book"],
            "timeline": "Next 4 months",
            "measurableOutcome": "Complete 3 data analysis projects and earn certificate"
          },
          {
            "skill": "Leadership Skills",
            "action": "Take leadership role in current projects",
            "resources": ["Internal mentoring program", "Leadership courses", "Cross-functional project opportunities"],
            "timeline": "6-12 months",
            "measurableOutcome": "Successfully lead 2 projects and receive positive team feedback"
          }
        ],
        "personalityProfile": [
          {
            "trait": "Analytical Thinking",
            "score": 8,
            "description": "Strong ability to break down complex problems systematically",
            "careerImplications": ["Research roles", "Data-driven positions", "Strategic planning roles"]
          },
          {
            "trait": "Collaboration Style",
            "score": 7,
            "description": "Works effectively in team environments and values input from others",
            "careerImplications": ["Team-based roles", "Cross-functional positions", "Client-facing opportunities"]
          },
          {
            "trait": "Learning Orientation",
            "score": 9,
            "description": "High motivation to continuously learn and adapt to new challenges",
            "careerImplications": ["Rapidly evolving fields", "Technology roles", "Growth-oriented positions"]
          }
        ],
        "marketInsights": [
          {
            "industry": "Technology",
            "demandLevel": "Very High",
            "averageSalary": "$85,000",
            "growthRate": "18% annually", 
            "keyTrends": ["AI and machine learning adoption", "Remote work transformation", "Data-driven decision making"],
            "emergingRoles": ["AI Product Manager", "Data Storyteller", "Digital Experience Designer"]
          },
          {
            "industry": "Healthcare Technology",
            "demandLevel": "High",
            "averageSalary": "$78,000",
            "growthRate": "12% annually",
            "keyTrends": ["Digital health solutions", "Telemedicine growth", "Health data analytics"],
            "emergingRoles": ["Healthcare UX Designer", "Health Data Analyst", "Digital Health Product Manager"]
          }
        ]
      }
    `;

    try {
      const result = await this.makeStructuredRequest(prompt);
      this.addToContext(prompt, JSON.stringify(result));
      
      // Type check the result before returning
      if (result && typeof result === 'object') {
        // Ensure all required properties exist for CareerAnalysis
        const careerResult = result as Partial<CareerAnalysis>;
        
        // Return a properly structured CareerAnalysis object
        return {
          overallScore: typeof careerResult.overallScore === 'number' ? careerResult.overallScore : 80,
          topStrengths: Array.isArray(careerResult.topStrengths) ? careerResult.topStrengths : selectedSkills,
          skillGaps: Array.isArray(careerResult.skillGaps) ? careerResult.skillGaps : [],
          careerRecommendations: Array.isArray(careerResult.careerRecommendations) ? careerResult.careerRecommendations : [],
          developmentPlan: careerResult.developmentPlan || { immediate: [], shortTerm: [], longTerm: [] },
          marketInsights: careerResult.marketInsights || { demandLevel: 'High', competitionLevel: 'Moderate', trendingSkills: [] },
          skillPatterns: Array.isArray(careerResult.skillPatterns) ? careerResult.skillPatterns : [],
          learningPath: Array.isArray(careerResult.learningPath) ? careerResult.learningPath : [],
          personalityProfile: Array.isArray(careerResult.personalityProfile) ? careerResult.personalityProfile : []
        };
      } else {
        console.log('⚠️ Invalid response from Gemini API, using fallback analysis');
        return this.getFallbackAnalysis(selectedSkills);
      }
    } catch (error) {
      console.error('Error analyzing career fit:', error);
      return this.getFallbackAnalysis(selectedSkills);
    }
  }


  private getFieldSpecificRequirements(field: string): string {
    const fieldRequirements = {
      'Technology': `
- Use authentic software development terminology (sprint, deployment, CI/CD, code review, technical debt, scalability)
- Include realistic tech stakeholders (Product Owner, Scrum Master, DevOps Engineer, QA Lead, Security Team)
- Present scenarios involving: system outages, technical debt decisions, architecture choices, security vulnerabilities, performance issues
- Test skills: debugging, system design, code quality, automation, incident response, technical leadership
- Include modern tech practices: agile methodologies, cloud infrastructure, microservices, API design
      `,
      'Business': `
- Use business terminology (ROI, KPIs, stakeholder alignment, market penetration, competitive analysis, P&L)
- Include stakeholders: C-suite executives, department heads, clients, vendors, board members, analysts
- Present scenarios involving: budget constraints, market competition, strategic pivots, client relationships, operational efficiency
- Test skills: strategic planning, financial analysis, negotiation, stakeholder management, change management
- Include business contexts: quarterly reviews, market launches, mergers, partnerships, crisis management
      `,
      'Healthcare': `
- Use medical terminology (patient outcomes, clinical protocols, HIPAA compliance, evidence-based practice, care coordination)
- Include stakeholders: physicians, nurses, administrators, patients, families, insurance companies, regulatory bodies
- Present scenarios involving: patient safety, staffing shortages, quality improvement, regulatory compliance, ethical dilemmas
- Test skills: clinical decision making, patient advocacy, team collaboration, crisis management, quality assurance
- Include healthcare contexts: emergency situations, interdisciplinary teams, technology adoption, patient satisfaction
      `,
      'Education': `
- Use educational terminology (learning outcomes, differentiated instruction, assessment strategies, IEP, curriculum alignment)
- Include stakeholders: students, parents, administrators, colleagues, school board, community members
- Present scenarios involving: diverse learning needs, behavioral challenges, budget cuts, technology integration, assessment results
- Test skills: instructional design, classroom management, student engagement, data analysis, parent communication
- Include educational contexts: lesson planning, student support, professional development, educational equity
      `,
      'Creative': `
- Use creative industry terminology (creative brief, brand guidelines, design thinking, user experience, creative direction)
- Include stakeholders: clients, creative directors, account managers, production teams, target audiences
- Present scenarios involving: creative vision conflicts, tight deadlines, budget constraints, client feedback, market trends
- Test skills: creative problem solving, visual communication, project management, client relations, trend analysis
- Include creative contexts: campaign development, design reviews, creative presentations, brand development
      `,
      'Finance': `
- Use financial terminology (risk assessment, portfolio management, regulatory compliance, financial modeling, due diligence)
- Include stakeholders: clients, auditors, regulators, senior management, investors, compliance teams
- Present scenarios involving: market volatility, regulatory changes, client portfolio decisions, risk management, fraud detection
- Test skills: financial analysis, risk management, regulatory knowledge, client advisory, ethical decision making
- Include finance contexts: investment decisions, audit processes, regulatory reporting, client meetings
      `,
      'Engineering': `
- Use engineering terminology (design specifications, quality control, safety protocols, project milestones, technical standards)
- Include stakeholders: project managers, safety officers, contractors, clients, regulatory inspectors, technical teams
- Present scenarios involving: safety concerns, design challenges, budget overruns, quality issues, regulatory compliance
- Test skills: technical problem solving, safety management, project coordination, quality assurance, regulatory compliance
- Include engineering contexts: design reviews, site inspections, testing procedures, project delivery
      `,
      'Sales': `
- Use sales terminology (pipeline management, lead qualification, closing techniques, customer acquisition cost, retention rate)
- Include stakeholders: prospects, customers, sales management, marketing teams, customer success, competitors
- Present scenarios involving: quota pressure, client objections, competitive threats, deal negotiations, customer retention
- Test skills: relationship building, negotiation, objection handling, territory management, customer needs analysis
- Include sales contexts: client meetings, proposal presentations, deal closures, account management
      `,
      'Operations': `
- Use operations terminology (process optimization, supply chain, quality metrics, efficiency improvements, resource allocation)
- Include stakeholders: suppliers, internal teams, customers, management, quality control, logistics partners
- Present scenarios involving: supply chain disruptions, quality issues, cost reduction, process improvements, capacity planning
- Test skills: process improvement, resource management, problem solving, vendor management, performance optimization
- Include operations contexts: workflow analysis, vendor negotiations, quality audits, capacity planning
      `,
      'HR': `
- Use HR terminology (talent acquisition, performance management, employee engagement, compensation benchmarking, compliance)
- Include stakeholders: employees, managers, executives, legal team, union representatives, candidates
- Present scenarios involving: employee relations, compliance issues, performance problems, compensation decisions, cultural initiatives
- Test skills: people management, conflict resolution, policy development, talent strategy, employee advocacy
- Include HR contexts: recruitment processes, performance reviews, employee investigations, organizational development
      `,
      'Legal': `
- Use legal terminology (due diligence, contract negotiation, risk mitigation, regulatory compliance, litigation strategy)
- Include stakeholders: clients, opposing counsel, judges, regulatory bodies, business partners, compliance teams
- Present scenarios involving: contract disputes, regulatory investigations, compliance violations, litigation decisions, risk assessments
- Test skills: legal analysis, negotiation, risk assessment, client counseling, regulatory knowledge
- Include legal contexts: contract reviews, court proceedings, regulatory filings, client advisory
      `,
      'Consulting': `
- Use consulting terminology (client engagement, deliverables, change management, stakeholder buy-in, implementation roadmap)
- Include stakeholders: client executives, project sponsors, end users, internal teams, subject matter experts
- Present scenarios involving: scope changes, stakeholder resistance, implementation challenges, client expectations, project timelines
- Test skills: problem diagnosis, solution design, stakeholder management, change leadership, project delivery
- Include consulting contexts: client presentations, workshop facilitation, implementation planning, stakeholder interviews
      `,
      'Data & Analytics': `
- Use data terminology (data pipeline, machine learning models, statistical significance, data governance, predictive analytics)
- Include stakeholders: business users, data engineers, executives, IT teams, compliance officers, end users
- Present scenarios involving: data quality issues, model performance, insights communication, privacy concerns, infrastructure scaling
- Test skills: data analysis, statistical thinking, communication, technical problem solving, business acumen
- Include data contexts: model development, dashboard creation, data strategy, insights presentation
      `
    };

    return fieldRequirements[field] || fieldRequirements['Business'];
  }

  private getFieldSpecificAnalysisRequirements(field: string): string {
    const analysisRequirements = {
      'Technology': `
Focus on technical leadership competencies, software development methodologies, and technology innovation patterns.
Assess: Technical decision-making, system thinking, agile leadership, code quality focus, DevOps mindset, security awareness.
Career paths: Software Engineer, DevOps Engineer, Technical Lead, Engineering Manager, Solution Architect, CTO.
Skills to evaluate: Programming languages, cloud platforms, system design, technical communication, mentoring developers.
Work styles: Agile environments, remote collaboration, continuous learning, innovation-driven culture.
      `,
      'Business': `
Focus on strategic thinking, stakeholder management, financial acumen, and market analysis capabilities.
Assess: Business strategy, P&L management, market analysis, negotiation skills, change management, executive presence.
Career paths: Business Analyst, Product Manager, Operations Manager, Strategy Consultant, General Manager, CEO.
Skills to evaluate: Financial modeling, strategic planning, stakeholder management, market research, business development.
Work styles: Results-oriented, data-driven decision making, executive environments, client-facing roles.
      `,
      'Healthcare': `
Focus on patient-centered leadership, clinical excellence, healthcare operations, and regulatory compliance.
Assess: Patient advocacy, clinical decision-making, interdisciplinary collaboration, quality improvement, ethical reasoning.
Career paths: Clinical Manager, Healthcare Administrator, Quality Director, Chief Medical Officer, Healthcare Consultant.
Skills to evaluate: Clinical knowledge, patient safety, healthcare regulations, team coordination, crisis management.
Work styles: Patient-first mindset, evidence-based practice, regulatory compliance, collaborative care teams.
      `,
      'Education': `
Focus on student-centered leadership, instructional design, educational technology, and learning outcomes.
Assess: Curriculum development, student engagement, assessment strategies, classroom management, educational innovation.
Career paths: Instructional Designer, Academic Administrator, Education Consultant, Principal, Superintendent.
Skills to evaluate: Pedagogy, educational technology, student assessment, parent communication, educational leadership.
Work styles: Student-focused, collaborative learning, continuous professional development, community engagement.
      `,
      'Creative': `
Focus on creative vision, brand development, design thinking, and artistic leadership.
Assess: Creative problem-solving, visual communication, brand strategy, creative direction, artistic collaboration.
Career paths: Creative Director, Brand Manager, UX Designer, Art Director, Creative Consultant, Agency Owner.
Skills to evaluate: Design software, creative strategy, brand development, client presentation, creative team leadership.
Work styles: Innovation-driven, collaborative creativity, client-focused, trend awareness, portfolio development.
      `,
      'Finance': `
Focus on financial analysis, risk management, regulatory compliance, and investment strategy.
Assess: Financial modeling, risk assessment, regulatory knowledge, investment analysis, client advisory skills.
Career paths: Financial Analyst, Portfolio Manager, Risk Manager, Investment Advisor, CFO, Financial Consultant.
Skills to evaluate: Financial analysis, regulatory compliance, risk management, client relations, market analysis.
Work styles: Data-driven, risk-conscious, client advisory, regulatory compliance, continuous market monitoring.
      `
    };

    return analysisRequirements[field] || analysisRequirements['Business'];
  }

  // Analyze scenario responses for personality insights
  async analyzeScenarioResponses(
    fieldOfInterest: string,
    scenarioResponses: Array<{
      scenario: string;
      selectedOption: any;
      reasoning?: string;
    }>
  ): Promise<{
    personalityProfile: PersonalityTrait[];
    workStylePreferences: string[];
    leadershipStyle: string;
    problemSolvingApproach: string;
    careerRecommendations: CareerRecommendation[];
    developmentAreas: string[];
    overallScore: number;
    topStrengths: string[];
    skillGaps: SkillGap[];
    learningPath: LearningPathItem[];
    developmentPlan: {
      immediate: string[];
      shortTerm: string[];
      longTerm: string[];
    };
    marketInsights: {
      demandLevel: string;
      competitionLevel: string;
      trendingSkills: string[];
    };
  }> {
    const context = this.conversationHistory.join('\n');
    const prompt = `You are a senior career strategist and organizational psychologist specializing in ${fieldOfInterest} talent assessment. Analyze these scenario responses to provide comprehensive, field-specific career insights.

FIELD OF INTEREST: ${fieldOfInterest}
SCENARIO RESPONSES: ${JSON.stringify(scenarioResponses, null, 2)}

FIELD-SPECIFIC ANALYSIS REQUIREMENTS:
${this.getFieldSpecificAnalysisRequirements(fieldOfInterest)}

Perform deep behavioral analysis based on the decision patterns revealed in their scenario choices:

1. **PERSONALITY PROFILE**: Identify 5-7 key personality traits with specific behavioral evidence from their choices
2. **WORK STYLE PREFERENCES**: Determine their preferred working environment and collaboration style
3. **LEADERSHIP APPROACH**: Analyze their natural leadership style and team dynamics preference
4. **PROBLEM-SOLVING METHODOLOGY**: Identify their systematic approach to challenges and decision-making
5. **FIELD-SPECIFIC CAREER RECOMMENDATIONS**: Suggest 3-4 specific roles in ${fieldOfInterest} that match their demonstrated behavioral patterns
6. **TARGETED DEVELOPMENT AREAS**: Identify skill gaps specific to ${fieldOfInterest} advancement

IMPORTANT: 
- Base analysis ONLY on evidence from their actual scenario choices
- Use ${fieldOfInterest} industry terminology and context
- Provide specific, actionable career recommendations within ${fieldOfInterest}
- Include realistic salary ranges and career progression paths for ${fieldOfInterest}

Return ONLY this JSON structure:
{
  "personalityProfile": [
    {
      "trait": "${fieldOfInterest} Leadership Style",
      "score": 8,
      "description": "Detailed analysis based on scenario choices with specific behavioral evidence",
      "careerImplications": ["Specific ${fieldOfInterest} roles", "${fieldOfInterest} career paths"]
    }
  ],
  "workStylePreferences": ["${fieldOfInterest}-relevant preferences", "Collaboration style", "Work environment fit"],
  "leadershipStyle": "Specific leadership approach suitable for ${fieldOfInterest} contexts",
  "problemSolvingApproach": "Methodology that aligns with ${fieldOfInterest} best practices",
  "careerRecommendations": [
    {
      "title": "Specific ${fieldOfInterest} Role",
      "field": "${fieldOfInterest}",
      "matchScore": 92,
      "description": "Detailed description using ${fieldOfInterest} terminology and context",
      "salaryRange": "${fieldOfInterest}-specific salary range",
      "growthProspects": "${fieldOfInterest} industry growth outlook",
      "requiredSkills": ["${fieldOfInterest}-specific skills"],
      "timeToTransition": "Realistic timeline for ${fieldOfInterest} transition"
    }
  ],
  "developmentAreas": ["${fieldOfInterest}-specific skill gaps", "Industry knowledge areas", "Professional development needs"]
}`;

    try {
      const result = await this.model.generateContent(prompt);
      const response = result.response.text();
      this.addToContext(prompt, response);
      
      const parsed = JSON.parse(response);
      
      // Ensure we return a complete ScenarioResults structure
      return {
        personalityProfile: parsed.personalityProfile || [],
        workStylePreferences: parsed.workStylePreferences || [],
        leadershipStyle: parsed.leadershipStyle || `${fieldOfInterest} leadership style`,
        problemSolvingApproach: parsed.problemSolvingApproach || `${fieldOfInterest} problem-solving approach`,
        careerRecommendations: parsed.careerRecommendations || [],
        developmentAreas: parsed.developmentAreas || [],
        overallScore: parsed.overallScore || 85,
        topStrengths: parsed.topStrengths || [
          `${fieldOfInterest} expertise demonstrated`,
          "Strong analytical thinking",
          "Effective decision-making"
        ],
        skillGaps: parsed.skillGaps || [],
        learningPath: parsed.learningPath || [],
        developmentPlan: parsed.developmentPlan || {
          immediate: [`Enhance ${fieldOfInterest} skills`, "Join professional networks"],
          shortTerm: [`Advanced ${fieldOfInterest} certification`, "Seek mentorship"],
          longTerm: [`Leadership roles in ${fieldOfInterest}`, "Industry thought leadership"]
        },
        marketInsights: parsed.marketInsights || {
          demandLevel: "High",
          competitionLevel: "Moderate",
          trendingSkills: [`${fieldOfInterest} expertise`, "Digital transformation", "Leadership"]
        }
      };
    } catch (error) {
      console.error('Error analyzing scenario responses:', error);
      return this.getFallbackScenarioAnalysis(fieldOfInterest);
    }
  }

  // Fallback methods for error handling
  private getFallbackQuestions(skills: string[], phase: string): AdaptiveQuestion[] {
    console.log('🔄 Using fallback questions for phase:', phase);
    const timestamp = Date.now();
    
    const baseQuestions = [
      {
        id: `fallback_${timestamp}_1`,
        question: `When working with ${skills[0] || 'new challenges'}, what energizes you most?`,
        type: 'multiple-choice' as const,
        options: ['Solving complex problems', 'Collaborating with team members', 'Creating innovative solutions', 'Achieving measurable results'],
        skillsAssessed: [skills[0] || 'motivation'],
        difficulty: 3
      },
      {
        id: `fallback_${timestamp}_2`,
        question: 'How confident are you in adapting to unexpected changes at work?',
        type: 'scale' as const,
        skillsAssessed: ['adaptability', 'confidence'],
        difficulty: 2
      },
      {
        id: `fallback_${timestamp}_3`,
        question: 'Your team disagrees on the best approach to a project. What do you do?',
        type: 'multiple-choice' as const,
        options: ['Facilitate a team discussion to find consensus', 'Research best practices and present findings', 'Suggest trying multiple approaches in parallel', 'Escalate to management for guidance'],
        skillsAssessed: ['leadership', 'communication', 'problem-solving'],
        difficulty: 4
      }
    ];

    if (phase === 'deep-dive') {
      baseQuestions.push(
        {
          id: `fallback_${timestamp}_4`,
          question: `In your experience with ${skills[1] || 'teamwork'}, what's your biggest strength?`,
          type: 'multiple-choice' as const,
          options: ['Building relationships', 'Organizing workflows', 'Mentoring others', 'Driving results'],
          skillsAssessed: [skills[1] || 'teamwork'],
          difficulty: 3
        },
        {
          id: `fallback_${timestamp}_5`,
          question: 'How do you prefer to learn new skills for your career?',
          type: 'multiple-choice' as const,
          options: ['Hands-on practice and experimentation', 'Structured courses and certifications', 'Learning from mentors and colleagues', 'Reading and self-directed research'],
          skillsAssessed: ['learning-style', 'self-development'],
          difficulty: 2
        }
      );
    }

    return [
      ...baseQuestions.slice(0, phase === 'initial' ? 3 : 5)
    ];
  }

  private getFallbackDeepDiveQuestions(topSkills: string[]): AdaptiveQuestion[] {
    console.log('🔄 Using fallback deep-dive questions for skills:', topSkills);
    const timestamp = Date.now();
    
    const deepQuestions: AdaptiveQuestion[] = [];
    
    // Generate 15 questions per skill
    topSkills.forEach((skill, skillIndex) => {
      for (let i = 0; i < 15; i++) {
        deepQuestions.push({
          id: `deep_fallback_${timestamp}_${skillIndex}_${i}`,
          question: `Advanced ${skill} Question ${i + 1}: How would you rate your expertise in applying ${skill} in complex, high-stakes situations?`,
          type: 'multiple-choice',
          options: [
            'Expert level - I can mentor others and handle any situation',
            'Advanced - I\'m highly competent and confident',
            'Intermediate - I can handle most situations with some guidance',
            'Developing - I need more experience and support'
          ],
          skillsAssessed: [skill],
          difficulty: 4
        });
      }
    });
    
    console.log('✅ Generated', deepQuestions.length, 'fallback deep-dive questions');
    return deepQuestions;
  }
  private getFallbackAnalysis(skills: string[]): CareerAnalysis {
    return {
      overallScore: 80,
      topStrengths: skills,
      skillGaps: [],
      careerRecommendations: [{
        title: 'Business Analyst',
        field: 'Technology',
        match: 75,
        description: 'Analyze business requirements and processes',
        salaryRange: '$60,000 - $85,000',
        growthOutlook: 'Strong growth expected',
        requiredSkills: skills.slice(0, 3),
        timeToTransition: '6-12 months'
      }],
      developmentPlan: {
        immediate: [],
        shortTerm: [],
        longTerm: []
      },
      marketInsights: {
        demandLevel: 'High',
        competitionLevel: 'Moderate',
        trendingSkills: []
      },
      skillPatterns: [],
      learningPath: [],
      personalityProfile: []
    };
  }

  private getFallbackScenario(field: string) {
    console.log(`🔄 Using enhanced fallback scenario for ${field}`);
    
    // Enhanced scenarios based on common workplace situations
    const scenarioTemplates = {
      'Technology': {
        scenario: 'Critical System Outage During Peak Hours',
        context: 'Your company\'s main application is experiencing a critical outage during peak business hours. Customers are unable to access services, and the issue appears to be affecting multiple system components. The operations team is under pressure to restore service quickly while the development team needs to identify and fix the root cause.',
        challenge: 'How do you prioritize actions and coordinate between teams to resolve this crisis while maintaining customer communication and preventing future occurrences?',
        options: [
          { 
            id: 'A', 
            text: 'Immediately assemble a war room with all technical leads, implement emergency protocols, and provide hourly updates to stakeholders while systematically isolating and fixing components', 
            skills: ['Crisis Management', 'Technical Leadership', 'Communication'], 
            personality: ['Decisive', 'Organized', 'Pressure-resistant'] 
          },
          { 
            id: 'B', 
            text: 'Focus the entire team on quickly implementing a workaround solution to restore basic functionality, then schedule a thorough post-mortem once service is restored', 
            skills: ['Problem Solving', 'Prioritization', 'Pragmatic Thinking'], 
            personality: ['Results-oriented', 'Practical', 'Customer-focused'] 
          },
          { 
            id: 'C', 
            text: 'Divide responsibilities: have the operations team focus on service restoration while development investigates root cause, with regular sync meetings to share findings', 
            skills: ['Delegation', 'Parallel Processing', 'Coordination'], 
            personality: ['Strategic', 'Collaborative', 'Systematic'] 
          },
          { 
            id: 'D', 
            text: 'Conduct a rapid assessment to understand the scope, then transparently communicate the situation to customers while implementing both immediate fixes and long-term solutions simultaneously', 
            skills: ['Assessment', 'Transparency', 'Multi-tasking'], 
            personality: ['Analytical', 'Honest', 'Comprehensive'] 
          }
        ]
      },
      'Business': {
        scenario: 'Major Client Threatening Contract Cancellation',
        context: 'Your largest client, representing 30% of annual revenue, has expressed serious concerns about recent service quality issues and is threatening to terminate their contract within 30 days. They\'ve scheduled a meeting to discuss their concerns and want to see a concrete action plan for improvement.',
        challenge: 'How do you address their concerns, rebuild trust, and create a plan that satisfies both their needs and your company\'s capabilities?',
        options: [
          { 
            id: 'A', 
            text: 'Immediately conduct a comprehensive audit of all services provided to this client, identify specific issues, and present a detailed improvement plan with timelines and accountability measures', 
            skills: ['Client Management', 'Problem Analysis', 'Strategic Planning'], 
            personality: ['Thorough', 'Accountable', 'Proactive'] 
          },
          { 
            id: 'B', 
            text: 'Schedule individual meetings with key stakeholders at the client to understand their specific concerns, then collaborate on co-creating solutions that address their unique needs', 
            skills: ['Relationship Building', 'Active Listening', 'Collaborative Problem Solving'], 
            personality: ['Empathetic', 'Collaborative', 'Client-centric'] 
          },
          { 
            id: 'C', 
            text: 'Offer immediate concessions (pricing adjustments, additional services) while simultaneously implementing rapid improvements to demonstrate commitment to the relationship', 
            skills: ['Negotiation', 'Quick Decision Making', 'Service Recovery'], 
            personality: ['Flexible', 'Generous', 'Action-oriented'] 
          },
          { 
            id: 'D', 
            text: 'Bring in senior leadership to demonstrate the importance of this relationship, conduct a joint review of expectations, and establish regular check-ins to prevent future issues', 
            skills: ['Escalation Management', 'Expectation Setting', 'Relationship Maintenance'], 
            personality: ['Strategic', 'Diplomatic', 'Long-term focused'] 
          }
        ]
      },
      'Healthcare': {
        scenario: 'Critical Staff Shortage During Emergency Surge',
        context: 'Your healthcare facility is experiencing an unexpected surge in patient volume due to a local emergency, but you\'re simultaneously dealing with multiple staff members calling in sick. Patient wait times are increasing, and the remaining staff is showing signs of stress and fatigue.',
        challenge: 'How do you ensure patient safety and quality of care while managing staff resources and maintaining team morale during this crisis?',
        options: [
          { 
            id: 'A', 
            text: 'Implement emergency staffing protocols, call in off-duty personnel, redistribute tasks based on urgency, and establish clear triage procedures to prioritize critical cases', 
            skills: ['Emergency Management', 'Resource Allocation', 'Clinical Prioritization'], 
            personality: ['Calm under pressure', 'Organized', 'Patient-safety focused'] 
          },
          { 
            id: 'B', 
            text: 'Focus on supporting current staff with regular breaks, emotional support, and streamlined processes while coordinating with nearby facilities for patient transfers if needed', 
            skills: ['Staff Support', 'Process Optimization', 'Inter-facility Coordination'], 
            personality: ['Empathetic', 'Supportive', 'Collaborative'] 
          },
          { 
            id: 'C', 
            text: 'Establish a command center to coordinate all activities, maintain constant communication with staff and families, and document everything for post-event analysis and improvement', 
            skills: ['Command Structure', 'Communication', 'Documentation'], 
            personality: ['Systematic', 'Communicative', 'Analytical'] 
          },
          { 
            id: 'D', 
            text: 'Adapt care delivery models to focus on essential services, extend operating hours for non-urgent cases, and engage volunteer or temporary staff while maintaining quality standards', 
            skills: ['Adaptive Leadership', 'Quality Management', 'Resource Flexibility'], 
            personality: ['Innovative', 'Quality-conscious', 'Resourceful'] 
          }
        ]
      }
    };
    
    // Select appropriate scenario based on field
    const scenario = scenarioTemplates[field] || scenarioTemplates['Business'];
    
    return {
      scenario: scenario.scenario,
      context: scenario.context,
      challenge: scenario.challenge,
      options: scenario.options,
      followUpQuestions: [
        'What would you do if this approach didn\'t resolve the situation within the expected timeframe?',
        'How would you measure the success of your chosen approach?',
        'What preventive measures would you implement to avoid similar situations in the future?'
      ]
    };
  }

  private getFallbackScenarioAnalysis(field: string) {
    console.log(`🔄 Using enhanced fallback scenario analysis for ${field}`);
    
    // Enhanced analysis based on field-specific insights using the analysis requirements
    const fieldSpecificGuidance = this.getFieldSpecificAnalysisRequirements(field);
    
    // Field-specific fallback analysis that aligns with our analysis requirements
    const fieldAnalysis: Record<string, any> = {
      'Technology': {
        personalityProfile: [
          {
            trait: 'Technical Problem Solving',
            score: 8,
            description: 'Demonstrates systematic approach to complex technical challenges with strong focus on code quality and system design',
            careerImplications: ['Software Engineering', 'DevOps Engineering', 'Technical Leadership', 'Solution Architecture']
          },
          {
            trait: 'Agile Leadership',
            score: 7,
            description: 'Shows natural affinity for agile methodologies and collaborative development practices',
            careerImplications: ['Scrum Master', 'Technical Team Lead', 'Engineering Manager', 'DevOps Leadership']
          },
          {
            trait: 'Innovation Mindset',
            score: 8,
            description: 'Balances cutting-edge technology adoption with practical implementation constraints',
            careerImplications: ['Research & Development', 'Technical Innovation', 'Startup Environments', 'Technology Strategy']
          }
        ],
        workStylePreferences: ['Agile environments', 'Remote collaboration', 'Continuous learning', 'Innovation-driven culture'],
        leadershipStyle: 'Technical Leader who mentors developers and drives architectural decisions',
        problemSolvingApproach: 'Systematic debugging combined with rapid prototyping and testing',
        careerRecommendations: [
          {
            title: 'Senior Software Engineer',
            field: field,
            match: 92,
            description: 'Lead complex software projects, mentor junior developers, and contribute to technical architecture decisions',
            salaryRange: '$110,000 - $160,000',
            growthOutlook: 'Excellent - 20% annual growth with high demand for experienced engineers',
            requiredSkills: ['Advanced Programming', 'System Design', 'Code Review', 'Technical Mentoring'],
            timeToTransition: '6-12 months'
          },
          {
            title: 'DevOps Engineer',
            field: field,
            match: 88,
            description: 'Design and maintain CI/CD pipelines, manage cloud infrastructure, and ensure system reliability',
            salaryRange: '$105,000 - $155,000',
            growthOutlook: 'Very strong growth in cloud and automation technologies',
            requiredSkills: ['Cloud Platforms', 'CI/CD', 'Infrastructure as Code', 'System Monitoring'],
            timeToTransition: '9-15 months'
          }
        ],
        developmentAreas: ['Cloud architecture', 'Technical communication', 'Product strategy']
      },
      'Business': {
        personalityProfile: [
          {
            trait: 'Strategic Business Thinking',
            score: 8,
            description: 'Demonstrates strong ability to analyze market conditions and develop comprehensive business strategies',
            careerImplications: ['Business Strategy', 'Management Consulting', 'Product Management', 'Executive Leadership']
          },
          {
            trait: 'Stakeholder Management',
            score: 9,
            description: 'Excels at building relationships and managing complex stakeholder expectations across organizational levels',
            careerImplications: ['Client Relations', 'Partnership Development', 'Business Development', 'Change Management']
          },
          {
            trait: 'Financial Acumen',
            score: 7,
            description: 'Shows understanding of financial metrics and ability to make data-driven business decisions',
            careerImplications: ['Financial Analysis', 'Business Operations', 'Investment Analysis', 'P&L Management']
          }
        ],
        workStylePreferences: ['Results-oriented environment', 'Data-driven decision making', 'Client-facing roles', 'Strategic planning'],
        leadershipStyle: 'Strategic leader with strong focus on stakeholder alignment and business results',
        problemSolvingApproach: 'Market analysis combined with stakeholder consultation and strategic planning',
        careerRecommendations: [
          {
            title: 'Business Development Manager',
            field: field,
            match: 90,
            description: 'Drive revenue growth through strategic partnerships, market expansion, and client relationship management',
            salaryRange: '$85,000 - $130,000',
            growthOutlook: 'Strong growth across industries with focus on digital transformation',
            requiredSkills: ['Strategic Planning', 'Relationship Building', 'Market Analysis', 'Negotiation'],
            timeToTransition: '6-9 months'
          },
          {
            title: 'Product Manager',
            field: field,
            match: 85,
            description: 'Lead product strategy, coordinate cross-functional teams, and drive product development from concept to launch',
            salaryRange: '$95,000 - $140,000',
            growthOutlook: 'Excellent growth in technology and consumer products',
            requiredSkills: ['Product Strategy', 'Market Research', 'Cross-functional Leadership', 'Data Analysis'],
            timeToTransition: '9-15 months'
          }
        ],
        developmentAreas: ['Digital marketing', 'Data analytics', 'Financial modeling']
      },
      'Healthcare': {
        personalityProfile: [
          {
            trait: 'Empathetic Leadership',
            score: 9,
            description: 'Shows exceptional ability to balance patient care priorities with operational efficiency and staff wellbeing',
            careerImplications: ['Healthcare Administration', 'Clinical Leadership', 'Patient Experience', 'Healthcare Consulting']
          },
          {
            trait: 'Quality Focus',
            score: 8,
            description: 'Demonstrates commitment to maintaining high standards while managing complex healthcare delivery systems',
            careerImplications: ['Quality Assurance', 'Compliance Management', 'Clinical Excellence', 'Healthcare Innovation']
          },
          {
            trait: 'Crisis Response',
            score: 8,
            description: 'Exhibits calm decision-making under pressure while maintaining focus on patient safety and care quality',
            careerImplications: ['Emergency Management', 'Healthcare Operations', 'Risk Management', 'Clinical Leadership']
          }
        ],
        workStylePreferences: ['Patient-centered environment', 'Collaborative care teams', 'Continuous improvement', 'Evidence-based practice'],
        leadershipStyle: 'Compassionate leader focused on patient outcomes and team support',
        problemSolvingApproach: 'Evidence-based solutions with strong emphasis on safety and quality',
        careerRecommendations: [
          {
            title: 'Healthcare Operations Manager',
            field: field,
            match: 88,
            description: 'Lead operational efficiency initiatives while maintaining focus on patient care quality and staff satisfaction',
            salaryRange: '$75,000 - $110,000',
            growthOutlook: 'Growing demand in healthcare transformation',
            requiredSkills: ['Healthcare Operations', 'Quality Management', 'Team Leadership'],
            timeToTransition: '9-15 months'
          },
          {
            title: 'Patient Experience Manager',
            field: field,
            match: 85,
            description: 'Design and implement programs to enhance patient satisfaction and care delivery experiences',
            salaryRange: '$65,000 - $95,000',
            growthOutlook: 'Strong growth in patient-centered care focus',
            requiredSkills: ['Patient Relations', 'Process Improvement', 'Data Analysis'],
            timeToTransition: '6-12 months'
          }
        ],
        developmentAreas: ['Healthcare technology', 'Data analytics', 'Financial management']
      }
    };
    
    const selectedAnalysis = fieldAnalysis[field] || fieldAnalysis['Business'];
    
    return {
      personalityProfile: selectedAnalysis.personalityProfile || [],
      workStylePreferences: selectedAnalysis.workStylePreferences || [],
      leadershipStyle: selectedAnalysis.leadershipStyle || `${field} leadership style`,
      problemSolvingApproach: selectedAnalysis.problemSolvingApproach || `${field} problem-solving approach`,
      careerRecommendations: selectedAnalysis.careerRecommendations || [],
      developmentAreas: selectedAnalysis.developmentAreas || [],
      overallScore: 85,
      topStrengths: [
        `Strong ${field} expertise`,
        selectedAnalysis.leadershipStyle || 'Effective leadership approach',
        selectedAnalysis.problemSolvingApproach || 'Systematic problem-solving',
        'Excellent communication and collaboration',
        'Adaptability and continuous learning'
      ],
      skillGaps: [
        {
          skill: `Advanced ${field} Skills`,
          currentLevel: 6,
          requiredLevel: 9,
          priority: 'high' as const,
          developmentTime: '6-9 months'
        },
        {
          skill: 'Strategic Leadership',
          currentLevel: 7,
          requiredLevel: 9,
          priority: 'medium' as const,
          developmentTime: '4-6 months'
        }
      ],
      learningPath: [
        {
          skill: `${field} Expertise`,
          action: `Develop advanced ${field} capabilities through targeted learning and practice`,
          resources: ['Professional courses', 'Industry certifications', 'Mentorship programs'],
          timeline: '6-9 months',
          measurableOutcome: `Achieve expert-level proficiency in ${field}`,
          difficultyLevel: 'Intermediate',
          prerequisites: 'Basic knowledge and experience'
        }
      ],
      developmentPlan: {
        immediate: [
          `Assess current ${field} skill level`,
          'Join professional associations',
          'Update LinkedIn profile',
          'Network with industry professionals'
        ],
        shortTerm: [
          `Pursue ${field} certification`,
          'Seek mentorship opportunities',
          'Attend industry conferences',
          'Build portfolio of projects'
        ],
        longTerm: [
          `Target senior ${field} roles`,
          'Develop thought leadership',
          'Mentor others in the field',
          'Consider consulting opportunities'
        ]
      },
      marketInsights: {
        demandLevel: 'High',
        competitionLevel: 'Moderate',
        trendingSkills: [`${field} expertise`, 'Digital transformation', 'Leadership', 'Data analysis']
      }
    };
  }

  // Generate detailed skill information for top 2 skills
  async generateSkillDetails(
    topSkills: string[],
    responses: QuizResponse[],
    userProfile: { name: string }
  ): Promise<SkillDetail[]> {
    try {
      console.log('🎯 Generating detailed skill information for:', topSkills);
      
      const responseData = responses.map(r => ({
        question: r.question,
        answer: r.answer,
        skills: r.skillsAssessed,
        reasoning: r.reasoning
      }));

      const skillDetails: SkillDetail[] = [];

      // Generate details for each top skill
      for (const skill of topSkills.slice(0, 2)) {
        const prompt = `You are a senior industry analyst, career expert, and professional content creator specializing in ${skill}. Generate comprehensive, actionable skill information based on current market data and trends.

SKILL TO ANALYZE: ${skill}
USER PROFILE: ${userProfile.name}
ASSESSMENT CONTEXT: ${JSON.stringify(responseData.filter(r => r.skills.includes(skill)), null, 2)}

PROVIDE DETAILED ANALYSIS INCLUDING:
1. Current market demand with specific 2024 salary data
2. Top 3 industries with detailed pros/cons analysis
3. In-depth blog post with practical insights and real examples
4. Curated learning resources with specific recommendations
5. Clear career progression pathway with realistic requirements

Ensure all information is:
- Current and market-relevant (2024 data)
- Specific with concrete examples and real company references
- Actionable with clear next steps
- Industry-focused with actual job titles from major companies
- Salary data based on current market rates from reliable sources

For the blog post, write a comprehensive 500-word article that:
- Provides actionable career advice
- Includes real industry examples
- Offers practical tips for skill development
- Discusses current market trends
- Gives specific steps for career advancement

Return ONLY this JSON structure:
{
  "skillName": "${skill}",
  "overview": "${skill} is a critical competency in today's rapidly evolving professional landscape. This skill combines technical expertise with strategic thinking, making professionals with strong ${skill} capabilities highly valued across industries. The demand for ${skill} expertise has grown exponentially, with organizations prioritizing candidates who can drive innovation and deliver measurable results through this competency.",
  "marketDemand": {
    "level": "Extremely High",
    "growth": "25-35% annually",
    "averageSalary": "$85,000 - $140,000"
  },
  "industries": [
    {
      "name": "Technology & Software",
      "demand": "Extremely High",
      "pros": ["Premium compensation packages ($100K-$180K)", "Cutting-edge project opportunities", "Remote work flexibility", "Rapid career advancement potential", "Stock options and equity participation", "Innovation-driven culture"],
      "cons": ["Intense competition for top positions", "Fast-paced, high-pressure environment", "Continuous learning required to stay current", "Long hours during product launches", "Frequent technology stack changes", "Burnout risk in demanding roles"],
      "avgSalary": "$95,000 - $165,000",
      "jobTitles": ["Senior ${skill} Engineer", "${skill} Team Lead", "Principal ${skill} Architect", "${skill} Director", "VP of ${skill}", "Chief ${skill} Officer"]
    },
    {
      "name": "Financial Services & Fintech",
      "demand": "Very High",
      "pros": ["Excellent job security and stability", "Comprehensive benefits packages", "Structured career advancement paths", "High client interaction and relationship building", "Strong regulatory framework protection", "Excellent networking opportunities"],
      "cons": ["Strict regulatory compliance requirements", "Conservative organizational culture", "Slower adoption of innovative technologies", "Extensive documentation and reporting", "Limited creative freedom", "High stress during market volatility"],
      "avgSalary": "$80,000 - $145,000",
      "jobTitles": ["${skill} Business Analyst", "Senior ${skill} Manager", "${skill} Strategy Director", "VP of ${skill} Operations", "${skill} Risk Manager", "Head of ${skill} Innovation"]
    },
    {
      "name": "Healthcare & Life Sciences",
      "demand": "Growing Rapidly",
      "pros": ["Meaningful work with direct patient impact", "Strong job stability and growth prospects", "Opportunity to work on life-saving innovations", "Government funding and grants available", "Growing sector with aging population", "Strong ethical framework and purpose-driven work"],
      "cons": ["Complex regulatory environment (FDA, HIPAA)", "Longer development and approval cycles", "Budget constraints in public healthcare", "Slow technology adoption in traditional settings", "Extensive compliance documentation", "Limited agility due to safety requirements"],
      "avgSalary": "$75,000 - $125,000",
      "jobTitles": ["Healthcare ${skill} Specialist", "${skill} Program Coordinator", "Senior ${skill} Research Analyst", "${skill} Implementation Manager", "Director of ${skill} Operations", "Chief ${skill} Innovation Officer"]
    }
  ],
  "blogPost": {
    "title": "Mastering ${skill} in 2024: Your Complete Guide to Career Excellence and Market Leadership",
    "content": "In today's hyper-competitive professional landscape, ${skill} has emerged as one of the most transformative and lucrative competencies across industries. Whether you're a recent graduate mapping your career trajectory or a seasoned professional seeking strategic advancement, developing deep expertise in ${skill} can unlock unprecedented opportunities and substantial career growth.\n\nThe current market landscape reveals an extraordinary surge in demand for ${skill} professionals. According to recent industry reports, companies are experiencing a critical talent shortage, with over 75% of organizations actively seeking qualified candidates. This supply-demand imbalance has created exceptional opportunities, with starting salaries increasing by 30-40% over the past two years alone.\n\nWhat distinguishes truly successful ${skill} professionals from their peers isn't just technical proficiency—it's the strategic ability to apply these skills in complex, real-world scenarios. Top performers combine deep technical expertise with business acumen, exceptional communication skills, and an unwavering commitment to continuous learning. They understand that ${skill} isn't just about executing tasks; it's about driving organizational transformation and delivering measurable business value.\n\nThe path to ${skill} excellence requires a structured approach. Start by building a rock-solid foundation through formal education or industry-recognized certifications. Companies like Google, Microsoft, and Amazon offer specialized programs that are highly valued by employers. Next, gain hands-on experience through internships, volunteer projects, or personal initiatives that demonstrate your capabilities.\n\nBuilding a compelling portfolio is absolutely crucial in today's market. Successful professionals showcase 3-5 diverse projects that highlight different aspects of their ${skill} expertise. Include detailed case studies that explain your approach, challenges overcome, and quantifiable results achieved. This tangible evidence of your capabilities often proves more valuable than credentials alone.\n\nNetworking remains a game-changer for career acceleration. Join professional associations, attend industry conferences, and actively participate in online communities. Many of the best opportunities come through referrals and professional connections rather than traditional job postings.\n\nLooking ahead, the future of ${skill} careers appears exceptionally bright. Emerging technologies, changing consumer behaviors, and evolving business needs continue to create new opportunities for skilled professionals. Artificial intelligence and automation, rather than replacing ${skill} roles, are creating demand for higher-level strategic thinking and creative problem-solving capabilities.\n\nThe time to invest in ${skill} development is now. With the right combination of technical skills, business understanding, and strategic networking, you can position yourself at the forefront of this dynamic and rewarding field. The professionals who start building these capabilities today will be the leaders and innovators of tomorrow.",
    "keyTakeaways": [
      "${skill} professionals command premium salaries with 25-35% annual growth in demand",
      "Success requires combining technical expertise with strategic business thinking",
      "Portfolio development with quantifiable results is essential for career advancement",
      "Networking and professional relationships often lead to the best opportunities",
      "Continuous learning and adaptation are critical due to rapid industry evolution",
      "Emerging technologies create new opportunities rather than eliminate ${skill} roles"
    ]
  },
  "learningResources": [
    {
      "type": "Professional Certification",
      "title": "${skill} Excellence Professional Certificate",
      "description": "Comprehensive industry-recognized certification program covering advanced ${skill} methodologies, best practices, and real-world applications. Includes hands-on capstone projects, peer collaboration, and direct mentorship from industry experts. Highly valued by Fortune 500 companies.",
      "difficulty": "Intermediate to Advanced"
    },
    {
      "type": "Online Specialization",
      "title": "Complete ${skill} Mastery Specialization",
      "description": "Self-paced online curriculum featuring interactive lessons, practical exercises, and personalized feedback. Includes access to industry tools, templates, and a vibrant community of learners. Perfect for working professionals with flexible scheduling needs.",
      "difficulty": "Beginner to Intermediate"
    },
    {
      "type": "Intensive Bootcamp",
      "title": "${skill} Leadership Intensive",
      "description": "Immersive 12-week program focusing on advanced techniques, emerging trends, and leadership skills. Features guest speakers from leading companies, networking opportunities with industry professionals, and personalized career coaching sessions.",
      "difficulty": "Advanced"
    },
    {
      "type": "Essential Reading",
      "title": "${skill} Mastery: A Strategic Guide for Modern Professionals",
      "description": "Definitive guide covering theoretical foundations, practical applications, and strategic implementation. Features case studies from successful organizations, actionable frameworks, and insights from industry thought leaders. Essential reading for serious practitioners.",
      "difficulty": "Intermediate"
    },
    {
      "type": "Hands-On Workshop",
      "title": "${skill} Innovation Lab",
      "description": "Interactive workshop series focusing on cutting-edge techniques and real-world problem solving. Participants work on actual industry challenges with guidance from expert facilitators. Includes post-workshop mentorship and career guidance.",
      "difficulty": "Advanced"
    }
  ],
  "careerProgression": {
    "entry": {
      "title": "Junior ${skill} Specialist",
      "salary": "$55,000 - $75,000",
      "requirements": ["Bachelor's degree or equivalent experience", "Basic ${skill} knowledge through coursework or projects", "Strong analytical and problem-solving abilities", "Excellent communication and teamwork skills", "Willingness to learn and adapt quickly"]
    },
    "mid": {
      "title": "Senior ${skill} Professional",
      "salary": "$85,000 - $130,000",
      "requirements": ["3-5 years of hands-on experience", "Professional certification or advanced degree", "Proven track record of successful project delivery", "Leadership experience with cross-functional teams", "Deep understanding of industry best practices"]
    },
    "senior": {
      "title": "${skill} Director / VP",
      "salary": "$140,000 - $220,000+",
      "requirements": ["7+ years of progressive leadership experience", "Strategic thinking and business development skills", "Proven ability to build and manage high-performing teams", "Deep industry expertise and thought leadership", "Track record of driving organizational transformation"]
    }
  }
}`;

        const result = await this.makeStructuredRequest(prompt);
        
        if (result) {
          skillDetails.push(result as SkillDetail);
          console.log(`✅ Generated enhanced skill details for ${skill}`);
        } else {
          console.log(`⚠️ Using enhanced fallback details for ${skill}`);
          skillDetails.push(this.getEnhancedFallbackSkillDetails(skill));
        }

        // Add delay between requests to avoid rate limiting
        if (topSkills.indexOf(skill) < topSkills.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 1500));
        }
      }

      console.log(`✅ Generated ${skillDetails.length} skill detail profiles`);
      return skillDetails;
    } catch (error) {
      console.error('❌ Error generating skill details:', error);
      return topSkills.slice(0, 2).map(skill => this.getFallbackSkillDetails(skill));
    }
  }

  // Fallback skill details when API fails
  private getFallbackSkillDetails(skill: string): SkillDetail {
    console.log(`🔄 Using fallback skill details for ${skill}`);
    
    return {
      skillName: skill,
      overview: `${skill} is a valuable professional competency that plays a crucial role in modern workplace success. Professionals with strong ${skill} capabilities are sought after across industries and can pursue diverse career paths with excellent growth potential.`,
      marketDemand: {
        level: 'High',
        growth: '10-15% annually',
        averageSalary: '$65,000 - $95,000'
      },
      industries: [
        {
          name: 'Technology',
          demand: 'Very High',
          pros: ['High salaries', 'Innovation opportunities', 'Remote work options', 'Career growth'],
          cons: ['Fast-paced environment', 'Continuous learning required', 'High competition', 'Long hours during projects'],
          avgSalary: '$75,000 - $125,000',
          jobTitles: [`${skill} Specialist`, `Senior ${skill} Analyst`, `${skill} Manager`, `Lead ${skill} Engineer`]
        },
        {
          name: 'Business Services',
          demand: 'High',
          pros: ['Stable employment', 'Diverse projects', 'Client interaction', 'Skill transferability'],
          cons: ['Client pressure', 'Variable workload', 'Travel requirements', 'Deadline pressure'],
          avgSalary: '$60,000 - $90,000',
          jobTitles: [`${skill} Consultant`, `${skill} Coordinator`, `Senior ${skill} Associate`, `${skill} Director`]
        },
        {
          name: 'Healthcare',
          demand: 'Growing',
          pros: ['Meaningful work', 'Job security', 'Growth sector', 'Competitive benefits'],
          cons: ['Regulatory complexity', 'Budget constraints', 'Slower innovation', 'Compliance requirements'],
          avgSalary: '$55,000 - $80,000',
          jobTitles: [`${skill} Coordinator`, `Healthcare ${skill} Specialist`, `${skill} Program Manager`, `Senior ${skill} Analyst`]
        }
      ],
      blogPost: {
        title: `Building Your Career with ${skill}: A Professional's Guide`,
        content: `${skill} represents one of today's most valuable professional competencies, offering practitioners the opportunity to make meaningful contributions across diverse industries and organizations.\n\nThe current job market shows strong demand for ${skill} professionals, with organizations recognizing the strategic value these capabilities bring to business operations and growth initiatives. This demand translates into competitive compensation packages and excellent career advancement opportunities.\n\nSuccessful ${skill} professionals typically combine technical expertise with strong communication skills and business understanding. The ability to translate complex concepts into actionable insights sets top performers apart in this field.\n\nFor those looking to develop ${skill} expertise, the recommended path includes formal education or certification, followed by hands-on experience through projects and practical application. Building a portfolio that demonstrates your capabilities is essential for career advancement.\n\nThe outlook for ${skill} careers remains positive, with technological advancement and changing business needs creating new opportunities for skilled professionals. Investment in developing these capabilities offers excellent return potential.`,
        keyTakeaways: [
          `Strong market demand for ${skill} professionals across industries`,
          'Competitive salaries with good growth potential',
          'Success requires combining technical skills with business acumen',
          'Portfolio development essential for demonstrating expertise',
          'Continuous professional development important for staying current'
        ]
      },
      learningResources: [
        {
          type: 'Online Course',
          title: `Professional ${skill} Fundamentals`,
          description: `Comprehensive online course covering ${skill} principles, methodologies, and practical applications. Includes real-world case studies and hands-on exercises.`,
          difficulty: 'Beginner to Intermediate'
        },
        {
          type: 'Certification',
          title: `Certified ${skill} Professional`,
          description: `Industry-recognized certification program validating ${skill} competencies and best practices. Enhances credibility and career prospects.`,
          difficulty: 'Intermediate'
        },
        {
          type: 'Workshop',
          title: `Advanced ${skill} Techniques`,
          description: `Intensive workshop focusing on advanced concepts and emerging trends in ${skill}. Great for networking with industry professionals.`,
          difficulty: 'Advanced'
        },
        {
          type: 'Book',
          title: `Mastering ${skill}: Theory and Practice`,
          description: `Comprehensive guide covering both theoretical foundations and practical applications of ${skill} in professional settings.`,
          difficulty: 'All Levels'
        }
      ],
      careerProgression: {
        entry: {
          title: `${skill} Associate`,
          salary: '$45,000 - $65,000',
          requirements: ['Relevant education or training', `Basic ${skill} knowledge`, 'Strong analytical skills', 'Good communication abilities']
        },
        mid: {
          title: `Senior ${skill} Professional`,
          salary: '$70,000 - $100,000',
          requirements: ['3-5 years experience', 'Professional certification preferred', 'Project management experience', 'Leadership capabilities']
        },
        senior: {
          title: `${skill} Manager/Director`,
          salary: '$110,000 - $160,000',
          requirements: ['7+ years experience', 'Advanced certification', 'Team management experience', 'Strategic planning skills']
        }
      }
    };
  }

  // Enhanced fallback skill details when API fails
  private getEnhancedFallbackSkillDetails(skill: string): SkillDetail {
    console.log(`🔄 Using enhanced fallback skill details for ${skill}`);
    
    return {
      skillName: skill,
      overview: `${skill} is a valuable professional competency that plays a crucial role in modern workplace success. Professionals with strong ${skill} capabilities are sought after across industries and can pursue diverse career paths with excellent growth potential and competitive compensation.`,
      marketDemand: {
        level: 'Very High',
        growth: '20-30% annually',
        averageSalary: '$75,000 - $115,000'
      },
      industries: [
        {
          name: 'Technology & Software',
          demand: 'Extremely High',
          pros: ['Premium salaries ($90K-$160K)', 'Remote work flexibility', 'Innovation opportunities', 'Rapid career advancement', 'Stock options available', 'Cutting-edge technology exposure'],
          cons: ['High competition for positions', 'Fast-paced work environment', 'Continuous learning requirements', 'Long hours during releases', 'Frequent technology changes', 'High-pressure deadlines'],
          avgSalary: '$85,000 - $145,000',
          jobTitles: [`Senior ${skill} Engineer`, `${skill} Team Lead`, `Principal ${skill} Architect`, `${skill} Product Manager`, `VP of ${skill}`, `Chief ${skill} Officer`]
        },
        {
          name: 'Financial Services',
          demand: 'Very High',
          pros: ['Excellent job security', 'Comprehensive benefits', 'Structured career paths', 'High client interaction', 'Strong industry reputation', 'Networking opportunities'],
          cons: ['Strict regulatory environment', 'Conservative culture', 'Slower innovation cycles', 'Extensive compliance requirements', 'Limited creative freedom', 'High stress during market volatility'],
          avgSalary: '$70,000 - $120,000',
          jobTitles: [`${skill} Business Analyst`, `Senior ${skill} Manager`, `${skill} Strategy Director`, `VP of ${skill} Operations`, `${skill} Risk Manager`, `Head of ${skill} Innovation`]
        },
        {
          name: 'Healthcare & Life Sciences',
          demand: 'Growing Rapidly',
          pros: ['Meaningful impact on lives', 'Strong job stability', 'Growing industry sector', 'Innovation in healthcare tech', 'Government support and funding', 'Purpose-driven work environment'],
          cons: ['Complex regulatory requirements', 'Slower technology adoption', 'Budget constraints', 'Extensive documentation needs', 'Long approval processes', 'Conservative decision-making'],
          avgSalary: '$65,000 - $100,000',
          jobTitles: [`Healthcare ${skill} Specialist`, `${skill} Program Coordinator`, `Senior ${skill} Research Analyst`, `${skill} Implementation Manager`, `Director of ${skill} Operations`, `Chief ${skill} Innovation Officer`]
        }
      ],
      blogPost: {
        title: `Building Your Career with ${skill}: A Strategic Guide for 2024 Success`,
        content: `In today's rapidly evolving professional landscape, ${skill} has become one of the most valuable and sought-after competencies across virtually every industry. Whether you're starting your career journey or planning a strategic pivot, developing expertise in ${skill} can unlock exceptional opportunities and drive substantial career growth.

The current job market demonstrates unprecedented demand for ${skill} professionals. Recent industry surveys indicate that over 80% of organizations are actively seeking qualified candidates, with many reporting significant difficulty in finding talent with the right combination of technical skills and strategic thinking. This talent shortage has created a highly favorable environment for skilled professionals, with starting salaries increasing by 25-35% over the past two years.

What distinguishes truly successful ${skill} professionals from their peers goes far beyond technical competency. The most sought-after practitioners combine deep expertise with business acumen, exceptional communication skills, and an unwavering commitment to continuous learning. They understand that ${skill} isn't just about executing tasks—it's about driving organizational transformation, solving complex business challenges, and delivering measurable value to stakeholders.

To accelerate your ${skill} career, start by building a strong foundation through formal education, industry certifications, or structured learning programs. Companies like Google, Microsoft, and IBM offer specialized training that's highly valued by employers. Next, focus on gaining hands-on experience through internships, volunteer projects, or personal initiatives that showcase your practical capabilities.

Building a compelling portfolio is absolutely critical in today's competitive market. Successful professionals showcase 3-5 diverse projects that demonstrate different aspects of their ${skill} expertise. Include detailed case studies that explain your approach, challenges overcome, and quantifiable results achieved. This tangible evidence often proves more valuable than credentials alone.

Networking and relationship building remain game-changers for career advancement. Join professional associations, attend industry conferences, and actively participate in online communities. Many of the best opportunities come through referrals and professional connections rather than traditional job postings.

Looking ahead, the future of ${skill} careers appears exceptionally bright. Emerging technologies, changing consumer behaviors, and evolving business models continue to create new opportunities for skilled professionals. Rather than being threatened by automation, ${skill} roles are evolving to focus on higher-level strategic thinking, creative problem-solving, and human-centered design.

The professionals who invest in ${skill} development today will be the leaders and innovators of tomorrow. With the right combination of technical skills, business understanding, and strategic networking, you can position yourself at the forefront of this dynamic and rewarding field.`,
        keyTakeaways: [
          `${skill} professionals command premium salaries with 20-30% annual demand growth`,
          'Success requires combining technical expertise with strategic business thinking',
          'Portfolio development with quantifiable results is essential for advancement',
          'Professional networking often leads to the best career opportunities',
          'Continuous learning is critical due to rapid technological evolution',
          'Future opportunities focus on strategic thinking rather than routine tasks'
        ]
      },
      learningResources: [
        {
          type: 'Professional Certification',
          title: `Advanced ${skill} Professional Certificate`,
          description: `Comprehensive industry-recognized certification covering advanced ${skill} methodologies, best practices, and real-world applications. Includes hands-on capstone projects, peer collaboration, and mentorship from industry experts.`,
          difficulty: 'Intermediate to Advanced'
        },
        {
          type: 'Online Specialization',
          title: `Complete ${skill} Mastery Program`,
          description: `Self-paced online curriculum with interactive lessons, practical exercises, and personalized feedback. Includes access to industry tools, templates, and a vibrant learning community.`,
          difficulty: 'Beginner to Intermediate'
        },
        {
          type: 'Intensive Bootcamp',
          title: `${skill} Leadership Intensive`,
          description: `Immersive program focusing on advanced techniques, emerging trends, and leadership skills. Features guest speakers from leading companies and extensive networking opportunities.`,
          difficulty: 'Advanced'
        },
        {
          type: 'Essential Reading',
          title: `${skill} Excellence: A Strategic Guide`,
          description: `Comprehensive guide covering theoretical foundations, practical applications, and strategic implementation. Features case studies from successful organizations and actionable frameworks.`,
          difficulty: 'Intermediate'
        },
        {
          type: 'Hands-On Workshop',
          title: `${skill} Innovation Workshop`,
          description: `Interactive workshop focusing on cutting-edge techniques and real-world problem solving. Includes post-workshop mentorship and personalized career guidance.`,
          difficulty: 'Advanced'
        }
      ],
      careerProgression: {
        entry: {
          title: `Junior ${skill} Specialist`,
          salary: '$55,000 - $75,000',
          requirements: ['Bachelor\'s degree or equivalent experience', `Basic ${skill} knowledge through coursework or projects`, 'Strong analytical and problem-solving abilities', 'Excellent communication and teamwork skills', 'Willingness to learn and adapt quickly']
        },
        mid: {
          title: `Senior ${skill} Professional`,
          salary: '$85,000 - $125,000',
          requirements: ['3-5 years of hands-on experience', 'Professional certification or advanced degree', 'Proven track record of successful project delivery', 'Leadership experience with cross-functional teams', 'Deep understanding of industry best practices']
        },
        senior: {
          title: `${skill} Director / VP`,
          salary: '$135,000 - $200,000+',
          requirements: ['7+ years of progressive leadership experience', 'Strategic thinking and business development skills', 'Proven ability to build and manage high-performing teams', 'Deep industry expertise and thought leadership', 'Track record of driving organizational transformation']
        }
      }
    };
  }


  // Analyze responses to find top 2 skills
  async findTopSkills(responses: QuizResponse[]): Promise<string[]> {
    try {
      console.log('🔍 Analyzing responses to find top 2 skills');
      console.log('Responses to analyze:', responses.length);
      
      if (!responses || responses.length === 0) {
        console.log('⚠️ No responses provided, using fallback skills');
        return this.getFallbackTopSkills();
      }
      
      const responseData = responses.map(r => ({
        question: r.question,
        answer: r.answer,
        skills: r.skillsAssessed,
        reasoning: r.reasoning
      }));

      const prompt = `You are a psychometric analyst specializing in skill assessment and competency evaluation. Analyze these assessment responses to identify the TOP 2 skills where the person demonstrates the highest proficiency, confidence, and practical application ability.

ASSESSMENT RESPONSES:
${JSON.stringify(responseData, null, 2)}

ANALYSIS CRITERIA:
Evaluate based on:
1. RESPONSE QUALITY: Depth and sophistication of answers
2. CONFIDENCE INDICATORS: Self-assessment scores and certainty in responses
3. PRACTICAL APPLICATION: Evidence of real-world experience and application
4. CONSISTENCY: Coherent responses across related questions
5. PROBLEM-SOLVING APPROACH: Demonstrated methodology and thinking patterns
6. ADVANCED UNDERSTANDING: Evidence of expertise beyond basic knowledge

SCORING METHODOLOGY:
- Analyze response patterns for each skill area
- Look for indicators of expertise (specific examples, nuanced understanding)
- Consider consistency across multiple questions per skill
- Identify where responses show confidence and detailed knowledge
- Factor in reasoning provided for context and depth

Return ONLY a JSON array with the 2 strongest skills based on evidence from responses:
["skill_with_highest_demonstrated_proficiency", "skill_with_second_highest_proficiency"]`;

      const result = await this.makeStructuredRequest(prompt);
      
      if (result && Array.isArray(result) && result.length >= 2) {
        console.log('✅ Top 2 skills identified:', result);
        return result.slice(0, 2); // Ensure exactly 2 skills
      } else {
        console.log('⚠️ Invalid API response, using fallback skill analysis');
        return this.getFallbackTopSkills(responses);
      }
    } catch (error) {
      console.error('❌ Error finding top skills:', error);
      console.log('🔄 Using fallback skill analysis due to error');
      return this.getFallbackTopSkills(responses);
    }
  }

  // Generate detailed career roadmap
  async generateDetailedRoadmap(
    topSkills: string[],
    careerRecommendations: CareerRecommendation[],
    skillGaps: SkillGap[],
    userProfile: { name: string }
  ): Promise<{
    immediate: Array<{title: string, description: string, timeline: string, priority: string}>;
    shortTerm: Array<{title: string, description: string, timeline: string, priority: string}>;
    longTerm: Array<{title: string, description: string, timeline: string, priority: string}>;
  }> {
    try {
      console.log('🗺️ Generating detailed career roadmap');
      
      const prompt = `You are a senior career strategist and executive coach. Create a comprehensive, actionable career roadmap based on this assessment data.

CARRER PROFILE:
User: ${userProfile.name}
Top Skills: ${topSkills.join(' & ')}
Career Recommendations: ${JSON.stringify(careerRecommendations, null, 2)}
Skill Gaps: ${JSON.stringify(skillGaps, null, 2)}

CREATE A DETAILED 3-PHASE ROADMAP:

PHASE 1 - IMMEDIATE (Next 3 months):
- 4-5 specific, actionable items
- Focus on quick wins and foundation building
- Include networking, skill assessment, and market research

PHASE 2 - SHORT-TERM (3-12 months):
- 4-5 strategic development activities
- Skill building, certification, portfolio development
- Professional positioning and relationship building

PHASE 3 - LONG-TERM (1-3 years):
- 4-5 career advancement initiatives
- Leadership development, specialization, industry recognition
- Career transition and growth opportunities

For each item provide:
- Specific, actionable title
- Detailed description with concrete steps
- Realistic timeline
- Priority level (Critical, High, Medium)

Return ONLY this JSON structure:
{
  "immediate": [
    {
      "title": "Complete Skills Assessment & Market Research",
      "description": "Conduct thorough analysis of current ${topSkills[0]} skills using industry benchmarks. Research 10-15 target companies and analyze their job requirements. Create skills gap analysis spreadsheet.",
      "timeline": "2-3 weeks",
      "priority": "Critical"
    }
  ],
  "shortTerm": [
    {
      "title": "Earn Industry-Recognized Certification",
      "description": "Complete ${topSkills[0]} certification from recognized provider. Dedicate 5-7 hours weekly to coursework and hands-on projects. Join certification study groups for networking.",
      "timeline": "4-6 months",
      "priority": "High"
    }
  ],
  "longTerm": [
    {
      "title": "Establish Industry Thought Leadership",
      "description": "Develop expertise in ${topSkills[0]} specialization. Publish articles, speak at conferences, mentor junior professionals. Build personal brand and industry recognition.",
      "timeline": "18-24 months",
      "priority": "High"
    }
  ]
}`;

      const model = genAI.getGenerativeModel({ 
        model: "gemini-1.5-flash",
        generationConfig: {
          responseMimeType: "application/json"
        }
      });

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const roadmap = JSON.parse(response.text());
      
      console.log('✅ Generated detailed career roadmap');
      return roadmap;
    } catch (error) {
      console.error('❌ Error generating detailed roadmap:', error);
      return this.getFallbackDetailedRoadmap(topSkills, careerRecommendations);
    }
  }

  getFallbackDetailedRoadmap(
    topSkills: string[], 
    careerRecommendations: CareerRecommendation[]
  ): DetailedRoadmap {
    return [
      {
        title: 'Develop Core Skills',
        description: 'Master the fundamental skills required for your career path.',
        skills: topSkills,
        workplaceExamples: ['Adapts to different team dynamics', 'Manages time effectively', 'Balances multiple priorities']
      }
    ];
  }

  getFallbackDetailedRoadmap(
    topSkills: string[],
    careerRecommendations: CareerRecommendation[]
  ): DetailedRoadmap {
    return [
      {
        title: 'Develop Core Skills',
        description: 'Master the fundamental skills required for your career path.',
        skills: topSkills,
        workplaceExamples: ['Adapts to different team dynamics', 'Manages time effectively', 'Balances multiple priorities']
      }
    ];
  }

  // Fallback methods for enhanced content
  getFallbackLearningPath(topSkills: string[]): LearningPathItem[] {
    console.log('🔄 Using fallback learning path for:', topSkills);
    
    const learningItems: LearningPathItem[] = [];
    
    topSkills.slice(0, 2).forEach(skill => {
      learningItems.push(
        {
          skill: skill,
          action: `Master foundational ${skill} concepts through structured learning`,
          resources: ['LinkedIn Learning courses', 'Coursera specializations', 'Industry certification programs'],
          timeline: '3-4 months',
          measurableOutcome: `Complete certification and 2 practical projects in ${skill}`
        },
        {
          skill: skill,
          action: `Build advanced ${skill} portfolio and gain practical experience`,
          resources: ['Open source projects', 'Professional mentorship', 'Industry conferences'],
          timeline: '4-6 months',
          measurableOutcome: `Create portfolio with 3-5 projects demonstrating ${skill} expertise`
        }
      );
    });
    
    return learningItems;
  }

  getFallbackPersonalityProfile(topSkills: string[]): PersonalityTrait[] {
    console.log('🔄 Using fallback personality profile for:', topSkills);
    
    return [
      {
        trait: 'Problem Solving Approach',
        score: 8,
        description: 'Demonstrates systematic and analytical problem-solving with strong attention to detail. Prefers to gather information and evaluate options before making decisions.',
        careerImplications: ['Analysis and research roles', 'Strategic planning positions', 'Technical problem-solving roles'],
        workplaceExamples: ['Thorough in planning projects', 'Effective at troubleshooting issues', 'Strong at risk assessment']
      },
      {
        trait: 'Communication Style',
        score: 7,
        description: 'Balanced communication approach that adapts to audience and situation. Shows good listening skills and ability to explain complex concepts clearly.',
        careerImplications: ['Team collaboration roles', 'Client-facing positions', 'Training and mentoring opportunities'],
        workplaceExamples: ['Facilitates productive meetings', 'Explains technical concepts clearly', 'Builds rapport with colleagues']
      },
      {
        trait: 'Learning Orientation',
        score: 9,
        description: 'High motivation for continuous learning and professional development. Embraces new challenges and adapts quickly to changing environments.',
        careerImplications: ['Emerging technology fields', 'Innovation and R&D roles', 'Career transition opportunities'],
        workplaceExamples: ['Stays current with industry trends', 'Volunteers for new projects', 'Seeks feedback for improvement']
      },
      {
        trait: 'Leadership Potential',
        score: 7,
        description: 'Shows collaborative leadership style with focus on team development and consensus building. Demonstrates emotional intelligence in team dynamics.',
        careerImplications: ['Team leadership roles', 'Project management positions', 'Cross-functional coordination'],
        workplaceExamples: ['Supports team member growth', 'Manages conflicts diplomatically', 'Encourages innovative thinking']
      },
      {
        trait: 'Work Style Preference',
        score: 6,
        description: 'Flexible approach to work structure, comfortable with both independent work and collaborative environments. Values efficiency and quality outcomes.',
        careerImplications: ['Hybrid work environments', 'Project-based roles', 'Consulting and freelance opportunities'],
        workplaceExamples: ['Adapts to different team dynamics', 'Manages time effectively', 'Balances multiple priorities']
      }
    ];
  },

  getFallbackDetailedRoadmap(
    topSkills: string[], 
    careerRecommendations: CareerRecommendation[]
  ): {
    immediate: Array<{title: string, description: string, timeline: string, priority: string}>;
    shortTerm: Array<{title: string, description: string, timeline: string, priority: string}>;
    longTerm: Array<{title: string, description: string, timeline: string, priority: string}>;
  } {
    console.log('🔄 Using fallback detailed roadmap for:', topSkills);
    
    const primarySkill = topSkills[0] || 'Professional Development';
    const secondarySkill = topSkills[1] || 'Communication';
    const targetRole = careerRecommendations[0]?.title || `${primarySkill} Specialist`;
    
    return {
      immediate: [
        {
          title: `Assess Current ${primarySkill} Competency Level`,
          description: `Complete comprehensive self-assessment using industry benchmarks. Identify specific strengths and gaps in ${primarySkill}. Research market requirements for target roles.`,
          timeline: '2-3 weeks',
          priority: 'Critical'
        },
        {
          title: 'Build Professional Network Foundation',
          description: `Connect with 15-20 professionals in your target field. Join relevant LinkedIn groups and professional associations. Attend 2-3 industry events or webinars.`,
          timeline: '4-6 weeks',
          priority: 'High'
        },
        {
          title: 'Update Professional Brand and Resume',
          description: `Revise resume to highlight ${primarySkill} and ${secondarySkill} achievements. Update LinkedIn profile with specific accomplishments and keywords for ${targetRole}.`,
          timeline: '2-3 weeks',
          priority: 'High'
        },
        {
          title: 'Research Target Companies and Roles',
          description: `Identify 10-15 companies that hire for ${targetRole} positions. Analyze job descriptions to understand requirements. Create target company spreadsheet with key contacts.`,
          timeline: '3-4 weeks',
          priority: 'Medium'
        }
      ],
      shortTerm: [
        {
          title: `Earn ${primarySkill} Professional Certification`,
          description: `Complete industry-recognized certification program in ${primarySkill}. Dedicate 5-8 hours weekly to coursework and practical projects. Join study groups for networking.`,
          timeline: '4-6 months',
          priority: 'Critical'
        },
        {
          title: 'Build Comprehensive Portfolio',
          description: `Create portfolio showcasing ${primarySkill} and ${secondarySkill} projects. Include 3-5 detailed case studies with measurable outcomes. Develop online presence.`,
          timeline: '3-5 months',
          priority: 'High'
        },
        {
          title: 'Gain Practical Experience Through Projects',
          description: `Volunteer for projects requiring ${primarySkill} application. Seek mentorship from senior professionals. Document learnings and expand professional network.`,
          timeline: '6-9 months',
          priority: 'High'
        },
        {
          title: 'Develop Industry Knowledge and Trends Awareness',
          description: `Subscribe to industry publications and podcasts. Attend conferences and workshops. Start sharing insights on LinkedIn to build thought leadership.`,
          timeline: '6-12 months',
          priority: 'Medium'
        }
      ],
      longTerm: [
        {
          title: `Transition to ${targetRole} Position`,
          description: `Apply strategic job search techniques to secure ${targetRole} role. Leverage network for referrals and insider information. Negotiate competitive compensation package.`,
          timeline: '12-18 months',
          priority: 'Critical'
        },
        {
          title: 'Establish Subject Matter Expertise',
          description: `Develop specialization within ${primarySkill} domain. Publish articles, present at conferences, and mentor junior professionals. Build reputation as industry expert.`,
          timeline: '18-30 months',
          priority: 'High'
        },
        {
          title: 'Advance to Senior Leadership Role',
          description: `Target senior or leadership positions leveraging accumulated expertise. Develop team management and strategic planning skills. Consider executive education programs.`,
          timeline: '24-36 months',
          priority: 'High'
        },
        {
          title: 'Build Long-term Career Options',
          description: `Explore consulting opportunities, board positions, or entrepreneurial ventures. Develop passive income streams related to expertise. Plan for long-term career sustainability.`,
          timeline: '30+ months',
          priority: 'Medium'
        }
      ]
    };
  }

  async generateDeepDiveQuestions(topSkills: string[], previousResponses: QuizResponse[]): Promise<AdaptiveQuestion[]> {
    try {
      console.log('🎯 Generating 30 deep-dive questions for top skills:', topSkills);
      
      // Validate input
      if (!topSkills || topSkills.length === 0) {
        console.log('⚠️ No top skills provided, using fallback');
        return this.getFallbackDeepDiveQuestions(['General Skills', 'Professional Development']);
      }
      
      const prompt = `You are a senior career specialist. Generate exactly 30 advanced assessment questions focused on these 2 top skills: ${topSkills.join(' and ')}.

Create questions that will:
- Deeply evaluate expertise level (15 questions per skill)
- Test advanced scenarios and edge cases
- Assess leadership and mentoring capabilities
- Evaluate market readiness and professional maturity
- Include industry-specific challenges

Mix question types:
- Advanced scenario-based questions (40%)
- Technical depth questions (30%) 
- Leadership/soft skills integration (20%)
- Market awareness questions (10%)

CRITICAL REQUIREMENTS:
1. Generate EXACTLY 30 questions (not more, not less)
2. Every question MUST have the "options" array with 4 choices
3. Questions should be numbered 1-30
4. Focus 15 questions on skill 1, 15 questions on skill 2

Return ONLY a JSON array with this exact structure:
[{
  "id": "deep_dive_1",
  "question": "advanced question text",
  "type": "multiple-choice",
  "options": ["expert_option1", "expert_option2", "expert_option3", "expert_option4"],
  "skillsAssessed": ["${topSkills[0] || 'skill1'}"],
  "difficulty": 4,
  "scenario": "professional context"
}]`;

      const model = genAI.getGenerativeModel({ 
        model: "gemini-1.5-flash",
        generationConfig: {
          responseMimeType: "application/json",
          temperature: 0.7,
          maxOutputTokens: 8192
        }
      });

      console.log('📡 Sending request to Gemini API...');
      const result = await this.makeStructuredRequest(prompt);
      
      console.log('📥 Generated response from Gemini, processing...');
      
      if (!result) {
        console.log('⚠️ No result from API, using fallback');
        return this.getFallbackDeepDiveQuestions(topSkills.length > 0 ? topSkills : ['Problem Solving', 'Communication']);
      }
      
      const questions = result;
      
      // Ensure we have exactly 30 questions
      let processedQuestions = Array.isArray(questions) ? questions.slice(0, 30) : []; // Take first 30 if more
      
      // If we have less than 30, pad with fallback questions
      if (processedQuestions.length < 30) {
        console.log(`⚠️ Only got ${processedQuestions.length} questions, padding to 30`);
        const fallbackQuestions = this.getFallbackDeepDiveQuestions(topSkills);
        const needed = 30 - processedQuestions.length;
        processedQuestions = [...processedQuestions, ...fallbackQuestions.slice(0, needed)];
      }
      
      processedQuestions = processedQuestions.map((q: any, index: number) => ({
        id: q.id || `deep_${index + 1}`,
        question: q.question,
        type: q.type || 'multiple-choice', 
        options: q.options && q.options.length >= 4 ? q.options.slice(0, 4) : [
          'Strongly agree - I excel at this',
          'Agree - I\'m competent in this area', 
          'Neutral - I have some experience',
          'Disagree - I need development here'
        ],
        skillsAssessed: q.skillsAssessed || [topSkills[Math.floor(index / 15)]],
        difficulty: q.difficulty || 4,
        scenario: q.scenario
      }));
      
      console.log(`✅ Processed exactly ${processedQuestions.length} deep-dive questions`);
      return processedQuestions;
    } catch (error) {
      console.error('❌ Error generating deep-dive questions:', error);
      console.log('🔄 Falling back to offline questions...');
      // Return fallback deep-dive questions
      return this.getFallbackDeepDiveQuestions(topSkills.length > 0 ? topSkills : ['Problem Solving', 'Communication']);
    }
  }

  // Generate workplace scenarios based on user's field of interest
  async generateWorkplaceScenario(
    fieldOfInterest: string,
    topSkills: string[],
    allResponses: QuizResponse[],
    userProfile: { name: string }
  ): Promise<WorkplaceScenario> {
    try {
      console.log('🤖 Generating workplace scenario');

      const responseData = allResponses.map(r => ({
        question: r.question,
        answer: r.answer,
      }));

      const prompt = `
        Generate a workplace scenario based on the user's field of interest and top skills.
        Field of Interest: ${fieldOfInterest}
        Top Skills: ${topSkills.join(', ')}
        Responses: ${JSON.stringify(responseData)}
        User Profile: ${JSON.stringify(userProfile)}
      `;

      const response = await this.callOpenAI(prompt);
      return JSON.parse(response);
    } catch (error) {
      console.error('❌ Error generating workplace scenario:', error);
      console.log('🔄 Falling back to offline scenario...');
      // Return fallback workplace scenario
      return this.getFallbackWorkplaceScenario();
    }
  },

  // Generate comprehensive career analysis and recommendations
  async analyzeCareerFit(
    topSkills: string[],
    allResponses: QuizResponse[],
    userProfile: { name: string }
  ): Promise<CareerAnalysis> {
    try {
      console.log('🤖 Generating comprehensive career analysis');
      
      const responseData = allResponses.map(r => ({
        question: r.question,
        answer: r.answer,
      }));

      const prompt = `
        Generate a comprehensive career analysis and recommendations based on the user's top skills and responses.
        Top Skills: ${topSkills.join(', ')}
        Responses: ${JSON.stringify(responseData)}
        User Profile: ${JSON.stringify(userProfile)}
      `;

      const response = await this.callOpenAI(prompt);
      return JSON.parse(response);
    } catch (error) {
      console.error('❌ Error generating career analysis:', error);
      console.log('🔄 Falling back to offline analysis...');
      // Return fallback career analysis
      return this.getFallbackCareerAnalysis();
    }
  },

  // Generate deep-dive questions based on user's top skills
  async generateDeepDiveQuestions(
    topSkills: string[],
    allResponses: QuizResponse[],
    userProfile: { name: string }
  ): Promise<DeepDiveQuestion[]> {
    try {
      console.log('🤖 Generating deep-dive questions');

      const responseData = allResponses.map(r => ({
        question: r.question,
        answer: r.answer,
        skills: r.skillsAssessed,
        reasoning: r.reasoning
      }));

      const prompt = `You are a senior career strategist with 15+ years of experience in talent assessment and career development. Analyze this comprehensive assessment data to provide actionable career guidance.

ASSESSMENT DATA:
User: ${userProfile.name}
Top 2 Skills Identified: ${topSkills.join(' & ')}
Total Assessment Responses: ${allResponses.length}
Detailed Response Analysis: ${JSON.stringify(responseData, null, 2)}

ANALYSIS REQUIREMENTS:
Provide a comprehensive career analysis that includes:

1. SKILL MASTERY EVALUATION (Rate 1-100 based on response patterns)
2. CAREER RECOMMENDATIONS with specific titles, realistic salary ranges, and growth projections
3. MARKET ANALYSIS with current demand data and competition levels
4. DEVELOPMENT ROADMAP with concrete timelines and measurable outcomes
5. RISK ASSESSMENT considering career stability and market volatility
6. INDUSTRY INSIGHTS including emerging trends and opportunities

OUTPUT REQUIREMENTS:
- Base all recommendations on actual response analysis
- Provide realistic salary ranges based on current market data
- Include specific next steps with timelines
- Consider both technical skills and soft skills demonstrated
- Factor in current job market conditions

Return ONLY this comprehensive JSON structure:
{
  "overallScore": 92,
  "topStrengths": ["Detailed analysis of strongest demonstrated abilities"],
  "skillGaps": ["Specific areas needing development based on responses"],
  "careerRecommendations": [
    {
      "title": "Senior Data Scientist", 
      "match": 95,
      "description": "Perfect alignment with analytical skills and problem-solving approach demonstrated in assessment",
      "salaryRange": "$120,000 - $180,000",
      "growthOutlook": "Excellent - 25% growth expected over 5 years",
      "companies": ["Tech giants", "Financial services", "Healthcare analytics"],
      "requirements": ["Advanced degree preferred", "3+ years experience", "Portfolio of projects"],
      "pros": ["High demand", "Remote work options", "Intellectual challenge"],
      "cons": ["Competitive field", "Continuous learning required", "Fast-paced environment"]
    }
  ],
  "developmentPlan": {
    "immediate": ["Specific 30-day action items with measurable outcomes"],
    "shortTerm": ["3-6 month goals with clear metrics and deadlines"],
    "longTerm": ["1-2 year strategic objectives with milestone tracking"]
  },
  "marketInsights": {
    "demandLevel": "Very High",
    "competitionLevel": "High", 
    "trendingSkills": ["Emerging skills gaining importance"],
    "industryTrends": ["Key market movements affecting this career path"],
    "salaryTrends": "15% increase year-over-year in target roles"
  },
  "recommendation": "Strong recommendation with confidence level and reasoning",
  "confidence": 94,
  "nextSteps": ["Immediate priority actions ranked by impact and urgency"]
}`;

      const model = genAI.getGenerativeModel({ 
        model: "gemini-1.5-flash",
        generationConfig: {
          responseMimeType: "application/json"
        }
      });

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const analysis = JSON.parse(response.text());
      
      console.log('✅ Comprehensive career analysis generated');
      
      // Generate enhanced learning path and personality analysis
      const [detailedLearningPath, enhancedPersonality, detailedRoadmap, skillDetails] = await Promise.all([
        this.generateDetailedLearningPath(topSkills, allResponses, userProfile),
        this.generatePersonalityAnalysis(topSkills, allResponses, userProfile),
        this.generateDetailedRoadmap(topSkills, [], [], userProfile), // Will be populated with analysis results
        this.generateSkillDetails(topSkills, allResponses, userProfile)
      ]);
      
      return {
        overallScore: analysis.overallScore || 85,
        topStrengths: analysis.topStrengths || topSkills,
        skillGaps: (analysis.skillGaps || []).map((gap: any) => ({
          skill: gap.skill || 'General Development',
          currentLevel: gap.currentLevel || 4,
          requiredLevel: gap.requiredLevel || 7,
          priority: gap.priority || 'medium',
          developmentTime: gap.developmentTime || '3-6 months'
        })),
        careerRecommendations: (analysis.careerRecommendations || []).map((rec: any) => ({
          title: rec.title || 'Career Opportunity',
          match: rec.match || 80,
          description: rec.description || 'Great career match based on your skills',
          salaryRange: rec.salaryRange || '$60,000 - $90,000',
          growthOutlook: rec.growthOutlook || 'Positive growth expected',
          field: rec.field || 'Technology',
          matchScore: rec.match || rec.matchScore || 80,
          growthProspects: rec.growthOutlook || rec.growthProspects || 'Good',
          requiredSkills: rec.requiredSkills || topSkills,
          timeToTransition: rec.timeToTransition || '6-12 months'
        })),
        developmentPlan: analysis.developmentPlan || {
          immediate: ['Update resume', 'Build portfolio'],
          shortTerm: ['Apply to positions', 'Expand network'],
          longTerm: ['Advance to leadership', 'Specialize further']
        },
        detailedRoadmap: detailedRoadmap,
        marketInsights: {
          demandLevel: analysis.marketInsights?.demandLevel || 'High',
          competitionLevel: analysis.marketInsights?.competitionLevel || 'Moderate',
          trendingSkills: analysis.marketInsights?.trendingSkills || topSkills
        },
        skillPatterns: analysis.topStrengths || topSkills,
        learningPath: detailedLearningPath,
        personalityProfile: enhancedPersonality,
        skillDetails: skillDetails
      };
    } catch (error) {
      console.error('❌ Error in career analysis:', error);
      // Return comprehensive fallback analysis
      return {
        overallScore: 80,
        topStrengths: topSkills,
        skillGaps: [
          {
            skill: 'Industry Knowledge',
            currentLevel: 5,
            requiredLevel: 8,
            priority: 'high' as const,
            developmentTime: '4-6 months'
          },
          {
            skill: 'Professional Network',
            currentLevel: 3,
            requiredLevel: 7,
            priority: 'medium' as const,
            developmentTime: '6-12 months'
          }
        ],
        careerRecommendations: [
          {
            title: `${topSkills[0]} Specialist`,
            match: 85,
            description: `Leverage your strong ${topSkills[0]} skills in a specialized role`,
            salaryRange: '$65,000 - $95,000',
            growthOutlook: 'Strong growth expected',
            field: 'Technology',
            matchScore: 85,
            growthProspects: 'Excellent',
            requiredSkills: topSkills,
            timeToTransition: '6-12 months'
          },
          {
            title: `${topSkills[1]} Professional`,
            match: 80,
            description: `Apply your ${topSkills[1]} expertise in a professional environment`,
            salaryRange: '$60,000 - $85,000',
            growthOutlook: 'Positive growth',
            field: 'Business',
            matchScore: 80,
            growthProspects: 'Good',
            requiredSkills: topSkills,
            timeToTransition: '6-9 months'
          }
        ],
        developmentPlan: {
          immediate: ['Update resume', 'Create portfolio'],
          shortTerm: ['Network with professionals', 'Apply for roles'],
          longTerm: ['Advance to senior positions', 'Develop leadership skills']
        },
        marketInsights: {
          demandLevel: 'High',
          competitionLevel: 'Moderate',
          trendingSkills: topSkills
        },
        skillPatterns: topSkills,
        learningPath: [
          {
            skill: topSkills[0],
            action: 'Pursue advanced certification',
            resources: ['Online courses', 'Professional training'],
            timeline: '3-6 months',
            measurableOutcome: 'Certification completion'
          },
          {
            skill: topSkills[1],
            action: 'Build practical portfolio',
            resources: ['Practice projects', 'Industry workshops'],
            timeline: '4-8 months',
            measurableOutcome: 'Portfolio with 3 projects'
          }
        ],
        personalityProfile: [
          {
            trait: 'Problem Solving',
            score: 8,
            description: 'Strong analytical and solution-oriented approach',
            careerImplications: ['Technical roles', 'Consulting', 'Project management']
          },
          {
            trait: 'Learning Orientation',
            score: 9,
            description: 'High motivation for continuous learning and growth',
            careerImplications: ['Emerging technology fields', 'Research roles', 'Innovation teams']
          }
        ]
      };
    }
  },

  // Generate workplace scenarios based on user's field of interest
  async generateWorkplaceScenario(
    fieldOfInterest: string,
    userBackground: { name: string; previousResponses?: QuizResponse[] },
    previousScenarios: string[] = [],
    nicheField?: string,
    majorField?: string
  ): Promise<{
    scenario: string;
    context: string;
    challenge: string;
    options: Array<{
      id: string;
      text: string;
      skills: string[];
      personality: string[];
    }>;
    followUpQuestions: string[];
  }> {
    // Get the niche field name if provided
    const nicheFieldName = nicheField ? this.getNicheFieldName(majorField || fieldOfInterest, nicheField) : null;
    
    const context = this.conversationHistory.join('\n');
    const prompt = `
      ${SYSTEM_PROMPTS.QUESTION_GENERATOR}
      
      IMPORTANT: Respond ONLY with valid JSON. No additional text or explanations.
      
      FIELD: ${fieldOfInterest}
      ${nicheFieldName ? `NICHE AREA: ${nicheFieldName}` : ''}
      User Background: ${JSON.stringify(userBackground)}
      Previous Scenarios: ${previousScenarios.join(', ')}
      
      CREATE A FIELD-SPECIFIC SCENARIO THAT:
      1. Reflects real ${fieldOfInterest}${nicheFieldName ? ` - ${nicheFieldName}` : ''} industry challenges and terminology
      2. Tests decision-making skills relevant to ${fieldOfInterest}${nicheFieldName ? ` - ${nicheFieldName}` : ''} professionals
      3. Reveals leadership potential in ${fieldOfInterest}${nicheFieldName ? ` - ${nicheFieldName}` : ''} contexts
      4. Shows problem-solving approach using ${fieldOfInterest}${nicheFieldName ? ` - ${nicheFieldName}` : ''} methodologies
      5. Demonstrates industry-specific knowledge and best practices
      6. Assesses communication style relevant to ${fieldOfInterest}${nicheFieldName ? ` - ${nicheFieldName}` : ''} stakeholders
      
      FIELD-SPECIFIC REQUIREMENTS:
      ${this.getFieldSpecificRequirements(fieldOfInterest)}
      
      ${nicheFieldName ? `NICHE-SPECIFIC FOCUS:
      - Emphasize challenges and terminology specific to ${nicheFieldName}
      - Include stakeholders and situations unique to ${nicheFieldName} within ${fieldOfInterest}
      - Test knowledge of ${nicheFieldName} best practices and methodologies
      - Present realistic options that ${nicheFieldName} professionals would face` : ''}
      
      Generate a workplace scenario that:
      1. Is relevant to the user's field of interest
      2. Builds on previous scenarios
      3. Includes a clear challenge and multiple options
      4. Provides follow-up questions for deeper exploration
      
      Return ONLY this JSON structure (no markdown, no extra text):
      {
        "scenario": "You're leading a project that's falling behind schedule. What's your first action?",
        "context": "Your team is working on an important project with a tight deadline. You realize you're 20% behind schedule with only 2 weeks left.",
        "challenge": "You need to get the project back on track without compromising quality.",
        "options": [
          {
            "id": "o_1",
            "text": "Analyze what's causing delays",
            "skills": ["problem-solving", "critical thinking"],
            "personality": ["analytical"]
          },
          {
            "id": "o_2",
            "text": "Increase team working hours",
            "skills": ["time management"],
            "personality": ["determined"]
          },
          {
            "id": "o_3",
            "text": "Request deadline extension",
            "skills": ["negotiation"],
            "personality": ["flexible"]
          },
          {
            "id": "o_4",
            "text": "Redistribute tasks among team",
            "skills": ["leadership"],
            "personality": ["collaborative"]
          }
        ],
        "followUpQuestions": [
          "What specific steps would you take to analyze the delays?",
          "How would you communicate the need for increased working hours to the team?",
          "What factors would you consider when negotiating the deadline extension?",
          "How would you redistribute tasks to ensure the project stays on track?"
        ]
      }
    `;

    try {
      const result = await this.makeStructuredRequest(prompt);
      this.addToContext(prompt, JSON.stringify(result));
      
      // Type check the result before returning
      if (result && typeof result === 'object' && 
          'scenario' in result && 
          'context' in result && 
          'challenge' in result && 
          'options' in result && 
          'followUpQuestions' in result) {
        return result as {
          scenario: string;
          context: string;
          challenge: string;
          options: Array<{
            id: string;
            text: string;
            skills: string[];
            personality: string[];
          }>;
          followUpQuestions: string[];
        };
      } else {
        console.log('⚠️ Invalid response from Gemini API, using fallback scenario');
        return this.getFallbackScenario(fieldOfInterest);
      }
    } catch (error) {
      console.error('Error generating workplace scenario:', error);
      return this.getFallbackScenario(fieldOfInterest);
    }
  }

  // Helper method to get niche field name from ID
  private getNicheFieldName(majorField: string, nicheId: string): string | null {
    // This would typically come from a constant or configuration
    // For now, we'll return the niche ID as the name
    // In a real implementation, you'd map niche IDs to their display names
    const nicheFieldsMap: Record<string, Record<string, string>> = {
      'technology': {
        'web-development': 'Web Development',
        'mobile-development': 'Mobile Development',
        'devops': 'DevOps & Cloud',
        'data-science': 'Data Science',
        'cybersecurity': 'Cybersecurity',
        'game-development': 'Game Development'
      },
      'business': {
        'strategy': 'Business Strategy',
        'operations-management': 'Operations Management',
        'project-management': 'Project Management',
        'business-analysis': 'Business Analysis',
        'entrepreneurship': 'Entrepreneurship',
        'product-management': 'Product Management'
      },
      'healthcare': {
        'clinical-management': 'Clinical Management',
        'health-informatics': 'Health Informatics',
        'public-health': 'Public Health',
        'healthcare-administration': 'Healthcare Administration',
        'nursing-leadership': 'Nursing Leadership',
        'healthcare-consulting': 'Healthcare Consulting'
      },
      'education': {
        'k12-education': 'K-12 Education',
        'higher-education': 'Higher Education',
        'educational-technology': 'Educational Technology',
        'corporate-training': 'Corporate Training',
        'curriculum-design': 'Curriculum Design',
        'education-administration': 'Education Administration'
      },
      'creative': {
        'ux-ui-design': 'UX/UI Design',
        'graphic-design': 'Graphic Design',
        'digital-marketing': 'Digital Marketing',
        'content-creation': 'Content Creation',
        'brand-management': 'Brand Management',
        'advertising': 'Advertising'
      },
      'finance': {
        'corporate-finance': 'Corporate Finance',
        'investment-banking': 'Investment Banking',
        'financial-planning': 'Financial Planning',
        'risk-management': 'Risk Management',
        'accounting': 'Accounting',
        'fintech': 'FinTech'
      },
      'engineering': {
        'software-engineering': 'Software Engineering',
        'mechanical-engineering': 'Mechanical Engineering',
        'electrical-engineering': 'Electrical Engineering',
        'civil-engineering': 'Civil Engineering',
        'systems-engineering': 'Systems Engineering',
        'biomedical-engineering': 'Biomedical Engineering'
      },
      'sales': {
        'b2b-sales': 'B2B Sales',
        'b2c-sales': 'B2C Sales',
        'saas-sales': 'SaaS Sales',
        'sales-management': 'Sales Management',
        'business-development': 'Business Development',
        'inside-sales': 'Inside Sales'
      },
      'operations': {
        'supply-chain': 'Supply Chain',
        'operations-excellence': 'Operations Excellence',
        'quality-management': 'Quality Management',
        'facilities-management': 'Facilities Management',
        'production-management': 'Production Management',
        'inventory-management': 'Inventory Management'
      },
      'hr': {
        'talent-acquisition': 'Talent Acquisition',
        'hr-operations': 'HR Operations',
        'organizational-development': 'Organizational Development',
        'employee-relations': 'Employee Relations',
        'compensation-benefits': 'Compensation & Benefits',
        'hr-business-partner': 'HR Business Partner'
      },
      'legal': {
        'corporate-law': 'Corporate Law',
        'litigation': 'Litigation',
        'compliance': 'Compliance',
        'contract-law': 'Contract Law',
        'intellectual-property': 'Intellectual Property',
        'employment-law': 'Employment Law'
      },
      'consulting': {
        'strategy-consulting': 'Strategy Consulting',
        'technology-consulting': 'Technology Consulting',
        'management-consulting': 'Management Consulting',
        'financial-consulting': 'Financial Consulting',
        'hr-consulting': 'HR Consulting',
        'change-management': 'Change Management'
      },
      'data': {
        'data-science': 'Data Science',
        'data-engineering': 'Data Engineering',
        'business-intelligence': 'Business Intelligence',
        'data-analytics': 'Data Analytics',
        'ai-ml': 'AI/ML Engineering',
        'data-governance': 'Data Governance'
      }
    };

    return nicheFieldsMap[majorField]?.[nicheId] || nicheId;
  }

  // Get field-specific requirements for scenario generation
  getFieldSpecificRequirements(fieldOfInterest: string): string {
    const requirements = {
      'technology': `
- Include technical challenges like system architecture, code reviews, technology adoption
- Use terminology: APIs, databases, frameworks, cloud services, DevOps, agile methodology
- Stakeholders: Product managers, engineering teams, QA engineers, DevOps engineers
- Common scenarios: System outages, technical debt, new feature development, security vulnerabilities
- Skills to test: Technical leadership, system design, code quality, project management`,
      
      'business': `
- Include strategic challenges like market analysis, resource allocation, stakeholder management
- Use terminology: ROI, KPIs, strategic planning, market research, competitive analysis
- Stakeholders: Executives, department heads, clients, board members, investors
- Common scenarios: Budget constraints, strategic pivots, market expansion, process optimization
- Skills to test: Strategic thinking, financial analysis, stakeholder management, decision-making`,
      
      'healthcare': `
- Include patient care challenges, regulatory compliance, resource management
- Use terminology: EHR systems, HIPAA compliance, patient outcomes, clinical protocols, quality metrics
- Stakeholders: Physicians, nurses, administrators, patients, regulatory bodies, insurance providers
- Common scenarios: Staffing shortages, regulatory changes, patient safety incidents, technology implementations
- Skills to test: Clinical judgment, regulatory knowledge, patient advocacy, crisis management`,
      
      'education': `
- Include curriculum development, student assessment, educational technology integration
- Use terminology: Learning objectives, assessment strategies, pedagogical approaches, educational standards
- Stakeholders: Students, teachers, administrators, parents, school boards, accrediting bodies
- Common scenarios: Curriculum updates, technology adoption, student performance issues, budget cuts
- Skills to test: Instructional design, student assessment, technology integration, educational leadership`,
      
      'creative': `
- Include brand strategy, creative campaigns, client presentations, design critiques
- Use terminology: Brand identity, user experience, creative brief, design thinking, visual hierarchy
- Stakeholders: Creative directors, clients, marketing teams, developers, target audiences
- Common scenarios: Rebranding projects, campaign launches, client feedback, creative blocks
- Skills to test: Creative problem-solving, client management, design thinking, brand strategy`,
      
      'finance': `
- Include financial analysis, risk assessment, regulatory compliance, investment decisions
- Use terminology: Financial modeling, risk metrics, compliance requirements, investment portfolios
- Stakeholders: CFOs, auditors, regulators, investors, risk managers, compliance officers
- Common scenarios: Market volatility, regulatory changes, investment decisions, financial reporting
- Skills to test: Financial analysis, risk management, regulatory knowledge, investment strategy`,
      
      'engineering': `
- Include project management, technical design, safety protocols, quality assurance
- Use terminology: Technical specifications, quality standards, safety protocols, project milestones
- Stakeholders: Project managers, technical teams, safety officers, clients, regulatory bodies
- Common scenarios: Design challenges, safety incidents, project delays, quality issues
- Skills to test: Technical design, project management, safety awareness, quality control`,
      
      'sales': `
- Include client relationship management, sales pipeline, negotiation, market analysis
- Use terminology: CRM systems, sales funnel, lead generation, client acquisition, revenue targets
- Stakeholders: Sales teams, clients, marketing, account managers, sales directors
- Common scenarios: Deal negotiations, client objections, market competition, sales targets
- Skills to test: Relationship building, negotiation, market analysis, sales strategy`,
      
      'operations': `
- Include supply chain management, process optimization, vendor relations, logistics
- Use terminology: Supply chain, inventory management, process efficiency, vendor management
- Stakeholders: Suppliers, logistics teams, quality control, procurement, warehouse staff
- Common scenarios: Supply chain disruptions, process inefficiencies, vendor issues, capacity planning
- Skills to test: Process optimization, supply chain management, vendor relations, analytical thinking`,
      
      'hr': `
- Include talent management, employee relations, policy development, organizational development
- Use terminology: Talent acquisition, performance management, employee engagement, HR policies
- Stakeholders: Employees, managers, executives, unions, legal counsel, external recruiters
- Common scenarios: Talent shortages, employee conflicts, policy updates, organizational changes
- Skills to test: Employee relations, policy development, talent management, organizational psychology`,
      
      'legal': `
- Include contract negotiations, regulatory compliance, legal research, risk assessment
- Use terminology: Legal research, contract law, regulatory compliance, risk mitigation, legal precedents
- Stakeholders: Clients, legal teams, regulatory bodies, courts, opposing counsel
- Common scenarios: Contract disputes, regulatory changes, compliance issues, litigation management
- Skills to test: Legal research, contract analysis, regulatory knowledge, risk assessment`,
      
      'consulting': `
- Include client problem-solving, strategic recommendations, change management, stakeholder alignment
- Use terminology: Strategic analysis, change management, stakeholder alignment, implementation roadmap
- Stakeholders: Client executives, project teams, steering committees, end users
- Common scenarios: Strategic transformations, organizational changes, process improvements, culture change
- Skills to test: Strategic thinking, change management, client relations, analytical problem-solving`,
      
      'data': `
- Include data analysis, machine learning, business intelligence, data governance
- Use terminology: Data pipelines, machine learning models, data visualization, statistical analysis
- Stakeholders: Data scientists, business analysts, IT teams, business stakeholders, data engineers
- Common scenarios: Data quality issues, model deployment, insights communication, data privacy
- Skills to test: Data analysis, statistical thinking, business intelligence, technical communication`
    };
    
    return requirements[fieldOfInterest] || requirements['business'];
  },

  async analyzeScenarioResponses(
    fieldOfInterest: string,
    responses: any[]
  ): Promise<any> {
    try {
      console.log('📊 Analyzing scenario responses for:', fieldOfInterest);
      
      const responseData = responses.map(r => ({
        scenario: r.scenario,
        choice: r.selectedOption,
        reasoning: r.reasoning
      }));

      const prompt = `You are a senior career strategist specializing in ${fieldOfInterest}. Analyze these scenario responses for field-specific insights.

FIELD: ${fieldOfInterest}
RESPONSES: ${JSON.stringify(responseData, null, 2)}

Analyze the decision patterns and provide ${fieldOfInterest}-specific career insights.

Return ONLY this JSON:
{
  "overallScore": 85,
  "leadershipStyle": "${fieldOfInterest} leadership style based on responses",
  "problemSolvingApproach": "${fieldOfInterest} problem-solving method",
  "topStrengths": [
    "${fieldOfInterest}-specific strength 1",
    "${fieldOfInterest}-specific strength 2",
    "${fieldOfInterest}-specific strength 3"
  ],
  "skillGaps": [
    {
      "skill": "${fieldOfInterest} Advanced Skill",
      "currentLevel": 6,
      "requiredLevel": 9,
      "priority": "high",
      "developmentTime": "4-6 months"
    }
  ],
  "careerRecommendations": [
    {
      "title": "Senior ${fieldOfInterest} Professional",
      "match": 90,
      "description": "${fieldOfInterest} role description",
      "salaryRange": "$80,000 - $120,000",
      "field": "${fieldOfInterest}",
      "requiredSkills": ["${fieldOfInterest} skill 1", "${fieldOfInterest} skill 2"]
    }
  ],
  "personalityProfile": [
    {
      "trait": "${fieldOfInterest} Leadership",
      "score": 8,
      "description": "${fieldOfInterest} leadership description",
      "careerImplications": ["${fieldOfInterest} career path"]
    }
  ]
}`;
      const model = genAI.getGenerativeModel({ 
        model: "gemini-1.5-flash",
        generationConfig: {
          responseMimeType: "application/json"
        }
      });

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const analysis = JSON.parse(response.text());
      
      console.log('✅ Comprehensive scenario analysis complete');
      return analysis;
    } catch (error) {
      console.error('❌ Error analyzing scenario responses:', error);
      
      // Return comprehensive fallback analysis
      return this.getFallbackScenarioAnalysis(fieldOfInterest);
    }
  },

  async testGeminiAPI(): Promise<{ success: boolean; error?: string; questionsCount?: number }> {
    try {
      console.log('🧪 Testing Gemini API connection...');
      
      const testPrompt = `Generate 3 simple career assessment questions. Return ONLY this JSON:
{
  "questions": [
    {
      "id": "test_1",
      "question": "What motivates you most at work?",
      "type": "multiple-choice",
      "options": ["Achievement", "Collaboration", "Learning", "Impact"]
    },
    {
      "id": "test_2", 
      "question": "How do you prefer to solve problems?",
      "type": "multiple-choice",
      "options": ["Research first", "Brainstorm ideas", "Try solutions", "Ask others"]
    },
    {
      "id": "test_3",
      "question": "What work environment suits you best?",
      "type": "multiple-choice", 
      "options": ["Quiet space", "Team setting", "Flexible location", "Structured office"]
    }
  ]
}`;

      const model = genAI.getGenerativeModel({ 
        model: "gemini-1.5-flash",
        generationConfig: {
          responseMimeType: "application/json"
        }
      });

      const result = await model.generateContent(testPrompt);
      const response = await result.response;
      const data = JSON.parse(response.text());
      
      console.log('✅ Gemini API test successful');
      return {
        success: true,
        questionsCount: data.questions?.length || 0
      };
    } catch (error) {
      console.error('❌ Gemini API test failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  },

  // Fallback method for deep-dive questions
  getFallbackDeepDiveQuestions(topSkills: string[]): AdaptiveQuestion[] {
    const questions: AdaptiveQuestion[] = [];
    const timestamp = Date.now();
    
    console.log('🔄 Creating diverse deep-dive questions for skills:', topSkills);
    
    // Ensure we have exactly 2 skills
    const skills = topSkills.length >= 2 ? topSkills.slice(0, 2) : 
      [...topSkills, ...['Problem Solving', 'Communication', 'Leadership']].slice(0, 2);
    
    // Create 15 unique questions per skill (30 total)
    skills.forEach((skill, skillIndex) => {
      const uniqueQuestions = [
        // Expertise Level Questions (5 questions)
        {
          question: `How would you rate your current mastery level in ${skill}?`,
          type: 'scale' as const,
          options: ['Beginner (1)', 'Developing (2)', 'Competent (3)', 'Proficient (4)', 'Advanced (5)', 'Expert (6)', 'Master (7)', 'Thought Leader (8)', 'Industry Expert (9)', 'World-Class (10)']
        },
        {
          question: `When teaching ${skill} to others, what is your primary strength?`,
          type: 'multiple-choice' as const,
          options: [
            'Breaking down complex concepts into simple steps',
            'Providing real-world examples and case studies',
            'Creating hands-on practice opportunities',
            'Adapting to different learning styles and paces'
          ]
        },
        {
          question: `What aspect of ${skill} do you find most challenging to master?`,
          type: 'multiple-choice' as const,
          options: [
            'Staying current with evolving best practices',
            'Adapting techniques to different contexts',
            'Balancing theoretical knowledge with practical application',
            'Scaling approaches for larger or more complex situations'
          ]
        },
        {
          question: `How do you typically acquire new knowledge in ${skill}?`,
          type: 'multiple-choice' as const,
          options: [
            'Formal training, courses, and certifications',
            'Learning from mentors and industry experts',
            'Hands-on experimentation and trial-and-error',
            'Reading research, articles, and best practice guides'
          ]
        },
        {
          question: `What motivates you most when working on ${skill}-intensive projects?`,
          type: 'multiple-choice' as const,
          options: [
            'The intellectual challenge and problem-solving aspects',
            'The opportunity to make a meaningful impact',
            'The chance to collaborate and learn from others',
            'The potential for innovation and creative solutions'
          ]
        },
        
        // Real-World Application Questions (5 questions)
        {
          question: `Describe your approach when you encounter a ${skill} challenge beyond your current experience`,
          type: 'multiple-choice' as const,
          options: [
            'Research extensively before taking any action',
            'Consult with experts and seek guidance',
            'Start with small experiments to test approaches',
            'Apply existing knowledge and adapt as needed'
          ]
        },
        {
          question: `In high-pressure situations requiring ${skill}, what is your typical response?`,
          type: 'scenario' as const,
          scenario: `You're in a time-critical situation where stakeholders are depending on your ${skill} expertise to resolve an urgent issue.`,
          options: [
            'Focus on proven, reliable solutions even if not optimal',
            'Take time to analyze the situation thoroughly first',
            'Involve the team in collaborative problem-solving',
            'Trust my intuition and experience to guide decisions'
          ]
        },
        {
          question: `How do you ensure quality when working quickly with ${skill}?`,
          type: 'multiple-choice' as const,
          options: [
            'Use established frameworks and checklists',
            'Build in review and validation checkpoints',
            'Leverage automation and tools where possible',
            'Focus on the most critical aspects first'
          ]
        },
        {
          question: `When your ${skill}-based solution doesn't work as expected, what do you do?`,
          type: 'multiple-choice' as const,
          options: [
            'Analyze what went wrong and adjust the approach',
            'Go back to research and explore alternative methods',
            'Seek feedback from users and stakeholders',
            'Test multiple variations to find what works'
          ]
        },
        {
          question: `How do you balance innovation with reliability in your ${skill} work?`,
          type: 'multiple-choice' as const,
          options: [
            'Start with proven methods, then gradually introduce innovations',
            'Create separate spaces for experimentation vs. delivery',
            'Test innovative approaches thoroughly before implementation',
            'Focus primarily on reliability with occasional innovation'
          ]
        },
        
        // Leadership and Team Questions (5 questions)
        {
          question: `When leading a team that needs strong ${skill} capabilities, what's your primary focus?`,
          type: 'multiple-choice' as const,
          options: [
            'Ensuring everyone has the necessary skills and training',
            'Creating clear processes and quality standards',
            'Building a collaborative environment for knowledge sharing',
            'Establishing metrics to track performance and improvement'
          ]
        },
        {
          question: `How do you handle team members who resist ${skill} best practices?`,
          type: 'scenario' as const,
          scenario: `Some team members prefer their existing approaches and are reluctant to adopt the ${skill} methods you're advocating for.`,
          options: [
            'Demonstrate the benefits through pilot projects',
            'Provide training and support to build confidence',
            'Work one-on-one to understand their concerns',
            'Set clear expectations and accountability measures'
          ]
        },
        {
          question: `What role do you typically take in ${skill}-focused team discussions?`,
          type: 'multiple-choice' as const,
          options: [
            'Subject matter expert providing guidance and answers',
            'Facilitator helping the team explore options together',
            'Active contributor sharing ideas and perspectives',
            'Strategic thinker focusing on long-term implications'
          ]
        },
        {
          question: `How do you develop ${skill} capabilities in junior team members?`,
          type: 'multiple-choice' as const,
          options: [
            'Provide structured learning paths with clear milestones',
            'Assign challenging projects with appropriate support',
            'Pair them with experienced mentors for guidance',
            'Create opportunities for them to observe and learn'
          ]
        },
        {
          question: `When making ${skill}-related decisions for your team, what do you prioritize?`,
          type: 'multiple-choice' as const,
          options: [
            'Technical excellence and best practices',
            'Team capacity and realistic timelines',
            'Stakeholder needs and business objectives',
            'Learning opportunities and skill development'
          ]
        }
      ];
      
      // Add all 15 unique questions for this skill
      uniqueQuestions.forEach((questionTemplate, questionIndex) => {
        questions.push({
          id: `deep_${timestamp}_${skillIndex}_${questionIndex}`,
          question: questionTemplate.question,
          type: questionTemplate.type,
          options: questionTemplate.options,
          skillsAssessed: [skill],
          difficulty: 4,
          scenario: questionTemplate.scenario
        });
      });
    });
    
    console.log(`✅ Generated ${questions.length} unique deep-dive questions`);
    return questions;
  },

  // Generate detailed skill information using the class method
  async generateSkillDetails(
    topSkills: string[],
    responses: QuizResponse[],
    userProfile: { name: string }
  ): Promise<SkillDetail[]> {
    // Create a temporary instance to use the class method
    const instance = new GeminiService();
    return await instance.generateSkillDetails(topSkills, responses, userProfile);
  },

  // Get fallback skill details
  getFallbackSkillDetails(skill: string): SkillDetail {
    const instance = new GeminiService();
    return instance['getFallbackSkillDetails'](skill);
  },

  // Get fallback scenario
  getFallbackScenario(field: string) {
    const instance = new GeminiService();
    return instance['getFallbackScenario'](field);
  },

  // Check if error is due to quota exceeded
  isQuotaExceededError(error: any): boolean {
    const errorMessage = error?.message || error?.toString() || '';
    return errorMessage.includes('429') || 
           errorMessage.includes('quota') || 
           errorMessage.includes('exceeded') ||
           errorMessage.includes('limit');
  },

  // Check if error is a network/connection issue
  isConnectionError(error: any): boolean {
    const errorMessage = error?.message || error?.toString() || '';
    return errorMessage.includes('503') || 
           errorMessage.includes('overloaded') ||
           errorMessage.includes('network') ||
           errorMessage.includes('timeout');
  },

  // Analyze scenario responses specifically for personality traits
  async analyzeScenarioResponsesForPersonality(
    fieldOfInterest: string,
    scenarioResults: any
  ): Promise<{ personalityProfile: PersonalityTrait[] }> {
    try {
      console.log('🧠 Analyzing scenario responses for personality insights');
      
      const prompt = `You are a senior organizational psychologist specializing in personality assessment through behavioral analysis. Analyze these scenario responses to provide detailed personality insights.

FIELD OF INTEREST: ${fieldOfInterest}
SCENARIO ANALYSIS RESULTS: ${JSON.stringify(scenarioResults, null, 2)}

Based on the decision patterns, response styles, and behavioral indicators in the scenario responses, generate a comprehensive personality profile that includes:

1. **COGNITIVE PROCESSING STYLE** - How they gather and process information
2. **DECISION-MAKING APPROACH** - Their methodology for making choices
3. **LEADERSHIP ORIENTATION** - Natural leadership style and team dynamics
4. **COMMUNICATION PREFERENCES** - How they interact and share information
5. **PROBLEM-SOLVING METHODOLOGY** - Their approach to challenges and obstacles
6. **WORK ENVIRONMENT FIT** - Preferred settings and organizational culture
7. **STRESS RESPONSE PATTERNS** - How they handle pressure and uncertainty
8. **LEARNING & ADAPTATION STYLE** - How they acquire new skills and adapt

For each trait, provide:
- Accurate score (1-10) based on evidence from responses
- Detailed behavioral description with specific examples
- Relevant career implications for ${fieldOfInterest}
- Workplace examples that demonstrate this trait

IMPORTANT: Base analysis ONLY on actual evidence from the responses provided. Do not make assumptions.

Return ONLY this JSON structure:
{
  "personalityProfile": [
    {
      "trait": "Cognitive Processing Style",
      "score": 8,
      "description": "Demonstrates systematic analytical thinking with attention to detail. Processes information methodically and considers multiple perspectives before forming conclusions.",
      "careerImplications": ["Research roles", "Strategic planning", "Quality assurance", "Systems analysis"],
      "workplaceExamples": ["Thoroughly researches before decisions", "Asks clarifying questions", "Documents processes systematically", "Identifies potential risks early"]
    },
    {
      "trait": "Decision-Making Approach",
      "score": 7,
      "description": "Balances data-driven analysis with intuitive insights. Seeks input from others while maintaining decisiveness when needed.",
      "careerImplications": ["Management roles", "Consulting positions", "Team leadership", "Strategic advisory"],
      "workplaceExamples": ["Gathers team input before major decisions", "Uses data to support choices", "Considers long-term implications", "Takes accountability for outcomes"]
    }
  ]
}`;

      // Use the makeStructuredRequest from the class instance
      const instance = new GeminiService();
      const result: any = await instance['makeStructuredRequest'](prompt);
      
      if (result && result.personalityProfile) {
        console.log('✅ Generated dynamic personality analysis from scenario responses');
        return result as { personalityProfile: PersonalityTrait[] };
      } else {
        console.log('⚠️ Using fallback personality analysis');
        return this.getFallbackPersonalityFromScenarios(fieldOfInterest, scenarioResults);
      }
    } catch (error) {
      console.error('❌ Error analyzing scenario responses for personality:', error);
      return this.getFallbackPersonalityFromScenarios(fieldOfInterest, scenarioResults);
    }
  },

  // Fallback personality analysis based on scenario results
  getFallbackPersonalityFromScenarios(
    fieldOfInterest: string,
    scenarioResults: any
  ): { personalityProfile: PersonalityTrait[] } {
    console.log('🔄 Using fallback personality analysis for scenario responses');
    
    const baseTraits: PersonalityTrait[] = [
      {
        trait: 'Decision-Making Style',
        score: 8,
        description: `Demonstrates thoughtful and analytical decision-making approach suitable for ${fieldOfInterest} challenges. Shows ability to balance multiple factors and stakeholder perspectives.`,
        careerImplications: ['Strategic planning roles', 'Management positions', 'Consulting opportunities', 'Leadership tracks'],
        workplaceExamples: ['Evaluates options systematically', 'Considers stakeholder impact', 'Balances risk and opportunity', 'Documents decision rationale']
      },
      {
        trait: 'Problem-Solving Approach',
        score: 7,
        description: `Exhibits structured problem-solving methodology with strong analytical capabilities. Approaches challenges methodically while remaining adaptable to changing circumstances.`,
        careerImplications: ['Technical roles', 'Process improvement', 'Business analysis', 'Project management'],
        workplaceExamples: ['Breaks complex problems into components', 'Researches best practices', 'Tests solutions iteratively', 'Learns from outcomes']
      },
      {
        trait: 'Communication Style',
        score: 8,
        description: `Shows strong communication skills with ability to adapt messaging to different audiences. Demonstrates active listening and collaborative approach to team interactions.`,
        careerImplications: ['Client-facing roles', 'Team leadership', 'Training and development', 'Cross-functional coordination'],
        workplaceExamples: ['Explains complex concepts clearly', 'Facilitates productive discussions', 'Builds consensus among stakeholders', 'Provides constructive feedback']
      },
      {
        trait: 'Learning Orientation',
        score: 9,
        description: `High motivation for continuous learning and professional development. Shows openness to feedback and enthusiasm for acquiring new skills relevant to ${fieldOfInterest}.`,
        careerImplications: ['Emerging technology fields', 'Innovation teams', 'Research and development', 'Change management'],
        workplaceExamples: ['Seeks out learning opportunities', 'Applies new knowledge quickly', 'Shares insights with team', 'Stays current with industry trends']
      },
      {
        trait: 'Collaboration & Teamwork',
        score: 8,
        description: `Strong collaborative approach with excellent team dynamics. Values diverse perspectives and contributes effectively to group objectives.`,
        careerImplications: ['Cross-functional teams', 'Matrix organizations', 'Agile environments', 'Partnership roles'],
        workplaceExamples: ['Supports team member success', 'Shares knowledge and resources', 'Builds strong working relationships', 'Contributes to positive team culture']
      },
      {
        trait: 'Adaptability & Resilience',
        score: 7,
        description: `Demonstrates good adaptability to changing circumstances while maintaining focus on objectives. Shows resilience when facing challenges or setbacks.`,
        careerImplications: ['Dynamic industries', 'Startup environments', 'Change management', 'Crisis response roles'],
        workplaceExamples: ['Adjusts plans based on new information', 'Maintains productivity during transitions', 'Learns from failures', 'Helps others navigate change']
      }
    ];
    
    // Customize traits based on field of interest
    if (fieldOfInterest === 'technology') {
      baseTraits[0].description = 'Demonstrates systematic, data-driven decision-making approach ideal for technical environments. Shows strong logical reasoning and consideration of technical constraints.';
      baseTraits[1].description = 'Exhibits methodical problem-solving with strong technical analysis capabilities. Approaches coding and system challenges with structured debugging methodology.';
    } else if (fieldOfInterest === 'business') {
      baseTraits[0].description = 'Shows strategic business thinking with strong consideration for market dynamics and stakeholder impact. Balances short-term needs with long-term objectives.';
      baseTraits[1].description = 'Demonstrates business acumen in problem-solving with focus on ROI and operational efficiency. Considers both quantitative and qualitative factors.';
    } else if (fieldOfInterest === 'healthcare') {
      baseTraits[0].description = 'Exhibits patient-centered decision-making approach with strong ethical considerations. Balances clinical evidence with compassionate care delivery.';
      baseTraits[1].description = 'Shows systematic clinical problem-solving with attention to patient safety and quality outcomes. Considers evidence-based practices and regulatory requirements.';
    }
    
    return { personalityProfile: baseTraits };
  },

  // Fallback method for initial questions - generates 20 questions
  getFallbackInitialQuestions(selectedSkills: string[]): AdaptiveQuestion[] {
    console.log('🔄 Generating 20 fallback initial questions for skills:', selectedSkills);
    const timestamp = Date.now();
    const questions: AdaptiveQuestion[] = [];
    
    // Generate 4 questions per skill (5 skills × 4 = 20 questions)
    selectedSkills.forEach((skill, skillIndex) => {
      for (let i = 0; i < 4; i++) {
        const questionTypes = [
          {
            question: `How confident are you in applying ${skill} in professional situations?`,
            type: 'multiple-choice' as const,
            options: [
              'Very confident - I excel in this area',
              'Confident - I handle most situations well', 
              'Somewhat confident - I can manage basic tasks',
              'Not confident - I need significant development'
            ]
          },
          {
            question: `When working with ${skill}, what motivates you most?`,
            type: 'multiple-choice' as const,
            options: [
              'Solving complex challenges',
              'Collaborating with others',
              'Achieving measurable results',
              'Learning and improving continuously'
            ]
          },
          {
            question: `Rate your current expertise level in ${skill}`,
            type: 'scale' as const,
            options: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10']
          },
          {
            question: `In a team project requiring ${skill}, what role do you typically take?`,
            type: 'multiple-choice' as const,
            options: [
              'Lead the initiative and guide others',
              'Contribute expertise and support the team',
              'Follow guidance while contributing ideas',
              'Observe and learn from more experienced members'
            ]
          }
        ];
        
        const questionTemplate = questionTypes[i % questionTypes.length];
        questions.push({
          id: `fallback_initial_${timestamp}_${skillIndex}_${i}`,
          question: questionTemplate.question,
          type: questionTemplate.type,
          options: questionTemplate.options,
          skillsAssessed: [skill],
          difficulty: 2 + i // Varying difficulty from 2-5
        });
      }
    });
    
    console.log('✅ Generated', questions.length, 'fallback initial questions');
    return questions;
  }
};

// Test API connectivity on initialization
console.log('🚀 Gemini Service initialized with API key:', API_KEY.substring(0, 10) + '...');

// Simple test function to verify API connectivity
export const testGeminiAPI = async () => {
  console.log('🧪 Testing Gemini API connectivity...');
  try {
    const testQuestions = await geminiService.generateInitialQuestions(
      ['communication', 'leadership']
    );
    console.log('✅ Gemini API test successful!');
    console.log('Sample questions generated:', testQuestions.length);
    return { success: true, questionsCount: testQuestions.length };
  } catch (error) {
    console.error('❌ Gemini API test failed:', error);
    return { success: false, error: (error as Error).message };
  }
};


