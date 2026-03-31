/**
 * Client-side location detection via Geolocation API.
 * Resolves GPS coordinates to a locality name using reverse geocoding.
 */

export interface LocationResult {
  latitude: number;
  longitude: number;
  locality: string | null;
  city: string | null;
}

export function detectLocation(): Promise<LocationResult> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error("Geolocation not supported"));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        const geo = await reverseGeocode(latitude, longitude);
        resolve({ latitude, longitude, locality: geo.locality, city: geo.city });
      },
      (error) => {
        reject(new Error(geolocationErrorMessage(error.code)));
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 300000 }
    );
  });
}

async function reverseGeocode(
  lat: number,
  lng: number
): Promise<{ locality: string | null; city: string | null }> {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&zoom=16&addressdetails=1`,
      { headers: { "Accept-Language": "en" } }
    );
    if (!res.ok) return { locality: null, city: null };
    const data = await res.json();
    const addr = data.address;
    const locality =
      addr?.suburb ||
      addr?.neighbourhood ||
      addr?.village ||
      addr?.town ||
      addr?.city_district ||
      addr?.city ||
      null;
    const rawCity = addr?.city_district || addr?.city || addr?.state_district || null;
    return { locality, city: resolveCityId(rawCity) };
  } catch {
    return { locality: null, city: null };
  }
}

/**
 * Maps a raw geocoded city name to our cities table ID.
 * Handles common variations from Nominatim (Gurugram, New Delhi, etc.)
 */
export function resolveCityId(rawCity: string | null | undefined): string | null {
  if (!rawCity) return null;
  const lower = rawCity.toLowerCase().trim();
  if (lower.includes("gurgaon") || lower.includes("gurugram")) return "gurgaon";
  if (lower.includes("manesar") || lower.includes("manesar")) return "manesar";
  if (lower.includes("faridabad")) return "faridabad";
  if (lower.includes("ghaziabad")) return "ghaziabad";
  if (lower.includes("greater noida")) return "greater-noida";
  if (lower.includes("noida") || lower.includes("gautam buddh") || lower.includes("gautam buddha")) return "noida";
  if (lower.includes("delhi") || lower.includes("new delhi")) return "delhi";
  return null;
}

export interface LocationSuggestion {
  displayName: string;
  locality: string;
  city: string | null;
  latitude: number;
  longitude: number;
}

export async function searchLocations(
  query: string
): Promise<LocationSuggestion[]> {
  if (query.trim().length < 2) return [];
  try {
    const res = await fetch(
      `/api/location-search?q=${encodeURIComponent(query)}`
    );
    if (!res.ok) return [];
    return await res.json();
  } catch {
    return [];
  }
}

function geolocationErrorMessage(code: number): string {
  switch (code) {
    case 1:
      return "Location permission denied";
    case 2:
      return "Location unavailable";
    case 3:
      return "Location request timed out";
    default:
      return "Could not detect location";
  }
}
