"use client"

import React, { useState } from "react"
import type { Flight } from "@/lib/types"
import {
  Plane,
  ChevronDown,
  ChevronUp,
  MapPin,
  Globe,
  ArrowUp,
  Gauge,
  Compass,
  Radio,
  Hash,
  ArrowUpDown,
  Mountain,
  ArrowRight,
} from "lucide-react"

const JOURNAL_STYLE = [
  { bg: "bg-muted/50", accent: "text-primary", ring: "ring-primary/20" },
  { bg: "bg-muted/50", accent: "text-primary", ring: "ring-primary/20" },
  { bg: "bg-muted/50", accent: "text-primary", ring: "ring-primary/20" },
  { bg: "bg-muted/50", accent: "text-primary", ring: "ring-primary/20" },
  { bg: "bg-muted/50", accent: "text-primary", ring: "ring-primary/20" },
  { bg: "bg-muted/50", accent: "text-primary", ring: "ring-primary/20" },
]

export default function FlightsInView({
  flight,
  colorIndex = 0,
}: {
  flight: Flight
  colorIndex?: number
}) {
  const [expanded, setExpanded] = useState(false)
  const style = JOURNAL_STYLE[colorIndex % JOURNAL_STYLE.length]

  const direction = flight.true_track
    ? (["N", "NE", "E", "SE", "S", "SW", "W", "NW"][
        Math.floor(((flight.true_track % 360) + 22.5) / 45) % 8
      ] as string)
    : "N/A"

  const statusLabel = flight.on_ground ? "On Ground" : "In Air"
  const statusClass = flight.on_ground
    ? "bg-muted text-muted-foreground border border-border"
    : "bg-primary/10 text-primary border border-primary/20"

  const originCode = flight.origin !== "N/A" ? flight.origin.split(" - ")[0] : "---"
  const destinationCode =
    flight.destination !== "N/A" ? flight.destination.split(" - ")[0] : "---"

  return (
    <div
      className={[
        "bg-card border border-border rounded-2xl overflow-hidden",
        expanded ? `ring-2 ${style.ring}` : "",
      ].join(" ")}
    >
      {/* Main row */}
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        className={[
          "w-full flex items-center gap-3 px-4 py-4 text-left transition-colors sm:gap-4 sm:px-5",
          expanded ? "bg-muted/40" : "hover:bg-muted/40",
        ].join(" ")}
      >
        <div
          className={[
            "w-12 h-12 rounded-xl flex items-center justify-center shrink-0 border border-border",
            style.bg,
          ].join(" ")}
        >
          <Plane className={["w-5 h-5", style.accent].join(" ")} />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-base font-semibold text-foreground tracking-tight font-display">
              {flight.callsign}
            </span>
            <span
              className={[
                "text-xs font-medium px-2.5 py-0.5 rounded-full",
                statusClass,
              ].join(" ")}
            >
              {statusLabel}
            </span>
          </div>
          <p className="text-sm text-muted-foreground mt-0.5 truncate">{flight.airline}</p>
        </div>

        {/* Route pill */}
        <div className="hidden md:flex items-center gap-2 border border-border bg-card/60 px-4 py-2 rounded-full shrink-0 shadow-sm">
          <span className="text-sm font-medium text-foreground tabular-nums">
            {originCode}
          </span>
          <ArrowRight className="w-3.5 h-3.5 text-muted-foreground" />
          <span className="text-sm font-medium text-foreground tabular-nums">
            {destinationCode}
          </span>
        </div>

        <div className="shrink-0 text-muted-foreground ml-2">
          {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </div>
      </button>

      {/* Expanded details */}
      {expanded && (
        <div className="border-t border-border">
          {/* Key metrics row */}
          <div className="grid grid-cols-3 gap-4 p-5">
            <MetricCard
              icon={ArrowUp}
              label="Altitude"
              value={`${Math.round(flight.baro_altitude).toLocaleString()} ft`}
            />
            <MetricCard
              icon={Gauge}
              label="Speed"
              value={`${Math.round(flight.velocity)} km/h`}
            />
            <MetricCard
              icon={Compass}
              label="Heading"
              value={`${direction} (${Math.round(flight.true_track || 0)}°)`}
            />
          </div>

          {/* Properties grid */}
          <div className="px-5 pb-5">
            <div className="bg-muted/30 border border-border rounded-xl overflow-hidden">
              <div className="grid grid-cols-2">
                <Property icon={Globe} label="Country" value={flight.origin_country} />
                <Property icon={Plane} label="Aircraft" value={flight.model || "N/A"} />
                <Property icon={MapPin} label="Origin" value={flight.origin} />
                <Property icon={MapPin} label="Destination" value={flight.destination} />
                <Property icon={Radio} label="ICAO24" value={flight.icao24} mono />
                <Property icon={Hash} label="Squawk" value={flight.squawk || "N/A"} mono />
                <Property
                  icon={ArrowUpDown}
                  label="Vertical Rate"
                  value={`${flight.vertical_rate || 0} m/s`}
                />
                <Property
                  icon={Mountain}
                  label="Geo Altitude"
                  value={`${flight.geo_altitude || "N/A"} ft`}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function MetricCard({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>
  label: string
  value: string
}) {
  return (
    <div className="rounded-xl p-4 text-center bg-muted/40 border border-border">
      <div className="flex items-center justify-center gap-1.5 mb-2">
        <Icon className="w-3.5 h-3.5 text-primary" />
        <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
          {label}
        </span>
      </div>
      <p className="text-lg font-semibold text-foreground tabular-nums font-display">{value}</p>
    </div>
  )
}

function Property({
  icon: Icon,
  label,
  value,
  mono = false,
}: {
  icon: React.ComponentType<{ className?: string }>
  label: string
  value: string
  mono?: boolean
}) {
  return (
    <div className="flex items-center gap-3 px-4 py-3 border-b border-border/60 last:border-b-0 hover:bg-muted/40 transition-colors">
      <Icon className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
      <span className="text-muted-foreground text-xs font-medium shrink-0 w-24">
        {label}
      </span>
      <span
        className={[
          "text-foreground text-sm truncate",
          mono ? "font-mono text-xs" : "",
        ].join(" ")}
      >
        {value}
      </span>
    </div>
  )
}
