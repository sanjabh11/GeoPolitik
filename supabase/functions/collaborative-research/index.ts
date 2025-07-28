import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

interface ResearchContribution {
  type: 'dataset' | 'model' | 'analysis' | 'validation' | 'review';
  title: string;
  description: string;
  content: any;
  authorId: string;
  tags: string[];
  references: string[];
  qualityIndicators: {
    novelty: number;
    rigor: number;
    impact: number;
    clarity: number;
  };
}

interface PeerReview {
  contributionId: string;
  reviewerId: string;
  reviewStage: 1 | 2 | 3; // Three-stage review process
  scores: {
    accuracy: number;
    methodology: number;
    significance: number;
    presentation: number;
  };
  comments: {
    strengths: string[];
    weaknesses: string[];
    suggestions: string[];
  };
  recommendation: 'accept' | 'minor_revision' | 'major_revision' | 'reject';
  confidence: number;
}

interface CollaborationRequest {
  initiatorId: string;
  targetUserIds: string[];
  projectType: 'dataset_creation' | 'model_validation' | 'research_paper' | 'benchmark_study';
  title: string;
  description: string;
  timeline: {
    startDate: string;
    milestones: Array<{
      description: string;
      dueDate: string;
      deliverables: string[];
    }>;
    endDate: string;
  };
  resourceRequirements: {
    computeHours: number;
    dataStorage: number;
    funding: number;
  };
}

class CollaborativeResearchService {
  async createContribution(contribution: ResearchContribution): Promise<string> {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    )

    const { data, error } = await supabase
      .from('research_contributions')
      .insert({
        ...contribution,
        status: 'submitted',
        submission_date: new Date().toISOString(),
        review_stage: 1,
        version: 1
      })
      .select()

    if (error) throw error
    return data[0].id
  }

  async submitPeerReview(review: PeerReview): Promise<void> {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    )

    const { error } = await supabase
      .from('peer_reviews')
      .insert({
        ...review,
        submission_date: new Date().toISOString()
      })

    if (error) throw error

    // Update contribution status based on review
    await this.updateContributionStatus(review.contributionId, review)
  }

  async initiateCollaboration(request: CollaborationRequest): Promise<string> {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    )

    const projectId = `collab_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

    const { data, error } = await supabase
      .from('collaboration_projects')
      .insert({
        project_id: projectId,
        ...request,
        status: 'pending',
        created_at: new Date().toISOString()
      })

    if (error) throw error

    // Create collaboration invitations
    for (const userId of request.targetUserIds) {
      await supabase
        .from('collaboration_invitations')
        .insert({
          project_id: projectId,
          user_id: userId,
          status: 'pending',
          invitation_date: new Date().toISOString()
        })
    }

    return projectId
  }

  async getResearchFeed(userId: string): Promise<any[]> {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    )

    // Get contributions for review
    const { data: reviewContributions } = await supabase
      .from('research_contributions')
      .select('*, author:profiles!author_id(*)')
      .neq('author_id', userId)
      .or(`review_stage.eq.1,review_stage.eq.2,review_stage.eq.3`)
      .order('submission_date', { ascending: false })

    // Get collaboration opportunities
    const { data: collaborations } = await supabase
      .from('collaboration_projects')
      .select('*')
      .or(`initiator_id.eq.${userId},target_user_ids.cs.{${userId}}`)
      .order('created_at', { ascending: false })

    // Get peer review requests
    const { data: reviewRequests } = await supabase
      .from('peer_review_assignments')
      .select('*, contribution:research_contributions!contribution_id(*)')
      .eq('reviewer_id', userId)
      .eq('status', 'pending')

    return [
      ...reviewContributions.map(c => ({ type: 'contribution', ...c })),
      ...collaborations.map(c => ({ type: 'collaboration', ...c })),
      ...reviewRequests.map(r => ({ type: 'review', ...r }))
    ].sort((a, b) => new Date(b.created_at || b.submission_date).getTime() - new Date(a.created_at || a.submission_date).getTime())
  }

  private async updateContributionStatus(contributionId: string, review: PeerReview): Promise<void> {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    )

    // Get current contribution
    const { data: contribution } = await supabase
      .from('research_contributions')
      .select('*')
      .eq('id', contributionId)
      .single()

    if (!contribution) return

    let newStatus = contribution.status
    let newReviewStage = contribution.review_stage

    switch (review.recommendation) {
      case 'accept':
        if (review.reviewStage === 3) {
          newStatus = 'accepted'
        } else {
          newReviewStage = review.reviewStage + 1
        }
        break
      case 'minor_revision':
        newStatus = 'minor_revision'
        newReviewStage = 1
        break
      case 'major_revision':
        newStatus = 'major_revision'
        newReviewStage = 1
        break
      case 'reject':
        newStatus = 'rejected'
        break
    }

    await supabase
      .from('research_contributions')
      .update({
        status: newStatus,
        review_stage: newReviewStage,
        last_review_date: new Date().toISOString()
      })
      .eq('id', contributionId)
  }

  async calculateResearcherScore(userId: string): Promise<{
    overall: number;
    contributions: number;
    reviews: number;
    collaborations: number;
    impact: number;
  }> {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    )

    // Count contributions
    const { count: contributions } = await supabase
      .from('research_contributions')
      .select('*', { count: 'exact' })
      .eq('author_id', userId)
      .eq('status', 'accepted')

    // Count reviews
    const { count: reviews } = await supabase
      .from('peer_reviews')
      .select('*', { count: 'exact' })
      .eq('reviewer_id', userId)

    // Count collaborations
    const { count: collaborations } = await supabase
      .from('collaboration_projects')
      .select('*', { count: 'exact' })
      .or(`initiator_id.eq.${userId},target_user_ids.cs.{${userId}}`)

    // Calculate impact score
    const { data: userContributions } = await supabase
      .from('research_contributions')
      .select('quality_indicators')
      .eq('author_id', userId)

    const impact = userContributions?.reduce((sum, c) => {
      const q = c.quality_indicators
      return sum + (q.novelty + q.rigor + q.impact + q.clarity) / 4
    }, 0) / (userContributions?.length || 1)

    return {
      overall: ((contributions || 0) * 0.3 + (reviews || 0) * 0.2 + (collaborations || 0) * 0.2 + impact * 0.3),
      contributions: contributions || 0,
      reviews: reviews || 0,
      collaborations: collaborations || 0,
      impact: impact
    }
  }
}

serve(async (req) => {
  const { action, data } = await req.json()
  const researchService = new CollaborativeResearchService()
  
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_ANON_KEY') ?? ''
  )

  try {
    let response

    switch (action) {
      case 'submit_contribution':
        const contributionId = await researchService.createContribution(data)
        response = { contributionId }
        break

      case 'submit_review':
        await researchService.submitPeerReview(data)
        response = { success: true }
        break

      case 'initiate_collaboration':
        const projectId = await researchService.initiateCollaboration(data)
        response = { projectId }
        break

      case 'get_research_feed':
        const feed = await researchService.getResearchFeed(data.userId)
        response = { feed }
        break

      case 'get_researcher_score':
        const score = await researchService.calculateResearcherScore(data.userId)
        response = { score }
        break

      default:
        throw new Error(`Unknown action: ${action}`)
    }

    return new Response(JSON.stringify(response), {
      headers: { 'Content-Type': 'application/json' }
    })

  } catch (error) {
    console.error('Collaborative research error:', error)
    
    return new Response(JSON.stringify({
      error: 'Collaborative research operation failed',
      message: error.message
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }
})
