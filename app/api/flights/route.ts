import { NextResponse } from "next/server"
import { getAirlineName } from "@/lib/api"
import type { Flight } from "@/lib/types"

export const dynamic = "force-dynamic"
export const runtime = "nodejs"
// Keep the outbound request near Phoenix instead of relying on a distant default region.
export const preferredRegion = "sfo1"

const STATE_CACHE_MS = 45_000
const STALE_CACHE_MS = 10 * 60_000
const TOKEN_SAFETY_WINDOW_MS = 60_000
const OPEN_SKY_TIMEOUT_MS = 12_000
const ADSB_LOL_TIMEOUT_MS = 12_000
const RETRY_DELAY_MS = 500
const METERS_TO_FEET = 3.28084
const KNOTS_TO_KMH = 1.852
const FEET_PER_MINUTE_TO_METERS_PER_SECOND = 0.00508

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

type FlightProvider = "opensky" | "adsb-lol"

type AdsbLolAircraft = {
  hex?: unknown
  flight?: unknown
  r?: unknown
  t?: unknown
  lat?: unknown
  lon?: unknown
  alt_baro?: unknown
  alt_geom?: unknown
  gs?: unknown
  track?: unknown
  true_heading?: unknown
  baro_rate?: unknown
  squawk?: unknown
  seen?: unknown
}

let stateCache: { expiresAt: number; payload: CachedPayload; provider: FlightProvider } | null = null
let tokenCache: { accessToken: string; expiresAt: number } | null = null

function sleep(duration: number) {
  return new Promise((resolve) => setTimeout(resolve, duration))
}

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

async function fetchOpenSkyStates(url: string, accessToken: string | null) {
  let lastError: unknown

  for (let attempt = 0; attempt < 2; attempt += 1) {
    try {
      const response = await fetch(url, {
        headers: {
          Accept: "application/json",
          "User-Agent": "UnionSky/1.0 (+https://tanishparsana.com)",
          ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
        },
        cache: "no-store",
        signal: AbortSignal.timeout(OPEN_SKY_TIMEOUT_MS),
      })

      if (response.ok || attempt === 1 || ![408, 429, 500, 502, 503, 504].includes(response.status)) {
        return response
      }

      lastError = new Error(`OpenSky state request failed (${response.status})`)
    } catch (error) {
      lastError = error
    }

    await sleep(RETRY_DELAY_MS)
  }

  throw lastError instanceof Error ? lastError : new Error("OpenSky state request failed")
}

async function fetchAdsbLolStates(url: string) {
  let lastError: unknown

  for (let attempt = 0; attempt < 2; attempt += 1) {
    try {
      const response = await fetch(url, {
        headers: {
          Accept: "application/json",
          "User-Agent": "UnionSky/1.0 (+https://tanishparsana.com)",
        },
        cache: "no-store",
        signal: AbortSignal.timeout(ADSB_LOL_TIMEOUT_MS),
      })

      if (response.ok || attempt === 1 || ![408, 429, 500, 502, 503, 504].includes(response.status)) {
        return response
      }

      lastError = new Error(`adsb.lol request failed (${response.status})`)
    } catch (error) {
      lastError = error
    }

    await sleep(RETRY_DELAY_MS)
  }

  throw lastError instanceof Error ? lastError : new Error("adsb.lol request failed")
}

function isInsideGeofence(latitude: number | null, longitude: number | null) {
  if (latitude === null || longitude === null) return false

  const { lamin, lamax, lomin, lomax } = getGeofence()
  return latitude >= lamin && latitude <= lamax && longitude >= lomin && longitude <= lomax
}

