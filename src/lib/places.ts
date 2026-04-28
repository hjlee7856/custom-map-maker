export type PlaceStatus = "published" | "pending" | "rejected";

export type Category = {
  id: string;
  label: string;
};

export type Place = {
  id: string;
  name: string;
  category: string;
  description: string;
  address: string;
  city: string;
  status: PlaceStatus;
  coordinates: [number, number];
};

export const sampleCategories: Category[] = [
  { id: "food", label: "맛집" },
  { id: "report", label: "제보" },
  { id: "parking", label: "주차" },
];

export const placeStatusLabels: Record<PlaceStatus, string> = {
  published: "공개",
  pending: "확인 대기",
  rejected: "반려",
};

export const placeStatusColors: Record<PlaceStatus, string> = {
  published: "green",
  pending: "gold",
  rejected: "red",
};

export const samplePlaces: Place[] = [
  {
    id: "place-1",
    name: "연남 샘플 맛집",
    category: "food",
    description: "공개 지도에서 카테고리 필터와 상세 설명 흐름을 검증하기 위한 예시 장소입니다.",
    address: "서울 마포구 연남동",
    city: "서울",
    status: "published",
    coordinates: [126.922, 37.562],
  },
  {
    id: "place-2",
    name: "서면 주정차 제보",
    category: "report",
    description: "확인 대기 상태와 운영 검토 흐름을 보여주기 위한 샘플 제보입니다.",
    address: "부산 부산진구 서면로",
    city: "부산",
    status: "pending",
    coordinates: [129.0596, 35.1578],
  },
  {
    id: "place-3",
    name: "성심당 인근 공영주차장",
    category: "parking",
    description: "지도와 리스트를 오가며 주차 카테고리 흐름을 확인하기 위한 예시입니다.",
    address: "대전 중구 대종로",
    city: "대전",
    status: "published",
    coordinates: [127.4231, 36.3275],
  },
  {
    id: "place-4",
    name: "애월 해안 맛집 제보",
    category: "food",
    description: "수도권 밖 위치에서도 리스트와 지도 연동이 자연스럽게 동작하는지 확인하기 위한 샘플 데이터입니다.",
    address: "제주 제주시 애월읍",
    city: "제주",
    status: "pending",
    coordinates: [126.3111, 33.4621],
  },
];

export function getCategoryLabel(categories: Category[], categoryId: string) {
  return categories.find((category) => category.id === categoryId)?.label ?? categoryId;
}

export function createCategoryMap(categories: Category[]) {
  return Object.fromEntries(categories.map((category) => [category.id, category.label]));
}

const markerPalette = ["#dc2626", "#d97706", "#0f766e", "#2563eb", "#7c3aed", "#be123c"] as const;

export function getCategoryColor(categoryId: string) {
  let hash = 0;

  for (const character of categoryId) {
    hash = (hash * 31 + character.charCodeAt(0)) >>> 0;
  }

  return markerPalette[hash % markerPalette.length];
}
