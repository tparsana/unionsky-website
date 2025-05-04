import type { Flight } from "./types"

// OpenSky API coordinates (from your Python script)
const LAMIN = 33.421699
const LAMAX = 33.458656
const LOMIN = -111.988786
const LOMAX = -111.917328

// Airline codes mapping (from your Python script)
const AIRLINE_CODES: Record<string, string> = {
  SWA: "Southwest Airlines",
  AAL: "American Airlines",
  DAL: "Delta Air Lines",
  UAL: "United Airlines",
  ASA: "Alaska Airlines",
  FFT: "Frontier Airlines",
  JBU: "JetBlue Airways",
  WN: "Spirit Airlines",
  HVN: "Hawaiian Airlines",
  MCO: "Envoy Air",
  SKW: "SkyWest Airlines",
  EJA: "NetJets",
  MXY: "Breeze Airways",
  WJA: "WestJet Airline",
  CFS: "FedEx",
}

// Get airline name from callsign
function getAirlineName(callsign: string): string {
  if (callsign && callsign.length >= 3) {
    const prefix = callsign.substring(0, 3).toUpperCase()
    return AIRLINE_CODES[prefix] || "Unknown Airline"
  }
  return "Unknown Airline"
}

// Strip leading K from airport codes
function stripLeadingK(airportCode: string): string {
  if (airportCode !== "N/A" && airportCode.length === 4 && airportCode.startsWith("K")) {
    return airportCode.substring(1)
  }
  return airportCode
}

// Fetch flight details for a specific aircraft
async function getFlightDetails(icao24: string): Promise<{ origin: string; destination: string }> {
  try {
    const now = Math.floor(Date.now() / 1000)
    const begin = now - 10 * 3600 // 10 hours ago
    const end = now + 2 * 3600 // 2 hours ahead

    const url = `https://opensky-network.org/api/flights/aircraft?icao24=${icao24}&begin=${begin}&end=${end}`
    const response = await fetch(url)

    if (!response.ok) {
      return { origin: "N/A", destination: "N/A" }
    }

    const data = await response.json()

    if (!data || !Array.isArray(data) || data.length === 0) {
      return { origin: "N/A", destination: "N/A" }
    }

    // Sort flights by firstSeen (descending) to get the most recent
    data.sort((a, b) => b.firstSeen - a.firstSeen)
    const latestFlight = data[0]

    const origin = latestFlight.estDepartureAirport || "N/A"
    const destination = latestFlight.estArrivalAirport || "N/A"

    return {
      origin: stripLeadingK(origin),
      destination: stripLeadingK(destination),
    }
  } catch (error) {
    console.error("Error fetching flight details:", error)
    return { origin: "N/A", destination: "N/A" }
  }
}

// Fetch flights from OpenSky API
export async function fetchFlights(): Promise<Flight[]> {
  try {
    // Fetch states from OpenSky API
    const url = `https://opensky-network.org/api/states/all?lamin=${LAMIN}&lamax=${LAMAX}&lomin=${LOMIN}&lomax=${LOMAX}`
    const response = await fetch(url)

    if (!response.ok) {
      throw new Error(`OpenSky API error: ${response.status}`)
    }

    const data = await response.json()

    if (!data.states || !Array.isArray(data.states)) {
      return []
    }

    // Transform API response to Flight objects
    const flights: Flight[] = await Promise.all(
      data.states.map(async (state: any[]) => {
        const icao24 = state[0] || ""
        const callsign = state[1]?.trim() || "N/A"
        const airline = getAirlineName(callsign)

        // Get real origin/destination from the API
        const { origin, destination } = await getFlightDetails(icao24)

        return {
          icao24: icao24,
          callsign: callsign,
          origin_country: state[2] || "N/A",
          time_position: state[3] || 0,
          last_contact: state[4] || 0,
          longitude: state[5] || 0,
          latitude: state[6] || 0,
          geo_altitude: state[7] || 0,
          on_ground: state[8] || false,
          velocity: state[9] || 0,
          true_track: state[10] || 0,
          vertical_rate: state[11] || 0,
          sensors: state[12] || [],
          baro_altitude: state[13] || 0,
          squawk: state[14] || "",
          spi: state[15] || false,
          position_source: state[16] || 0,
          airline: airline,
          origin: origin,
          destination: destination,
          model: "N/A", // Aircraft model not provided by OpenSky API
        }
      }),
    )

    return flights
  } catch (error) {
    console.error("Error fetching flight data:", error)
    return []
  }
}
