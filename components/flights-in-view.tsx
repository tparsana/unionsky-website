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
  ArrowRight,
} from "lucide-react"

const PASTEL_COLORS = [
  { bg: "bg-hover-purple", accent: "text-violet-600", ring: "ring-violet-200" },
  { bg: "bg-hover-blue", accent: "text-blue-600", ring: "ring-blue-200" },
  { bg: "bg-hover-pink", accent: "text-pink-600", ring: "ring-pink-200" },
  { bg: "bg-hover-green", accent: "text-emerald-600", ring: "ring-emerald-200" },
  { bg: "bg-hover-orange", accent: "text-orange-600", ring: "ring-orange-200" },
  { bg: "bg-hover-yellow", accent: "text-amber-600", ring: "ring-amber-200" },
]

export default function FlightsInView({ flight, colorIndex = 0 }: { flight: Flight; colorIndex?: number }) {
  const [expanded, setExpanded] = useState(false)
  const color = PASTEL_COLORS[colorIndex % PASTEL_COLORS.length]

  const direction = flight.true_track
    ? ["N", "NE", "E", "SE", "S", "SW", "W", "NW"][
        Math.floor(((flight.true_track % 360) + 22.5) / 45) % 8
      ]
    : "N/A"

  const statusLabel = flight.on_ground ? "On Ground" : "In Air"
  const statusColor = flight.on_ground
    ? "bg-hover-orange text-orange-700"
    : "bg-hover-green text-emerald-700"

  return (
    <div className={`bg-card border border-border rounded-2xl overflow-hidden hover-lift ${expanded ? "ring-2 " + color.ring : ""}`}>
      {/* Main row */}
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className={`w-full flex items-center gap-4 px-5 py-4 transition-colors text-left ${expanded ? color.bg : "hover:bg-secondary/50"}`}
      >
        <div className={`w-12 h-12 rounded-xl ${color.bg} flex items-center justify-center shrink-0`}>
          <Plane className={`w-5 h-5 ${color.accent}`} />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2.5">
            <span className="text-base font-bold text-foreground tracking-tight">{flight.callsign}</span>
            <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${statusColor}`}>
              {statusLabel}
            </span>
          </div>
          <p className="text-sm text-muted-foreground mt-0.5">{flight.airline}</p>
        </div>

        {/* Route pill */}
        <div className="hidden sm:flex items-center gap-2 bg-secondary px-4 py-2 rounded-full shrink-0">
          <span className="text-sm font-medium text-foreground">{flight.origin !== "N/A" ? flight.origin.split(" - ")[0] : "---"}</span>
          <ArrowRight className="w-3.5 h-3.5 text-muted-foreground" />
          <span className="text-sm font-medium text-foreground">{flight.destination !== "N/A" ? flight.destination.split(" - ")[0] : "---"}</span>
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
              bgColor="bg-hover-blue"
              iconColor="text-blue-600"
            />
            <MetricCard
              icon={Gauge}
              label="Speed"
              value={`${Math.round(flight.velocity)} km/h`}
              bgColor="bg-hover-green"
              iconColor="text-emerald-600"
            />
            <MetricCard
              icon={Compass}
              label="Heading"
              value={`${direction} (${Math.round(flight.true_track || 0)}°)`}
              bgColor="bg-hover-purple"
              iconColor="text-violet-600"
            />
          </div>

          {/* Properties grid */}
          <div className="px-5 pb-5">
            <div className="bg-secondary/50 rounded-xl overflow-hidden">
              <div className="grid grid-cols-2">
                <Property icon={Globe} label="Country" value={flight.origin_country} hoverColor="hover:bg-hover-blue" />
                <Property icon={Plane} label="Aircraft" value={flight.model || "N/A"} hoverColor="hover:bg-hover-purple" />
                <Property icon={MapPin} label="Origin" value={flight.origin} hoverColor="hover:bg-hover-green" />
                <Property icon={MapPin} label="Destination" value={flight.destination} hoverColor="hover:bg-hover-pink" />
                <Property icon={Radio} label="ICAO24" value={flight.icao24} mono hoverColor="hover:bg-hover-orange" />
                <Property icon={Hash} label="Squawk" value={flight.squawk || "N/A"} mono hoverColor="hover:bg-hover-yellow" />
                <Property icon={ArrowUpDown} label="Vertical Rate" value={`${flight.vertical_rate || 0} m/s`} hoverColor="hover:bg-hover-blue" />
                <Property icon={Mountain} label="Geo Altitude" value={`${flight.geo_altitude || "N/A"} ft`} hoverColor="hover:bg-hover-green" />
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
  bgColor,
  iconColor,
}: {
  icon: React.ComponentType<{ className?: string }>
  label: string
  value: string
  bgColor: string
  iconColor: string
}) {
  return (
    <div className={`${bgColor} rounded-xl p-4 text-center hover-lift`}>
      <div className="flex items-center justify-center gap-1.5 mb-2">
        <Icon className={`w-3.5 h-3.5 ${iconColor}`} />
        <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">{label}</span>
      </div>
      <p className="text-lg font-bold text-foreground tabular-nums">{value}</p>
    </div>
  )
}

function Property({
  icon: Icon,
  label,
  value,
  mono = false,
  hoverColor = "hover:bg-hover-blue",
}: {
  icon: React.ComponentType<{ className?: string }>
  label: string
  value: string
  mono?: boolean
  hoverColor?: string
}) {
  return (
    <div className={`flex items-center gap-3 px-4 py-3 border-b border-border/50 last:border-b-0 ${hoverColor} transition-colors rounded-sm`}>
      <Icon className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
      <span className="text-muted-foreground text-xs font-medium shrink-0 w-20">{label}</span>
      <span className={`text-foreground text-sm truncate ${mono ? "font-mono text-xs" : ""}`}>{value}</span>
    </div>
  )
}
