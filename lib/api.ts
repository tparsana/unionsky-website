import type { Flight } from "./types"

// OpenSky API bounding box coordinates
const LAMIN = 33.421699
const LAMAX = 33.458656
const LOMIN = -111.988786
const LOMAX = -111.917328

// Airline codes mapping (from Python script, expanded)
const AIRLINE_CODES: Record<string, string> = {
  SWA: "Southwest Airlines",
  ATN: "Amazon Air",
  AAL: "American Airlines",
  DAL: "Delta Air Lines",
  UAL: "United Airlines",
  ASA: "Alaska Airlines",
  FFT: "Frontier Airlines",
  JBU: "JetBlue Airways",
  NKS: "Spirit Airlines",
  HAL: "Hawaiian Airlines",
  ENY: "Envoy Air",
  SKW: "SkyWest Airlines",
  EJA: "NetJets",
  BSK: "Breeze Airways",
  WJA: "WestJet Airlines",
  FDX: "FedEx Express",
  UPS: "UPS Airlines",
  GTI: "Atlas Air",
  SCX: "Sun Country Airlines",
  AAY: "Allegiant Air",
  VRD: "Virgin America",
  ACA: "Air Canada",
  AMX: "Aeromexico",
  BAW: "British Airways",
  DLH: "Lufthansa",
  AFR: "Air France",
  KLM: "KLM Royal Dutch Airlines",
  UAE: "Emirates",
  ETH: "Ethiopian Airlines",
  QTR: "Qatar Airways",
  CPA: "Cathay Pacific",
  JAL: "Japan Airlines",
  ANA: "All Nippon Airways",
  SIA: "Singapore Airlines",
  QFA: "Qantas",
  VOI: "Volaris",
  VIV: "VivaAerobus",
  CXP: "Compass Airlines",
  RPA: "Republic Airways",
  PDT: "Piedmont Airlines",
  PSA: "PSA Airlines",
  AWI: "Air Wisconsin",
  ASQ: "ExpressJet",
  JSX: "JSX",
  GLO: "Gol Transportes Aereos",
  TAM: "LATAM Brasil",
  AVA: "Avianca",
  CMP: "Copa Airlines",
  IBE: "Iberia",
  AZA: "Alitalia",
  CSN: "China Southern Airlines",
  CES: "China Eastern Airlines",
  CCA: "Air China",
  THY: "Turkish Airlines",
  KAL: "Korean Air",
  ASL: "Air Serbia",
  MXY: "Breeze Airways",
  MCO: "Envoy Air",
}

// Airport codes mapping
const AIRPORT_CODES: Record<string, string> = {
  ATL: "Atlanta",
  LAX: "Los Angeles",
  ORD: "Chicago",
  DFW: "Dallas/Fort Worth",
  DEN: "Denver",
  JFK: "New York JFK",
  SFO: "San Francisco",
  SEA: "Seattle",
  LAS: "Las Vegas",
  MCO: "Orlando",
  EWR: "Newark",
  MIA: "Miami",
  PHX: "Phoenix",
  IAH: "Houston",
  BOS: "Boston",
  MSP: "Minneapolis",
  DTW: "Detroit",
  FLL: "Fort Lauderdale",
  CLT: "Charlotte",
  LGA: "New York LaGuardia",
  BWI: "Baltimore",
  SLC: "Salt Lake City",
  DCA: "Washington DC",
  IAD: "Washington Dulles",
  SAN: "San Diego",
  TPA: "Tampa",
  PDX: "Portland",
  PHL: "Philadelphia",
  BNA: "Nashville",
  AUS: "Austin",
  STL: "St. Louis",
  MCI: "Kansas City",
  OAK: "Oakland",
  SJC: "San Jose",
  SMF: "Sacramento",
  SNA: "Santa Ana",
  RDU: "Raleigh/Durham",
  CLE: "Cleveland",
  MKE: "Milwaukee",
  PIT: "Pittsburgh",
  SJU: "San Juan",
  RSW: "Fort Myers",
  IND: "Indianapolis",
  CVG: "Cincinnati",
  CMH: "Columbus",
  JAX: "Jacksonville",
  BUF: "Buffalo",
  ABQ: "Albuquerque",
  OMA: "Omaha",
  OKC: "Oklahoma City",
  TUL: "Tulsa",
  BOI: "Boise",
  ONT: "Ontario",
  RNO: "Reno",
  TUS: "Tucson",
  PVD: "Providence",
  MEM: "Memphis",
  MSY: "New Orleans",
  SAT: "San Antonio",
  MDW: "Chicago Midway",
  BDL: "Hartford",
  DAL: "Dallas Love Field",
  HOU: "Houston Hobby",
  LHR: "London Heathrow",
  CDG: "Paris",
  FRA: "Frankfurt",
  AMS: "Amsterdam",
  MAD: "Madrid",
  FCO: "Rome",
  YYZ: "Toronto",
  MEX: "Mexico City",
  YVR: "Vancouver",
  NRT: "Tokyo Narita",
  HND: "Tokyo Haneda",
  ICN: "Seoul",
  PEK: "Beijing",
  PVG: "Shanghai",
  HKG: "Hong Kong",
  SIN: "Singapore",
  BKK: "Bangkok",
  DXB: "Dubai",
  DOH: "Doha",
  SYD: "Sydney",
  MEL: "Melbourne",
  AKL: "Auckland",
  GRU: "Sao Paulo",
  GIG: "Rio de Janeiro",
  EZE: "Buenos Aires",
  SCL: "Santiago",
  LIM: "Lima",
  BOG: "Bogota",
  JNB: "Johannesburg",
  CPT: "Cape Town",
  CAI: "Cairo",
  IST: "Istanbul",
  DEL: "Delhi",
  BOM: "Mumbai",
  YUL: "Montreal",
  YYC: "Calgary",
  YOW: "Ottawa",
  YHZ: "Halifax",
  YEG: "Edmonton",
  CUN: "Cancun",
  GDL: "Guadalajara",
  MTY: "Monterrey",
}

