import type { FlightStats } from "@/lib/types"
import { ArrowDownToLine, ArrowUpFromLine, Clock } from "lucide-react"

export default function FlightHistory({ stats }: { stats: FlightStats }) {
  return (
    <div className="space-y-4">
      {/* Arrivals / Departures */}
      <div className="grid grid-cols-2 gap-3">
        <div className="border border-border rounded-md p-4 hover:bg-secondary/50 transition-colors">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-7 h-7 rounded bg-emerald-50 flex items-center justify-center">
              <ArrowDownToLine className="w-3.5 h-3.5 text-emerald-600" />
            </div>
            <span className="text-xs text-muted-foreground font-medium">Arrivals</span>
          </div>
          <p className="text-2xl font-semibold text-foreground tracking-tight">{stats.arrivals}</p>
        </div>

        <div className="border border-border rounded-md p-4 hover:bg-secondary/50 transition-colors">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-7 h-7 rounded bg-blue-50 flex items-center justify-center">
              <ArrowUpFromLine className="w-3.5 h-3.5 text-blue-600" />
            </div>
            <span className="text-xs text-muted-foreground font-medium">Departures</span>
          </div>
          <p className="text-2xl font-semibold text-foreground tracking-tight">{stats.departures}</p>
        </div>
      </div>

      {/* History Table */}
      <div className="border border-border rounded-md overflow-hidden">
        <div className="px-4 py-3 bg-secondary/50 border-b border-border flex items-center gap-2">
          <Clock className="w-3.5 h-3.5 text-muted-foreground" />
          <h3 className="text-sm font-medium text-foreground">Session History</h3>
        </div>

        {/* Table header */}
        <div className="grid grid-cols-[1fr_1fr_auto] px-4 py-2 border-b border-border text-xs font-medium text-muted-foreground uppercase tracking-wider">
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
                  key={index}
                  className="grid grid-cols-[1fr_1fr_auto] px-4 py-2.5 border-b border-border last:border-b-0 hover:bg-secondary/30 transition-colors"
                >
                  <span className="text-sm text-foreground tabular-nums">
                    {date.toLocaleTimeString()}
                  </span>
                  <span className="text-sm text-muted-foreground truncate pr-4">
                    {entry.airlines.join(", ")}
                  </span>
                  <span className="text-sm font-medium text-foreground tabular-nums text-right">
                    {entry.flights}
                  </span>
                </div>
              )
            })
          ) : (
            <div className="px-4 py-10 text-center text-sm text-muted-foreground">
              No history data available yet
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
