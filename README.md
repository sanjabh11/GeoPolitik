# GeoPolitik - Game Theory Geopolitical Prediction Platform

## Overview

GeoPolitik is an advanced AI-powered platform that combines interactive game theory education with real-time geopolitical risk assessment and strategic analysis. Built with cutting-edge technology, it serves students, researchers, policymakers, and analysts who need to understand and forecast international relations through mathematical modeling and AI-driven insights.

![GeoPolitik Platform](https://images.pexels.com/photos/7412095/pexels-photo-7412095.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1)

## 🚀 Key Features

### 1. **AI-Powered Game Theory Tutorials**
- Interactive learning modules from beginner to advanced levels
- Real-time AI-generated content using Google Gemini 2.5 Flash
- Geopolitical examples and scenarios
- Adaptive learning with progress tracking
- Nash equilibrium calculators and game trees

### 2. **Real-Time Geopolitical Risk Assessment**
- Live risk scoring (0-100) for global regions
- Multi-factor analysis (political, economic, military, social)
- AI-powered confidence intervals and scenario analysis
- Historical trend visualization
- Automated data refresh and caching

### 3. **Strategic Scenario Simulation**
- Multi-actor game-theoretic modeling
- AI-powered Nash equilibrium calculation
- Monte Carlo simulations with 1,000+ iterations
- Strategic recommendations and sensitivity analysis
- Interactive actor configuration

### 4. **Crisis Event Monitoring**
- Real-time crisis detection using AI analysis
- Customizable alert thresholds and notifications
- Multi-source intelligence aggregation
- Escalation probability assessment
- Browser notifications and real-time updates

### 5. **Advanced Economic Modeling**
- GDP impact calculations with confidence intervals
- Trade flow analysis with bilateral and multilateral metrics
- Employment effects modeling by sector
- Welfare impact assessments
- Fiscal implications analysis

### 6. **Mobile Application Features**
- Progressive Web App (PWA) capabilities
- Offline data access and synchronization
- Push notifications for critical alerts
- Mobile-optimized UI with touch-friendly interfaces
- Installable app experience

### 7. **Enterprise Features**
- Single Sign-On (SSO) integration
- Advanced analytics dashboard
- Custom branding options
- API marketplace for third-party integrations
- White-label solutions

### 8. **Collaborative Workspace**
- Document sharing and editing
- Real-time commenting and discussions
- Version control for analyses
- Team management with permissions
- Document locking and access controls

### 9. **Advanced AI Features**
- Natural language querying for insights
- Automated report generation
- Predictive timeline analysis
- Ensemble prediction methods
- Custom model training capabilities

## 🛠 Technology Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for fast development and building
- **Tailwind CSS** for responsive design
- **Framer Motion** for smooth animations
- **Lucide React** for consistent iconography
- **React Router** for navigation
- **React Query** for data fetching and caching

### Backend & AI
- **Google Gemini 2.5 Flash API** for AI-powered analysis
- **Supabase** for database and real-time features
- **News API** for real-time news data
- **World Bank API** for economic indicators
- **Custom data aggregation services**

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ and npm
- Supabase account (for full functionality)
- Google Gemini API key
- News API key (optional)

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/your-org/geopolitik.git
cd geopolitik
```

2. **Install dependencies**
```bash
npm install
```

3. **Environment Setup**
Copy `.env.example` to `.env` and configure:
```bash
cp .env.example .env
```

Required environment variables:
```env
# Gemini AI (Required)
VITE_GEMINI_API_KEY=your_gemini_api_key

# Supabase (Required for data persistence)
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# News API (Optional - enables real news data)
VITE_NEWS_API_KEY=your_news_api_key

# Economic Data APIs (Optional)
VITE_WORLD_BANK_API_KEY=your_world_bank_key
VITE_ALPHA_VANTAGE_API_KEY=your_alpha_vantage_key
```

4. **Supabase Setup**
- Create a new Supabase project
- Run the database migrations from `supabase/migrations/`
- Deploy the edge functions in `supabase/functions/`

5. **Start Development Server**
```bash
npm run dev
```

The application will be available at `http://localhost:5173`

### Production Build
```bash
npm run build
npm run preview
```

## 📖 Usage Guide

### For Students
1. **Start Learning**: Navigate to "Game Theory" section
2. **Select Module**: Choose from beginner to advanced topics
3. **Interactive Learning**: Engage with AI-generated tutorials
4. **Track Progress**: Monitor your learning journey and achievements

### For Analysts
1. **Risk Assessment**: Configure regions and factors for analysis
2. **Real-time Monitoring**: Set up crisis monitoring with custom alerts
3. **Scenario Planning**: Run strategic simulations with multiple actors
4. **Economic Modeling**: Analyze comprehensive economic impacts
5. **Export Reports**: Generate comprehensive analysis reports

### For Researchers
1. **Historical Analysis**: Access pattern recognition and trend analysis
2. **Model Validation**: Use backtesting features for model verification
3. **Collaborative Tools**: Share analyses and collaborate on research
4. **API Integration**: Integrate with existing research workflows
5. **Custom Models**: Train specialized AI models on your data

### For Enterprise Users
1. **Team Management**: Set up user roles and permissions
2. **Custom Branding**: Apply your organization's visual identity
3. **SSO Integration**: Connect with your identity provider
4. **API Access**: Integrate with your existing systems
5. **Advanced Analytics**: Track usage and performance metrics

## 🔧 Configuration

### API Keys Setup
- **Gemini API**: Get your key from Google AI Studio
- **News API**: Register at newsapi.org
- **Economic APIs**: Register with World Bank and Alpha Vantage

### Customization
- **Themes**: Modify `tailwind.config.js` for custom styling
- **AI Prompts**: Update prompts in `src/services/geminiService.ts`
- **Data Sources**: Add new data providers in `src/services/dataService.ts`

## 🏗 Architecture

### Component Structure
```
src/
├── components/          # Reusable UI components
│   ├── ui/             # Basic UI elements
│   └── Navigation.tsx  # Main navigation
├── pages/              # Main application pages
├── hooks/              # Custom React hooks for data management
├── services/           # API services and data fetching
├── lib/                # Utility libraries and configurations
└── types/              # TypeScript type definitions
```

### Database Schema
```sql
-- User profiles and authentication
user_profiles (id, role, preferences, created_at, updated_at)

-- Learning progress tracking
learning_progress (id, user_id, module_id, completion_percentage, performance_data)

-- Risk assessments with expiration
risk_assessments (id, region, risk_score, factors, confidence_interval, expires_at)

-- Scenario simulations
scenario_simulations (id, user_id, scenario_config, results, created_at)

-- Crisis events and monitoring
crisis_events (id, title, region, severity, category, description, confidence)

-- Alert configurations
alert_configurations (id, user_id, alert_type, criteria, notification_settings)
```

## 🧪 Testing

### Running Tests
```bash
npm run test          # Run unit tests
npm run test:e2e      # Run end-to-end tests
npm run lint          # Run ESLint
npm run type-check    # Run TypeScript checks
```

## 📊 Performance

### Optimization Features
- **Code Splitting**: Lazy loading for all major components
- **Caching Strategy**: Multi-level caching (browser, React Query, Supabase)
- **AI Response Caching**: Intelligent caching of AI-generated content
- **Image Optimization**: Optimized assets and lazy loading
- **PWA Support**: Service worker for offline capabilities

## 🔒 Security

### Security Features
- **API Key Protection**: Environment-based configuration
- **Rate Limiting**: Built-in API rate limiting
- **Input Validation**: Comprehensive input sanitization
- **CORS Configuration**: Proper cross-origin resource sharing
- **Content Security Policy**: XSS protection

## 🤝 Contributing

### Development Workflow
1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes and add tests
4. Commit your changes: `git commit -m 'Add amazing feature'`
5. Push to the branch: `git push origin feature/amazing-feature`
6. Open a Pull Request

## 📝 API Documentation

### Gemini AI Integration
```typescript
// Generate game theory tutorial
const tutorial = await geminiService.generateGameTheoryTutorial(
  'intermediate',
  'Nash Equilibrium',
  userProgress
);

// Analyze geopolitical risks
const riskAssessment = await geminiService.generateRiskAssessment(
  ['Eastern Europe', 'South China Sea'],
  ['Military Tensions', 'Economic Instability']
);

// Run economic impact analysis
const economicImpact = await geminiService.generateEconomicImpactAnalysis({
  name: 'US-China Trade War',
  type: 'trade_war',
  parameters: {
    affected_countries: ['US', 'China', 'Global'],
    duration_months: 24
  }
});

// Process natural language query
const insights = await geminiService.processNaturalLanguageQuery(
  "What would happen if oil prices doubled?"
);
```

### Data Services
```typescript
// Fetch latest news
const news = await dataService.fetchLatestNews(
  ['Eastern Europe'],
  ['conflict', 'tension']
);

// Get economic indicators
const economics = await dataService.fetchEconomicIndicators(
  ['Ukraine', 'Russia', 'Poland']
);
```

## 📈 Roadmap

### Upcoming Features
- **Expanded Model Training**: More advanced custom model capabilities
- **VR/AR Visualization**: Immersive data visualization experiences
- **Blockchain Integration**: Decentralized prediction markets
- **Quantum Computing**: Advanced simulation capabilities for complex scenarios
- **Regulatory Compliance**: Government and enterprise certifications

---

**Built with ❤️ for the geopolitical analysis community**