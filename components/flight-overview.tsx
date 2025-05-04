import { Card, CardContent } from "@/components/ui/card"
import type { FlightStats } from "@/lib/types"
import { Plane, ArrowUp, Gauge, Globe } from "lucide-react"

export default function FlightOverview({ stats }: { stats: FlightStats }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card className="bg-black/50 backdrop-blur-sm border-indigo-900/50 overflow-hidden">
        <CardContent className="p-6 relative">
          <div className="absolute top-0 right-0 w-16 h-16 bg-indigo-600/10 rounded-bl-full flex items-start justify-end p-2">
            <Plane className="w-6 h-6 text-indigo-400" />
          </div>
          <h3 className="text-sm font-medium text-gray-400">Total Flights</h3>
          <p className="text-4xl font-bold mt-2 text-white">{stats.totalFlights}</p>
        </CardContent>
      </Card>

      <Card className="bg-black/50 backdrop-blur-sm border-indigo-900/50 overflow-hidden">
        <CardContent className="p-6 relative">
          <div className="absolute top-0 right-0 w-16 h-16 bg-purple-600/10 rounded-bl-full flex items-start justify-end p-2">
            <ArrowUp className="w-6 h-6 text-purple-400" />
          </div>
          <h3 className="text-sm font-medium text-gray-400">Avg. Altitude</h3>
          <p className="text-4xl font-bold mt-2 text-white">{Math.round(stats.avgAltitude)} ft</p>
        </CardContent>
      </Card>

      <Card className="bg-black/50 backdrop-blur-sm border-indigo-900/50 overflow-hidden">
        <CardContent className="p-6 relative">
          <div className="absolute top-0 right-0 w-16 h-16 bg-blue-600/10 rounded-bl-full flex items-start justify-end p-2">
            <Gauge className="w-6 h-6 text-blue-400" />
          </div>
          <h3 className="text-sm font-medium text-gray-400">Avg. Speed</h3>
          <p className="text-4xl font-bold mt-2 text-white">{Math.round(stats.avgSpeed)} km/h</p>
        </CardContent>
      </Card>

      <Card className="bg-black/50 backdrop-blur-sm border-indigo-900/50 overflow-hidden">
        <CardContent className="p-6 relative">
          <div className="absolute top-0 right-0 w-16 h-16 bg-cyan-600/10 rounded-bl-full flex items-start justify-end p-2">
            <Globe className="w-6 h-6 text-cyan-400" />
          </div>
          <h3 className="text-sm font-medium text-gray-400">Countries</h3>
          <p className="text-4xl font-bold mt-2 text-white">{stats.countries}</p>
        </CardContent>
      </Card>
    </div>
  )
}
