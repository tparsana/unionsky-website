import type { FlightStats } from "@/lib/types"
import { Plane, ArrowUp, Gauge, Globe } from "lucide-react"

const statCards = [
  { key: "totalFlights", label: "Total Flights", icon: Plane, color: "bg-hover-purple", iconColor: "text-violet-600" },
  { key: "avgAltitude", label: "Avg. Altitude", icon: ArrowUp, color: "bg-hover-blue", iconColor: "text-blue-600", format: (v: number) => `${Math.round(v).toLocaleString()} ft` },
  { key: "avgSpeed", label: "Avg. Speed", icon: Gauge, color: "bg-hover-green", iconColor: "text-emerald-600", format: (v: number) => `${Math.round(v)} km/h` },
  { key: "countries", label: "Countries", icon: Globe, color: "bg-hover-orange", iconColor: "text-orange-600" },
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
      {statCards.map(({ key, label, icon: Icon, color, iconColor, ...rest }) => {
        const format = "format" in rest ? rest.format : (v: number) => String(v)
        return (
          <div
            key={key}
            className={`bg-card border border-border rounded-2xl p-5 hover-lift hover:${color} transition-colors group`}
          >
            <div className="flex items-center gap-2.5 mb-3">
              <div className={`w-9 h-9 rounded-xl ${color} flex items-center justify-center transition-transform group-hover:scale-110`}>
                <Icon className={`w-4 h-4 ${iconColor}`} />
              </div>
              <span className="text-xs text-muted-foreground font-medium">{label}</span>
            </div>
            <p className="text-2xl font-bold text-foreground tracking-tight tabular-nums">
              {format(values[key])}
            </p>
          </div>
        )
      })}
    </div>
  )
}
