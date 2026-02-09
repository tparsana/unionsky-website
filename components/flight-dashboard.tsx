"use client"

import { useEffect, useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BarChart3, Clock, Plane, Radio } from "lucide-react"
import FlightOverview from "@/components/flight-overview"
import FlightAirlines from "@/components/flight-airlines"
import FlightHistory from "@/components/flight-history"
import FlightsInView from "@/components/flights-in-view"
import { fetchFlights } from "@/lib/api"
import type { Flight, FlightStats } from "@/lib/types"
import Image from "next/image"

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
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      try {
        const data = await fetchFlights()
        setFlights(data)
        setLastUpdated(new Date())

        const uniqueCountries = new Set(data.map((f) => f.origin_country))
        const uniqueAirlines = new Set(data.map((f) => f.airline))
        const avgAlt = data.reduce((sum, f) => sum + f.baro_altitude, 0) / (data.length || 1)
        const avgSpd = data.reduce((sum, f) => sum + f.velocity, 0) / (data.length || 1)

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
    const interval = setInterval(fetchData, 30000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="max-w-5xl mx-auto px-6 py-8">
      {/* Header */}
      <header className="flex items-center justify-between pb-6 border-b border-border">
        <div className="flex items-center gap-3">
          <Image
            src="/images/unionsky-logo.png"
            alt="UnionSky"
            width={400}
            height={100}
            className="h-[100px] w-auto object-contain invert"
            priority
          />
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Radio className="w-3.5 h-3.5 text-emerald-500 animate-pulse" />
          <span>Live</span>
          {lastUpdated && (
            <>
              <span className="text-border">|</span>
              <span>{lastUpdated.toLocaleTimeString()}</span>
            </>
          )}
        </div>
      </header>

      {/* Statistics Section */}
      <section className="mt-8">
        <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg font-semibold text-foreground">Flight Statistics</h2>
            <TabsList className="bg-secondary">
              <TabsTrigger
                value="overview"
                className="data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm text-muted-foreground"
              >
                <BarChart3 className="w-3.5 h-3.5 mr-1.5" />
                Overview
              </TabsTrigger>
              <TabsTrigger
                value="airlines"
                className="data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm text-muted-foreground"
              >
                <Plane className="w-3.5 h-3.5 mr-1.5" />
                Airlines
              </TabsTrigger>
              <TabsTrigger
                value="history"
                className="data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm text-muted-foreground"
              >
                <Clock className="w-3.5 h-3.5 mr-1.5" />
                History
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
      </section>

      {/* Flights In View */}
      <section className="mt-10">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-semibold text-foreground">Flights In View</h2>
          <span className="text-xs text-muted-foreground bg-secondary px-2 py-1 rounded">
            {flights.length} aircraft
          </span>
        </div>

        <div className="flex flex-col gap-3">
          {loading ? (
            Array(3)
              .fill(0)
              .map((_, i) => (
                <div
                  key={i}
                  className="border border-border rounded-md p-5 animate-pulse"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded bg-secondary" />
                    <div className="flex-1">
                      <div className="h-4 w-28 rounded bg-secondary mb-2" />
                      <div className="h-3 w-40 rounded bg-secondary" />
                    </div>
                  </div>
                </div>
              ))
          ) : flights.length > 0 ? (
            flights.map((flight) => <FlightsInView key={flight.icao24} flight={flight} />)
          ) : (
            <div className="border border-dashed border-border rounded-md py-16 flex flex-col items-center justify-center">
              <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center mb-3">
                <Plane className="w-5 h-5 text-muted-foreground" />
              </div>
              <p className="text-sm font-medium text-foreground">No flights currently in view</p>
              <p className="text-xs text-muted-foreground mt-1">
                Waiting for aircraft to enter your viewing area...
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-12 pt-6 border-t border-border text-center">
        <p className="text-sm text-muted-foreground">
          UnionSky Viewfinder · Created with ♥ by{" "}
          <a
            href="https://solo.to/tparsana"
            target="_blank"
            rel="noopener noreferrer"
            className="text-foreground underline decoration-border underline-offset-2 hover:decoration-foreground transition-colors"
          >
            Tanish Parsana
          </a>{" "}
          · Using OpenSky Network API
        </p>
        <p className="mt-1.5 text-xs text-muted-foreground/70">
          Data refreshes automatically every 30 seconds
        </p>
      </footer>
    </div>
  )
}
