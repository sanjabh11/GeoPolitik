import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

interface UpdateNotification {
  userId: string;
  type: 'research' | 'collaboration' | 'validation' | 'system';
  title: string;
  message: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  actionRequired: boolean;
  metadata: {
    sourceId?: string;
    url?: string;
    expiresAt?: string;
  };
}

interface UserPreferences {
  userId: string;
  notificationTypes: string[];
  frequency: 'immediate' | 'daily' | 'weekly' | 'monthly';
  channels: {
    email: boolean;
    inApp: boolean;
    push: boolean;
  };
  priorityThreshold: 'low' | 'medium' | 'high' | 'urgent';
  quietHours: {
    start: string;
    end: string;
  };
}

class RealTimeUpdateService {
  async processResearchUpdates(): Promise<UpdateNotification[]> {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    )

    const { data: newPapers } = await supabase
      .from('research_insights')
      .select('*')
      .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
      .order('created_at', { ascending: false })

    return newPapers.map(paper => ({
      userId: 'all_users',
      type: 'research',
      title: `New Research: ${paper.query_topics.join(', ')}`,
      message: `Found ${paper.paper_count} new papers with actionable insights`,
      priority: 'medium',
      actionRequired: false,
      metadata: {
        sourceId: paper.id,
        url: `/research/insights/${paper.id}`,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
      }
    }))
  }

  async processCollaborationUpdates(): Promise<UpdateNotification[]> {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    )

    const { data: newContributions } = await supabase
      .from('research_contributions')
      .select('*')
      .gte('submission_date', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
      .order('submission_date', { ascending: false })

    return newContributions.map(contribution => ({
      userId: 'reviewers',
      type: 'collaboration',
      title: `New Contribution: ${contribution.title}`,
      message: `A new ${contribution.type} contribution requires review`,
      priority: 'high',
      actionRequired: true,
      metadata: {
        sourceId: contribution.id,
        url: `/collaborate/review/${contribution.id}`,
        expiresAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString()
      }
    }))
  }

  async processValidationUpdates(): Promise<UpdateNotification[]> {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    )

    const { data: newBacktests } = await supabase
      .from('backtesting_results')
      .select('*')
      .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
      .order('created_at', { ascending: false })

    return newBacktests.map(result => ({
      userId: 'analysts',
      type: 'validation',
      title: `Backtesting Complete: ${result.model_id}`,
      message: `Model validation results are ready for review`,
      priority: 'medium',
      actionRequired: true,
      metadata: {
        sourceId: result.id,
        url: `/validation/backtest/${result.id}`,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
      }
    }))
  }

  async getUserNotifications(userId: string): Promise<UpdateNotification[]> {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    )

    const { data: preferences } = await supabase
      .from('user_preferences')
      .select('*')
      .eq('user_id', userId)
      .single()

    const { data: notifications } = await supabase
      .from('notifications')
      .select('*')
      .or(`user_id.eq.${userId},user_id.eq.all_users`)
      .order('created_at', { ascending: false })
      .limit(50)

    return this.filterNotificationsByPreferences(notifications, preferences)
  }

  private filterNotificationsByPreferences(
    notifications: any[],
    preferences: UserPreferences
  ): UpdateNotification[] {
    return notifications.filter(notification => {
      // Filter by type
      if (!preferences.notificationTypes.includes(notification.type)) {
        return false
      }

      // Filter by priority
      const priorityOrder = { low: 1, medium: 2, high: 3, urgent: 4 }
      const thresholdOrder = { low: 1, medium: 2, high: 3, urgent: 4 }
      
      if (priorityOrder[notification.priority] < thresholdOrder[preferences.priorityThreshold]) {
        return false
      }

      // Filter by quiet hours
      const now = new Date()
      const quietStart = new Date(now.toDateString() + ' ' + preferences.quietHours.start)
      const quietEnd = new Date(now.toDateString() + ' ' + preferences.quietHours.end)
      
      if (now >= quietStart && now <= quietEnd) {
        return false
      }

      return true
    })
  }

  async updateUserPreferences(userId: string, preferences: UserPreferences): Promise<void> {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    )

    await supabase
      .from('user_preferences')
      .upsert({
        user_id: userId,
        ...preferences,
        updated_at: new Date().toISOString()
      })
  }

  async sendNotification(notification: UpdateNotification): Promise<void> {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    )

    await supabase
      .from('notifications')
      .insert({
        ...notification,
        created_at: new Date().toISOString(),
        read: false
      })

    // Send real-time updates via Supabase Realtime
    await supabase.realtime.send({
      type: 'broadcast',
      event: 'new_notification',
      payload: notification
    })
  }

  async processSystemHealthChecks(): Promise<UpdateNotification[]> {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    )

    const healthChecks = []

    // Check system performance
    const { data: performanceMetrics } = await supabase
      .from('system_metrics')
      .select('*')
      .gte('timestamp', new Date(Date.now() - 5 * 60 * 1000).toISOString())
      .order('timestamp', { ascending: false })
      .limit(1)

    if (performanceMetrics && performanceMetrics.length > 0) {
      const metrics = performanceMetrics[0]
      
      if (metrics.response_time > 5000) {
        healthChecks.push({
          userId: 'admins',
          type: 'system',
          title: 'Performance Alert',
          message: `Response time exceeded 5 seconds: ${metrics.response_time}ms`,
          priority: 'high',
          actionRequired: true,
          metadata: {
            sourceId: 'performance_monitor',
            url: '/admin/performance',
            expiresAt: new Date(Date.now() + 60 * 60 * 1000).toISOString()
          }
        })
      }

      if (metrics.error_rate > 0.05) {
        healthChecks.push({
          userId: 'admins',
          type: 'system',
          title: 'Error Rate Alert',
          message: `Error rate exceeded 5%: ${(metrics.error_rate * 100).toFixed(1)}%`,
          priority: 'urgent',
          actionRequired: true,
          metadata: {
            sourceId: 'error_monitor',
            url: '/admin/errors',
            expiresAt: new Date(Date.now() + 30 * 60 * 1000).toISOString()
          }
        })
      }
    }

    return healthChecks
  }
}

