import type { Airline } from "@/lib/types"
import { Plane } from "lucide-react"

export default function FlightAirlines({ airlines }: { airlines: Airline[] }) {
  const sortedAirlines = [...airlines].sort((a, b) => b.count - a.count)
  const maxCount = sortedAirlines.length > 0 ? sortedAirlines[0].count : 1

  return (
    <div className="border border-border rounded-md divide-y divide-border">
      {sortedAirlines.length > 0 ? (
        sortedAirlines.map((airline) => (
          <div
            key={airline.name}
            className="flex items-center gap-4 px-4 py-3 hover:bg-secondary/50 transition-colors"
          >
            <div className="w-7 h-7 rounded bg-secondary flex items-center justify-center shrink-0">
              <Plane className="w-3.5 h-3.5 text-muted-foreground" />
            </div>
            <span className="text-sm font-medium text-foreground flex-1 min-w-0 truncate">
              {airline.name}
            </span>
            <div className="flex items-center gap-3 shrink-0">
              <div className="w-32 h-1.5 rounded-full bg-secondary overflow-hidden">
                <div
                  className="h-full rounded-full bg-foreground/30 transition-all"
                  style={{ width: `${(airline.count / maxCount) * 100}%` }}
                />
              </div>
              <span className="text-sm font-medium text-muted-foreground tabular-nums w-6 text-right">
                {airline.count}
              </span>
            </div>
          </div>
        ))
      ) : (
        <div className="px-4 py-10 text-center text-sm text-muted-foreground">
          No airline data available
        </div>
      )}
    </div>
  )
}