/**
 * Derive the airline name from the first 3 letters of callsign.
 * Matches Python: get_airline_name(callsign)
 */
export function getAirlineName(callsign: string): string {
  if (callsign && callsign.length >= 3) {
    const prefix = callsign.substring(0, 3).toUpperCase()
    return AIRLINE_CODES[prefix] || "Unknown Airline"
  }
  return "Unknown Airline"
}

/**
 * If the airport code is exactly 4 characters long and starts with 'K',
 * remove the first character (e.g., 'KSAT' -> 'SAT').
 * Otherwise, return it as is.
 * Matches Python: strip_leading_k(airport_code)
 */
function stripLeadingK(airportCode: string): string {
  if (airportCode !== "N/A" && airportCode.length === 4 && airportCode.startsWith("K")) {
    return airportCode.substring(1)
  }
  return airportCode
}

/**
 * Get a human-readable airport name with code.
 * Returns "SNA - Santa Ana" format, or just the code if unknown.
 */
function formatAirport(rawCode: string): string {
  if (!rawCode || rawCode === "N/A") return "N/A"
  const code = stripLeadingK(rawCode)
  const name = AIRPORT_CODES[code]
  return name ? `${code} - ${name}` : code
}

/**
 * Retrieve flight data from the last 10 hours for this aircraft.
 * Sort by 'firstSeen' descending so we pick the most recent flight.
 * Return (origin, destination) or ("N/A","N/A") if none found.
 * Matches Python: get_flight_details(icao24)
 */
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

    // Sort flights by firstSeen descending to get the most recent flight
    data.sort((a: { firstSeen: number }, b: { firstSeen: number }) => b.firstSeen - a.firstSeen)
    const latestFlight = data[0]

    // Extract raw airport codes
    const rawOrigin = latestFlight.estDepartureAirport || "N/A"
    const rawDestination = latestFlight.estArrivalAirport || "N/A"

    // Strip leading K and format with name
    return {
      origin: formatAirport(rawOrigin),
      destination: formatAirport(rawDestination),
    }
  } catch {
    return { origin: "N/A", destination: "N/A" }
  }
}

/**
 * Browser clients only call the app's server route. This avoids OpenSky's CORS
 * restriction and keeps credentials and provider failures off the client.
 */
export async function fetchFlights(): Promise<Flight[]> {
  const response = await fetch("/api/flights", { cache: "no-store" })
  const payload = (await response.json().catch(() => null)) as
    | { flights?: Flight[]; error?: string }
    | null

  if (!response.ok) {
    throw new Error(payload?.error || `Flight data request failed (${response.status})`)
  }

  if (!Array.isArray(payload?.flights)) {
    throw new Error("Flight data response was invalid")
  }

  return payload.flights
}