serve(async (req) => {
  const { action, data } = await req.json()
  const updateService = new RealTimeUpdateService()
  
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_ANON_KEY') ?? ''
  )

  try {
    let response

    switch (action) {
      case 'get_notifications':
        const notifications = await updateService.getUserNotifications(data.userId)
        response = { notifications }
        break

      case 'update_preferences':
        await updateService.updateUserPreferences(data.userId, data.preferences)
        response = { success: true }
        break

      case 'send_notification':
        await updateService.sendNotification(data.notification)
        response = { success: true }
        break

      case 'process_updates':
        const researchUpdates = await updateService.processResearchUpdates()
        const collaborationUpdates = await updateService.processCollaborationUpdates()
        const validationUpdates = await updateService.processValidationUpdates()
        const systemUpdates = await updateService.processSystemHealthChecks()
        
        // Send all updates
        const allUpdates = [...researchUpdates, ...collaborationUpdates, ...validationUpdates, ...systemUpdates]
        
        for (const update of allUpdates) {
          await updateService.sendNotification(update)
        }
        
        response = { 
          processed: allUpdates.length,
          research: researchUpdates.length,
          collaboration: collaborationUpdates.length,
          validation: validationUpdates.length,
          system: systemUpdates.length
        }
        break

      default:
        throw new Error(`Unknown action: ${action}`)
    }

    return new Response(JSON.stringify(response), {
      headers: { 'Content-Type': 'application/json' }
    })

  } catch (error) {
    console.error('Real-time updates error:', error)
    
    return new Response(JSON.stringify({
      error: 'Real-time updates operation failed',
      message: error.message
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }
})
