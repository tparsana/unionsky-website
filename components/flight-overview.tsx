import type { FlightStats } from "@/lib/types"
import { Plane, ArrowUp, Gauge, Globe } from "lucide-react"

const statCards = [
  { key: "totalFlights", label: "Total Flights", icon: Plane, format: (v: number) => String(v) },
  { key: "avgAltitude", label: "Avg. Altitude", icon: ArrowUp, format: (v: number) => `${Math.round(v).toLocaleString()} ft` },
  { key: "avgSpeed", label: "Avg. Speed", icon: Gauge, format: (v: number) => `${Math.round(v)} km/h` },
  { key: "countries", label: "Countries", icon: Globe, format: (v: number) => String(v) },
] as const

export default function FlightOverview({ stats }: { stats: FlightStats }) {
  const values: Record<string, number> = {
    totalFlights: stats.totalFlights,
    avgAltitude: stats.avgAltitude,
    avgSpeed: stats.avgSpeed,
    countries: stats.countries,
  }

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {statCards.map(({ key, label, icon: Icon, format }) => (
        <div
          key={key}
          className="border border-border rounded-md p-4 hover:bg-secondary/50 transition-colors"
        >
          <div className="flex items-center gap-2 mb-3">
            <div className="w-7 h-7 rounded bg-secondary flex items-center justify-center">
              <Icon className="w-3.5 h-3.5 text-muted-foreground" />
            </div>
            <span className="text-xs text-muted-foreground font-medium">{label}</span>
          </div>
          <p className="text-2xl font-semibold text-foreground tracking-tight">
            {format(values[key])}
          </p>
        </div>
      ))}
    </div>
  )
}
