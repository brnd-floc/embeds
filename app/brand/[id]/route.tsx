import { ImageResponse } from "next/og";
import { readFileSync } from "fs";
import path from "path";
import { getBrand, getTotalBrands } from "@/lib/database-simple";

const interMediumArrayBuffer = readFileSync(
  path.join(process.cwd(), "static", "inter/Inter_18pt-Medium.ttf")
);
const interSemiBoldArrayBuffer = readFileSync(
  path.join(process.cwd(), "static", "inter/Inter_18pt-SemiBold.ttf")
);
const geistBoldArrayBuffer = readFileSync(
  path.join(process.cwd(), "static", "fonts/Geist-Bold.ttf")
);
const geistRegularArrayBuffer = readFileSync(
  path.join(process.cwd(), "static", "fonts/Geist-Regular.ttf")
);

const drukWideArrayBuffer = readFileSync(
  path.join(process.cwd(), "static", "fonts/DrukWide.woff")
);

// Points icon SVG as data URI for use in ImageResponse
const pointsIconSvg = `<svg width="29" height="25" viewBox="0 0 29 25" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M11.1199 8.16819L2.94922 8.16819L4.4268 0L12.5975 0L11.1199 8.16819Z" fill="white" style="fill:white;fill-opacity:1;"/>
<path d="M8.17067 24.5158H0L1.47758 16.3477H9.64826L8.17067 24.5158Z" fill="white" style="fill:white;fill-opacity:1;"/>
<path d="M17.8149 16.3342H9.64844L11.1218 8.16602L19.2925 8.16602L17.8149 16.3342Z" fill="white" style="fill:white;fill-opacity:1;"/>
<path d="M8.17067 24.5158H0L1.47759 16.3477H9.64826L8.17067 24.5158Z" fill="white" style="fill:white;fill-opacity:1;"/>
<path d="M27.4636 8.16819L19.293 8.16819L20.7706 0L28.9412 0L27.4636 8.16819Z" fill="white" style="fill:white;fill-opacity:1;"/>
<path d="M24.5144 24.5158H16.3438L17.8213 16.3477H25.992L24.5144 24.5158Z" fill="white" style="fill:white;fill-opacity:1;"/>
<path d="M24.5102 24.5158H16.3438L17.8171 16.3477H25.9878L24.5102 24.5158Z" fill="white" style="fill:white;fill-opacity:1;"/>
</svg>`;

// Convert SVG to data URI for use in img tag
const pointsIconDataUri = `data:image/svg+xml;base64,${Buffer.from(
  pointsIconSvg
).toString("base64")}`;

