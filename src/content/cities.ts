/**
 * Cities for the setup question "Which city are you in?". Used only to know when the
 * rains come, which changes copy and the rain on the map. Months are 1 (January) to 12.
 *
 * Most of India gets the southwest monsoon, June to September. Tamil Nadu and the
 * south-east coast get most of their rain from the northeast monsoon, October to
 * December. A few cities straddle both; they get the months with the most rain.
 */
export interface City {
  id: string;
  name: string;
  state: string;
  monsoon: number[];
}

const SW = [6, 7, 8, 9];
const NE = [10, 11, 12];

export const CITIES: City[] = [
  { id: "mumbai", name: "Mumbai", state: "Maharashtra", monsoon: SW },
  { id: "delhi", name: "Delhi", state: "Delhi", monsoon: [7, 8, 9] },
  { id: "bengaluru", name: "Bengaluru", state: "Karnataka", monsoon: [6, 7, 8, 9, 10] },
  { id: "hyderabad", name: "Hyderabad", state: "Telangana", monsoon: SW },
  { id: "chennai", name: "Chennai", state: "Tamil Nadu", monsoon: NE },
  { id: "kolkata", name: "Kolkata", state: "West Bengal", monsoon: SW },
  { id: "pune", name: "Pune", state: "Maharashtra", monsoon: SW },
  { id: "ahmedabad", name: "Ahmedabad", state: "Gujarat", monsoon: [7, 8, 9] },
  { id: "gurugram", name: "Gurugram", state: "Haryana", monsoon: [7, 8, 9] },
  { id: "noida", name: "Noida", state: "Uttar Pradesh", monsoon: [7, 8, 9] },
  { id: "jaipur", name: "Jaipur", state: "Rajasthan", monsoon: [7, 8, 9] },
  { id: "lucknow", name: "Lucknow", state: "Uttar Pradesh", monsoon: [7, 8, 9] },
  { id: "chandigarh", name: "Chandigarh", state: "Chandigarh", monsoon: [7, 8, 9] },
  { id: "kochi", name: "Kochi", state: "Kerala", monsoon: SW },
  { id: "thiruvananthapuram", name: "Thiruvananthapuram", state: "Kerala", monsoon: SW },
  { id: "goa", name: "Goa", state: "Goa", monsoon: SW },
  { id: "surat", name: "Surat", state: "Gujarat", monsoon: SW },
  { id: "indore", name: "Indore", state: "Madhya Pradesh", monsoon: SW },
  { id: "bhopal", name: "Bhopal", state: "Madhya Pradesh", monsoon: SW },
  { id: "nagpur", name: "Nagpur", state: "Maharashtra", monsoon: SW },
  { id: "patna", name: "Patna", state: "Bihar", monsoon: SW },
  { id: "bhubaneswar", name: "Bhubaneswar", state: "Odisha", monsoon: SW },
  { id: "guwahati", name: "Guwahati", state: "Assam", monsoon: SW },
  { id: "visakhapatnam", name: "Visakhapatnam", state: "Andhra Pradesh", monsoon: [6, 7, 8, 9, 10] },
  { id: "coimbatore", name: "Coimbatore", state: "Tamil Nadu", monsoon: [10, 11] },
  { id: "madurai", name: "Madurai", state: "Tamil Nadu", monsoon: NE },
  { id: "puducherry", name: "Puducherry", state: "Puducherry", monsoon: NE },
  { id: "mysuru", name: "Mysuru", state: "Karnataka", monsoon: [6, 7, 8, 9, 10] },
  { id: "dehradun", name: "Dehradun", state: "Uttarakhand", monsoon: SW },
  { id: "srinagar", name: "Srinagar", state: "Jammu and Kashmir", monsoon: [] },
];

/** When someone skips the city, or says "somewhere else" with rains: most of India. */
export const DEFAULT_MONSOON = SW;

export const cityById = (id: string | null | undefined) => (id ? CITIES.find((c) => c.id === id) : undefined);

/** Case- and accent-insensitive search on name and state, best matches first. */
export function searchCities(query: string, limit = 8): City[] {
  const q = query.trim().toLowerCase();
  if (!q) return CITIES.slice(0, limit);
  const starts = CITIES.filter((c) => c.name.toLowerCase().startsWith(q));
  const contains = CITIES.filter((c) => !starts.includes(c) && `${c.name} ${c.state}`.toLowerCase().includes(q));
  return [...starts, ...contains].slice(0, limit);
}
