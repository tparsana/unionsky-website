import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import type { Airline } from "@/lib/types"

export default function FlightAirlines({ airlines }: { airlines: Airline[] }) {
  // Sort airlines by count (descending)
  const sortedAirlines = [...airlines].sort((a, b) => b.count - a.count)
  const maxCount = sortedAirlines.length > 0 ? sortedAirlines[0].count : 1

  return (
    <div className="space-y-4">
      {sortedAirlines.length > 0 ? (
        sortedAirlines.map((airline) => (
          <Card key={airline.name} className="bg-black/50 backdrop-blur-sm border-indigo-900/50">
            <CardContent className="p-4">
              <div className="flex justify-between items-center mb-2">
                <h3 className="font-medium">{airline.name}</h3>
                <span className="text-indigo-300 font-semibold">{airline.count}</span>
              </div>
              <Progress
                value={(airline.count / maxCount) * 100}
                className="h-2 bg-indigo-950"
                indicatorClassName="bg-gradient-to-r from-indigo-500 to-purple-500"
              />
            </CardContent>
          </Card>
        ))
      ) : (
        <Card className="bg-black/50 backdrop-blur-sm border-indigo-900/50">
          <CardContent className="p-6 text-center text-gray-400">No airline data available</CardContent>
        </Card>
      )}
    </div>
  )
}