function parseOpenSkyFlight(state: unknown[]): Flight | null {
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
    geo_altitude: numberAt(7) * METERS_TO_FEET,
    on_ground: state[8] === true,
    velocity: numberAt(9) * 3.6,
    true_track: numberAt(10),
    vertical_rate: numberAt(11),
    sensors: Array.isArray(state[12]) ? state[12].filter((sensor): sensor is number => typeof sensor === "number") : [],
    baro_altitude: numberAt(13) * METERS_TO_FEET,
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

function numberValue(value: unknown) {
  return typeof value === "number" && Number.isFinite(value) ? value : 0
}

function parseAdsbLolFlight(aircraft: AdsbLolAircraft, now: number): Flight | null {
  const icao24 = typeof aircraft.hex === "string" ? aircraft.hex : ""
  const latitude = typeof aircraft.lat === "number" ? aircraft.lat : null
  const longitude = typeof aircraft.lon === "number" ? aircraft.lon : null

  if (!icao24 || latitude === null || longitude === null || !isInsideGeofence(latitude, longitude)) {
    return null
  }

  const callsign = typeof aircraft.flight === "string" ? aircraft.flight.trim() || "N/A" : "N/A"
  const onGround = aircraft.alt_baro === "ground"
  const baroAltitude = typeof aircraft.alt_baro === "number" ? aircraft.alt_baro : 0
  const geometricAltitude = numberValue(aircraft.alt_geom)
  const lastSeenSeconds = numberValue(aircraft.seen)
  const observedAt = Math.max(0, now - Math.round(lastSeenSeconds))

  return {
    icao24,
    callsign,
    // adsb.lol provides aircraft telemetry but not a reliable aircraft-country field.
    origin_country: "Unknown",
    time_position: observedAt,
    last_contact: observedAt,
    longitude,
    latitude,
    geo_altitude: geometricAltitude || baroAltitude,
    on_ground: onGround,
    velocity: numberValue(aircraft.gs) * KNOTS_TO_KMH,
    true_track: numberValue(aircraft.track) || numberValue(aircraft.true_heading),
    vertical_rate: numberValue(aircraft.baro_rate) * FEET_PER_MINUTE_TO_METERS_PER_SECOND,
    sensors: [],
    baro_altitude: baroAltitude,
    squawk: typeof aircraft.squawk === "string" ? aircraft.squawk : "",
    spi: false,
    position_source: 0,
    airline: getAirlineName(callsign),
    origin: "N/A",
    destination: "N/A",
    model: typeof aircraft.t === "string" ? aircraft.t : "N/A",
  }
}

function getAdsbLolUrl(geofence: ReturnType<typeof getGeofence>) {
  const latitude = (geofence.lamin + geofence.lamax) / 2
  const longitude = (geofence.lomin + geofence.lomax) / 2
  const latitudeDistanceNm = Math.abs(geofence.lamax - geofence.lamin) * 30
  const longitudeDistanceNm =
    Math.abs(geofence.lomax - geofence.lomin) * 30 * Math.cos((latitude * Math.PI) / 180)
  // A small buffer includes every corner of the rectangular geofence; exact filtering happens above.
  const radiusNm = Math.max(1, Math.ceil(Math.hypot(latitudeDistanceNm, longitudeDistanceNm) + 0.25))

  return `https://api.adsb.lol/v2/point/${latitude}/${longitude}/${radiusNm}`
}

function jsonResponse(payload: CachedPayload, provider: FlightProvider, cacheControl = "public, s-maxage=45, stale-while-revalidate=30") {
  return NextResponse.json(payload, {
    headers: {
      "Cache-Control": cacheControl,
      "X-Flight-Provider": provider,
    },
  })
}

export async function GET() {
  if (stateCache && stateCache.expiresAt > Date.now()) {
    return jsonResponse(stateCache.payload, stateCache.provider)
  }

  try {
    const geofence = getGeofence()
    const accessToken = await getAccessToken()
    const query = new URLSearchParams(
      Object.entries(geofence).map(([key, value]) => [key, String(value)]),
    )
    const response = await fetchOpenSkyStates(
      `https://opensky-network.org/api/states/all?${query}`,
      accessToken,
    )

    if (!response.ok) {
      throw new Error(`OpenSky state request failed (${response.status})`)
    }

    const data = (await response.json()) as { states?: unknown[][] }
    const flights = Array.isArray(data.states)
      ? data.states.map(parseOpenSkyFlight).filter((flight): flight is Flight => flight !== null)
      : []
    const payload = { flights, updatedAt: new Date().toISOString() }

    stateCache = {
      payload,
      expiresAt: Date.now() + STATE_CACHE_MS,
      provider: "opensky",
    }

    return jsonResponse(payload, "opensky")
  } catch (openSkyError) {
    console.warn("OpenSky live-flight request failed; trying adsb.lol", openSkyError)

    try {
      const response = await fetchAdsbLolStates(getAdsbLolUrl(getGeofence()))
      if (!response.ok) {
        throw new Error(`adsb.lol request failed (${response.status})`)
      }

      const data = (await response.json()) as { ac?: AdsbLolAircraft[]; now?: number }
      const now = typeof data.now === "number" ? Math.round(data.now / 1_000) : Math.round(Date.now() / 1_000)
      const flights = Array.isArray(data.ac)
        ? data.ac.map((aircraft) => parseAdsbLolFlight(aircraft, now)).filter((flight): flight is Flight => flight !== null)
        : []
      const payload = { flights, updatedAt: new Date().toISOString() }

      stateCache = {
        payload,
        expiresAt: Date.now() + STATE_CACHE_MS,
        provider: "adsb-lol",
      }

      return jsonResponse(payload, "adsb-lol")
    } catch (adsbLolError) {
      console.error("Live-flight fallback request failed", { openSkyError, adsbLolError })
    }

    // A temporary upstream failure should not empty an otherwise live dashboard.
    if (stateCache && stateCache.expiresAt + STALE_CACHE_MS > Date.now()) {
      return jsonResponse(stateCache.payload, stateCache.provider, "public, s-maxage=30, stale-while-revalidate=30")
    }

    return NextResponse.json({ error: "Live flight data is temporarily unavailable." }, { status: 502 })
  }
}
