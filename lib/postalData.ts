import { supabase, type PostalCodeRow } from '@/lib/supabase';
import { slugify } from '@/lib/slug';

export interface PostalEntry {
  country_code: string;
  postal_code: string;
  places: PostalCodeRow[];
}

export interface PinSummary {
  postal_code: string;
  placeCount: number;
  primaryPlace: string;
}

export interface StateStats {
  state_name: string;
  district_count: number;
  pin_count: number;
  place_count: number;
}

export interface DistrictStats {
  district_name: string;
  pin_count: number;
  place_count: number;
}

/**
 * Fetch a specific postal entry dynamically from Supabase.
 */
export async function getPostalEntry(
  countryCode: string,
  postalCode: string
): Promise<PostalEntry | undefined> {
  const cc = countryCode.toUpperCase();
  const pc = decodeURIComponent(postalCode).toUpperCase();
  
  const { data, error } = await supabase
    .from('postal_codes')
    .select('country_code, postal_code, place_name, admin_name1, admin_name2, admin_name3, lat, lng')
    .eq('country_code', cc)
    .eq('postal_code', pc)
    .order('place_name', { ascending: true });
    
  if (error || !data || data.length === 0) {
    return undefined;
  }
  
  return {
    country_code: cc,
    postal_code: pc,
    places: data,
  };
}

/**
 * Fetch stats for all states in a country dynamically.
 */
export async function getStateStatsForCountry(countryCode: string): Promise<StateStats[]> {
  const cc = countryCode.toUpperCase();
  const { data, error } = await supabase
    .from('state_stats')
    .select('state_name, district_count, pin_count, place_count')
    .eq('country_code', cc)
    .order('state_name', { ascending: true });
    
  if (error) {
    console.error(`[postalData] Error fetching state stats for ${cc}:`, error.message);
    return [];
  }
  return data || [];
}

/**
 * Find a state in a country by its URL slug.
 */
export async function getStateBySlug(countryCode: string, stateSlug: string): Promise<StateStats | undefined> {
  const states = await getStateStatsForCountry(countryCode);
  return states.find((s) => slugify(s.state_name) === stateSlug);
}

/**
 * Fetch stats for all districts in a state dynamically.
 */
export async function getDistrictStatsForState(
  countryCode: string,
  stateName: string
): Promise<DistrictStats[]> {
  const cc = countryCode.toUpperCase();
  const { data, error } = await supabase
    .from('district_stats')
    .select('district_name, pin_count, place_count')
    .eq('country_code', cc)
    .eq('state_name', stateName)
    .order('district_name', { ascending: true });
    
  if (error) {
    console.error(`[postalData] Error fetching district stats for ${cc}/${stateName}:`, error.message);
    return [];
  }
  return data || [];
}

/**
 * Find a district in a state by its URL slug.
 */
export async function getDistrictBySlug(
  countryCode: string,
  stateName: string,
  districtSlug: string
): Promise<DistrictStats | undefined> {
  const districts = await getDistrictStatsForState(countryCode, stateName);
  return districts.find((d) => slugify(d.district_name) === districtSlug);
}

/**
 * Fetch all PINs and primary place details for a district.
 */
export async function getPinsForDistrict(
  countryCode: string,
  stateName: string,
  districtName: string
): Promise<PinSummary[]> {
  const cc = countryCode.toUpperCase();
  const { data, error } = await supabase
    .from('postal_codes')
    .select('postal_code, place_name')
    .eq('country_code', cc)
    .eq('admin_name1', stateName)
    .eq('admin_name2', districtName)
    .order('postal_code', { ascending: true });
    
  if (error || !data) {
    console.error(`[postalData] Error fetching PINs for ${cc}/${stateName}/${districtName}:`, error?.message);
    return [];
  }
  
  // Aggregate places by PIN code in memory
  const pinsMap = new Map<string, PinSummary>();
  for (const row of data) {
    const key = row.postal_code;
    const existing = pinsMap.get(key);
    if (existing) {
      existing.placeCount += 1;
    } else {
      pinsMap.set(key, {
        postal_code: row.postal_code,
        placeCount: 1,
        primaryPlace: row.place_name ?? row.postal_code,
      });
    }
  }
  
  return [...pinsMap.values()].sort((a, b) =>
    a.postal_code.localeCompare(b.postal_code, 'en', { numeric: true })
  );
}

/** English country name from ISO code, e.g. 'IN' -> 'India'. */
export function countryName(code: string): string {
  try {
    return (
      new Intl.DisplayNames(['en'], { type: 'region' }).of(
        code.toUpperCase()
      ) ?? code.toUpperCase()
    );
  } catch {
    return code.toUpperCase();
  }
}
