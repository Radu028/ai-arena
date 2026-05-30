import type { FunctionReturnType } from 'convex/server'
import type { api } from '@convex/_generated/api'

export type AdminSession = NonNullable<
  FunctionReturnType<typeof api.sessions.getAdminSession>
>

export type AdminPublicSessionView = NonNullable<
  FunctionReturnType<typeof api.sessions.getPublicSessionView>
>