// Load the background image as base64
const backgroundImageBase64 = readFileSync(
  path.join(process.cwd(), "static", "share-miniapp.png")
).toString("base64");

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    console.log("params", params);
    const brandId = parseInt(params.id);
    console.log("brandId", brandId);

    if (isNaN(brandId)) {
      return new Response("Invalid brand ID", { status: 400 });
    }

    const brand = await getBrand(brandId);
    console.log("brand", brand);
    const totalBrands = await getTotalBrands();
    console.log("totalBrands", totalBrands);

    if (!brand || !totalBrands) {
      return new Response("Brand not found", { status: 404 });
    }

    // Format score (e.g., 76065 -> "76.1K")
    const formatNumber = (num: number) => {
      if (num >= 1000) {
        return `${(num / 1000).toFixed(1)}K`;
      }
      return String(num);
    };

    const formatBrandScore = (score: number) => {
      if (score >= 1000) {
        return `${(score / 1000).toFixed(1)}K`;
      }
      if (score >= 1000000) {
        return `${(score / 1000000).toFixed(1)}M`;
      }
      if (score >= 1000000000) {
        return `${(score / 1000000000).toFixed(1)}B`;
      }
      return String(score);
    };

    return new ImageResponse(
      (
        <div
          style={{
            height: "100%",
            width: "100%",
            display: "flex",
            position: "relative",
            fontFamily: "Inter",
          }}
        >
          {/* Background image */}
          <img
            src={`data:image/png;base64,${backgroundImageBase64}`}
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

          {/* Brand name - top left area */}
          <div
            style={{
              position: "absolute",
              top: 125,
              left: 70,
              fontSize: 48,
              fontWeight: 700,
              fontFamily: "Geist",
              color: "white",
              display: "flex",
            }}
          >
            {brand.name}
          </div>

          {/* Brand ID badge - top right of left section */}
          <div
            style={{
              position: "absolute",
              top: 125,
              right: 70,
              fontSize: 30,
              color: "white",
              border: "2px solid rgba(255,255,255,0.5)",
              borderRadius: 20,
              fontFamily: "Geist",
              fontWeight: 400,
              padding: "4px 14px",
              display: "flex",
            }}
          >
            {String(brand.id).padStart(4, "0")}
          </div>

          {/* Brand logo - in the left box */}
          <div
            style={{
              position: "absolute",
              top: 200,
              left: 70,
              width: 520,
              height: 520,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: 40,
              overflow: "hidden",
            }}
          >
            {brand.imageUrl && (
              <img
                src={brand.imageUrl}
                width={514}
                height={514}
                style={{
                  width: 514,
                  height: 514,
                  borderRadius: 40,
                  objectFit: "contain",
                }}
              />
            )}
          </div>

          {/* @handle - below the logo box */}
          <div
            style={{
              position: "absolute",
              bottom: 30,
              left: 70,
              fontSize: 20,
              color: "white",
              display: "flex",
              fontFamily: "Geist",
              fontWeight: 700,
            }}
          >
            @{brand.name.toLowerCase().replace(/\s+/g, "")}
          </div>

          {/* RANKING value */}
          <div
            style={{
              position: "absolute",
              top: 370,
              left: 634,
              display: "flex",
              flexDirection: "column",
            }}
          >
            <div
              style={{
                fontSize: 14,
                color: "rgba(255,255,255,0.5)",
                display: "flex",
                fontFamily: "Geist",
                fontWeight: 400,
                marginBottom: 4,
              }}
            >
              GLOBAL
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "flex-end",
              }}
            >
              <div
                style={{
                  fontSize: 32,
                  lineHeight: 1,
                  color: "white",
                  display: "flex",
                  marginTop: 4,
                  fontFamily: "DrukWide",
                  fontWeight: 500,
                }}
              >
                {brand.category?.ranking || "N/A"}
              </div>
              <div
                style={{
                  fontSize: 16,
                  color: "rgba(255,255,255,0.4)",
                  display: "flex",
                  marginLeft: 4,
                  lineHeight: 1,
                  fontFamily: "DrukWide",
                  fontWeight: 400,
                  marginBottom: 4,
                }}
              >
                /{totalBrands}
              </div>
            </div>
          </div>

          {/* SCORE value */}
          <div
            style={{
              position: "absolute",
              top: 370,
              left: 910,
              display: "flex",
              flexDirection: "column",
            }}
          >
            <div
              style={{
                fontSize: 14,
                color: "rgba(255,255,255,0.5)",
                display: "flex",
                fontFamily: "Geist",
                fontWeight: 400,
                marginBottom: 4,
              }}
            >
              $BRND
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <div
                style={{
                  fontSize: 32,
                  color: "white",
                  display: "flex",
                  fontFamily: "DrukWide",
                  fontWeight: 500,
                }}
              >
                {formatBrandScore(brand.score || 0)}{" "}
                <img
                  src={pointsIconDataUri}
                  style={{ marginLeft: 10, marginTop: 4 }}
                  width={33}
                  height={28}
                />
              </div>
            </div>
          </div>

          {/* CATEGORY value */}
          <div
            style={{
              position: "absolute",
              bottom: 100,
              left: 634,
              display: "flex",
              flexDirection: "column",
            }}
          >
            <div
              style={{
                fontSize: 14,
                color: "rgba(255,255,255,0.5)",
                display: "flex",
                fontFamily: "Geist",
                fontWeight: 400,
                marginBottom: 4,
              }}
            >
              {brand.category?.name?.toUpperCase() || "BRAND"}
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "flex-end",
              }}
            >
              <div
                style={{
                  fontSize: 32,
                  lineHeight: 1,
                  color: "white",
                  display: "flex",
                  fontFamily: "DrukWide",
                  fontWeight: 500,
                }}
              >
                {brand.ranking || "N/A"}
              </div>
              <div
                style={{
                  fontSize: 16,
                  color: "rgba(255,255,255,0.4)",
                  display: "flex",
                  marginLeft: 4,
                  lineHeight: 1,
                  fontFamily: "DrukWide",
                  fontWeight: 400,
                  marginBottom: 4,
                }}
              >
                /{brand.category?.totalBrands || 0}
              </div>
            </div>
          </div>

          {/* FANS value */}
          <div
            style={{
              position: "absolute",
              bottom: 100,
              left: 910,
              display: "flex",
              flexDirection: "column",
            }}
          >
            <div
              style={{
                fontSize: 14,
                color: "rgba(255,255,255,0.5)",
                display: "flex",
                fontFamily: "Geist",
                fontWeight: 400,
                marginBottom: 4,
              }}
            >
              VOTERS
            </div>
            <div
              style={{
                fontSize: 32,
                lineHeight: 1,
                color: "white",
                display: "flex",
                fontFamily: "DrukWide",
                fontWeight: 500,
              }}
            >
              {formatNumber(brand.uniqueVotersCount || 0)}
            </div>
          </div>

          {/* Footer text - bottom right */}
          {brand.category?.name && (
            <div
              style={{
                position: "absolute",
                bottom: 30,
                right: 70,
                fontSize: 24,
                color: "white",
                display: "flex",
                fontFamily: "Geist",
                fontWeight: 700,
              }}
            >
              {brand.category?.name}
            </div>
          )}
        </div>
      ),
      {
        width: 1200,
        height: 800,
        headers: {
          "Cache-Control":
            "public, max-age=3600, s-maxage=86400, stale-while-revalidate",
        },
        fonts: [
          {
            name: "Inter",
            data: interMediumArrayBuffer,
            weight: 500,
            style: "normal",
          },
          {
            name: "Inter",
            data: interSemiBoldArrayBuffer,
            weight: 600,
            style: "normal",
          },
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
          {
            name: "DrukWide",
            data: drukWideArrayBuffer,
            weight: 500,
            style: "normal",
          },
        ],
      }
    );
  } catch (e: any) {
    console.log(`Failed to generate brand image: ${e.message}`);
    return new Response(`Failed to generate brand image`, {
      status: 500,
    });
  }
}
