# CareerQuest - Use Case Diagram

## 📊 Use Case Diagram

This document describes the use case diagram for the CareerQuest application - an AI-powered career discovery platform.

### 📋 Diagram Files

- **USE_CASE_DIAGRAM.puml** - PlantUML source file (can be viewed in VS Code with PlantUML extension)
- **USE_CASE_DIAGRAM.md** - This documentation file

### 🎭 Actors

1. **Guest User** - Unauthenticated visitors
2. **Authenticated User** - Logged-in users who can take assessments
3. **AI System (Gemini API)** - External AI service that generates questions and analyzes responses

### 📦 Use Case Packages

#### 1. Authentication Package
- UC1: Sign Up
- UC2: Login  
- UC3: Logout

#### 2. Path Selection Package
- UC4: View Landing Page
- UC5: Select Talents Path
- UC6: Select Scenarios Path

#### 3. Talents Path Assessment Package
- UC7: Select 5 Skills (from 15 available)
- UC8: Take Phase 1 Quiz (20 questions)
- UC9: View Phase 1 Analysis (identifies top 2 skills)
- UC10: Take Phase 2 Quiz (30 questions)
- UC11: View Career Analysis (comprehensive results)

#### 4. Scenarios Path Assessment Package
- UC12: Select Field of Interest (Technology, Business, Healthcare, etc.)
- UC13: Select Niche Field (specific area within chosen field)
- UC14: Complete Scenario Quiz (workplace decision-making)
- UC15: View Personality Analysis (personality profile and recommendations)

#### 5. Results & Reports Package
- UC16: View Full Results (comprehensive view with all tabs)
- UC17: View Summary Results (condensed view)
- UC18: Export Results as PDF
- UC19: Print Results
- UC20: Share Results
- UC21: Retake Assessment

#### 6. AI-Powered Services Package
- UC22: Generate Adaptive Questions
- UC23: Analyze Career Fit
- UC24: Generate Workplace Scenarios
- UC25: Analyze Personality Profile
- UC26: Generate Learning Path
- UC27: Provide Market Insights

### 🔗 Key Relationships

#### Include Relationships (Required)
- **UC1/UC2 → UC4**: Sign Up/Login includes viewing landing page
- **UC4 → UC5/UC6**: Landing page includes path selection
- **UC8/UC10 → UC22**: Quizzes use AI to generate questions
- **UC11 → UC23, UC26, UC27**: Career analysis uses multiple AI services
- **UC14 → UC24**: Scenario quiz uses AI to generate scenarios
- **UC15 → UC25**: Personality analysis uses AI

#### Extend Relationships (Optional)
- **UC16 ← UC17**: Summary view extends full results
- **UC16 ← UC18**: PDF export extends full results
- **UC16 ← UC19**: Print extends full results
- **UC16 ← UC20**: Share extends full results
- **UC16 ← UC21**: Retake assessment extends full results

### 📊 Use Case Descriptions

#### Authentication Use Cases

**UC1: Sign Up**
- **Actor:** Guest User
- **Description:** New user creates an account
- **Input:** Name, Email, Password
- **Output:** User account created, session started
- **Flow:** Enter credentials → Validate → Create account → Login → Navigate to path selection

**UC2: Login**
- **Actor:** Guest User
- **Description:** Existing user authenticates
- **Input:** Email, Password
- **Output:** Session created, user authenticated
- **Flow:** Enter credentials → Validate → Create session → Navigate to path selection

**UC3: Logout**
- **Actor:** Authenticated User
- **Description:** User ends session
- **Output:** Session terminated, redirected to landing

#### Talents Path Use Cases

**UC7: Select 5 Skills**
- **Actor:** Authenticated User
- **Description:** User chooses 5 skills from 15 options
- **Available Skills:** Leadership, Communication, Problem Solving, Creativity, Technical, Analytics, Design, Writing, Marketing, Sales, Project Management, Research, Teaching, Finance, Strategy
- **Output:** 5 selected skills, Phase 1 unlocked

**UC8: Take Phase 1 Quiz**
- **Actor:** Authenticated User
- **Description:** User answers 20 adaptive questions
- **Uses:** UC22 (AI generates questions)
- **Output:** 20 responses saved, triggers analysis

**UC9: View Phase 1 Analysis**
- **Actor:** Authenticated User
- **Description:** View AI analysis identifying top 2 skills
- **Output:** Top 2 skills identified, Phase 2 unlocked

**UC10: Take Phase 2 Quiz**
- **Actor:** Authenticated User
- **Description:** User answers 30 deep-dive questions on top 2 skills
- **Uses:** UC22 (AI generates questions)
- **Output:** 30 responses saved, triggers final analysis

**UC11: View Career Analysis**
- **Actor:** Authenticated User
- **Description:** Comprehensive career recommendations and analysis
- **Uses:** UC23 (Career Fit), UC26 (Learning Path), UC27 (Market Insights)
- **Output:** Full career report with recommendations, skill gaps, learning paths

#### Scenarios Path Use Cases

**UC12: Select Field of Interest**
- **Actor:** Authenticated User
- **Description:** Choose major field category
- **Options:** Technology, Business, Healthcare, Education, Creative, Finance, Engineering, Sales, Operations, HR, Legal, Consulting, Data
- **Output:** Niche selection unlocked

