import type { FunctionReturnType } from 'convex/server'
import type { api } from '@convex/_generated/api'

export type AdminCostSummary = FunctionReturnType<
  typeof api.stats.getAdminCostSummary
>
export type AdminUsersResult = FunctionReturnType<typeof api.admins.list>
export type SignedUpUsersResult = FunctionReturnType<
  typeof api.admins.listSignedUpUsers
>
export type AdminSessionsResult = FunctionReturnType<
  typeof api.sessions.listAdminSessions
>
