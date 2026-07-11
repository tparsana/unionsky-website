import { NextResponse } from "next/server"
import { getAirlineName } from "@/lib/api"
import type { Flight } from "@/lib/types"

export const dynamic = "force-dynamic"
export const runtime = "nodejs"

const STATE_CACHE_MS = 45_000
const TOKEN_SAFETY_WINDOW_MS = 60_000

const DEFAULT_GEOFENCE = {
  lamin: 33.421699,
  lamax: 33.458656,
  lomin: -111.988786,
  lomax: -111.917328,
}

type CachedPayload = {
  flights: Flight[]
  updatedAt: string
}

let stateCache: { expiresAt: number; payload: CachedPayload } | null = null
let tokenCache: { accessToken: string; expiresAt: number } | null = null

function readCoordinate(name: keyof typeof DEFAULT_GEOFENCE): number {
  const configuredValue = process.env[`OPEN_SKY_${name.toUpperCase()}`]
  const parsed = configuredValue ? Number.parseFloat(configuredValue) : Number.NaN
  return Number.isFinite(parsed) ? parsed : DEFAULT_GEOFENCE[name]
}

function getGeofence() {
  return {
    lamin: readCoordinate("lamin"),
    lamax: readCoordinate("lamax"),
    lomin: readCoordinate("lomin"),
    lomax: readCoordinate("lomax"),
  }
}

async function getAccessToken(): Promise<string | null> {
  const clientId = process.env.OPEN_SKY_CLIENT_ID
  const clientSecret = process.env.OPEN_SKY_CLIENT_SECRET

  if (!clientId && !clientSecret) return null
  if (!clientId || !clientSecret) {
    throw new Error("OpenSky OAuth configuration is incomplete")
  }

  if (tokenCache && tokenCache.expiresAt > Date.now()) {
    return tokenCache.accessToken
  }

  const body = new URLSearchParams({
    grant_type: "client_credentials",
    client_id: clientId,
    client_secret: clientSecret,
  })
  const response = await fetch(
    "https://auth.opensky-network.org/auth/realms/opensky-network/protocol/openid-connect/token",
    {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body,
      cache: "no-store",
    },
  )

  if (!response.ok) {
    throw new Error(`OpenSky OAuth request failed (${response.status})`)
  }

  const payload = (await response.json()) as { access_token?: string; expires_in?: number }
  if (!payload.access_token) {
    throw new Error("OpenSky OAuth response did not include an access token")
  }

  const expiresInMs = Math.max((payload.expires_in || 1_800) * 1_000 - TOKEN_SAFETY_WINDOW_MS, 60_000)
  tokenCache = {
    accessToken: payload.access_token,
    expiresAt: Date.now() + expiresInMs,
  }

  return tokenCache.accessToken
}

function isInsideGeofence(latitude: number | null, longitude: number | null) {
  if (latitude === null || longitude === null) return false

  const { lamin, lamax, lomin, lomax } = getGeofence()
  return latitude >= lamin && latitude <= lamax && longitude >= lomin && longitude <= lomax
}

function parseFlight(state: unknown[]): Flight | null {
  const icao24 = typeof state[0] === "string" ? state[0] : ""
  const latitude = typeof state[6] === "number" ? state[6] : null
  const longitude = typeof state[5] === "number" ? state[5] : null

  if (
    !icao24 ||
    latitude === null ||
    longitude === null ||
    !isInsideGeofence(latitude, longitude)
  ) {
    return null
  }

  const callsign = typeof state[1] === "string" ? state[1].trim() || "N/A" : "N/A"
  const numberAt = (index: number) => (typeof state[index] === "number" ? state[index] : 0)

  return {
    icao24,
    callsign,
    origin_country: typeof state[2] === "string" ? state[2] : "N/A",
    time_position: numberAt(3),
    last_contact: numberAt(4),
    longitude,
    latitude,
    geo_altitude: numberAt(7),
    on_ground: state[8] === true,
    velocity: numberAt(9),
    true_track: numberAt(10),
    vertical_rate: numberAt(11),
    sensors: Array.isArray(state[12]) ? state[12].filter((sensor): sensor is number => typeof sensor === "number") : [],
    baro_altitude: numberAt(13),
    squawk: typeof state[14] === "string" ? state[14] : "",
    spi: state[15] === true,
    position_source: numberAt(16),
    airline: getAirlineName(callsign),
    // Per-aircraft flight-history calls are intentionally omitted to conserve credits.
    origin: "N/A",
    destination: "N/A",
    model: "N/A",
  }
}

export async function GET() {
  if (stateCache && stateCache.expiresAt > Date.now()) {
    return NextResponse.json(stateCache.payload, {
      headers: { "Cache-Control": "public, s-maxage=45, stale-while-revalidate=30" },
    })
  }

  try {
    const geofence = getGeofence()
    const accessToken = await getAccessToken()
    const query = new URLSearchParams(
      Object.entries(geofence).map(([key, value]) => [key, String(value)]),
    )
    const response = await fetch(`https://opensky-network.org/api/states/all?${query}`, {
      headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : undefined,
      cache: "no-store",
      signal: AbortSignal.timeout(12_000),
    })

    if (!response.ok) {
      throw new Error(`OpenSky state request failed (${response.status})`)
    }

    const data = (await response.json()) as { states?: unknown[][] }
    const flights = Array.isArray(data.states)
      ? data.states.map(parseFlight).filter((flight): flight is Flight => flight !== null)
      : []
    const payload = { flights, updatedAt: new Date().toISOString() }

    stateCache = {
      payload,
      expiresAt: Date.now() + STATE_CACHE_MS,
    }

    return NextResponse.json(payload, {
      headers: { "Cache-Control": "public, s-maxage=45, stale-while-revalidate=30" },
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to retrieve live flight data"
    return NextResponse.json({ error: message }, { status: 502 })
  }
}
