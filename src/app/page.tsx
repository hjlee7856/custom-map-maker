import Link from "next/link";
import { MapView } from "@/components/map-view";
import { categories, samplePlaces } from "@/lib/places";

const pageStyle = {
  minHeight: "100vh",
  padding: "24px",
};

const shellStyle = {
  display: "grid",
  gridTemplateColumns: "320px 1fr",
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
};

export default function Home() {
  return (
    <main style={pageStyle}>
      <div style={shellStyle}>
        <section style={panelStyle}>
          <div style={{ display: "grid", gap: "12px" }}>
            <span style={{ color: "var(--accent)", fontWeight: 700 }}>MVP Demo</span>
            <h1 style={{ margin: 0, fontSize: "2.2rem", lineHeight: 1.1 }}>
              지도 기반 제보/장소 관리 CMS
            </h1>
            <p style={{ margin: 0, color: "var(--muted)", lineHeight: 1.6 }}>
              README에서 정의한 MVP 범위에 맞춰, 공개 지도 화면과 운영 시작점을 먼저 만들었습니다.
            </p>
          </div>

          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginTop: "20px" }}>
            {Object.entries(categories).map(([id, label]) => (
              <span
                key={id}
                style={{
                  padding: "8px 12px",
                  borderRadius: "999px",
                  background: "var(--chip)",
                  color: "var(--accent-strong)",
                  fontSize: "0.9rem",
                  fontWeight: 600,
                }}
              >
                {label}
              </span>
            ))}
          </div>

          <div style={{ display: "grid", gap: "12px", marginTop: "20px" }}>
            {samplePlaces.map((place) => (
              <article key={place.id} style={cardStyle}>
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
                <p style={{ margin: "12px 0 0", fontSize: "0.92rem" }}>{place.address}</p>
              </article>
            ))}
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
          <MapView />
        </section>
      </div>
    </main>
  );
}
