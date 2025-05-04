import { Card, CardContent } from "@/components/ui/card"
import type { FlightStats } from "@/lib/types"
import { ArrowDown, ArrowUp } from "lucide-react"

export default function FlightHistory({ stats }: { stats: FlightStats }) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="bg-black/50 backdrop-blur-sm border-indigo-900/50 overflow-hidden">
          <CardContent className="p-6 relative">
            <div className="absolute top-0 right-0 w-16 h-16 bg-green-600/10 rounded-bl-full flex items-start justify-end p-2">
              <ArrowDown className="w-6 h-6 text-green-400" />
            </div>
            <h3 className="text-sm font-medium text-gray-400">Arrivals</h3>
            <p className="text-4xl font-bold mt-2 text-white">{stats.arrivals}</p>
          </CardContent>
        </Card>

        <Card className="bg-black/50 backdrop-blur-sm border-indigo-900/50 overflow-hidden">
          <CardContent className="p-6 relative">
            <div className="absolute top-0 right-0 w-16 h-16 bg-blue-600/10 rounded-bl-full flex items-start justify-end p-2">
              <ArrowUp className="w-6 h-6 text-blue-400" />
            </div>
            <h3 className="text-sm font-medium text-gray-400">Departures</h3>
            <p className="text-4xl font-bold mt-2 text-white">{stats.departures}</p>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-black/50 backdrop-blur-sm border-indigo-900/50">
        <CardContent className="p-4">
          <h3 className="font-medium mb-4">Flight History</h3>
          <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2">
            {stats.history.length > 0 ? (
              stats.history.map((entry, index) => {
                const date = new Date(entry.timestamp)
                return (
                  <div
                    key={index}
                    className="flex justify-between items-center p-3 bg-black/70 rounded-md border border-indigo-900/30"
                  >
                    <div>
                      <p className="text-sm text-gray-400">{date.toLocaleTimeString()}</p>
                      <p className="text-xs text-gray-500 mt-1">{entry.airlines.join(", ")}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-indigo-300 font-semibold">{entry.flights}</span>
                      <span className="text-xs text-gray-500">flights</span>
                    </div>
                  </div>
                )
              })
            ) : (
              <div className="text-center text-gray-400 py-4">No history data available yet</div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
