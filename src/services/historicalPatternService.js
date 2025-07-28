/**
 * Simple historical pattern analysis service for deployment testing
 */

class HistoricalPatternService {
  async analyzeHistoricalPatterns(country, timeframe) {
    // Mock data for deployment testing
    return {
      patterns: [
        {
          type: 'trade_conflict',
          frequency: 3,
          severity: 'medium',
          examples: ['US-China trade war', 'Brexit negotiations']
        },
        {
          type: 'diplomatic_crisis',
          frequency: 2,
          severity: 'high',
          examples: ['Ukraine-Russia conflict', 'South China Sea tensions']
        }
      ],
      trends: [
        'increasing bilateral tensions',
        'multilateral trade agreements',
        'regional security alliances'
      ],
      riskScore: 0.65,
      lastUpdated: new Date().toISOString()
    };
  }

  async getHistoricalData(country, startDate, endDate) {
    return {
      country,
      timeframe: `${startDate} to ${endDate}`,
      events: [
        {
          date: '2022-02-24',
          type: 'military_conflict',
          description: 'Russia invades Ukraine',
          impact: 0.85
        },
        {
          date: '2020-01-15',
          type: 'trade_agreement',
          description: 'US-China Phase One trade deal',
          impact: 0.45
        }
      ]
    };
  }
}

module.exports = { HistoricalPatternService };
