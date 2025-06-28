import React, { Suspense, useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Navigation } from './components/Navigation';
import { LoadingSpinner } from './components/ui/LoadingSpinner';
import { AuthProvider } from './components/AuthProvider';
import { AuthModal } from './components/AuthModal';
import { ErrorBoundary } from './components/ErrorBoundary';
import { LoadingOverlay } from './components/LoadingOverlay';

// Lazy load components for better performance
const LandingPage = React.lazy(() => import('./pages/LandingPage'));
const Dashboard = React.lazy(() => import('./pages/Dashboard'));
const GameTheoryTutorial = React.lazy(() => import('./pages/GameTheoryTutorial'));
const RiskAssessment = React.lazy(() => import('./pages/RiskAssessment'));
const ScenarioSimulation = React.lazy(() => import('./pages/ScenarioSimulation'));
const CrisisMonitoring = React.lazy(() => import('./pages/CrisisMonitoring'));
const Profile = React.lazy(() => import('./pages/Profile'));
const EconomicModeling = React.lazy(() => import('./pages/EconomicModeling'));
const AdvancedAnalytics = React.lazy(() => import('./pages/AdvancedAnalytics'));
const MobileOptimized = React.lazy(() => import('./pages/MobileOptimized'));
const CollaborativeWorkspace = React.lazy(() => import('./pages/CollaborativeWorkspace'));
const EnterpriseFeatures = React.lazy(() => import('./pages/EnterpriseFeatures'));
const CustomModelTraining = React.lazy(() => import('./pages/CustomModelTraining'));

function App() {
  const [authModalOpen, setAuthModalOpen] = useState(false);
  
  return (
    <ErrorBoundary>
      <AuthProvider>
        <Router>
          <div className="min-h-screen bg-gradient-to-br from-neutral-950 via-neutral-900 to-neutral-950">
            <Navigation onAuthClick={() => setAuthModalOpen(true)} />
            <Suspense fallback={
              <LoadingOverlay fullScreen message="Loading application..." />
            }>
              <Routes>
                <Route path="/" element={<LandingPage />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/tutorials" element={<GameTheoryTutorial />} />
                <Route path="/risk-assessment" element={<RiskAssessment />} />
                <Route path="/simulation" element={<ScenarioSimulation />} />
                <Route path="/crisis-monitoring" element={<CrisisMonitoring />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/economic-modeling" element={<EconomicModeling />} />
                <Route path="/advanced-analytics" element={<AdvancedAnalytics />} />
                <Route path="/mobile" element={<MobileOptimized />} />
                <Route path="/collaborate" element={<CollaborativeWorkspace />} />
                <Route path="/enterprise" element={<EnterpriseFeatures />} />
                <Route path="/custom-models" element={<CustomModelTraining />} />
              </Routes>
            </Suspense>
            
            <AuthModal 
              isOpen={authModalOpen} 
              onClose={() => setAuthModalOpen(false)} 
            />
          </div>
        </Router>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;