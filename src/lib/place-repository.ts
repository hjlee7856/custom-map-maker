import { samplePlaces, type CategoryId, type Place } from "@/lib/places";
import { createClient } from "@/lib/supabase/server";

type PlaceRow = {
  id: string;
  name: string;
  category: string;
  description: string;
  address: string;
  city: string;
  status: string;
  latitude: number;
  longitude: number;
};

export type PlaceMutationInput = {
  name: string;
  category: CategoryId;
  description: string;
  address: string;
  city: string;
  status: Place["status"];
  latitude: number;
  longitude: number;
};

function isCategory(value: string): value is CategoryId {
  return value === "food" || value === "report" || value === "parking";
}

function isStatus(value: string): value is Place["status"] {
  return value === "published" || value === "pending";
}

function mapPlaceRow(row: PlaceRow): Place | null {
  if (!isCategory(row.category) || !isStatus(row.status)) {
    return null;
  }

  return {
    id: row.id,
    name: row.name,
    category: row.category,
    description: row.description,
    address: row.address,
    city: row.city,
    status: row.status,
    coordinates: [row.longitude, row.latitude],
  };
}

function normalizeString(value: string, fieldName: string) {
  const normalized = value.trim();

  if (!normalized) {
    throw new Error(`${fieldName} 값을 입력해주세요.`);
  }

  return normalized;
}

function validateCoordinates(latitude: number, longitude: number) {
  if (!Number.isFinite(latitude) || latitude < -90 || latitude > 90) {
    throw new Error("위도 값을 확인해주세요.");
  }

  if (!Number.isFinite(longitude) || longitude < -180 || longitude > 180) {
    throw new Error("경도 값을 확인해주세요.");
  }
}

function toPlaceRowInput(input: PlaceMutationInput) {
  validateCoordinates(input.latitude, input.longitude);

  return {
    name: normalizeString(input.name, "장소명"),
    category: input.category,
    description: normalizeString(input.description, "설명"),
    address: normalizeString(input.address, "주소"),
    city: normalizeString(input.city, "도시"),
    status: input.status,
    latitude: input.latitude,
    longitude: input.longitude,
  };
}

export async function getPlaces(): Promise<Place[]> {
  const supabase = await createClient();

  if (!supabase) {
    return samplePlaces;
  }

  const { data, error } = await supabase
    .from("places")
    .select("id, name, category, description, address, city, status, latitude, longitude")
    .order("name", { ascending: true });

  if (error) {
    console.error("Failed to fetch places from Supabase:", error.message);
    return samplePlaces;
  }

  const places = (data as PlaceRow[]).map(mapPlaceRow).filter((place): place is Place => place !== null);

  return places;
}

export async function createPlace(input: PlaceMutationInput) {
  const supabase = await createClient();

  if (!supabase) {
    throw new Error("Supabase 설정이 없습니다.");
  }

  const payload = {
    id: crypto.randomUUID(),
    ...toPlaceRowInput(input),
  };

  const { error } = await supabase.from("places").insert(payload);

  if (error) {
    throw new Error(error.message);
  }
}

export async function updatePlace(id: string, input: PlaceMutationInput) {
  const supabase = await createClient();

  if (!supabase) {
    throw new Error("Supabase 설정이 없습니다.");
  }

  const { error } = await supabase.from("places").update(toPlaceRowInput(input)).eq("id", id);

  if (error) {
    throw new Error(error.message);
  }
}

export async function deletePlace(id: string) {
  const supabase = await createClient();

  if (!supabase) {
    throw new Error("Supabase 설정이 없습니다.");
  }

  const { error } = await supabase.from("places").delete().eq("id", id);

  if (error) {
    throw new Error(error.message);
  }
}
