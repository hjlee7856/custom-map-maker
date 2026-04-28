"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { MapView } from "@/components/map-view";
import { categories, samplePlaces, type CategoryId } from "@/lib/places";

const pageStyle = {
  minHeight: "100vh",
  padding: "24px",
};

const shellStyle = {
  display: "grid",
  gridTemplateColumns: "360px 1fr",
  gap: "20px",
  minHeight: "calc(100vh - 48px)",
};

const panelStyle = {
  background: "var(--surface)",
  border: "1px solid var(--line)",
  borderRadius: "24px",
  padding: "24px",
  backdropFilter: "blur(10px)",
};

const cardStyle = {
  border: "1px solid var(--line)",
  borderRadius: "18px",
  padding: "16px",
  background: "rgba(255,255,255,0.66)",
  cursor: "pointer",
};

export function MapExplorer() {
  const [selectedCategory, setSelectedCategory] = useState<"all" | CategoryId>("all");
  const [search, setSearch] = useState("");
  const [selectedPlaceId, setSelectedPlaceId] = useState<string | null>(samplePlaces[0]?.id ?? null);

  const filteredPlaces = useMemo(() => {
    const normalized = search.trim().toLowerCase();

    return samplePlaces.filter((place) => {
      const matchesCategory = selectedCategory === "all" || place.category === selectedCategory;
      const matchesSearch =
        normalized.length === 0 ||
        [place.name, place.description, place.address, place.city].some((value) =>
          value.toLowerCase().includes(normalized),
        );

      return matchesCategory && matchesSearch;
    });
  }, [search, selectedCategory]);

  const effectiveSelectedPlaceId = useMemo(() => {
    if (filteredPlaces.some((place) => place.id === selectedPlaceId)) {
      return selectedPlaceId;
    }

    return filteredPlaces[0]?.id ?? null;
  }, [filteredPlaces, selectedPlaceId]);

  return (
    <main style={pageStyle}>
      <div className="app-shell" style={shellStyle}>
        <section style={panelStyle}>
          <div style={{ display: "grid", gap: "12px" }}>
            <span style={{ color: "var(--accent)", fontWeight: 700 }}>Korea Map MVP</span>
            <h1 style={{ margin: 0, fontSize: "2.2rem", lineHeight: 1.1 }}>
              지도 기반 제보/장소 관리 CMS
            </h1>
            <p style={{ margin: 0, color: "var(--muted)", lineHeight: 1.6 }}>
              한국 중심 지도 기본값과 검색, 카테고리 필터, 리스트-지도 연동을 우선 반영했습니다.
            </p>
          </div>

          <div style={{ display: "grid", gap: "10px", marginTop: "20px" }}>
            <label htmlFor="place-search" style={{ fontWeight: 700 }}>
              검색
            </label>
            <input
              id="place-search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="장소명, 설명, 주소, 도시 검색"
              style={{
                width: "100%",
                borderRadius: "14px",
                border: "1px solid var(--line)",
                padding: "12px 14px",
                background: "#fff",
              }}
            />
          </div>

          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginTop: "16px" }}>
            <button
              type="button"
              onClick={() => setSelectedCategory("all")}
              className={selectedCategory === "all" ? "chip-button is-active" : "chip-button"}
            >
              전체
            </button>
            {Object.entries(categories).map(([id, label]) => (
              <button
                key={id}
                type="button"
                onClick={() => setSelectedCategory(id as CategoryId)}
                className={selectedCategory === id ? "chip-button is-active" : "chip-button"}
              >
                {label}
              </button>
            ))}
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
              gap: "10px",
              marginTop: "20px",
            }}
          >
            <article className="summary-card">
              <strong>전체</strong>
              <span>{samplePlaces.length}</span>
            </article>
            <article className="summary-card">
              <strong>현재 결과</strong>
              <span>{filteredPlaces.length}</span>
            </article>
            <article className="summary-card">
              <strong>승인 대기</strong>
              <span>{samplePlaces.filter((place) => place.status === "pending").length}</span>
            </article>
          </div>

          <div style={{ display: "grid", gap: "12px", marginTop: "20px" }}>
            {filteredPlaces.length === 0 ? (
              <article style={cardStyle}>
                <strong>검색 결과가 없습니다.</strong>
                <p style={{ margin: "8px 0 0", color: "var(--muted)", lineHeight: 1.5 }}>
                  검색어를 줄이거나 카테고리를 전체로 바꿔보세요.
                </p>
              </article>
            ) : (
              filteredPlaces.map((place) => (
                <article
                  key={place.id}
                  style={cardStyle}
                  className={effectiveSelectedPlaceId === place.id ? "place-card is-selected" : "place-card"}
                  onClick={() => setSelectedPlaceId(place.id)}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      gap: "12px",
                    }}
                  >
                    <strong>{place.name}</strong>
                    <span style={{ color: "var(--muted)", fontSize: "0.9rem" }}>
                      {place.status === "published" ? "공개" : "승인 대기"}
                    </span>
                  </div>
                  <p style={{ margin: "8px 0 0", color: "var(--muted)", lineHeight: 1.5 }}>
                    {place.description}
                  </p>
                  <p style={{ margin: "12px 0 0", fontSize: "0.92rem" }}>
                    {categories[place.category]} · {place.city} · {place.address}
                  </p>
                </article>
              ))
            )}
          </div>

          <div style={{ marginTop: "20px" }}>
            <Link
              href="/admin"
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                padding: "12px 16px",
                borderRadius: "14px",
                background: "var(--accent)",
                color: "#fff",
                fontWeight: 700,
              }}
            >
              관리자 화면 보기
            </Link>
          </div>
        </section>

        <section
          style={{
            ...panelStyle,
            padding: "0",
            overflow: "hidden",
            minHeight: "70vh",
          }}
        >
          <MapView
            places={filteredPlaces}
            selectedPlaceId={effectiveSelectedPlaceId}
            onSelectPlace={setSelectedPlaceId}
          />
        </section>
      </div>
    </main>
  );
}
