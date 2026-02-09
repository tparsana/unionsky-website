import type { FlightStats } from "@/lib/types"
import { ArrowDownToLine, ArrowUpFromLine, Clock } from "lucide-react"

export default function FlightHistory({ stats }: { stats: FlightStats }) {
  return (
    <div className="flex flex-col gap-4">
      {/* Arrivals / Departures */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-card border border-border rounded-2xl p-5 hover-lift hover:bg-hover-green transition-colors group">
          <div className="flex items-center gap-2.5 mb-3">
            <div className="w-9 h-9 rounded-xl bg-hover-green flex items-center justify-center transition-transform group-hover:scale-110">
              <ArrowDownToLine className="w-4 h-4 text-emerald-600" />
            </div>
            <span className="text-xs text-muted-foreground font-medium">Arrivals</span>
          </div>
          <p className="text-2xl font-bold text-foreground tracking-tight tabular-nums">{stats.arrivals}</p>
        </div>

        <div className="bg-card border border-border rounded-2xl p-5 hover-lift hover:bg-hover-blue transition-colors group">
          <div className="flex items-center gap-2.5 mb-3">
            <div className="w-9 h-9 rounded-xl bg-hover-blue flex items-center justify-center transition-transform group-hover:scale-110">
              <ArrowUpFromLine className="w-4 h-4 text-blue-600" />
            </div>
            <span className="text-xs text-muted-foreground font-medium">Departures</span>
          </div>
          <p className="text-2xl font-bold text-foreground tracking-tight tabular-nums">{stats.departures}</p>
        </div>
      </div>

      {/* History Table */}
      <div className="bg-card border border-border rounded-2xl overflow-hidden">
        <div className="px-5 py-3.5 border-b border-border flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-hover-purple flex items-center justify-center">
            <Clock className="w-3.5 h-3.5 text-violet-600" />
          </div>
          <h3 className="text-sm font-semibold text-foreground">Session History</h3>
        </div>

        {/* Table header */}
        <div className="grid grid-cols-[1fr_1fr_auto] px-5 py-2.5 border-b border-border text-xs font-medium text-muted-foreground uppercase tracking-wider bg-secondary/30">
          <span>Time</span>
          <span>Airlines</span>
          <span className="text-right">Flights</span>
        </div>

        <div className="max-h-[300px] overflow-y-auto">
          {stats.history.length > 0 ? (
            stats.history.map((entry, index) => {
              const date = new Date(entry.timestamp)
              const hoverColors = ["hover:bg-hover-blue", "hover:bg-hover-purple", "hover:bg-hover-pink", "hover:bg-hover-green", "hover:bg-hover-orange", "hover:bg-hover-yellow"]
              return (
                <div
                  key={index}
                  className={`grid grid-cols-[1fr_1fr_auto] px-5 py-3 border-b border-border last:border-b-0 ${hoverColors[index % hoverColors.length]} transition-colors`}
                >
                  <span className="text-sm text-foreground tabular-nums font-medium">
                    {date.toLocaleTimeString()}
                  </span>
                  <span className="text-sm text-muted-foreground truncate pr-4">
                    {entry.airlines.join(", ")}
                  </span>
                  <span className="text-sm font-bold text-foreground tabular-nums text-right">
                    {entry.flights}
                  </span>
                </div>
              )
            })
          ) : (
            <div className="px-5 py-14 text-center">
              <p className="text-sm text-muted-foreground">No history data available yet</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
