import Link from "next/link";
import { categories, samplePlaces } from "@/lib/places";

const panelStyle = {
  background: "var(--surface)",
  border: "1px solid var(--line)",
  borderRadius: "24px",
  padding: "24px",
  backdropFilter: "blur(10px)",
};

export default function AdminPage() {
  return (
    <main style={{ minHeight: "100vh", padding: "24px", display: "grid", gap: "20px" }}>
      <section style={panelStyle}>
        <div style={{ display: "flex", justifyContent: "space-between", gap: "16px", flexWrap: "wrap" }}>
          <div>
            <p style={{ margin: 0, color: "var(--accent)", fontWeight: 700 }}>Admin Starter</p>
            <h1 style={{ margin: "8px 0 0", fontSize: "2rem" }}>운영자 승인 대시보드</h1>
          </div>
          <Link href="/" style={{ alignSelf: "start", color: "var(--accent-strong)", fontWeight: 700 }}>
            공개 지도 돌아가기
          </Link>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
            gap: "12px",
            marginTop: "20px",
          }}
        >
          <article style={{ ...panelStyle, padding: "18px" }}>
            <strong>총 장소</strong>
            <p style={{ fontSize: "2rem", margin: "10px 0 0" }}>{samplePlaces.length}</p>
          </article>
          <article style={{ ...panelStyle, padding: "18px" }}>
            <strong>승인 대기</strong>
            <p style={{ fontSize: "2rem", margin: "10px 0 0" }}>
              {samplePlaces.filter((place) => place.status === "pending").length}
            </p>
          </article>
          <article style={{ ...panelStyle, padding: "18px" }}>
            <strong>카테고리</strong>
            <p style={{ fontSize: "2rem", margin: "10px 0 0" }}>{Object.keys(categories).length}</p>
          </article>
        </div>
      </section>

      <section style={panelStyle}>
        <h2 style={{ marginTop: 0 }}>승인 대기 목록</h2>
        <div style={{ display: "grid", gap: "12px" }}>
          {samplePlaces.map((place) => (
            <article
              key={place.id}
              style={{
                display: "grid",
                gridTemplateColumns: "1.4fr 0.8fr 1fr 0.9fr",
                gap: "12px",
                padding: "14px 0",
                borderBottom: "1px solid var(--line)",
              }}
            >
              <strong>{place.name}</strong>
              <span>{categories[place.category]}</span>
              <span>{place.address}</span>
              <span style={{ color: place.status === "published" ? "var(--accent)" : "#b45309" }}>
                {place.status === "published" ? "공개" : "검수 필요"}
              </span>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
