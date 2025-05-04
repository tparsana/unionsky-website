"use client"

import { useEffect, useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent } from "@/components/ui/card"
import { Plane, BarChart3, Clock, Globe } from "lucide-react"
import FlightOverview from "@/components/flight-overview"
import FlightAirlines from "@/components/flight-airlines"
import FlightHistory from "@/components/flight-history"
import FlightsInView from "@/components/flights-in-view"
import { fetchFlights } from "@/lib/api"
import type { Flight, FlightStats } from "@/lib/types"

export default function FlightDashboard() {
  const [flights, setFlights] = useState<Flight[]>([])
  const [stats, setStats] = useState<FlightStats>({
    totalFlights: 0,
    avgAltitude: 0,
    avgSpeed: 0,
    countries: 0,
    airlines: [],
    arrivals: 0,
    departures: 0,
    history: [],
  })
  const [activeTab, setActiveTab] = useState("overview")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      try {
        const data = await fetchFlights()
        setFlights(data)

        // Calculate stats
        const uniqueCountries = new Set(data.map((f) => f.origin_country))
        const uniqueAirlines = new Set(data.map((f) => f.airline))
        const avgAlt = data.reduce((sum, f) => sum + f.baro_altitude, 0) / (data.length || 1)
        const avgSpd = data.reduce((sum, f) => sum + f.velocity, 0) / (data.length || 1)

        // Update stats
        setStats((prev) => {
          const newHistory = [...prev.history]
          if (data.length > 0) {
            newHistory.push({
              timestamp: new Date().toISOString(),
              flights: data.length,
              airlines: Array.from(uniqueAirlines),
            })
          }

          return {
            totalFlights: data.length,
            avgAltitude: avgAlt,
            avgSpeed: avgSpd,
            countries: uniqueCountries.size,
            airlines: Array.from(uniqueAirlines).map((airline) => ({
              name: airline,
              count: data.filter((f) => f.airline === airline).length,
            })),
            arrivals: data.filter((f) => f.destination !== "N/A").length,
            departures: data.filter((f) => f.origin !== "N/A" && f.destination === "N/A").length,
            history: newHistory,
          }
        })
      } catch (error) {
        console.error("Error fetching flight data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
    const interval = setInterval(fetchData, 30000) // Refresh every 30 seconds

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="container mx-auto p-4 space-y-6">
      <header className="flex justify-between items-center py-4">
        <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-indigo-300">
          UnionSky
        </h1>
        <div className="text-sm text-gray-400">Live Air Traffic • {new Date().toLocaleTimeString()}</div>
      </header>

      <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Flight Statistics</h2>
          <TabsList className="bg-black/50 backdrop-blur-sm">
            <TabsTrigger value="overview" className="data-[state=active]:bg-indigo-600">
              <BarChart3 className="w-4 h-4 mr-2" /> Overview
            </TabsTrigger>
            <TabsTrigger value="airlines" className="data-[state=active]:bg-indigo-600">
              <Plane className="w-4 h-4 mr-2" /> Airlines
            </TabsTrigger>
            <TabsTrigger value="history" className="data-[state=active]:bg-indigo-600">
              <Clock className="w-4 h-4 mr-2" /> History
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="overview" className="mt-0">
          <FlightOverview stats={stats} />
        </TabsContent>

        <TabsContent value="airlines" className="mt-0">
          <FlightAirlines airlines={stats.airlines} />
        </TabsContent>

        <TabsContent value="history" className="mt-0">
          <FlightHistory stats={stats} />
        </TabsContent>
      </Tabs>

      <section>
        <h2 className="text-xl font-semibold mb-4">Flights In View</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {loading ? (
            Array(3)
              .fill(0)
              .map((_, i) => (
                <Card key={i} className="bg-black/50 backdrop-blur-sm border-indigo-900/50 animate-pulse h-64">
                  <CardContent className="p-6"></CardContent>
                </Card>
              ))
          ) : flights.length > 0 ? (
            flights.map((flight) => <FlightsInView key={flight.icao24} flight={flight} />)
          ) : (
            <Card className="bg-black/50 backdrop-blur-sm border-indigo-900/50 col-span-full">
              <CardContent className="p-6 flex flex-col items-center justify-center h-64">
                <Globe className="w-16 h-16 text-indigo-400 mb-4 opacity-50" />
                <p className="text-center text-gray-400">No flights currently in view</p>
                <p className="text-center text-gray-500 text-sm mt-2">
                  Waiting for aircraft to enter your viewing area...
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </section>

      <footer className="mt-8 pt-6 border-t border-indigo-900/30 text-center text-sm text-gray-400">
        <p>
          UnionSky Viewfinder · Created with ♥ by{" "}
          <a
            href="https://solo.to/tparsana"
            target="_blank"
            rel="noopener noreferrer"
            className="text-indigo-400 hover:text-indigo-300"
          >
            Tanish Parsana
          </a>{" "}
          · Using OpenSky Network API
        </p>
        <p className="mt-1 text-gray-500">Data refreshes automatically every 30 seconds</p>
      </footer>
    </div>
  )
}
