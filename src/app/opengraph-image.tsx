import { ImageResponse } from "next/og";

export const alt = "ReserBa: amenity booking for homeowners associations";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// The picture shown when a link to ReserBa is shared in a chat.
export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 80,
          background: "#08130f",
          color: "#ffffff",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <div
            style={{
              width: 64,
              height: 64,
              borderRadius: 18,
              background: "#0f5c46",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
                          }}
          >
            <div
              style={{
                width: 26,
                height: 14,
                borderLeft: "5px solid #ffffff",
                borderBottom: "5px solid #ffffff",
                transform: "rotate(-45deg) translateY(-3px)",
              }}
            />
          </div>
          <div style={{ fontSize: 40, fontWeight: 600 }}>ReserBa</div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          <div style={{ fontSize: 84, lineHeight: 1.05, letterSpacing: -2, maxWidth: 940 }}>
            Reserve the clubhouse, court, or pool without the back-and-forth.
          </div>
          <div style={{ fontSize: 30, color: "#86b9a2" }}>Amenity booking for homeowners associations</div>
        </div>
      </div>
    ),
    size,
  );
}
