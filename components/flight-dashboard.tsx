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

function dedupeFlightsByIcao24(flights: Flight[]): Flight[] {
  const map = new Map<string, Flight>()

  for (const flight of flights) {
    const existing = map.get(flight.icao24)
    if (!existing) {
      map.set(flight.icao24, flight)
      continue
    }

    const existingFreshness = Math.max(existing.last_contact || 0, existing.time_position || 0)
    const incomingFreshness = Math.max(flight.last_contact || 0, flight.time_position || 0)
    if (incomingFreshness >= existingFreshness) {
      map.set(flight.icao24, flight)
    }
  }

  return Array.from(map.values())
}

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
        const fetchedFlights = await fetchFlights()
        const data = dedupeFlightsByIcao24(fetchedFlights)
        setFlights(data)
        setLastUpdated(new Date())

        const uniqueCountries = new Set(data.map((f) => f.origin_country))
        const uniqueAirlines = new Set(data.map((f) => f.airline))
        const airlineCounts = Array.from(uniqueAirlines).map((airline) => ({
          name: airline,
          count: data.filter((f) => f.airline === airline).length,
        }))
        const avgAlt = data.reduce((sum, f) => sum + f.baro_altitude, 0) / (data.length || 1)
        const avgSpd = data.reduce((sum, f) => sum + f.velocity, 0) / (data.length || 1)

        setStats((prev) => {
          const newHistory = [...prev.history]
          if (data.length > 0) {
            newHistory.push({
              timestamp: new Date().toISOString(),
              flights: data.length,
              airlines: Array.from(uniqueAirlines),
              airlineCounts,
              avgAltitude: avgAlt,
              avgSpeed: avgSpd,
              countries: uniqueCountries.size,
            })
          }

          return {
            totalFlights: data.length,
            avgAltitude: avgAlt,
            avgSpeed: avgSpd,
            countries: uniqueCountries.size,
            airlines: airlineCounts,
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
    <div className="mx-auto w-full max-w-[92rem] px-3 py-4 sm:px-6 sm:py-8 lg:px-8">
      <section className="relative overflow-hidden rounded-[2rem] bg-primary px-5 pb-16 pt-5 text-primary-foreground shadow-[0_26px_80px_-40px_hsl(var(--primary)/0.9)] sm:px-8 sm:pb-20 sm:pt-7 lg:px-10">
        <div className="absolute -right-16 -top-24 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute -left-20 bottom-0 h-52 w-52 rounded-full bg-black/15 blur-3xl" />
        <header className="relative z-10 flex items-center justify-between gap-4">
          <p className="font-display text-2xl font-semibold tracking-tight sm:text-3xl">UnionSky</p>

          <div className="flex flex-wrap items-center justify-end gap-2 text-sm">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/5 px-3.5 py-2 text-primary-foreground/90 sm:px-4">
              <Radio className="h-3.5 w-3.5 animate-pulse-soft" />
              Live
            </span>
            {lastUpdated && (
              <span className="rounded-full border border-white/30 bg-white/5 px-3.5 py-2 tabular-nums text-primary-foreground/90 sm:px-4">
                {lastUpdated.toLocaleTimeString()}
              </span>
            )}
          </div>
        </header>

        <div className="relative z-10 mt-8 lg:mt-10">
          <div>
            <p className="mb-3 text-xs uppercase tracking-[0.22em] text-primary-foreground/75">
              Planespotting Dashboard
            </p>
            <h1 className="max-w-2xl font-display text-3xl leading-tight sm:text-4xl lg:text-[3.1rem]">
              Live Air Traffic Outside
              My Apartment Window.
            </h1>
          </div>
        </div>
      </section>

      <section
        className="-mt-6 rounded-[2rem] border border-border bg-card px-4 pb-8 pt-10 shadow-[0_24px_70px_-55px_rgba(0,0,0,0.85)] sm:-mt-8 sm:px-7 sm:pb-10 sm:pt-12 lg:px-10"
      >
        <section id="live-board" className="space-y-4">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div className="flex items-start gap-3 pr-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-border bg-muted/60">
                <Plane className="h-[18px] w-[18px] text-primary" />
              </div>
              <div>
                <h2 className="font-display text-2xl font-semibold tracking-tight sm:text-3xl">
                  Outside now
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">Aircraft currently in your view</p>
              </div>
            </div>

            <span className="rounded-full border border-border bg-background/70 px-4 py-2 text-sm font-medium text-muted-foreground tabular-nums">
              {flights.length} {flights.length === 1 ? "plane" : "planes"}
            </span>
          </div>

          <div className="flex flex-col gap-3">
            {loading ? (
              Array(3)
                .fill(0)
                .map((_, i) => (
                  <div
                    key={i}
                    className="rounded-2xl border border-border bg-background/80 p-5 sm:p-6 animate-pulse"
                  >
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 rounded-xl border border-border bg-muted" />
                      <div className="flex-1">
                        <div className="mb-2 h-5 w-32 rounded-lg border border-border bg-muted" />
                        <div className="h-3.5 w-48 rounded-lg border border-border bg-muted" />
                      </div>
                    </div>
                  </div>
                ))
            ) : flights.length > 0 ? (
              flights.map((flight, index) => (
                <FlightsInView key={flight.icao24} flight={flight} colorIndex={index} />
              ))
            ) : (
              <div className="flex min-h-[300px] flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-background/80 py-20">
                <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-border bg-muted">
                  <Plane className="h-6 w-6 text-muted-foreground" />
                </div>
                <p className="font-display text-base font-medium text-foreground">Quiet skies</p>
                <p className="mt-1.5 text-sm text-muted-foreground">
                  Nothing overhead right now, Waiting for aircraft to enter your view...
                </p>
              </div>
            )}
          </div>
        </section>

        <section id="analytics" className="mt-10 border-t border-border pt-10">
          <Tabs
            defaultValue="overview"
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full"
          >
            <div className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-border bg-muted/60">
                  <BarChart3 className="h-[18px] w-[18px] text-primary" />
                </div>
                <h2 className="font-display text-2xl font-semibold tracking-tight leading-tight sm:text-3xl">
                  Flight statistics
                </h2>
              </div>

              <TabsList className="w-full justify-start overflow-x-auto whitespace-nowrap lg:w-auto">
                <TabsTrigger value="overview" className="px-4">
                  <BarChart3 className="mr-1.5 h-3.5 w-3.5" />
                  Overview
                </TabsTrigger>
                <TabsTrigger value="airlines" className="px-4">
                  <Plane className="mr-1.5 h-3.5 w-3.5" />
                  Airlines
                </TabsTrigger>
                <TabsTrigger value="history" className="px-4">
                  <Clock className="mr-1.5 h-3.5 w-3.5" />
                  Log
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="overview" className="mt-0">
              <FlightOverview stats={stats} />
            </TabsContent>
            <TabsContent value="airlines" className="mt-0">
              <FlightAirlines history={stats.history} />
            </TabsContent>
            <TabsContent value="history" className="mt-0">
              <FlightHistory stats={stats} />
            </TabsContent>
          </Tabs>
        </section>

        <footer className="mt-10 border-t border-border pt-6 text-center">
          <p className="text-sm text-muted-foreground">
            UnionSky Viewfinder · Created Curiously by{" "}
            <a
              href="https://solo.to/tparsana"
              target="_blank"
              rel="noopener noreferrer"
              className="text-foreground underline decoration-border underline-offset-4 transition-colors hover:text-primary"
            >
              Tanish Parsana
            </a>{" "}
            · Powered by OpenSky Network
          </p>
          <p className="mt-2 text-xs text-muted-foreground/70">Auto-refreshes every 30 seconds</p>
        </footer>
      </section>
    </div>
  )
}
