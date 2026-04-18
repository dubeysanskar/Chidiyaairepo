"use client";

/**
 * BackgroundIllustration — renders SVG-based decorative patterns behind section content.
 *
 * @param {"dotGrid" | "wave" | "constellation" | "blob" | "circuits" | "waveTop"} type
 * @param {"light" | "dark"} variant
 * @param {"left" | "right" | "both" | "full"} position
 */
export default function BackgroundIllustration({
  type = "dotGrid",
  variant = "light",
  position = "both",
}) {
  const opacity = variant === "dark" ? 0.15 : 0.35;
  const color = variant === "dark" ? "#60a5fa" : "#3b82f6";
  const colorFaint = variant === "dark" ? "#4f46e5" : "#6366f1";

  const wrapperStyle = {
    position: "absolute",
    inset: 0,
    overflow: "hidden",
    pointerEvents: "none",
    zIndex: 0,
  };

  // ── Dot Grid ────────────────────────────────────────────
  if (type === "dotGrid") {
    return (
      <div style={wrapperStyle} aria-hidden="true">
        {(position === "left" || position === "both") && (
          <svg
            style={{ position: "absolute", left: 0, top: "10%", opacity }}
            width="160" height="200" viewBox="0 0 160 200"
          >
            {Array.from({ length: 8 }).map((_, row) =>
              Array.from({ length: 6 }).map((_, col) => (
                <circle
                  key={`${row}-${col}`}
                  cx={15 + col * 26}
                  cy={15 + row * 26}
                  r="2.5"
                  fill={color}
                  opacity={0.3 + (row + col) * 0.04}
                />
              ))
            )}
          </svg>
        )}
        {(position === "right" || position === "both") && (
          <svg
            style={{ position: "absolute", right: 0, bottom: "10%", opacity }}
            width="160" height="200" viewBox="0 0 160 200"
          >
            {Array.from({ length: 8 }).map((_, row) =>
              Array.from({ length: 6 }).map((_, col) => (
                <circle
                  key={`${row}-${col}`}
                  cx={5 + col * 26}
                  cy={5 + row * 26}
                  r="2"
                  fill={colorFaint}
                  opacity={0.2 + (row + col) * 0.03}
                />
              ))
            )}
          </svg>
        )}
      </div>
    );
  }

  // ── Wave ─────────────────────────────────────────────────
  if (type === "wave") {
    return (
      <div style={wrapperStyle} aria-hidden="true">
        {(position === "left" || position === "both") && (
          <svg
            style={{ position: "absolute", left: "-40px", top: "20%", opacity: opacity * 0.7 }}
            width="200" height="400" viewBox="0 0 200 400"
          >
            <path
              d="M 50 0 Q 150 80 50 160 Q -50 240 50 320 Q 150 400 50 400"
              fill="none"
              stroke={color}
              strokeWidth="1.5"
              strokeDasharray="6 4"
            />
            <path
              d="M 100 20 Q 180 100 100 180 Q 20 260 100 340"
              fill="none"
              stroke={colorFaint}
              strokeWidth="1"
              strokeDasharray="4 6"
            />
          </svg>
        )}
        {(position === "right" || position === "both") && (
          <svg
            style={{ position: "absolute", right: "-30px", bottom: "10%", opacity: opacity * 0.6 }}
            width="180" height="350" viewBox="0 0 180 350"
          >
            <path
              d="M 130 0 Q 30 70 130 140 Q 230 210 130 280 Q 30 350 130 350"
              fill="none"
              stroke={color}
              strokeWidth="1.5"
              strokeDasharray="5 5"
            />
          </svg>
        )}
      </div>
    );
  }

  // ── Wave Top (section divider) ──────────────────────────
  if (type === "waveTop") {
    return (
      <div style={{ ...wrapperStyle }} aria-hidden="true">
        <svg
          style={{ position: "absolute", top: "-1px", left: 0, width: "100%" }}
          height="60" viewBox="0 0 1440 60" preserveAspectRatio="none"
        >
          <path
            d="M0,20 C360,60 720,0 1080,40 C1260,55 1380,20 1440,30 L1440,0 L0,0 Z"
            fill={variant === "dark" ? "#0f172a" : "#f8fafc"}
          />
        </svg>
      </div>
    );
  }

  // ── Constellation ───────────────────────────────────────
  if (type === "constellation") {
    const points = [
      [30, 40], [80, 20], [140, 55], [60, 100], [120, 130],
      [20, 150], [160, 90], [100, 70], [40, 180], [150, 170],
    ];
    const lines = [
      [0, 1], [1, 2], [1, 7], [7, 4], [3, 7], [5, 3], [2, 6], [4, 9], [8, 5],
    ];
    return (
      <div style={wrapperStyle} aria-hidden="true">
        {(position === "left" || position === "both") && (
          <svg
            style={{ position: "absolute", left: "2%", top: "15%", opacity }}
            width="180" height="200" viewBox="0 0 180 200"
          >
            {lines.map(([a, b], i) => (
              <line
                key={i}
                x1={points[a][0]} y1={points[a][1]}
                x2={points[b][0]} y2={points[b][1]}
                stroke={color}
                strokeWidth="0.8"
                opacity="0.4"
              />
            ))}
            {points.map(([x, y], i) => (
              <circle key={i} cx={x} cy={y} r={i % 3 === 0 ? 3 : 2} fill={color} opacity={0.5 + i * 0.04} />
            ))}
          </svg>
        )}
        {(position === "right" || position === "both") && (
          <svg
            style={{ position: "absolute", right: "2%", bottom: "15%", opacity, transform: "rotate(180deg)" }}
            width="160" height="180" viewBox="0 0 180 200"
          >
            {lines.map(([a, b], i) => (
              <line
                key={i}
                x1={points[a][0]} y1={points[a][1]}
                x2={points[b][0]} y2={points[b][1]}
                stroke={colorFaint}
                strokeWidth="0.8"
                opacity="0.35"
              />
            ))}
            {points.map(([x, y], i) => (
              <circle key={i} cx={x} cy={y} r={i % 3 === 0 ? 2.5 : 1.5} fill={colorFaint} opacity={0.4 + i * 0.04} />
            ))}
          </svg>
        )}
      </div>
    );
  }

  // ── Blob ──────────────────────────────────────────────────
  if (type === "blob") {
    return (
      <div style={wrapperStyle} aria-hidden="true">
        {(position === "left" || position === "both") && (
          <svg
            style={{ position: "absolute", left: "-60px", top: "10%", opacity: opacity * 0.5 }}
            width="300" height="300" viewBox="0 0 300 300"
          >
            <defs>
              <linearGradient id="blobGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor={color} stopOpacity="0.15" />
                <stop offset="100%" stopColor={colorFaint} stopOpacity="0.05" />
              </linearGradient>
            </defs>
            <path
              d="M150,30 C220,30 270,80 260,150 C250,220 200,270 140,260 C80,250 30,210 40,140 C50,70 80,30 150,30Z"
              fill="url(#blobGrad1)"
            />
          </svg>
        )}
        {(position === "right" || position === "both") && (
          <svg
            style={{ position: "absolute", right: "-80px", bottom: "5%", opacity: opacity * 0.4 }}
            width="350" height="350" viewBox="0 0 350 350"
          >
            <defs>
              <linearGradient id="blobGrad2" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor={colorFaint} stopOpacity="0.12" />
                <stop offset="100%" stopColor={color} stopOpacity="0.04" />
              </linearGradient>
            </defs>
            <path
              d="M175,35 C260,25 320,95 310,175 C300,255 240,320 165,310 C90,300 35,240 45,165 C55,90 90,45 175,35Z"
              fill="url(#blobGrad2)"
            />
          </svg>
        )}
      </div>
    );
  }

  // ── Circuits ──────────────────────────────────────────────
  if (type === "circuits") {
    return (
      <div style={wrapperStyle} aria-hidden="true">
        {(position === "left" || position === "both") && (
          <svg
            style={{ position: "absolute", left: "1%", top: "20%", opacity }}
            width="120" height="250" viewBox="0 0 120 250"
          >
            <path d="M60 0 L60 40 L20 40 L20 80 L60 80 L60 120" stroke={color} strokeWidth="1" fill="none" opacity="0.4" />
            <path d="M60 120 L100 120 L100 160 L60 160 L60 200 L80 200 L80 250" stroke={color} strokeWidth="1" fill="none" opacity="0.3" />
            <circle cx="60" cy="40" r="3" fill={color} opacity="0.5" />
            <circle cx="20" cy="80" r="3" fill={color} opacity="0.5" />
            <circle cx="100" cy="120" r="3" fill={color} opacity="0.5" />
            <circle cx="60" cy="160" r="3" fill={color} opacity="0.5" />
            <circle cx="80" cy="200" r="3" fill={color} opacity="0.5" />
          </svg>
        )}
        {(position === "right" || position === "both") && (
          <svg
            style={{ position: "absolute", right: "1%", bottom: "15%", opacity, transform: "scaleX(-1)" }}
            width="100" height="220" viewBox="0 0 120 250"
          >
            <path d="M60 0 L60 50 L30 50 L30 100 L70 100 L70 150" stroke={colorFaint} strokeWidth="1" fill="none" opacity="0.35" />
            <path d="M70 150 L90 150 L90 200 L50 200 L50 250" stroke={colorFaint} strokeWidth="1" fill="none" opacity="0.3" />
            <circle cx="60" cy="50" r="2.5" fill={colorFaint} opacity="0.45" />
            <circle cx="30" cy="100" r="2.5" fill={colorFaint} opacity="0.45" />
            <circle cx="90" cy="150" r="2.5" fill={colorFaint} opacity="0.45" />
            <circle cx="50" cy="200" r="2.5" fill={colorFaint} opacity="0.45" />
          </svg>
        )}
      </div>
    );
  }

  return null;
}
