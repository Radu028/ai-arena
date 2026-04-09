import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts'
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '#/components/ui/chart'

export function LiveVoteChart({
  responses,
}: {
  responses: Array<{ slot: string; votes: number }>
}) {
  const data = responses.map((response) => ({
    slot: response.slot,
    votes: response.votes,
  }))

  return (
    <ChartContainer
      config={{
        votes: {
          label: 'Votes',
          color: 'var(--arena-cobalt)',
        },
      }}
      className="h-72 w-full"
    >
      <BarChart data={data} margin={{ left: 0, right: 10, top: 10, bottom: 0 }}>
        <CartesianGrid vertical={false} />
        <XAxis dataKey="slot" tickLine={false} axisLine={false} />
        <YAxis allowDecimals={false} tickLine={false} axisLine={false} />
        <ChartTooltip content={<ChartTooltipContent />} />
        <Bar
          dataKey="votes"
          fill="var(--color-votes)"
          radius={[12, 12, 0, 0]}
        />
      </BarChart>
    </ChartContainer>
  )
}
