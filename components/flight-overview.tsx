import type { FlightStats } from "@/lib/types"
import { Plane, ArrowUp, Gauge, Globe } from "lucide-react"

const statCards = [
  { key: "totalFlights", label: "Sightings", icon: Plane },
  { key: "avgAltitude", label: "Typical Altitude", icon: ArrowUp, format: (v: number) => `${Math.round(v).toLocaleString()} ft` },
  { key: "avgSpeed", label: "Typical Speed", icon: Gauge, format: (v: number) => `${Math.round(v)} km/h` },
  { key: "countries", label: "Origins", icon: Globe },
] as const

export default function FlightOverview({ stats }: { stats: FlightStats }) {
  const values: Record<string, number> = {
    totalFlights: stats.totalFlights,
    avgAltitude: stats.avgAltitude,
    avgSpeed: stats.avgSpeed,
    countries: stats.countries,
  }

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {statCards.map(({ key, label, icon: Icon, ...rest }) => {
        const format = "format" in rest ? rest.format : (v: number) => String(v)
        return (
          <div
            key={key}
            className="min-h-[152px] rounded-2xl border border-border bg-card p-5 transition-colors hover:bg-muted/40"
          >
            <div className="mb-3 flex items-start gap-2.5">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-border bg-muted">
                <Icon className="h-4 w-4 text-primary" />
              </div>
              <span className="pt-1 text-xs font-medium leading-snug text-muted-foreground">
                {label}
              </span>
            </div>
            <p className="font-display text-[2rem] font-semibold leading-tight tracking-tight text-foreground tabular-nums">
              {format(values[key])}
            </p>
          </div>
        )
      })}
    </div>
  )
}
