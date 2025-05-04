"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import type { Flight } from "@/lib/types"
import { Plane, ChevronDown, ChevronUp, MapPin, Globe, PlaneIcon } from "lucide-react"

export default function FlightsInView({ flight }: { flight: Flight }) {
  const [expanded, setExpanded] = useState(false)

  return (
    <Card className="bg-black/50 backdrop-blur-sm border-indigo-900/50 overflow-hidden">
      <CardContent className="p-0">
        <div className="p-4 border-b border-indigo-900/30 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="bg-indigo-900/50 p-2 rounded-md">
              <Plane className="w-5 h-5 text-indigo-300" />
            </div>
            <div>
              <h3 className="font-bold text-lg">{flight.callsign}</h3>
              <p className="text-sm text-gray-400">{flight.airline}</p>
            </div>
          </div>
          <div className="px-3 py-1 rounded-full bg-indigo-900/30 text-indigo-300 text-xs font-medium">In Air</div>
        </div>

        <div className="p-4 grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-xs text-gray-400">Altitude</p>
            <p className="font-semibold mt-1">{Math.round(flight.baro_altitude)} ft</p>
          </div>
          <div>
            <p className="text-xs text-gray-400">Speed</p>
            <p className="font-semibold mt-1">{Math.round(flight.velocity)} km/h</p>
          </div>
          <div>
            <p className="text-xs text-gray-400">Direction</p>
            <p className="font-semibold mt-1">
              {flight.true_track
                ? ["N", "NE", "E", "SE", "S", "SW", "W", "NW"][Math.floor(((flight.true_track % 360) + 22.5) / 45) % 8]
                : "N/A"}
            </p>
          </div>
        </div>

        <div className="px-4 pb-2 flex items-center gap-2">
          <Globe className="w-4 h-4 text-gray-400" />
          <p className="text-sm">
            Country: <span className="text-indigo-300">{flight.origin_country}</span>
          </p>
        </div>

        <div className="px-4 pb-2 flex items-center gap-2">
          <MapPin className="w-4 h-4 text-gray-400" />
          <p className="text-sm">
            Origin: <span className="text-indigo-300">{flight.origin}</span>
          </p>
        </div>

        <div className="px-4 pb-4 flex items-center gap-2">
          <MapPin className="w-4 h-4 text-gray-400" />
          <p className="text-sm">
            Destination: <span className="text-indigo-300">{flight.destination}</span>
          </p>
        </div>

        {expanded && (
          <div className="px-4 pb-4 pt-2 border-t border-indigo-900/30 space-y-2">
            <div className="flex items-center gap-2">
              <PlaneIcon className="w-4 h-4 text-gray-400" />
              <p className="text-sm">
                Aircraft: <span className="text-indigo-300">{flight.model || "N/A"}</span>
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-gray-400">ICAO24</p>
                <p className="font-mono text-sm">{flight.icao24}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400">Squawk</p>
                <p className="font-mono text-sm">{flight.squawk || "N/A"}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400">Vertical Rate</p>
                <p className="font-mono text-sm">{flight.vertical_rate || 0} m/s</p>
              </div>
              <div>
                <p className="text-xs text-gray-400">Geo Altitude</p>
                <p className="font-mono text-sm">{flight.geo_altitude || "N/A"} ft</p>
              </div>
            </div>
          </div>
        )}

        <Button
          variant="ghost"
          size="sm"
          className="w-full flex items-center justify-center py-2 text-gray-400 hover:text-white hover:bg-indigo-900/30"
          onClick={() => setExpanded(!expanded)}
        >
          {expanded ? (
            <>
              <ChevronUp className="w-4 h-4 mr-1" /> Less details
            </>
          ) : (
            <>
              <ChevronDown className="w-4 h-4 mr-1" /> More details
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  )
}
