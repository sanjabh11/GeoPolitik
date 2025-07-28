// Client-side historical pattern service
interface HistoricalEvent {
  id: string
  title: string
  description: string
  date: string
  region: string
  conflict_type: string
  severity_score: number
  trigger_event: string
  escalation_level: string
  participants: string[]
  outcome: string
  data_sources: string[]
}

interface HistoricalPattern {
  events: HistoricalEvent[]
  patterns: any
  analysis: any
}

class HistoricalPatternService {
  async getHistoricalPatterns(region?: string, conflictType?: string, timeRange?: string): Promise<HistoricalPattern> {
    // Client-side implementation to avoid Supabase function limit
    const events = this.generateMockHistoricalData(region, conflictType, timeRange)
    
    return {
      events,
      patterns: this.analyzePatterns(events),
      analysis: {
        total_events: events.length,
        unique_regions: [...new Set(events.map(e => e.region))],
        common_triggers: this.analyzeTriggers(events),
        escalation_patterns: this.analyzeEscalations(events),
        data_source: 'client_side'
      }
    }
  }

  private generateMockHistoricalData(region?: string, conflictType?: string, timeRange?: string): HistoricalEvent[] {
    const events: HistoricalEvent[] = [
      {
        id: '1',
        title: 'Cuban Missile Crisis',
        description: '13-day confrontation between US and Soviet Union over Soviet ballistic missiles in Cuba',
        date: '1962-10-14',
        region: 'Caribbean',
        conflict_type: 'nuclear_standoff',
        severity_score: 95,
        trigger_event: 'missile_discovery',
        escalation_level: 'critical',
        participants: ['United States', 'Soviet Union', 'Cuba'],
        outcome: 'peaceful_resolution',
        data_sources: ['historical_records', 'declassified_documents']
      },
      {
        id: '2',
        title: 'Berlin Wall Construction',
        description: 'East Germany begins construction of Berlin Wall dividing East and West Berlin',
        date: '1961-08-13',
        region: 'Europe',
        conflict_type: 'territorial_dispute',
        severity_score: 80,
        trigger_event: 'refugee_crisis',
        escalation_level: 'high',
        participants: ['East Germany', 'West Germany', 'Soviet Union', 'United States'],
        outcome: 'wall_constructed',
        data_sources: ['historical_records', 'news_archives']
      },
      {
        id: '3',
        title: 'Korean War',
        description: 'Conflict between North and South Korea with international involvement',
        date: '1950-06-25',
        region: 'Asia',
        conflict_type: 'civil_war',
        severity_score: 85,
        trigger_event: 'border_incursion',
        escalation_level: 'high',
        participants: ['North Korea', 'South Korea', 'United States', 'China', 'Soviet Union'],
        outcome: 'armistice_signed',
        data_sources: ['historical_records', 'military_archives']
      },
      {
        id: '4',
        title: 'Suez Crisis',
        description: 'International crisis following Egypt\'s nationalization of Suez Canal',
        date: '1956-10-29',
        region: 'Middle East',
        conflict_type: 'territorial_dispute',
        severity_score: 75,
        trigger_event: 'canal_nationalization',
        escalation_level: 'high',
        participants: ['Egypt', 'United Kingdom', 'France', 'Israel'],
        outcome: 'withdrawal_of_forces',
        data_sources: ['historical_records', 'diplomatic_archives']
      },
      {
        id: '5',
        title: 'Vietnam War',
        description: 'Prolonged conflict between North and South Vietnam with US involvement',
        date: '1955-11-01',
        region: 'Asia',
        conflict_type: 'civil_war',
        severity_score: 90,
        trigger_event: 'communist_insurgency',
        escalation_level: 'critical',
        participants: ['North Vietnam', 'South Vietnam', 'United States', 'Soviet Union', 'China'],
        outcome: 'communist_victory',
        data_sources: ['historical_records', 'military_archives']
      }
    ]

    return events.filter(event => {
      if (region && !event.region.toLowerCase().includes(region.toLowerCase())) return false
      if (conflictType && !event.conflict_type.toLowerCase().includes(conflictType.toLowerCase())) return false
      
      if (timeRange) {
        const [startDate, endDate] = timeRange.split(',')
        const eventDate = new Date(event.date)
        if (eventDate < new Date(startDate) || eventDate > new Date(endDate)) return false
      }
      
      return true
    })
  }

  private analyzePatterns(events: HistoricalEvent[]) {
    return {
      triggers: this.analyzeTriggers(events),
      escalations: this.analyzeEscalations(events),
      timeline_analysis: this.generateTimeline(events)
    }
  }

  private analyzeTriggers(events: HistoricalEvent[]) {
    const triggers = events
      .filter(e => e.trigger_event)
      .reduce((acc: any, event) => {
        acc[event.trigger_event] = (acc[event.trigger_event] || 0) + 1
        return acc
      }, {})

    return Object.entries(triggers)
      .sort(([,a], [,b]) => (b as number) - (a as number))
      .slice(0, 5)
  }

  private analyzeEscalations(events: HistoricalEvent[]) {
    return events
      .reduce((acc: any, event) => {
        acc[event.escalation_level] = (acc[event.escalation_level] || 0) + 1
        return acc
      }, {})
  }

  private generateTimeline(events: HistoricalEvent[]) {
    return events
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .map(event => ({
        date: event.date,
        event: event.title,
        type: event.conflict_type,
        severity: event.severity_score,
        region: event.region
      }))
  }
}

export const historicalPatternService = new HistoricalPatternService()
