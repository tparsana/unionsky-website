"use client"

import React from "react"

import { useState } from "react"
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
} from "lucide-react"

export default function FlightsInView({ flight }: { flight: Flight }) {
  const [expanded, setExpanded] = useState(false)

  const direction = flight.true_track
    ? ["N", "NE", "E", "SE", "S", "SW", "W", "NW"][
        Math.floor(((flight.true_track % 360) + 22.5) / 45) % 8
      ]
    : "N/A"

  return (
    <div className="border border-border rounded-md overflow-hidden hover:shadow-sm transition-shadow">
      {/* Main row - always visible */}
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center gap-4 px-4 py-3.5 hover:bg-secondary/30 transition-colors text-left"
      >
        <div className="w-8 h-8 rounded bg-secondary flex items-center justify-center shrink-0">
          <Plane className="w-4 h-4 text-muted-foreground" />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-foreground">{flight.callsign}</span>
            <span className="text-xs text-muted-foreground">{flight.airline}</span>
          </div>
          <div className="flex items-center gap-3 mt-0.5 text-xs text-muted-foreground">
            <span>{flight.origin}</span>
            <span className="text-border">{'-->'}</span>
            <span>{flight.destination}</span>
          </div>
        </div>

        {/* Quick stats */}
        <div className="hidden sm:flex items-center gap-4 text-xs text-muted-foreground shrink-0">
          <span className="tabular-nums">{Math.round(flight.baro_altitude).toLocaleString()} ft</span>
          <span className="tabular-nums">{Math.round(flight.velocity)} km/h</span>
          <span>{direction}</span>
        </div>

        <div className="shrink-0 text-muted-foreground">
          {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </div>
      </button>

      {/* Expanded details */}
      {expanded && (
        <div className="border-t border-border bg-secondary/20">
          {/* Key metrics */}
          <div className="grid grid-cols-3 divide-x divide-border border-b border-border">
            <div className="px-4 py-3 text-center">
              <div className="flex items-center justify-center gap-1 mb-1">
                <ArrowUp className="w-3 h-3 text-muted-foreground" />
                <span className="text-[11px] text-muted-foreground font-medium uppercase tracking-wider">Altitude</span>
              </div>
              <p className="text-sm font-semibold text-foreground tabular-nums">
                {Math.round(flight.baro_altitude).toLocaleString()} ft
              </p>
            </div>
            <div className="px-4 py-3 text-center">
              <div className="flex items-center justify-center gap-1 mb-1">
                <Gauge className="w-3 h-3 text-muted-foreground" />
                <span className="text-[11px] text-muted-foreground font-medium uppercase tracking-wider">Speed</span>
              </div>
              <p className="text-sm font-semibold text-foreground tabular-nums">
                {Math.round(flight.velocity)} km/h
              </p>
            </div>
            <div className="px-4 py-3 text-center">
              <div className="flex items-center justify-center gap-1 mb-1">
                <Compass className="w-3 h-3 text-muted-foreground" />
                <span className="text-[11px] text-muted-foreground font-medium uppercase tracking-wider">Heading</span>
              </div>
              <p className="text-sm font-semibold text-foreground tabular-nums">
                {direction} ({Math.round(flight.true_track || 0)}°)
              </p>
            </div>
          </div>

          {/* Properties list */}
          <div className="grid grid-cols-2 text-sm">
            <Property icon={Globe} label="Country" value={flight.origin_country} />
            <Property icon={MapPin} label="Origin" value={flight.origin} />
            <Property icon={MapPin} label="Destination" value={flight.destination} />
            <Property icon={Plane} label="Aircraft" value={flight.model || "N/A"} />
            <Property icon={Radio} label="ICAO24" value={flight.icao24} mono />
            <Property icon={Hash} label="Squawk" value={flight.squawk || "N/A"} mono />
            <Property icon={ArrowUpDown} label="Vertical Rate" value={`${flight.vertical_rate || 0} m/s`} />
            <Property icon={Mountain} label="Geo Altitude" value={`${flight.geo_altitude || "N/A"} ft`} />
          </div>
        </div>
      )}
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
    <div className="flex items-center gap-2.5 px-4 py-2.5 border-b border-border last:border-b-0 hover:bg-secondary/30 transition-colors">
      <Icon className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
      <span className="text-muted-foreground text-xs shrink-0">{label}</span>
      <span className={`text-foreground text-xs truncate ${mono ? "font-mono" : ""}`}>{value}</span>
    </div>
  )
}
