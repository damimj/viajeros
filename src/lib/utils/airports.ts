/**
 * Airport database with coordinates.
 * Based on the original TravelMap's airport data.
 * Lookup by IATA or ICAO code.
 */

export interface Airport {
  iata: string;
  icao: string;
  name: string;
  city: string;
  country: string;
  lat: number;
  lon: number;
}

const AIRPORTS: Airport[] = [
  { iata: "EZE", icao: "SAEZ", name: "Ministro Pistarini", city: "Buenos Aires", country: "AR", lat: -34.8222, lon: -58.5358 },
  { iata: "AEP", icao: "SABE", name: "Jorge Newbery", city: "Buenos Aires", country: "AR", lat: -34.5592, lon: -58.4156 },
  { iata: "GRU", icao: "SBGR", name: "Guarulhos", city: "São Paulo", country: "BR", lat: -23.4356, lon: -46.4731 },
  { iata: "GIG", icao: "SBGL", name: "Galeão", city: "Rio de Janeiro", country: "BR", lat: -22.8100, lon: -43.2506 },
  { iata: "SCL", icao: "SCEL", name: "Arturo Merino Benítez", city: "Santiago", country: "CL", lat: -33.3930, lon: -70.7858 },
  { iata: "LIM", icao: "SPJC", name: "Jorge Chávez", city: "Lima", country: "PE", lat: -12.0219, lon: -77.1143 },
  { iata: "BOG", icao: "SKBO", name: "El Dorado", city: "Bogotá", country: "CO", lat: 4.7016, lon: -74.1469 },
  { iata: "MEX", icao: "MMMX", name: "Benito Juárez", city: "Mexico City", country: "MX", lat: 19.4363, lon: -99.0721 },
  { iata: "CUN", icao: "MMUN", name: "Cancún International", city: "Cancún", country: "MX", lat: 21.0365, lon: -86.8771 },
  { iata: "MIA", icao: "KMIA", name: "Miami International", city: "Miami", country: "US", lat: 25.7959, lon: -80.2870 },
  { iata: "JFK", icao: "KJFK", name: "John F. Kennedy", city: "New York", country: "US", lat: 40.6398, lon: -73.7789 },
  { iata: "LAX", icao: "KLAX", name: "Los Angeles International", city: "Los Angeles", country: "US", lat: 33.9425, lon: -118.4081 },
  { iata: "ORD", icao: "KORD", name: "O'Hare International", city: "Chicago", country: "US", lat: 41.9742, lon: -87.9073 },
  { iata: "ATL", icao: "KATL", name: "Hartsfield-Jackson", city: "Atlanta", country: "US", lat: 33.6367, lon: -84.4281 },
  { iata: "SFO", icao: "KSFO", name: "San Francisco International", city: "San Francisco", country: "US", lat: 37.6213, lon: -122.3790 },
  { iata: "DFW", icao: "KDFW", name: "Dallas/Fort Worth", city: "Dallas", country: "US", lat: 32.8968, lon: -97.0380 },
  { iata: "LHR", icao: "EGLL", name: "Heathrow", city: "London", country: "GB", lat: 51.4700, lon: -0.4543 },
  { iata: "CDG", icao: "LFPG", name: "Charles de Gaulle", city: "Paris", country: "FR", lat: 49.0097, lon: 2.5479 },
  { iata: "FRA", icao: "EDDF", name: "Frankfurt am Main", city: "Frankfurt", country: "DE", lat: 50.0333, lon: 8.5706 },
  { iata: "AMS", icao: "EHAM", name: "Schiphol", city: "Amsterdam", country: "NL", lat: 52.3086, lon: 4.7639 },
  { iata: "MAD", icao: "LEMD", name: "Barajas", city: "Madrid", country: "ES", lat: 40.4719, lon: -3.5626 },
  { iata: "BCN", icao: "LEBL", name: "El Prat", city: "Barcelona", country: "ES", lat: 41.2971, lon: 2.0785 },
  { iata: "FCO", icao: "LIRF", name: "Fiumicino", city: "Rome", country: "IT", lat: 41.8003, lon: 12.2389 },
  { iata: "MXP", icao: "LIMC", name: "Malpensa", city: "Milan", country: "IT", lat: 45.6306, lon: 8.7281 },
  { iata: "IST", icao: "LTFM", name: "Istanbul Airport", city: "Istanbul", country: "TR", lat: 41.2753, lon: 28.7519 },
  { iata: "DXB", icao: "OMDB", name: "Dubai International", city: "Dubai", country: "AE", lat: 25.2528, lon: 55.3644 },
  { iata: "DOH", icao: "OTHH", name: "Hamad International", city: "Doha", country: "QA", lat: 25.2731, lon: 51.6081 },
  { iata: "SIN", icao: "WSSS", name: "Changi", city: "Singapore", country: "SG", lat: 1.3502, lon: 103.9944 },
  { iata: "HKG", icao: "VHHH", name: "Hong Kong International", city: "Hong Kong", country: "HK", lat: 22.3080, lon: 113.9185 },
  { iata: "NRT", icao: "RJAA", name: "Narita", city: "Tokyo", country: "JP", lat: 35.7647, lon: 140.3864 },
  { iata: "HND", icao: "RJTT", name: "Haneda", city: "Tokyo", country: "JP", lat: 35.5494, lon: 139.7798 },
  { iata: "ICN", icao: "RKSI", name: "Incheon", city: "Seoul", country: "KR", lat: 37.4602, lon: 126.4407 },
  { iata: "BKK", icao: "VTBS", name: "Suvarnabhumi", city: "Bangkok", country: "TH", lat: 13.6900, lon: 100.7501 },
  { iata: "SYD", icao: "YSSY", name: "Kingsford Smith", city: "Sydney", country: "AU", lat: -33.9461, lon: 151.1772 },
  { iata: "MEL", icao: "YMML", name: "Melbourne Airport", city: "Melbourne", country: "AU", lat: -37.6733, lon: 144.8433 },
  { iata: "YYZ", icao: "CYYZ", name: "Pearson", city: "Toronto", country: "CA", lat: 43.6772, lon: -79.6306 },
  { iata: "YVR", icao: "CYVR", name: "Vancouver International", city: "Vancouver", country: "CA", lat: 49.1947, lon: -123.1792 },
  { iata: "PTY", icao: "MPTO", name: "Tocumen International", city: "Panama City", country: "PA", lat: 9.0714, lon: -79.3835 },
  { iata: "HAV", icao: "MUHA", name: "José Martí International", city: "Havana", country: "CU", lat: 22.9892, lon: -82.4091 },
  { iata: "LIS", icao: "LPPT", name: "Lisbon Portela", city: "Lisbon", country: "PT", lat: 38.7813, lon: -9.1359 },
  { iata: "ZRH", icao: "LSZH", name: "Zürich Airport", city: "Zürich", country: "CH", lat: 47.4647, lon: 8.5492 },
  { iata: "VIE", icao: "LOWW", name: "Vienna International", city: "Vienna", country: "AT", lat: 48.1103, lon: 16.5697 },
  { iata: "PRG", icao: "LKPR", name: "Václav Havel Airport", city: "Prague", country: "CZ", lat: 50.1008, lon: 14.2600 },
  { iata: "WAW", icao: "EPWA", name: "Chopin Airport", city: "Warsaw", country: "PL", lat: 52.1657, lon: 20.9671 },
  { iata: "CPH", icao: "EKCH", name: "Copenhagen Airport", city: "Copenhagen", country: "DK", lat: 55.6180, lon: 12.6508 },
  { iata: "OSL", icao: "ENGM", name: "Oslo Gardermoen", city: "Oslo", country: "NO", lat: 60.1939, lon: 11.1004 },
  { iata: "ARN", icao: "ESSA", name: "Stockholm Arlanda", city: "Stockholm", country: "SE", lat: 59.6519, lon: 17.9186 },
  { iata: "HEL", icao: "EFHK", name: "Helsinki-Vantaa", city: "Helsinki", country: "FI", lat: 60.3172, lon: 24.9633 },
  { iata: "MUC", icao: "EDDM", name: "Munich Airport", city: "Munich", country: "DE", lat: 48.3538, lon: 11.7861 },
  { iata: "BER", icao: "EDDB", name: "Berlin Brandenburg", city: "Berlin", country: "DE", lat: 52.3667, lon: 13.5033 },
  { iata: "DUB", icao: "EIDW", name: "Dublin Airport", city: "Dublin", country: "IE", lat: 53.4213, lon: -6.2701 },
  { iata: "ATH", icao: "LGAV", name: "Athens International", city: "Athens", country: "GR", lat: 37.9364, lon: 23.9445 },
  { iata: "BRU", icao: "EBBR", name: "Brussels Airport", city: "Brussels", country: "BE", lat: 50.9014, lon: 4.4844 },
  { iata: "GVA", icao: "LSGG", name: "Geneva Airport", city: "Geneva", country: "CH", lat: 46.2381, lon: 6.1089 },
  { iata: "COR", icao: "SACO", name: "Ingeniero Taravella", city: "Córdoba", country: "AR", lat: -31.3236, lon: -64.2078 },
  { iata: "MDZ", icao: "SAME", name: "El Plumerillo", city: "Mendoza", country: "AR", lat: -32.8317, lon: -68.7929 },
  { iata: "IGR", icao: "SARI", name: "Cataratas del Iguazú", city: "Iguazú", country: "AR", lat: -25.7373, lon: -54.4734 },
  { iata: "BRC", icao: "SAZS", name: "San Carlos de Bariloche", city: "Bariloche", country: "AR", lat: -41.1512, lon: -71.1575 },
  { iata: "USH", icao: "SAWH", name: "Malvinas Argentinas", city: "Ushuaia", country: "AR", lat: -54.8433, lon: -68.2958 },
  { iata: "MVD", icao: "SUMU", name: "Carrasco International", city: "Montevideo", country: "UY", lat: -34.8384, lon: -56.0308 },
  { iata: "ASU", icao: "SGAS", name: "Silvio Pettirossi", city: "Asunción", country: "PY", lat: -25.2400, lon: -57.5192 },
  { iata: "VCP", icao: "SBKP", name: "Viracopos", city: "Campinas", country: "BR", lat: -23.0074, lon: -47.1345 },
  { iata: "CNF", icao: "SBCF", name: "Confins", city: "Belo Horizonte", country: "BR", lat: -19.6244, lon: -43.9719 },
  { iata: "SSA", icao: "SBSV", name: "Deputado Luis Eduardo", city: "Salvador", country: "BR", lat: -12.9086, lon: -38.3225 },
  { iata: "BSB", icao: "SBBR", name: "Presidente Juscelino", city: "Brasília", country: "BR", lat: -15.8711, lon: -47.9186 },
  { iata: "CGH", icao: "SBSP", name: "Congonhas", city: "São Paulo", country: "BR", lat: -23.6261, lon: -46.6564 },
  { iata: "SDU", icao: "SBRJ", name: "Santos Dumont", city: "Rio de Janeiro", country: "BR", lat: -22.9105, lon: -43.1631 },
  { iata: "FLN", icao: "SBFL", name: "Hercílio Luz", city: "Florianópolis", country: "BR", lat: -27.6703, lon: -48.5525 },
  { iata: "POA", icao: "SBPA", name: "Salgado Filho", city: "Porto Alegre", country: "BR", lat: -29.9944, lon: -51.1714 },
  { iata: "PEK", icao: "ZBAA", name: "Capital International", city: "Beijing", country: "CN", lat: 40.0799, lon: 116.6031 },
  { iata: "PVG", icao: "ZSPD", name: "Pudong International", city: "Shanghai", country: "CN", lat: 31.1443, lon: 121.8083 },
  { iata: "DEL", icao: "VIDP", name: "Indira Gandhi", city: "New Delhi", country: "IN", lat: 28.5562, lon: 77.1000 },
  { iata: "BOM", icao: "VABB", name: "Chhatrapati Shivaji", city: "Mumbai", country: "IN", lat: 19.0896, lon: 72.8656 },
  { iata: "JNB", icao: "FAOR", name: "O.R. Tambo", city: "Johannesburg", country: "ZA", lat: -26.1392, lon: 28.2460 },
  { iata: "CAI", icao: "HECA", name: "Cairo International", city: "Cairo", country: "EG", lat: 30.1219, lon: 31.4056 },
];

const INDEX_BY_IATA = new Map<string, Airport>();
const INDEX_BY_ICAO = new Map<string, Airport>();

for (const ap of AIRPORTS) {
  INDEX_BY_IATA.set(ap.iata.toUpperCase(), ap);
  INDEX_BY_ICAO.set(ap.icao.toUpperCase(), ap);
}

/**
 * Look up an airport by IATA or ICAO code.
 */
export function findAirport(code: string): Airport | undefined {
  const upper = code.toUpperCase().trim();
  return INDEX_BY_IATA.get(upper) ?? INDEX_BY_ICAO.get(upper);
}

export { AIRPORTS };
