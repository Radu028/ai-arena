import { mutation } from './_generated/server'
import { v } from 'convex/values'
import {
  getParticipantByToken,
  getRoundByNumber,
  getSessionBySlug,
  now,
} from './lib'

export const castHumanVote = mutation({
  args: {
    slug: v.string(),
    participantToken: v.string(),
    responseId: v.id('roundResponses'),
  },
  handler: async (ctx, args) => {
    const session = await getSessionBySlug(ctx, args.slug)
    if (!session) {
      throw new Error('Session not found.')
    }
    if (session.status !== 'active') {
      throw new Error('Voting is closed for this session.')
    }

    const participant = await getParticipantByToken(
      ctx,
      session._id,
      args.participantToken,
    )
    if (!participant) {
      throw new Error('Join the session before voting.')
    }

    const round = await getRoundByNumber(
      ctx,
      session._id,
      session.currentRoundNumber,
    )
    if (!round || round.status !== 'voting') {
      throw new Error('Voting is not open right now.')
    }

    const response = await ctx.db.get(args.responseId)
    if (!response || response.roundId !== round._id) {
      throw new Error('Response not found in this round.')
    }
    if (response.status !== 'success' || !response.responseText) {
      throw new Error('You can only vote for successful responses.')
    }

    const existing = await ctx.db
      .query('roundVotes')
      .withIndex('by_round_id_and_participant_id', (query) =>
        query.eq('roundId', round._id).eq('participantId', participant._id),
      )
      .unique()
    if (existing) {
      return {
        accepted: false,
        responseId: existing.responseId,
      }
    }

    await ctx.db.insert('roundVotes', {
      roundId: round._id,
      participantId: participant._id,
      responseId: response._id,
      source: 'human',
      createdAt: now(),
    })
    await ctx.db.patch(participant._id, {
      lastSeenAt: now(),
    })

    return {
      accepted: true,
      responseId: response._id,
    }
  },
})
