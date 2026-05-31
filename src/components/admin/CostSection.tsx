import { SparklesIcon } from 'lucide-react'
import type { AdminCostSummary } from '#/components/admin/AdminDashboardData'
import { KpiStat } from '#/components/admin/KpiStat'
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '#/components/ui/empty'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '#/components/ui/table'
import { formatMicrosUsd } from '@shared/arena'

export function CostSection({
  costs,
}: {
  costs: NonNullable<AdminCostSummary>
}) {
  return (
    <section data-reveal className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow">Cost tracking</p>
          <p className="display mt-2 text-4xl tabular-nums sm:text-5xl">
            {formatMicrosUsd(costs.totals.costMicrosUsd)}
          </p>
          <p className="mt-1.5 text-sm text-muted-foreground">
            Estimated spend across {costs.totals.sessions} session
            {costs.totals.sessions === 1 ? '' : 's'} and {costs.totals.rounds}{' '}
            round{costs.totals.rounds === 1 ? '' : 's'}.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-x-8 gap-y-3 sm:grid-cols-4 sm:divide-x sm:divide-border/50">
          <KpiStat
            label="Sessions"
            value={costs.totals.sessions.toLocaleString()}
          />
          <KpiStat
            label="Rounds"
            value={costs.totals.rounds.toLocaleString()}
          />
          <KpiStat
            label="Tokens in"
            value={costs.totals.tokensIn.toLocaleString()}
          />
          <KpiStat
            label="Tokens out"
            value={costs.totals.tokensOut.toLocaleString()}
          />
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <p className="text-sm font-semibold">Cost by model</p>
          <span className="font-mono text-[0.65rem] uppercase tracking-[0.18em] text-muted-foreground">
            top spend first
          </span>
        </div>
        {costs.byModel.length > 0 ? (
          <div className="overflow-hidden rounded-xl border border-border/40">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Model</TableHead>
                    <TableHead className="text-right">Calls</TableHead>
                    <TableHead className="text-right">Tokens</TableHead>
                    <TableHead className="text-right">Cost</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {costs.byModel.map((row) => (
                    <TableRow key={row.modelKey}>
                      <TableCell>
                        <span className="inline-flex items-center gap-2">
                          <span
                            aria-hidden
                            className="size-2 rounded-full"
                            style={{ backgroundColor: row.accent }}
                          />
                          {row.label}
                        </span>
                      </TableCell>
                      <TableCell className="text-right font-mono tabular-nums">
                        {row.calls}
                        {row.failures > 0 ? (
                          <span className="ml-1 text-[0.7rem] text-muted-foreground">
                            ({row.failures} failed)
                          </span>
                        ) : null}
                      </TableCell>
                      <TableCell className="text-right font-mono text-xs tabular-nums text-muted-foreground">
                        {row.tokensIn.toLocaleString()}
                        <span className="mx-1 opacity-40">/</span>
                        {row.tokensOut.toLocaleString()}
                      </TableCell>
                      <TableCell className="text-right font-mono tabular-nums">
                        {formatMicrosUsd(row.costMicrosUsd)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        ) : (
          <Empty className="rounded-xl border border-dashed border-border/50 py-10">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <SparklesIcon />
              </EmptyMedia>
              <EmptyTitle>No model calls recorded yet</EmptyTitle>
              <EmptyDescription>
                Run a session and provider usage will show up here.
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        )}
      </div>
    </section>
  )
}
