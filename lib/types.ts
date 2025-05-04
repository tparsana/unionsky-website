export interface Flight {
  icao24: string
  callsign: string
  origin_country: string
  time_position: number
  last_contact: number
  longitude: number
  latitude: number
  geo_altitude: number
  on_ground: boolean
  velocity: number
  true_track: number
  vertical_rate: number
  sensors: number[]
  baro_altitude: number
  squawk: string
  spi: boolean
  position_source: number
  airline: string
  origin: string
  destination: string
  model: string
}

export interface Airline {
  name: string
  count: number
}

export interface HistoryEntry {
  timestamp: string
  flights: number
  airlines: string[]
}

export interface FlightStats {
  totalFlights: number
  avgAltitude: number
  avgSpeed: number
  countries: number
  airlines: Airline[]
  arrivals: number
  departures: number
  history: HistoryEntry[]
}