**UC13: Select Niche Field**
- **Actor:** Authenticated User
- **Description:** Choose specific niche within selected field
- **Example:** Technology → Web Development, Mobile Development, DevOps, etc.
- **Output:** Scenario quiz unlocked

**UC14: Complete Scenario Quiz**
- **Actor:** Authenticated User
- **Description:** Navigate AI-generated workplace scenarios
- **Uses:** UC24 (AI generates scenarios)
- **Output:** Scenario responses saved, triggers analysis

**UC15: View Personality Analysis**
- **Actor:** Authenticated User
- **Description:** View personality profile based on scenario responses
- **Uses:** UC25 (AI analyzes personality)
- **Output:** Personality traits, career implications, recommendations

#### Results Use Cases

**UC16: View Full Results**
- **Actor:** Authenticated User
- **Description:** Comprehensive results with 6 tabs
- **Tabs:** Overview, Career Paths, Skills Analysis, Personality, Learning Path, AI Insights
- **Output:** Full interactive results display

**UC17: View Summary Results**
- **Actor:** Authenticated User
- **Description:** Condensed summary view
- **Type:** Extends UC16
- **Output:** Key metrics and recommendations in compact format

**UC18: Export Results as PDF**
- **Actor:** Authenticated User
- **Description:** Generate and download PDF report
- **Type:** Extends UC16
- **Output:** PDF file with full assessment results

**UC19: Print Results**
- **Actor:** Authenticated User
- **Description:** Print results using browser print
- **Type:** Extends UC16
- **Output:** Print dialog, formatted for printing

**UC20: Share Results**
- **Actor:** Authenticated User
- **Description:** Share results summary via native share or clipboard
- **Type:** Extends UC16
- **Output:** Shared summary text

**UC21: Retake Assessment**
- **Actor:** Authenticated User
- **Description:** Start new assessment from beginning
- **Type:** Extends UC16
- **Output:** All data cleared, return to path selection

#### AI Services Use Cases

**UC22: Generate Adaptive Questions**
- **Actor:** AI System
- **Description:** Creates personalized questions
- **Input:** Selected skills, previous responses, phase
- **Output:** Set of adaptive questions

**UC23: Analyze Career Fit**
- **Actor:** AI System
- **Description:** Analyzes responses for career matching
- **Input:** All quiz responses, selected skills
- **Output:** Career recommendations with match scores

**UC24: Generate Workplace Scenarios**
- **Actor:** AI System
- **Description:** Creates realistic workplace scenarios
- **Input:** Field of interest, niche, previous scenarios
- **Output:** Customized scenario with options

**UC25: Analyze Personality Profile**
- **Actor:** AI System
- **Description:** Determines personality traits from scenarios
- **Input:** Scenario responses
- **Output:** Personality profile with scores and implications

**UC26: Generate Learning Path**
- **Actor:** AI System
- **Description:** Creates personalized development roadmap
- **Input:** Skill gaps, career goals
- **Output:** Structured learning path with timelines and resources

**UC27: Provide Market Insights**
- **Actor:** AI System
- **Description:** Provides industry trends and market data
- **Input:** Career field, skills
- **Output:** Market insights, salary ranges, demand levels

### 🔄 Main User Flows

#### Flow 1: New User - Talents Path
```
Guest → UC1 (Sign Up) → UC4 (Landing) → UC5 (Talents Path) 
→ UC7 (Select Skills) → UC8 (Phase 1) → UC9 (Analysis) 
→ UC10 (Phase 2) → UC11 (Career Analysis) → UC16 (Results) 
→ UC18 (Export PDF)
```

#### Flow 2: Existing User - Scenarios Path
```
User → UC2 (Login) → UC6 (Scenarios Path) → UC12 (Field) 
→ UC13 (Niche) → UC14 (Quiz) → UC15 (Analysis) 
→ UC16 (Results) → UC17 (Summary View)
```

### 🎯 System Boundaries

**Inside System:**
- All UI components and pages
- Authentication logic
- Assessment state management
- Results display and formatting
- PDF generation
- Share functionality

**Outside System:**
- Gemini AI API (external service)
- Browser storage (for session management)
- File system (for PDF downloads)

### 📈 Key Features Mapped to Use Cases

| Feature | Use Cases |
|---------|-----------|
| Authentication | UC1, UC2, UC3 |
| Assessment Paths | UC5, UC6 |
| Skill-Based Assessment | UC7, UC8, UC9, UC10, UC11 |
| Scenario-Based Assessment | UC12, UC13, UC14, UC15 |
| Results Display | UC16, UC17 |
| Export & Share | UC18, UC19, UC20 |
| AI Integration | UC22, UC23, UC24, UC25, UC26, UC27 |

### 🔧 Viewing the Diagram

To view the PlantUML diagram:

1. **VS Code:**
   - Install "PlantUML" extension
   - Open `USE_CASE_DIAGRAM.puml`
   - Press `Alt+D` to preview

2. **Online:**
   - Visit http://www.plantuml.com/plantuml/uml/
   - Paste the contents of `USE_CASE_DIAGRAM.puml`

3. **Command Line:**
   ```bash
   # Install PlantUML
   npm install -g node-plantuml
   
   # Generate image
   puml generate USE_CASE_DIAGRAM.puml -o use_case_diagram.png
   ```

---

**Last Updated:** Based on CareerQuest codebase analysis  
**Total Use Cases:** 27  
**Total Actors:** 3
