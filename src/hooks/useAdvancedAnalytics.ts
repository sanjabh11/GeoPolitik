import { useState } from 'react';
import { geminiService } from '../services/geminiService';
import { dataService } from '../services/dataService';
import { useAuth } from '../components/AuthProvider';
import { useToast } from './useToast';

export interface NLQuery {
  id: string;
  query: string;
  timestamp: string;
  response: any;
}

export interface Report {
  id: string;
  title: string;
  type: 'risk_assessment' | 'economic_analysis' | 'crisis_report' | 'strategic_overview';
  generated_at: string;
  sections: Array<{
    title: string;
    content: string;
  }>;
}

export interface TimelinePrediction {
  timeline: Array<{
    date: string;
    event: string;
    probability: number;
    confidence: number;
  }>;
  critical_points: string[];
  risk_factors: string[];
}

export function useAdvancedAnalytics() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [queryHistory, setQueryHistory] = useState<NLQuery[]>([]);
  const [reports, setReports] = useState<Report[]>([]);
  const [timelinePrediction, setTimelinePrediction] = useState<TimelinePrediction | null>(null);
  const [currentResponse, setCurrentResponse] = useState<any>(null);
  
  const { user } = useAuth();
  const { showToast } = useToast();

  const processNaturalLanguageQuery = async (query: string): Promise<any> => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await geminiService.processNaturalLanguageQuery(query);
      
      const newQuery: NLQuery = {
        id: Date.now().toString(),
        query,
        timestamp: new Date().toISOString(),
        response
      };
      
      setQueryHistory(prev => [newQuery, ...prev.slice(0, 9)]);
      setCurrentResponse(response);
      
      // Save to localStorage
      try {
        const savedHistory = localStorage.getItem('nlQueryHistory');
        const parsedHistory = savedHistory ? JSON.parse(savedHistory) : [];
        localStorage.setItem('nlQueryHistory', JSON.stringify([newQuery, ...parsedHistory.slice(0, 9)]));
      } catch (err) {
        console.error('Failed to save to localStorage:', err);
      }
      
      // Save to database if user is logged in
      if (user) {
        try {
          // In a real implementation, this would save to Supabase
          console.log('Would save query to database for user:', user.id);
        } catch (err) {
          console.error('Failed to save query to database:', err);
        }
      }
      
      showToast('success', 'Query Processed', 'Natural language analysis complete');
      
      return response;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Query processing failed';
      setError(errorMessage);
      showToast('error', 'Query Failed', errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const generateAutomatedReport = async (type: string, data: any, timeframe: string): Promise<Report> => {
    setLoading(true);
    setError(null);
    
    try {
      const reportData = await geminiService.generateAutomatedReport(type, data, timeframe);
      
      const newReport: Report = {
        id: Date.now().toString(),
        title: reportData.title || `${type} Report - ${timeframe}`,
        type: type as any,
        generated_at: new Date().toISOString(),
        sections: reportData.sections || [
          { title: 'Executive Summary', content: reportData.executive_summary || 'Comprehensive analysis summary' },
          { title: 'Key Findings', content: 'Analysis of primary trends and developments' },
          { title: 'Recommendations', content: 'Strategic recommendations based on analysis' }
        ]
      };
      
      setReports(prev => [newReport, ...prev.slice(0, 9)]);
      
      // Save to localStorage
      try {
        const savedReports = localStorage.getItem('generatedReports');
        const parsedReports = savedReports ? JSON.parse(savedReports) : [];
        localStorage.setItem('generatedReports', JSON.stringify([newReport, ...parsedReports.slice(0, 9)]));
      } catch (err) {
        console.error('Failed to save to localStorage:', err);
      }
      
      showToast('success', 'Report Generated', `${type} report created successfully`);
      
      return newReport;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Report generation failed';
      setError(errorMessage);
      showToast('error', 'Report Failed', errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const generatePredictiveTimeline = async (scenario: any, timeHorizon: string): Promise<TimelinePrediction> => {
    setLoading(true);
    setError(null);
    
    try {
      const timeline = await geminiService.generatePredictiveTimeline(scenario, timeHorizon);
      setTimelinePrediction(timeline);
      
      showToast('success', 'Timeline Generated', 'Predictive timeline analysis complete');
      
      return timeline;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Timeline generation failed';
      setError(errorMessage);
      showToast('error', 'Timeline Failed', errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const generateEnsemblePrediction = async (models: string[], data: any): Promise<any> => {
    setLoading(true);
    setError(null);
    
    try {
      const ensemble = await geminiService.generateEnsemblePrediction(models, data);
      
      setCurrentResponse({
        type: 'ensemble_prediction',
        data: ensemble
      });
      
      showToast('success', 'Ensemble Analysis Complete', 'Multi-model prediction generated');
      
      return ensemble;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Ensemble analysis failed';
      setError(errorMessage);
      showToast('error', 'Analysis Failed', errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const loadQueryHistory = () => {
    try {
      const savedHistory = localStorage.getItem('nlQueryHistory');
      if (savedHistory) {
        setQueryHistory(JSON.parse(savedHistory));
      }
    } catch (err) {
      console.error('Failed to load query history:', err);
    }
  };

  const loadReports = () => {
    try {
      const savedReports = localStorage.getItem('generatedReports');
      if (savedReports) {
        setReports(JSON.parse(savedReports));
      }
    } catch (err) {
      console.error('Failed to load reports:', err);
    }
  };

  return {
    loading,
    error,
    queryHistory,
    reports,
    timelinePrediction,
    currentResponse,
    processNaturalLanguageQuery,
    generateAutomatedReport,
    generatePredictiveTimeline,
    generateEnsemblePrediction,
    loadQueryHistory,
    loadReports,
    setCurrentResponse
  };
}