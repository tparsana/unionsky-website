import { Suspense } from "react"
import FlightDashboard from "@/components/flight-dashboard"
import LoadingDashboard from "@/components/loading-dashboard"

export default function Home() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <Suspense fallback={<LoadingDashboard />}>
        <FlightDashboard />
      </Suspense>
    </main>
  )
}
