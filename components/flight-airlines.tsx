"use client"

import type { HistoryEntry } from "@/lib/types"
import { PieChart as PieChartIcon, Plane, TrendingUp } from "lucide-react"
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"

const AIRLINE_COLORS = [
  "#2f6f4f",
  "#3b7f59",
  "#4a9067",
  "#5aa276",
  "#6bb486",
  "#84c59c",
  "#78b98f",
  "#5da67a",
  "#4f9870",
  "#428b66",
  "#377d5a",
  "#2b704f",
]

function truncateLabel(label: string): string {
  return label.length > 22 ? `${label.slice(0, 22)}...` : label
}

function compactAirlineName(name: string): string {
  return name
    .replace(/\s+(airlines?|airways|air\s*lines?)$/i, "")
    .replace(/\s{2,}/g, " ")
    .trim()
}

export default function FlightAirlines({ history }: { history: HistoryEntry[] }) {
  const aggregatedByAirline = new Map<string, number>()

  for (const snapshot of history) {
    for (const airline of snapshot.airlineCounts) {
      aggregatedByAirline.set(
        airline.name,
        (aggregatedByAirline.get(airline.name) || 0) + airline.count,
      )
    }
  }

  const sortedAirlines = Array.from(aggregatedByAirline.entries())
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)

  const colorByAirline = new Map(
    sortedAirlines.map((airline, index) => [airline.name, AIRLINE_COLORS[index % AIRLINE_COLORS.length]]),
  )

  const totalFlights = sortedAirlines.reduce((sum, airline) => sum + airline.count, 0)
  const topAirline = sortedAirlines[0]

  const barData = sortedAirlines.slice(0, 8).map((airline) => ({
    name: airline.name,
    count: airline.count,
  }))
  const maxNameLength = barData.reduce((max, item) => Math.max(max, item.name.length), 0)
  const useCompactXAxisLabels = barData.length >= 5 || maxNameLength > 22
  const formatXAxisLabel = (name: string) => {
    if (!useCompactXAxisLabels) return name
    const compactName = compactAirlineName(name)
    return compactName.length > 22 ? truncateLabel(compactName) : compactName
  }

  const shareData = sortedAirlines.map((airline) => ({
    name: airline.name,
    value: airline.count,
    color: colorByAirline.get(airline.name) || AIRLINE_COLORS[0],
  }))

  return (
    <div className="space-y-3">
      <div className="grid gap-3 xl:grid-cols-[minmax(0,1.45fr)_minmax(0,1fr)]">
        <div className="rounded-2xl border border-border bg-card p-5">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-border bg-muted">
              <Plane className="h-4 w-4 text-primary" />
            </div>
            <div>
              <h3 className="font-display text-lg font-semibold text-foreground">Top airlines</h3>
              <p className="text-xs text-muted-foreground">Combined volume across session snapshots</p>
            </div>
          </div>

          <div className="mt-4 h-[300px]">
            {barData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barData} margin={{ left: 16, right: 16, top: 8, bottom: 8 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis
                    dataKey="name"
                    tickFormatter={(value: string) => formatXAxisLabel(value)}
                    tick={{ fontSize: 11 }}
                    stroke="hsl(var(--muted-foreground))"
                    interval={0}
                    angle={0}
                    textAnchor="middle"
                    height={50}
                    tickMargin={10}
                    minTickGap={0}
                    padding={{ left: 8, right: 8 }}
                  />
                  <YAxis allowDecimals={false} stroke="hsl(var(--muted-foreground))" />
                  <Tooltip
                    cursor={{ fill: "hsl(var(--muted) / 0.45)" }}
                    formatter={(value: number, _name, item) => [`${value} flights`, item.payload.name]}
                    contentStyle={{
                      borderRadius: 12,
                      border: "1px solid hsl(var(--border))",
                      background: "hsl(var(--card))",
                    }}
                    labelStyle={{ color: "hsl(var(--muted-foreground))" }}
                  />
                  <Bar dataKey="count" radius={[8, 8, 0, 0]}>
                    {barData.map((airline) => (
                      <Cell
                        key={`bar-${airline.name}`}
                        fill={colorByAirline.get(airline.name) || AIRLINE_COLORS[0]}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                No airline data yet
              </div>
            )}
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card p-5">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-border bg-muted">
                <PieChartIcon className="h-4 w-4 text-primary" />
              </div>
              <div>
                <h3 className="font-display text-lg font-semibold text-foreground">Airline share</h3>
                <p className="text-xs text-muted-foreground">Share across entire tracked session</p>
              </div>
            </div>
            <span className="rounded-full border border-border bg-background/70 px-3 py-1 text-xs font-medium text-muted-foreground tabular-nums">
              Total flights: {totalFlights}
            </span>
          </div>

          <div className="mt-4 h-[240px]">
            {shareData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Tooltip
                    formatter={(value: number, _name, item) => [`${value} flights`, item.payload.name]}
                    contentStyle={{
                      borderRadius: 12,
                      border: "1px solid hsl(var(--border))",
                      background: "hsl(var(--card))",
                    }}
                    labelStyle={{ color: "hsl(var(--muted-foreground))" }}
                  />
                  <Pie
                    data={shareData}
                    cx="50%"
                    cy="50%"
                    innerRadius={56}
                    outerRadius={88}
                    dataKey="value"
                    nameKey="name"
                    stroke="hsl(var(--card))"
                    strokeWidth={2}
                  >
                    {shareData.map((entry) => (
                      <Cell key={entry.name} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                No share data yet
              </div>
            )}
          </div>

          <div className="mt-2 rounded-xl border border-border bg-background/80 px-3.5 py-3 text-sm">
            {topAirline ? (
              <p className="text-muted-foreground">
                <TrendingUp className="mr-1.5 inline h-4 w-4 text-primary" />
                Top carrier:{" "}
                <span className="font-semibold text-foreground">{topAirline.name}</span> with{" "}
                <span className="font-semibold text-foreground">{topAirline.count}</span> flights (
                {Math.round((topAirline.count / Math.max(totalFlights, 1)) * 100)}%)
              </p>
            ) : (
              <p className="text-muted-foreground">Waiting for session log data to build trends.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
