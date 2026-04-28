export type CategoryId = "food" | "report" | "parking";

export type Place = {
  id: string;
  name: string;
  category: CategoryId;
  description: string;
  address: string;
  status: "published" | "pending";
  coordinates: [number, number];
};

export const categories: Record<CategoryId, string> = {
  food: "맛집",
  report: "제보",
  parking: "주차",
};

export const samplePlaces: Place[] = [
  {
    id: "place-1",
    name: "연남 샘플 맛집",
    category: "food",
    description: "초기 MVP에서 상세 패널과 카테고리 필터를 검증하기 위한 예시 장소입니다.",
    address: "서울 마포구 연남동",
    status: "published",
    coordinates: [126.922, 37.562],
  },
  {
    id: "place-2",
    name: "불법 주정차 제보",
    category: "report",
    description: "승인 전 상태를 표현하기 위한 샘플 제보입니다.",
    address: "서울 서대문구 창천동",
    status: "pending",
    coordinates: [126.936, 37.556],
  },
  {
    id: "place-3",
    name: "공영주차장 A",
    category: "parking",
    description: "지도와 리스트를 동시에 볼 때 주차 카테고리 동작을 확인하는 예시입니다.",
    address: "서울 마포구 동교동",
    status: "published",
    coordinates: [126.927, 37.558],
  },
];
