import { ImageResponse } from "next/og";
import { readFileSync } from "fs";
import path from "path";
import { getPodium } from "@/lib/database-simple";

const geistBoldArrayBuffer = readFileSync(
  path.join(process.cwd(), "static", "fonts/Geist-Bold.ttf")
);
const geistRegularArrayBuffer = readFileSync(
  path.join(process.cwd(), "static", "fonts/Geist-Regular.ttf")
);

// Load the base layer image as base64
const baseLayerImageBase64 = readFileSync(
  path.join(process.cwd(), "static", "podium_base_layer.png")
).toString("base64");

// Slot configuration matching the NestJS service
const SLOTS = [
  { rank: 2, centerX: 344, y: 244, size: 220 },
  { rank: 1, centerX: 600, y: 164, size: 220 },
  { rank: 3, centerX: 856, y: 324, size: 220 },
];

// Vote amount percentages
const VOTE_PERCENTAGES: Record<1 | 2 | 3, number> = {
  1: 0.6,
  2: 0.3,
  3: 0.1,
};

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const transactionHash = params.id;

    if (!transactionHash || 
        typeof transactionHash !== 'string' || 
        transactionHash.length > 100 ||
        !/^[a-zA-Z0-9\-_]+$/.test(transactionHash)) {
      return Response.redirect("https://brnd.land/image.png", 302);
    }

    const podium = await getPodium(transactionHash);

    if (!podium) {
      return Response.redirect("https://brnd.land/image.png", 302);
    }

    const voteCost = podium.brndPaidWhenCreatingPodium || 0;
    const canvasHeight = 800;

    // Organize brands by rank
    const brandsByRank = {
      1: podium.brand1,
      2: podium.brand2,
      3: podium.brand3,
    };

    // Pre-calculate text positions (since transform doesn't work in Satori)
    // Estimate text width and center it manually
    const textWidth = 200; // approximate width for centering

    return new ImageResponse(
      (
        <div
          style={{
            height: "100%",
            width: "100%",
            display: "flex",
            position: "relative",
            backgroundColor: "#000000",
            fontFamily: "Geist",
          }}
        >
          {/* Base layer image */}
          <img
            src={`data:image/png;base64,${baseLayerImageBase64}`}
            width={1200}
            height={800}
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
            }}
          />

          {/* User header - top right */}
          <div
            style={{
              position: "absolute",
              top: 20,
              right: 28,
              display: "flex",
              flexDirection: "row",
              alignItems: "center",
              gap: 16,
            }}
          >
            {/* Text on the left */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "flex-start",
              }}
            >
              {/* Username */}
              <div
                style={{
                  fontSize: 20,
                  fontWeight: 700,
                  color: "#FFFFFF",
                  fontFamily: "Geist",
                  display: "flex",
                  alignSelf: "flex-end",
                }}
              >
                by @{podium.user.username}
              </div>
              {/* Level */}
              <div
                style={{
                  fontSize: 16,
                  fontWeight: 400,
                  color: "#CCCCCC",
                  fontFamily: "Geist",
                  display: "flex",
                  marginTop: 4,
                  alignSelf: "flex-end",
                  paddingRight: 3,
                }}
              >
                LEVEL {podium.user.brndPowerLevel || 0}
              </div>
            </div>
            {/* User avatar on the right */}
            {podium.user.photoUrl && (
              <img
                src={podium.user.photoUrl}
                width={62}
                height={62}
                style={{
                  borderRadius: 31,
                }}
              />
            )}
          </div>

          {/* Rank 2 - Left slot */}
          <div
            style={{
              position: "absolute",
              left: SLOTS[0].centerX - SLOTS[0].size / 2,
              top: SLOTS[0].y,
              width: SLOTS[0].size,
              height: SLOTS[0].size,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            {brandsByRank[2]?.imageUrl && (
              <img
                src={brandsByRank[2].imageUrl}
                width={SLOTS[0].size}
                height={SLOTS[0].size}
                style={{
                  borderRadius: 16,
                  objectFit: "cover",
                }}
              />
            )}
          </div>

          {/* Rank 1 - Center slot */}
          <div
            style={{
              position: "absolute",
              left: SLOTS[1].centerX - SLOTS[1].size / 2,
              top: SLOTS[1].y,
              width: SLOTS[1].size,
              height: SLOTS[1].size,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            {brandsByRank[1]?.imageUrl && (
              <img
                src={brandsByRank[1].imageUrl}
                width={SLOTS[1].size}
                height={SLOTS[1].size}
                style={{
                  borderRadius: 16,
                  objectFit: "cover",
                }}
              />
            )}
          </div>

          {/* Rank 3 - Right slot */}
          <div
            style={{
              position: "absolute",
              left: SLOTS[2].centerX - SLOTS[2].size / 2,
              top: SLOTS[2].y,
              width: SLOTS[2].size,
              height: SLOTS[2].size,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            {brandsByRank[3]?.imageUrl && (
              <img
                src={brandsByRank[3].imageUrl}
                width={SLOTS[2].size}
                height={SLOTS[2].size}
                style={{
                  borderRadius: 16,
                  objectFit: "cover",
                }}
              />
            )}
          </div>

          {/* Rank 2 text - Left */}
          <div
            style={{
              position: "absolute",
              left: SLOTS[0].centerX - textWidth / 2,
              top: canvasHeight - 85,
              width: textWidth,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            <div
              style={{
                fontSize: 25,
                fontWeight: 700,
                color: "#FFFFFF",
                fontFamily: "Geist",
                textAlign: "center",
                marginBottom: 8,
                display: "flex",
              }}
            >
              {brandsByRank[2]?.name || ""}
            </div>
            <div
              style={{
                fontSize: 20,
                fontWeight: 400,
                color: "#FFFFFF",
                fontFamily: "Geist",
                textAlign: "center",
                display: "flex",
              }}
            >
              {Math.floor(voteCost * VOTE_PERCENTAGES[2])} $BRND
            </div>
          </div>

          {/* Rank 1 text - Center */}
          <div
            style={{
              position: "absolute",
              left: SLOTS[1].centerX - textWidth / 2,
              top: canvasHeight - 85,
              width: textWidth,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            <div
              style={{
                fontSize: 25,
                fontWeight: 700,
                color: "#FFFFFF",
                fontFamily: "Geist",
                textAlign: "center",
                marginBottom: 8,
                display: "flex",
              }}
            >
              {brandsByRank[1]?.name || ""}
            </div>
            <div
              style={{
                fontSize: 20,
                fontWeight: 400,
                color: "#FFFFFF",
                fontFamily: "Geist",
                textAlign: "center",
                display: "flex",
              }}
            >
              {Math.floor(voteCost * VOTE_PERCENTAGES[1])} $BRND
            </div>
          </div>

          {/* Rank 3 text - Right */}
          <div
            style={{
              position: "absolute",
              left: SLOTS[2].centerX - textWidth / 2,
              top: canvasHeight - 85,
              width: textWidth,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            <div
              style={{
                fontSize: 25,
                fontWeight: 700,
                color: "#FFFFFF",
                fontFamily: "Geist",
                textAlign: "center",
                marginBottom: 8,
                display: "flex",
              }}
            >
              {brandsByRank[3]?.name || ""}
            </div>
            <div
              style={{
                fontSize: 20,
                fontWeight: 400,
                color: "#FFFFFF",
                fontFamily: "Geist",
                textAlign: "center",
                display: "flex",
              }}
            >
              {Math.floor(voteCost * VOTE_PERCENTAGES[3])} $BRND
            </div>
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 800,
        headers: {
          "Cache-Control": "public, max-age=31536000, s-maxage=31536000, immutable",
          "X-Content-Type-Options": "nosniff",
          "X-Frame-Options": "DENY",
          "X-XSS-Protection": "1; mode=block",
          "Referrer-Policy": "strict-origin-when-cross-origin",
          "Content-Security-Policy": "default-src 'none'; img-src 'self' data: https:; style-src 'unsafe-inline'",
        },
        fonts: [
          {
            name: "Geist",
            data: geistBoldArrayBuffer,
            weight: 700,
            style: "normal",
          },
          {
            name: "Geist",
            data: geistRegularArrayBuffer,
            weight: 400,
            style: "normal",
          },
        ],
      }
    );
  } catch (e: any) {
    console.log(`Failed to generate podium image: ${e.message}`);
    return Response.redirect("https://brnd.land/image.png", 302);
  }
}
