import { useState } from 'react';
import { geminiService } from '../services/geminiService';
import { dataService } from '../services/dataService';
import { useAuth } from '../components/AuthProvider';
import { useToast } from './useToast';

export interface EconomicScenario {
  id: string;
  name: string;
  description: string;
  type: 'trade_war' | 'sanctions' | 'currency_crisis' | 'supply_shock' | 'policy_change';
  parameters: {
    affected_countries: string[];
    duration_months: number;
    intensity: 'low' | 'medium' | 'high';
    sectors: string[];
  };
}

export interface EconomicImpact {
  gdpImpact: {
    primary: { value: number; confidence: [number, number] };
    secondary: { value: number; confidence: [number, number] };
    total: { value: number; confidence: [number, number] };
  };
  tradeFlows: {
    bilateral: { change: number; volume: number; sectors: string[] };
    multilateral: { change: number; volume: number; affected_countries: number };
  };
  employmentEffects: {
    manufacturing: { jobs: number; percentage: number };
    services: { jobs: number; percentage: number };
    agriculture: { jobs: number; percentage: number };
    net: { jobs: number; percentage: number };
  };
  welfareImpact: {
    consumer: { surplus: number; confidence: [number, number] };
    producer: { surplus: number; confidence: [number, number] };
    government: { revenue: number; expenditure: number };
  };
  fiscalImpact: {
    revenue: { change: number; sources: string[] };
    expenditure: { change: number; categories: string[] };
    deficit: { change: number; sustainability: string };
  };
  timeline: {
    immediate: string;
    short_term: string;
    medium_term: string;
    long_term: string;
  };
}

export function useEconomicModeling() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [economicImpact, setEconomicImpact] = useState<EconomicImpact | null>(null);
  const [analysisHistory, setAnalysisHistory] = useState<Array<{
    id: string;
    scenario: EconomicScenario;
    impact: EconomicImpact;
    timestamp: string;
  }>>([]);
  
  const { user } = useAuth();
  const { showToast } = useToast();

  const generateEconomicAnalysis = async (scenario: EconomicScenario): Promise<EconomicImpact> => {
    setLoading(true);
    setError(null);

    try {
      // Generate AI-powered economic analysis
      const impact = await geminiService.generateEconomicImpactAnalysis(scenario);
      
      // Save to database if user is logged in
      if (user) {
        try {
          await dataService.saveEconomicModel(scenario.id, {
            scenario_id: scenario.id,
            model_type: 'economic_impact',
            parameters: scenario,
            results: impact
          });
        } catch (err) {
          console.error('Failed to save economic model:', err);
          // Continue even if save fails
        }
      }
      
      // Update state
      setEconomicImpact(impact);
      
      // Add to history
      const historyEntry = {
        id: Date.now().toString(),
        scenario,
        impact,
        timestamp: new Date().toISOString()
      };
      
      setAnalysisHistory(prev => [historyEntry, ...prev.slice(0, 9)]);
      
      // Save to localStorage as backup
      try {
        const savedHistory = localStorage.getItem('economicAnalysisHistory');
        const parsedHistory = savedHistory ? JSON.parse(savedHistory) : [];
        localStorage.setItem('economicAnalysisHistory', JSON.stringify([historyEntry, ...parsedHistory.slice(0, 9)]));
      } catch (err) {
        console.error('Failed to save to localStorage:', err);
      }
      
      showToast('success', 'Analysis Complete', 'Economic impact assessment generated');
      
      return impact;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Economic analysis failed';
      setError(errorMessage);
      showToast('error', 'Analysis Failed', errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const loadAnalysisHistory = async () => {
    try {
      if (user) {
        // In a real implementation, this would fetch from Supabase
        // For now, we'll use localStorage
        const savedHistory = localStorage.getItem('economicAnalysisHistory');
        if (savedHistory) {
          setAnalysisHistory(JSON.parse(savedHistory));
        }
      } else {
        // Load from localStorage as fallback
        const savedHistory = localStorage.getItem('economicAnalysisHistory');
        if (savedHistory) {
          setAnalysisHistory(JSON.parse(savedHistory));
        }
      }
    } catch (err) {
      console.error('Failed to load analysis history:', err);
    }
  };

  const clearHistory = () => {
    setAnalysisHistory([]);
    localStorage.removeItem('economicAnalysisHistory');
    showToast('info', 'History Cleared', 'Analysis history has been cleared');
  };

  return {
    loading,
    error,
    economicImpact,
    analysisHistory,
    generateEconomicAnalysis,
    loadAnalysisHistory,
    clearHistory
  };
}