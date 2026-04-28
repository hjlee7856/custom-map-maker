import { sampleCategories, samplePlaces, type Category, type Place, type PlaceStatus } from "@/lib/places";
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

type CategoryRow = {
  id: string;
  label: string;
};

export type PlaceMutationInput = {
  name: string;
  category: string;
  description: string;
  address: string;
  city: string;
  status: PlaceStatus;
  latitude: number;
  longitude: number;
};

export type ReportMutationInput = Omit<PlaceMutationInput, "status">;

function isStatus(value: string): value is PlaceStatus {
  return value === "published" || value === "pending" || value === "rejected";
}

function mapPlaceRow(row: PlaceRow): Place | null {
  if (!isStatus(row.status) || !row.category.trim()) {
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

function mapCategoryRow(row: CategoryRow): Category {
  return {
    id: row.id,
    label: row.label,
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

function toCategoryId(label: string) {
  const normalized = normalizeString(label, "카테고리명")
    .toLowerCase()
    .replace(/[^a-z0-9가-힣]+/g, "-")
    .replace(/^-+|-+$/g, "");

  return normalized || `category-${crypto.randomUUID().slice(0, 8)}`;
}

function toPlaceRowInput(input: PlaceMutationInput) {
  validateCoordinates(input.latitude, input.longitude);

  return {
    name: normalizeString(input.name, "장소명"),
    category: normalizeString(input.category, "카테고리"),
    description: normalizeString(input.description, "설명"),
    address: normalizeString(input.address, "주소"),
    city: normalizeString(input.city, "도시"),
    status: input.status,
    latitude: input.latitude,
    longitude: input.longitude,
  };
}

async function fetchPlaces(status?: PlaceStatus): Promise<Place[]> {
  const supabase = await createClient();

  if (!supabase) {
    const fallback = status ? samplePlaces.filter((place) => place.status === status) : samplePlaces;
    return fallback;
  }

  let query = supabase
    .from("places")
    .select("id, name, category, description, address, city, status, latitude, longitude");

  if (status) {
    query = query.eq("status", status);
  }

  const { data, error } = await query.order("name", { ascending: true });

  if (error) {
    console.error("Failed to fetch places from Supabase:", error.message);
    return status ? samplePlaces.filter((place) => place.status === status) : samplePlaces;
  }

  return (data as PlaceRow[]).map(mapPlaceRow).filter((place): place is Place => place !== null);
}

export async function getCategories(): Promise<Category[]> {
  const supabase = await createClient();

  if (!supabase) {
    return sampleCategories;
  }

  const { data, error } = await supabase.from("place_categories").select("id, label").order("label");

  if (error) {
    console.error("Failed to fetch categories from Supabase:", error.message);
    return sampleCategories;
  }

  return (data as CategoryRow[]).map(mapCategoryRow);
}

export async function getPublicPlaces() {
  return fetchPlaces("published");
}

export async function getAdminPlaces() {
  return fetchPlaces();
}

export async function getPlaces() {
  return getPublicPlaces();
}

export async function createCategory(label: string) {
  const supabase = await createClient();

  if (!supabase) {
    throw new Error("Supabase 설정이 없습니다.");
  }

  const normalizedLabel = normalizeString(label, "카테고리명");
  const payload = {
    id: toCategoryId(normalizedLabel),
    label: normalizedLabel,
  };

  const { error } = await supabase.from("place_categories").insert(payload);

  if (error) {
    throw new Error(error.message);
  }
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

export async function createReport(input: ReportMutationInput) {
  await createPlace({
    ...input,
    status: "pending",
  });
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

export async function updatePlaceStatus(id: string, status: PlaceStatus) {
  const supabase = await createClient();

  if (!supabase) {
    throw new Error("Supabase 설정이 없습니다.");
  }

  const { error } = await supabase.from("places").update({ status }).eq("id", id);

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
