import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { ProgressBar } from '../components/ui/ProgressBar';
import { useRiskAssessment } from '../hooks/useRiskAssessment';

interface RiskDashboardProps {
  regions?: string[];
  factors?: string[];
}

export function RiskDashboard({ regions = ['global'], factors = ['political', 'economic'] }: RiskDashboardProps) {
  const { getRiskAssessment, loading, error } = useRiskAssessment();
  const [assessments, setAssessments] = useState<any[]>([]);
  const [selectedRegion, setSelectedRegion] = useState<string>('global');
  const [selectedFactors, setSelectedFactors] = useState<string[]>(factors);

  useEffect(() => {
    loadRiskAssessment();
    
    // Auto-refresh every 30 seconds
    const interval = setInterval(() => {
      loadRiskAssessment();
    }, 30000);
    
    return () => clearInterval(interval);
  }, [selectedRegion, selectedFactors]);

  const loadRiskAssessment = async () => {
    const data = await getRiskAssessment([selectedRegion], selectedFactors);
    setAssessments(data?.assessments || []);
  };

  const getRiskColor = (score: number) => {
    if (score >= 80) return 'text-red-400';
    if (score >= 60) return 'text-orange-400';
    if (score >= 40) return 'text-yellow-400';
    return 'text-green-400';
  };

  const getRiskBg = (score: number) => {
    if (score >= 80) return 'bg-red-900/20 border-red-600';
    if (score >= 60) return 'bg-orange-900/20 border-orange-600';
    if (score >= 40) return 'bg-yellow-900/20 border-yellow-600';
    return 'bg-green-900/20 border-green-600';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="p-6 max-w-md">
          <h2 className="text-xl font-bold text-red-400 mb-4">Error Loading Risk Assessment</h2>
          <p className="text-neutral-400">{error}</p>
          <Button onClick={loadRiskAssessment} className="mt-4">
            Retry
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-900 text-white p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Real-Time Geopolitical Risk Assessment</h1>
          <p className="text-neutral-400">Live risk scores and analysis for global regions</p>
        </div>

        {/* Controls */}
        <Card className="p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium mb-2">Region</label>
              <select
                value={selectedRegion}
                onChange={(e) => setSelectedRegion(e.target.value)}
                className="w-full px-3 py-2 bg-neutral-800 border border-neutral-600 rounded-lg focus:ring-2 focus:ring-primary-500"
              >
                <option value="global">Global</option>
                <option value="europe">Europe</option>
                <option value="asia">Asia</option>
                <option value="middle-east">Middle East</option>
                <option value="africa">Africa</option>
                <option value="americas">Americas</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Factors</label>
              <div className="space-y-2">
                {['political', 'economic', 'security', 'social'].map(factor => (
                  <label key={factor} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={selectedFactors.includes(factor)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedFactors([...selectedFactors, factor]);
                        } else {
                          setSelectedFactors(selectedFactors.filter(f => f !== factor));
                        }
                      }}
                      className="mr-2"
                    />
                    <span className="capitalize">{factor}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </Card>

        {/* Risk Assessments */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Regional Risk Analysis</h2>
          <Button onClick={loadRiskAssessment} className="text-sm">
            Refresh Now
          </Button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {(assessments || []).map((assessment, index) => (
            <motion.div
              key={assessment.region}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className={`p-6 ${getRiskBg(assessment.riskScore)}`}>
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-lg font-semibold capitalize">{assessment.region}</h3>
                  <div className={`text-2xl font-bold ${getRiskColor(assessment.riskScore)}`}>
                    {assessment.riskScore}
                  </div>
                </div>

                <div className="mb-4">
                  <ProgressBar progress={assessment.riskScore} showLabel={false} />
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-neutral-400">Confidence:</span>
                    <span className="text-neutral-300">
                      {assessment.confidenceInterval?.[0]}-{assessment.confidenceInterval?.[1]}%
                    </span>
                  </div>

                  <div className="space-y-1">
                    <span className="text-neutral-400">Primary Drivers:</span>
                    {assessment.primaryDrivers?.map((driver: any, idx: number) => (
                      <div key={idx} className="flex justify-between text-xs">
                        <span className="text-neutral-300">{driver.factor}</span>
                        <span className="text-primary-400">{driver.weight}x</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-4 space-y-2">
                  <div className="text-xs">
                    <span className="text-green-400">Best Case:</span>
                    <span className="text-neutral-300 ml-2">{assessment.scenarios?.best?.description}</span>
                  </div>
                  <div className="text-xs">
                    <span className="text-red-400">Worst Case:</span>
                    <span className="text-neutral-300 ml-2">{assessment.scenarios?.worst?.description}</span>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Refresh Button */}
        <div className="mt-8 text-center">
          <Button onClick={loadRiskAssessment} disabled={loading}>
            {loading ? 'Refreshing...' : 'Refresh Assessments'}
          </Button>
        </div>
      </div>
    </div>
  );
}
