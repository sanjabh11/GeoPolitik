# GeoPolitik - Game Theory Geopolitical Prediction Platform

## Overview

GeoPolitik is an advanced AI-powered platform that combines interactive game theory education with real-time geopolitical risk assessment and strategic analysis. Built with cutting-edge technology, it serves students, researchers, policymakers, and analysts who need to understand and forecast international relations through mathematical modeling and AI-driven insights.

![GeoPolitik Platform](https://images.pexels.com/photos/7412095/pexels-photo-7412095.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1)

## 🚀 Key Features

## 📚 Resource Integration Features (RI-1 to RI-8)

The platform now includes full production-grade resource integration for books, videos, analytics, and recommendations:

- **Open-access Game Theory Books**: Search, read, annotate, and bookmark open-access books (Bonanno, Osborne, etc.) via `/api/books/search`. Section and TOC endpoints allow deep linking and progress tracking.
- **Commercial Book Metadata**: Discover commercial/copyrighted books using `/api/catalogue/book/search` (Google Books API integration).
- **Book TOC & Section APIs**: `/api/books/{id}/toc` and `/api/books/{id}/section/{section_id}` provide structured navigation and section serving.
- **PDF/HTML Reader**: Frontend `BookReader` component supports annotation, bookmarks, and real-time progress sync.
- **YouTube Video Integration**: `/api/videos/search` and `/api/videos/playlist/{id}` endpoints provide lecture discovery and playlist embedding (YouTube Data API).
- **Video Player with Progress**: Frontend `VideoPlayer` component tracks video progress, supports chapters and playlists.
- **Resource Recommendations**: `/api/suggested-resources` endpoint delivers AI-powered book/video suggestions.
- **Progress Analytics**: Supabase schema and edge function aggregate reading/viewing analytics, view history, and timestamps.

**Access Guide:**
- **API Endpoints**: See section below or use `/docs` (if enabled) for Swagger/OpenAPI docs.
- **Frontend**: Use "Library" or "Resources" section in the app to:
  - Search and read books (with annotation/bookmarking)
  - Watch and track progress on YouTube lectures/playlists
  - View analytics dashboard for your reading and viewing history

**Environment Variables Required:**
- `GOOGLE_BOOKS_API_KEY`, `YOUTUBE_API_KEY`, `SUPABASE_URL`, `SUPABASE_ANON_KEY`

For more, see [RESOURCE_INTEGRATION_FINAL_REPORT.md](./RESOURCE_INTEGRATION_FINAL_REPORT.md).


### 1. **Enhanced AI-Powered Game Theory Tutorials**
- Interactive learning modules from beginner to advanced levels
- **NEW**: Formal game theory computations using Gambit Python integration
- **NEW**: Nash equilibrium calculators with academic benchmarking
- **NEW**: Cooperative game theory analysis and extensive form games
- Real-time AI-generated content using Google Gemini 2.5 Flash
- Geopolitical examples and scenarios
- Adaptive learning with progress tracking
- **NEW**: Personalized learning paths based on performance analysis

### 2. **Enhanced Real-Time Geopolitical Risk Assessment**
- Live risk scoring (0-100) for global regions
- **NEW**: Multi-agent reinforcement learning (MARL) simulations
- **NEW**: Strategic scenario modeling with AI-powered insights
- Multi-factor analysis (political, economic, military, social)
- **NEW**: Real-time academic research integration from Papers with Code
- AI-powered confidence intervals and scenario analysis
- Historical trend visualization
- **NEW**: Academic benchmarking and validation

### 3. **Advanced Strategic Scenario Simulation**
- **NEW**: Multi-agent reinforcement learning (MARL) with Python microservices
- **NEW**: Game-theoretic modeling with formal Nash equilibrium computation
- **NEW**: Backtesting with academic benchmarking and statistical significance
- **NEW**: Real-time research integration with trend analysis
- AI-powered strategic recommendations and sensitivity analysis
- Monte Carlo simulations with 1,000+ iterations
- **NEW**: Collaborative research tools with peer review system
- Interactive actor configuration

### 4. **Enhanced Crisis Event Monitoring**
- Real-time crisis detection using AI analysis
- **NEW**: Enhanced backtesting with model validation against academic benchmarks
- **NEW**: Research integration with real-time academic paper analysis
- Customizable alert thresholds and notifications
- Multi-source intelligence aggregation
- **NEW**: Collaborative research contributions and peer review
- Escalation probability assessment
- Browser notifications and real-time updates

### 5. **Advanced Economic Modeling**
- GDP impact calculations with confidence intervals
- **NEW**: Enhanced backtesting with academic benchmarking
- **NEW**: Research paper integration for validation
- Trade flow analysis with bilateral and multilateral metrics
- **NEW**: Multi-agent simulations for economic scenarios
- Employment effects modeling by sector
- Welfare impact assessments
- **NEW**: Collaborative research data and validation

### 6. **Enhanced Mobile Application Features**
- Progressive Web App (PWA) capabilities
- **NEW**: Real-time collaborative research tools
- **NEW**: Enhanced backtesting with mobile-friendly interfaces
- Offline data access and synchronization
- **NEW**: Academic research integration on mobile
- Push notifications for critical alerts
- **NEW**: Collaborative research notifications
- Mobile-optimized UI with touch-friendly interfaces
- Installable app experience

### 7. **Advanced AI Features**
- **NEW**: Formal game theory computations using Gambit
- **NEW**: Multi-agent reinforcement learning (MARL) simulations
- **NEW**: Enhanced backtesting with academic benchmarking
- **NEW**: Real-time academic research integration
- **NEW**: Collaborative research tools with peer review
- **NEW**: Research paper analysis and trend detection
- **NEW**: Statistical significance testing for models
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

### Resource Integration Usage

- **Books**: Go to the "Books" section to search, open, and annotate books. Your progress and bookmarks are saved automatically.
- **Videos**: Go to the "Videos" section to search for lectures or explore playlists. Progress is tracked for each video.
- **Analytics**: Access your reading/viewing analytics under "My Analytics". Data is updated in real-time.
- **Recommendations**: Visit "Suggested Resources" for AI-curated book and video suggestions.

**API Access:**
- `/api/books/search?q=...` — Search open-access and commercial books
- `/api/books/{id}/toc` — Table of contents for a book
- `/api/books/{id}/section/{section_id}` — Section content
- `/api/catalogue/book/search?q=...` — Commercial book metadata
- `/api/videos/search?q=...` — Search YouTube lectures
- `/api/videos/playlist/{id}` — Playlist videos
- `/api/suggested-resources` — AI-powered resource recommendations
- `/api/analytics` — User analytics (if enabled)

**Frontend Components:**
- `BookReader` (src/components/BookReader.tsx)
- `VideoPlayer` (src/components/VideoPlayer.tsx)

**Supabase/Edge Functions:**
- See `supabase/migrations/` and `edge-functions/analytics-aggregation/`


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
1. **Advanced Analytics**: Use natural language queries for insights
2. **Ensemble Modeling**: Combine multiple prediction models
3. **Timeline Analysis**: Generate predictive timelines for scenarios
4. **Automated Reports**: Create detailed reports with AI assistance

### For Mobile Users
1. **Install PWA**: Add to home screen for app-like experience
2. **Offline Mode**: Download data for offline access
3. **Push Notifications**: Get alerts for critical events
4. **Mobile UI**: Enjoy touch-optimized interface and gestures

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
The application uses Supabase with the following key tables:
- `user_profiles`: User information and preferences
- `learning_progress`: Game theory tutorial progress tracking
- `risk_assessments`: Geopolitical risk analysis results
- `crisis_events`: Detected crisis events and monitoring
- `scenario_simulations`: Game theory simulation configurations and results
- `economic_models`: Economic impact analysis data

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