import { ImageResponse } from "@vercel/og";
import { NextRequest } from "next/server";

export const runtime = "edge";

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const title = searchParams.get("title") || "Botshot";
  const agent = searchParams.get("agent") || "";
  const image = searchParams.get("image") || "";

  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          width: "100%",
          height: "100%",
          backgroundColor: "#0a0a0a",
          padding: "60px",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        {image ? (
          <div
            style={{
              display: "flex",
              flex: 1,
              borderRadius: "16px",
              overflow: "hidden",
              marginBottom: "40px",
            }}
          >
            <img
              src={image}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
              }}
            />
          </div>
        ) : (
          <div
            style={{
              display: "flex",
              flex: 1,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <div
              style={{
                display: "flex",
                gap: "12px",
              }}
            >
              <div
                style={{
                  width: "48px",
                  height: "48px",
                  backgroundColor: "#fff",
                  borderRadius: "10px",
                }}
              />
              <div
                style={{
                  width: "48px",
                  height: "48px",
                  backgroundColor: "#fff",
                  borderRadius: "10px",
                }}
              />
              <div
                style={{
                  width: "48px",
                  height: "48px",
                  backgroundColor: "#fff",
                  borderRadius: "10px",
                }}
              />
              <div
                style={{
                  width: "48px",
                  height: "48px",
                  backgroundColor: "#fff",
                  borderRadius: "10px",
                  opacity: 0.35,
                }}
              />
            </div>
          </div>
        )}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-end",
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            <div
              style={{
                fontSize: "32px",
                fontWeight: 700,
                color: "#fff",
                lineHeight: 1.2,
              }}
            >
              {title}
            </div>
            {agent && (
              <div style={{ fontSize: "18px", color: "#666" }}>{agent}</div>
            )}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <div
              style={{
                width: "24px",
                height: "24px",
                backgroundColor: "#333",
                borderRadius: "5px",
              }}
            />
            <div style={{ fontSize: "16px", color: "#555", fontWeight: 600 }}>
              botshot
            </div>
          </div>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );
}
