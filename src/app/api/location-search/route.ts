import { NextRequest, NextResponse } from "next/server";

interface LocationSuggestion {
  displayName: string;
  locality: string;
  latitude: number;
  longitude: number;
}

// Cache Mappls token in memory (server-side only)
let mapplsToken: string | null = null;
let mapplsTokenExpiry = 0;

async function getMapplsToken(): Promise<string | null> {
  const clientId = process.env.MAPPLS_CLIENT_ID;
  const clientSecret = process.env.MAPPLS_CLIENT_SECRET;
  if (!clientId || !clientSecret) return null;

  // Reuse cached token if still valid (with 60s buffer)
  if (mapplsToken && Date.now() < mapplsTokenExpiry - 60000) {
    return mapplsToken;
  }

  try {
    const res = await fetch("https://outpost.mappls.com/api/security/oauth/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        grant_type: "client_credentials",
        client_id: clientId,
        client_secret: clientSecret,
      }),
    });
    if (!res.ok) return null;
    const data = await res.json();
    mapplsToken = data.access_token;
    mapplsTokenExpiry = Date.now() + (data.expires_in ?? 86400) * 1000;
    return mapplsToken;
  } catch {
    return null;
  }
}

async function searchNominatim(query: string): Promise<LocationSuggestion[]> {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query + ", India")}&format=json&addressdetails=1&limit=5`,
      {
        headers: {
          "Accept-Language": "en",
          "User-Agent": "kaamdha.com/1.0",
        },
      }
    );
    if (!res.ok) return [];
    const data = await res.json();
    return data.map((item: Record<string, unknown>) => {
      const addr = item.address as Record<string, string> | undefined;
      const locality =
        addr?.suburb ||
        addr?.neighbourhood ||
        addr?.village ||
        addr?.town ||
        addr?.city_district ||
        addr?.city ||
        (item.display_name as string).split(",")[0];
      return {
        displayName: item.display_name as string,
        locality,
        latitude: parseFloat(item.lat as string),
        longitude: parseFloat(item.lon as string),
      };
    });
  } catch {
    return [];
  }
}

async function searchMappls(query: string): Promise<LocationSuggestion[]> {
  const token = await getMapplsToken();
  if (!token) return [];

  try {
    // Use autosuggest API with Gurgaon as bias location
    const res = await fetch(
      `https://atlas.mappls.com/api/places/search/json?query=${encodeURIComponent(query)}&region=IND&location=28.4595,77.0266&limit=5`,
      {
        headers: { Authorization: `bearer ${token}` },
      }
    );
    if (!res.ok) return [];
    const data = await res.json();
    const places: Record<string, unknown>[] = data.suggestedLocations ?? [];

    // Prioritize LOCALITY/SUBLOCALITY results, then include others
    return places.map((item) => {
      const placeName = (item.placeName as string) || "";
      const placeAddress = (item.placeAddress as string) || "";
      const type = (item.type as string) || "";

      // For locality types, use placeName directly
      // For POIs/others, use placeName but show address for context
      const locality = (type === "LOCALITY" || type === "SUBLOCALITY"
        ? placeName
        : placeName.split(",")[0]) || placeAddress.split(",")[0] || "";

      const displayName = placeAddress
        ? `${placeName}, ${placeAddress}`
        : placeName;

      return {
        displayName,
        locality,
        latitude: 0,
        longitude: 0,
      };
    });
  } catch {
    return [];
  }
}

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get("q")?.trim();
  if (!q || q.length < 2) {
    return NextResponse.json([]);
  }

  // Try Nominatim first
  const nominatimResults = await searchNominatim(q);
  if (nominatimResults.length > 0) {
    return NextResponse.json(nominatimResults);
  }

  // Fall back to Mappls
  const mapplsResults = await searchMappls(q);
  return NextResponse.json(mapplsResults);
}
