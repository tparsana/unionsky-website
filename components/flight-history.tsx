"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import type { FlightStats } from "@/lib/types"
import {
  ArrowDownToLine,
  ArrowUpFromLine,
  Clock,
  Info,
  LineChart as LineChartIcon,
  TrendingUp,
} from "lucide-react"
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"

export default function FlightHistory({ stats }: { stats: FlightStats }) {
  const historyWindow = stats.history.slice(-24)
  const sessionTotalFlights = stats.history.reduce((sum, entry) => sum + entry.flights, 0)
  const altitudeData = historyWindow.map((entry) => {
    const date = new Date(entry.timestamp)
    return {
      timestamp: date.getTime(),
      flights: entry.flights,
      avgAltitude: Math.round(entry.avgAltitude),
    }
  })
  const intensityData = buildIntensitySeries(historyWindow)
  const [activeIntensityTimestamp, setActiveIntensityTimestamp] = useState<number | null>(null)
  const [showActivityInfo, setShowActivityInfo] = useState(false)
  const activityInfoRef = useRef<HTMLDivElement | null>(null)

  const [firstTimestamp, lastTimestamp] =
    altitudeData.length > 1
      ? [altitudeData[0].timestamp, altitudeData[altitudeData.length - 1].timestamp]
      : [Date.now() - 60_000, Date.now()]
  const timeDomain: [number, number] =
    firstTimestamp === lastTimestamp ? [firstTimestamp - 30_000, lastTimestamp + 30_000] : [firstTimestamp, lastTimestamp]
  const axisTicks = buildAxisTicks(timeDomain[0], timeDomain[1], 7)

  const formatTimeTick = (value: number) =>
    new Date(value).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })
  const formatTooltipTime = (value: number) =>
    new Date(value).toLocaleTimeString([], { hour: "numeric", minute: "2-digit", second: "2-digit" })

  const peakFlights = altitudeData.reduce((max, point) => Math.max(max, point.flights), 0)
  const avgFlights = altitudeData.length
    ? Math.round(altitudeData.reduce((sum, point) => sum + point.flights, 0) / altitudeData.length)
    : 0
  const flightTrend =
    altitudeData.length > 1
      ? altitudeData[altitudeData.length - 1].flights - altitudeData[altitudeData.length - 2].flights
      : 0
  const currentIntensity = intensityData[intensityData.length - 1]?.intensity || 0
  const activityLevel = getActivityLevel(currentIntensity)
  const focusIntensityPoint = useMemo(() => {
    if (intensityData.length === 0) return null
    if (activeIntensityTimestamp === null) return intensityData[intensityData.length - 1]
    return (
      intensityData.find((point) => point.timestamp === activeIntensityTimestamp) ||
      intensityData[intensityData.length - 1]
    )
  }, [activeIntensityTimestamp, intensityData])

  useEffect(() => {
    if (!showActivityInfo) return

    const handlePointerDown = (event: PointerEvent) => {
      if (!activityInfoRef.current) return
      if (!activityInfoRef.current.contains(event.target as Node)) {
        setShowActivityInfo(false)
      }
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setShowActivityInfo(false)
      }
    }

    window.addEventListener("pointerdown", handlePointerDown)
    window.addEventListener("keydown", handleKeyDown)
    return () => {
      window.removeEventListener("pointerdown", handlePointerDown)
      window.removeEventListener("keydown", handleKeyDown)
    }
  }, [showActivityInfo])

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-2xl border border-border bg-card p-5 transition-colors hover:bg-muted/40">
          <div className="mb-3 flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-border bg-muted">
              <ArrowDownToLine className="h-4 w-4 text-primary" />
            </div>
            <span className="text-xs font-medium text-muted-foreground">Arrivals</span>
          </div>
          <p className="font-display text-2xl font-semibold tracking-tight text-foreground tabular-nums">
            {stats.arrivals}
          </p>
        </div>

        <div className="rounded-2xl border border-border bg-card p-5 transition-colors hover:bg-muted/40">
          <div className="mb-3 flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-border bg-muted">
              <ArrowUpFromLine className="h-4 w-4 text-primary" />
            </div>
            <span className="text-xs font-medium text-muted-foreground">Departures</span>
          </div>
          <p className="font-display text-2xl font-semibold tracking-tight text-foreground tabular-nums">
            {stats.departures}
          </p>
        </div>
      </div>

      <div className="grid gap-3 xl:grid-cols-2">
        <div className="rounded-2xl border border-border bg-card p-5">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-border bg-muted">
                <LineChartIcon className="h-4 w-4 text-primary" />
              </div>
              <div>
                <h3 className="font-display text-lg font-semibold text-foreground">Flight activity trend</h3>
                <p className="text-xs text-muted-foreground">
                  Minute-level intensity with takeoff/landing density
                </p>
              </div>
            </div>

            <div ref={activityInfoRef} className="relative flex items-center gap-2">
              <span className="rounded-full border border-border bg-background/70 px-3 py-1 text-xs font-medium text-foreground tabular-nums">
                Activity:{" "}
                <span className={activityLevel.wordTone}>
                  {activityLevel.label}
                </span>
              </span>
              <button
                type="button"
                aria-label="Show activity info"
                onClick={() => setShowActivityInfo((v) => !v)}
                className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-border bg-background/70 text-muted-foreground transition hover:text-foreground"
              >
                <Info className="h-3.5 w-3.5" />
              </button>
              {showActivityInfo && (
                <div className="absolute right-0 top-full z-20 mt-2 w-[320px] max-w-[85vw] rounded-xl border border-border bg-card px-4 py-3 text-sm shadow-lg">
                  {focusIntensityPoint ? (
                    <>
                      <p className="text-muted-foreground">
                        <span className="font-medium text-foreground">
                          {formatTooltipTime(focusIntensityPoint.timestamp)}
                        </span>{" "}
                        · {describeIntensity(focusIntensityPoint)}
                      </p>
                      <p className="mt-1.5 text-xs text-muted-foreground">
                        Solid line = total intensity. Dashed line = estimated takeoff/landing turnover.
                      </p>
                    </>
                  ) : (
                    <p className="text-muted-foreground">
                      Hover or tap the graph to inspect activity at a specific time.
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="mt-4 h-[250px] touch-pan-y">
            {intensityData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={intensityData}
                  margin={{ left: 0, right: 8, top: 8, bottom: 0 }}
                  onMouseMove={(state: any) => {
                    const timestamp = state?.activePayload?.[0]?.payload?.timestamp
                    if (typeof timestamp === "number") {
                      setActiveIntensityTimestamp(timestamp)
                    }
                  }}
                  onClick={(state: any) => {
                    const timestamp = state?.activePayload?.[0]?.payload?.timestamp
                    if (typeof timestamp === "number") {
                      setActiveIntensityTimestamp(timestamp)
                    }
                  }}
                  onMouseDown={(state: any) => {
                    const timestamp = state?.activePayload?.[0]?.payload?.timestamp
                    if (typeof timestamp === "number") {
                      setActiveIntensityTimestamp(timestamp)
                    }
                  }}
                  onMouseLeave={() => setActiveIntensityTimestamp(null)}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis
                    dataKey="timestamp"
                    type="number"
                    scale="time"
                    domain={timeDomain}
                    ticks={axisTicks}
                    tickFormatter={formatTimeTick}
                    tick={{ fontSize: 11 }}
                    stroke="hsl(var(--muted-foreground))"
                    minTickGap={36}
                  />
                  <YAxis stroke="hsl(var(--muted-foreground))" tickFormatter={formatYAxisTick} />
                  <Tooltip
                    labelFormatter={(value: number) => formatTooltipTime(value)}
                    formatter={(value: number, name: string) => {
                      if (name === "Intensity") return [formatYAxisTick(value), "Intensity"]
                      if (name === "Takeoff/Landing density")
                        return [formatYAxisTick(value), "Takeoff/Landing density"]
                      if (name === "Avg flights") return [formatYAxisTick(value), "Avg flights"]
                      return [formatYAxisTick(value), name]
                    }}
                    contentStyle={{
                      borderRadius: 12,
                      border: "1px solid hsl(var(--border))",
                      background: "hsl(var(--card))",
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="intensity"
                    name="Intensity"
                    stroke="#2f6f4f"
                    strokeWidth={2}
                    dot={false}
                  />
                  <Line
                    type="monotone"
                    dataKey="takeoffLandingDensity"
                    name="Takeoff/Landing density"
                    stroke="#6bb486"
                    strokeWidth={2}
                    strokeDasharray="5 4"
                    dot={false}
                  />
                  <Line
                    type="monotone"
                    dataKey="avgFlights"
                    name="Avg flights"
                    stroke="#3b7f59"
                    strokeWidth={1.5}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                No session history yet
              </div>
            )}
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card p-5">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-border bg-muted">
              <TrendingUp className="h-4 w-4 text-primary" />
            </div>
            <div>
              <h3 className="font-display text-lg font-semibold text-foreground">Coverage insights</h3>
              <p className="text-xs text-muted-foreground">Average altitude over time (ft)</p>
            </div>
          </div>

          <div className="mt-4 h-[250px] touch-pan-y">
            {altitudeData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={altitudeData} margin={{ left: 0, right: 8, top: 8, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis
                    dataKey="timestamp"
                    type="number"
                    scale="time"
                    domain={timeDomain}
                    ticks={axisTicks}
                    tickFormatter={formatTimeTick}
                    tick={{ fontSize: 11 }}
                    stroke="hsl(var(--muted-foreground))"
                    minTickGap={36}
                  />
                  <YAxis allowDecimals={false} stroke="hsl(var(--muted-foreground))" />
                  <Tooltip
                    labelFormatter={(value: number) => formatTooltipTime(value)}
                    formatter={(value: number) => [`${value.toLocaleString()} ft`, "Altitude"]}
                    contentStyle={{
                      borderRadius: 12,
                      border: "1px solid hsl(var(--border))",
                      background: "hsl(var(--card))",
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="avgAltitude"
                    name="Altitude"
                    stroke="#2f6f4f"
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                Waiting for more session data
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <InsightCard label="Peak flights" value={peakFlights.toString()} />
        <InsightCard label="Average flights" value={avgFlights.toString()} />
        <InsightCard
          label="Latest trend"
          value={`${flightTrend > 0 ? "+" : ""}${flightTrend}`}
          hint={flightTrend > 0 ? "up from previous snapshot" : "vs previous snapshot"}
        />
      </div>

      <div className="overflow-hidden rounded-2xl border border-border bg-card">
        <div className="flex items-center justify-between gap-3 border-b border-border px-5 py-3.5">
          <div className="flex items-center gap-2.5">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg border border-border bg-muted">
              <Clock className="h-3.5 w-3.5 text-primary" />
            </div>
            <h3 className="font-display text-sm font-semibold text-foreground">Session log</h3>
          </div>
          <span className="rounded-full border border-border bg-background/70 px-3 py-1 text-xs font-medium text-muted-foreground tabular-nums">
            Total flights: {sessionTotalFlights}
          </span>
        </div>

        <div className="grid grid-cols-[1fr_1fr_auto] border-b border-border bg-muted/40 px-5 py-2.5 text-xs font-medium uppercase tracking-wider text-muted-foreground">
          <span>Time</span>
          <span>Airlines</span>
          <span className="text-right">Flights</span>
        </div>

        <div className="max-h-[300px] overflow-y-auto">
          {stats.history.length > 0 ? (
            stats.history.map((entry, index) => {
              const date = new Date(entry.timestamp)
              return (
                <div
                  key={`${entry.timestamp}-${index}`}
                  className="grid grid-cols-[1fr_1fr_auto] border-b border-border px-5 py-3 transition-colors last:border-b-0 hover:bg-muted/40"
                >
                  <span className="text-sm font-medium text-foreground tabular-nums">
                    {date.toLocaleTimeString()}
                  </span>
                  <span className="truncate pr-4 text-sm text-muted-foreground">
                    {entry.airlines.join(", ")}
                  </span>
                  <span className="text-right text-sm font-semibold text-foreground tabular-nums">
                    {entry.flights}
                  </span>
                </div>
              )
            })
          ) : (
            <div className="px-5 py-14 text-center">
              <p className="text-sm text-muted-foreground">No log entries yet</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function buildIntensitySeries(historyWindow: FlightStats["history"]) {
  if (historyWindow.length === 0) return []

  const minuteBuckets = new Map<
    number,
    { flightsSum: number; movementSum: number; samples: number }
  >()

  const sorted = [...historyWindow].sort(
    (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime(),
  )

  for (let i = 0; i < sorted.length; i += 1) {
    const current = sorted[i]
    const previous = i > 0 ? sorted[i - 1] : null
    const timestamp = new Date(current.timestamp).getTime()
    const minuteTimestamp = Math.floor(timestamp / 60_000) * 60_000
    const estimatedMovement = previous ? estimateTakeoffLandingDensity(previous, current) : 0

    const existing = minuteBuckets.get(minuteTimestamp) || {
      flightsSum: 0,
      movementSum: 0,
      samples: 0,
    }
    existing.flightsSum += current.flights
    existing.movementSum += estimatedMovement
    existing.samples += 1
    minuteBuckets.set(minuteTimestamp, existing)
  }

  return Array.from(minuteBuckets.entries())
    .sort(([a], [b]) => a - b)
    .map(([timestamp, bucket]) => {
      const avgFlights = bucket.flightsSum / bucket.samples
      const takeoffLandingDensity = bucket.movementSum / bucket.samples
      const intensity = avgFlights + takeoffLandingDensity

      return {
        timestamp,
        avgFlights: Number(avgFlights.toFixed(2)),
        takeoffLandingDensity: Number(takeoffLandingDensity.toFixed(2)),
        intensity: Number(intensity.toFixed(2)),
      }
    })
}

function estimateTakeoffLandingDensity(
  previous: FlightStats["history"][number],
  current: FlightStats["history"][number],
) {
  const previousCounts = new Map(previous.airlineCounts.map((item) => [item.name, item.count]))
  const currentCounts = new Map(current.airlineCounts.map((item) => [item.name, item.count]))
  const allAirlines = new Set([...previousCounts.keys(), ...currentCounts.keys()])

  let countChangeMagnitude = 0
  for (const airline of allAirlines) {
    const prevCount = previousCounts.get(airline) || 0
    const currCount = currentCounts.get(airline) || 0
    countChangeMagnitude += Math.abs(currCount - prevCount)
  }

  const airlineReplacementEstimate = countChangeMagnitude / 2
  const totalFlightChange = Math.abs(current.flights - previous.flights)

  return Math.max(airlineReplacementEstimate, totalFlightChange)
}

function buildAxisTicks(start: number, end: number, maxTicks: number): number[] {
  if (end <= start) return [start]

  const span = end - start
  const candidates = [
    30_000,
    60_000,
    2 * 60_000,
    5 * 60_000,
    10 * 60_000,
    15 * 60_000,
  ]

  const step =
    candidates.find((candidate) => span / candidate <= Math.max(maxTicks - 1, 1)) ||
    candidates[candidates.length - 1]

  const ticks: number[] = [start]
  let current = Math.ceil(start / step) * step
  while (current < end) {
    ticks.push(current)
    current += step
  }
  ticks.push(end)

  return Array.from(new Set(ticks)).sort((a, b) => a - b)
}

function formatYAxisTick(value: number): string {
  return Number.isInteger(value) ? String(value) : value.toFixed(1)
}

function getActivityLevel(intensity: number): {
  label: "High" | "Medium" | "Low"
  wordTone: string
} {
  if (intensity >= 2.4) {
    return {
      label: "High",
      wordTone: "text-red-600",
    }
  }

  if (intensity >= 1.4) {
    return {
      label: "Medium",
      wordTone: "text-amber-600",
    }
  }

  return {
    label: "Low",
    wordTone: "text-emerald-600",
  }
}

function describeIntensity(point: {
  intensity: number
  takeoffLandingDensity: number
  avgFlights: number
}) {
  const activity = getActivityLevel(point.intensity).label.toLowerCase()
  const movement =
    point.takeoffLandingDensity >= 1.5
      ? "strong turnover"
      : point.takeoffLandingDensity >= 0.75
        ? "moderate turnover"
        : "low turnover"

  return `${activity} activity (${point.intensity.toFixed(1)}), ${movement}, baseline ${point.avgFlights.toFixed(1)} flights/min`
}

function InsightCard({
  label,
  value,
  hint,
}: {
  label: string
  value: string
  hint?: string
}) {
  return (
    <div className="rounded-xl border border-border bg-background/75 px-4 py-3.5">
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="mt-1 font-display text-2xl font-semibold text-foreground tabular-nums">{value}</p>
      {hint ? <p className="mt-1 text-xs text-muted-foreground">{hint}</p> : null}
    </div>
  )
}
