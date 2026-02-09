import type { Airline } from "@/lib/types"
import { Plane } from "lucide-react"

const ROW_COLORS = [
  "hover:bg-hover-purple",
  "hover:bg-hover-blue",
  "hover:bg-hover-pink",
  "hover:bg-hover-green",
  "hover:bg-hover-orange",
  "hover:bg-hover-yellow",
]

const BAR_COLORS = [
  "bg-violet-400",
  "bg-blue-400",
  "bg-pink-400",
  "bg-emerald-400",
  "bg-orange-400",
  "bg-amber-400",
]

export default function FlightAirlines({ airlines }: { airlines: Airline[] }) {
  const sortedAirlines = [...airlines].sort((a, b) => b.count - a.count)
  const maxCount = sortedAirlines.length > 0 ? sortedAirlines[0].count : 1

  return (
    <div className="bg-card border border-border rounded-2xl overflow-hidden">
      {sortedAirlines.length > 0 ? (
        sortedAirlines.map((airline, index) => (
          <div
            key={airline.name}
            className={`flex items-center gap-4 px-5 py-3.5 border-b border-border last:border-b-0 ${ROW_COLORS[index % ROW_COLORS.length]} transition-colors`}
          >
            <div className="w-9 h-9 rounded-xl bg-secondary flex items-center justify-center shrink-0">
              <Plane className="w-4 h-4 text-muted-foreground" />
            </div>
            <span className="text-sm font-semibold text-foreground flex-1 min-w-0 truncate">
              {airline.name}
            </span>
            <div className="flex items-center gap-3 shrink-0">
              <div className="w-32 h-2 rounded-full bg-secondary overflow-hidden">
                <div
                  className={`h-full rounded-full ${BAR_COLORS[index % BAR_COLORS.length]} transition-all`}
                  style={{ width: `${(airline.count / maxCount) * 100}%` }}
                />
              </div>
              <span className="text-sm font-bold text-foreground tabular-nums w-6 text-right">
                {airline.count}
              </span>
            </div>
          </div>
        ))
      ) : (
        <div className="px-5 py-14 text-center">
          <div className="w-12 h-12 rounded-2xl bg-hover-purple flex items-center justify-center mx-auto mb-3">
            <Plane className="w-5 h-5 text-violet-500" />
          </div>
          <p className="text-sm text-muted-foreground">No airline data available</p>
        </div>
      )}
    </div>
  )
}
