import { defineSchema, defineTable } from 'convex/server'
import { v } from 'convex/values'
import {
  artifactStatusValidator,
  artifactTypeValidator,
  nullableNumberValidator,
  nullableStringValidator,
  participantKindValidator,
  responseStatusValidator,
  roundResultStatusValidator,
  roundStatusValidator,
  sessionModelSnapshotValidator,
  sessionStatusValidator,
  sessionThemeValidator,
} from './validators'

export default defineSchema({
  sessions: defineTable({
    slug: v.string(),
    joinCode: v.string(),
    title: v.string(),
    theme: sessionThemeValidator,
    status: sessionStatusValidator,
    createdByIdentity: nullableStringValidator,
    createdByName: nullableStringValidator,
    roundCount: v.number(),
    currentRoundNumber: v.number(),
    maxParticipants: v.number(),
    votingWindowSeconds: v.number(),
    selectedModelKeys: v.array(v.string()),
    selectedModelsSnapshot: v.array(sessionModelSnapshotValidator),
    startedAt: nullableNumberValidator,
    stoppedAt: nullableNumberValidator,
    endedAt: nullableNumberValidator,
    createdAt: v.number(),
  })
    .index('by_slug', ['slug'])
    .index('by_join_code', ['joinCode'])
    .index('by_created_by_identity_and_created_at', [
      'createdByIdentity',
      'createdAt',
    ]),

  sessionParticipants: defineTable({
    sessionId: v.id('sessions'),
    kind: participantKindValidator,
    displayName: v.string(),
    email: nullableStringValidator,
    clerkTokenIdentifier: nullableStringValidator,
    accessTokenHash: v.string(),
    joinedAt: v.number(),
    lastSeenAt: v.number(),
  })
    .index('by_session_id', ['sessionId'])
    .index('by_session_id_and_access_token_hash', [
      'sessionId',
      'accessTokenHash',
    ])
    .index('by_session_id_and_clerk_token_identifier', [
      'sessionId',
      'clerkTokenIdentifier',
    ]),

  rounds: defineTable({
    sessionId: v.id('sessions'),
    roundNumber: v.number(),
    status: roundStatusValidator,
    topic: nullableStringValidator,
    topicSubmittedByParticipantId: v.union(
      v.id('sessionParticipants'),
      v.null(),
    ),
    topicLockedAt: nullableNumberValidator,
    generatingStartedAt: nullableNumberValidator,
    votingStartedAt: nullableNumberValidator,
    votingEndsAt: nullableNumberValidator,
    closedAt: nullableNumberValidator,
    revealAt: nullableNumberValidator,
    resultStatus: roundResultStatusValidator,
    winnerResponseIds: v.array(v.id('roundResponses')),
  }).index('by_session_id_and_round_number', ['sessionId', 'roundNumber']),

  roundResponses: defineTable({
    sessionId: v.id('sessions'),
    roundId: v.id('rounds'),
    providerKey: v.string(),
    modelKey: v.string(),
    modelId: v.string(),
    modelLabel: v.string(),
    anonymizedSlot: v.string(),
    promptVersion: v.string(),
    responseText: nullableStringValidator,
    status: responseStatusValidator,
    latencyMs: nullableNumberValidator,
    tokenUsageInput: nullableNumberValidator,
    tokenUsageOutput: nullableNumberValidator,
    costMicrosUsd: nullableNumberValidator,
    errorCode: nullableStringValidator,
    errorMessage: nullableStringValidator,
    createdAt: v.number(),
    completedAt: nullableNumberValidator,
  })
    .index('by_round_id_and_model_key', ['roundId', 'modelKey'])
    .index('by_round_id_and_anonymized_slot', ['roundId', 'anonymizedSlot']),

  roundVotes: defineTable({
    roundId: v.id('rounds'),
    participantId: v.id('sessionParticipants'),
    responseId: v.id('roundResponses'),
    source: v.literal('human'),
    createdAt: v.number(),
  })
    .index('by_round_id_and_participant_id', ['roundId', 'participantId'])
    .index('by_round_id_and_response_id', ['roundId', 'responseId']),

  roundAiVotes: defineTable({
    roundId: v.id('rounds'),
    voterModelKey: v.string(),
    responseId: v.id('roundResponses'),
    rationale: nullableStringValidator,
    source: v.literal('ai'),
    createdAt: v.number(),
  })
    .index('by_round_id_and_voter_model_key', ['roundId', 'voterModelKey'])
    .index('by_round_id_and_response_id', ['roundId', 'responseId']),

  roundArtifacts: defineTable({
    sessionId: v.id('sessions'),
    roundId: v.id('rounds'),
    type: artifactTypeValidator,
    status: artifactStatusValidator,
    content: v.string(),
    modelId: nullableStringValidator,
    failureReason: nullableStringValidator,
    createdAt: v.number(),
  })
    .index('by_round_id_and_type', ['roundId', 'type'])
    .index('by_session_id_and_created_at', ['sessionId', 'createdAt']),

  sessionEvents: defineTable({
    sessionId: v.id('sessions'),
    roundId: v.union(v.id('rounds'), v.null()),
    type: v.string(),
    title: v.string(),
    description: v.string(),
    meta: v.record(v.string(), v.string()),
    createdAt: v.number(),
  }).index('by_session_id_and_created_at', ['sessionId', 'createdAt']),
})
