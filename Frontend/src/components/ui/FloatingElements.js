"use client";

/**
 * FloatingElements — decorative floating shapes with pure CSS animations.
 * Renders absolute-positioned circles, dots, rings, etc.
 * All pointer-events: none so they don't interfere with content.
 *
 * @param {"light" | "dark" | "blue"} variant - color scheme
 * @param {"circles" | "dots" | "mixed"} pattern - shape pattern
 */
export default function FloatingElements({ variant = "light", pattern = "mixed" }) {
  const colors = {
    light: {
      circle1: "rgba(59,130,246,0.07)",
      circle2: "rgba(139,92,246,0.06)",
      circle3: "rgba(59,130,246,0.05)",
      ring: "rgba(59,130,246,0.1)",
      dot: "rgba(59,130,246,0.15)",
    },
    dark: {
      circle1: "rgba(59,130,246,0.12)",
      circle2: "rgba(139,92,246,0.1)",
      circle3: "rgba(99,102,241,0.08)",
      ring: "rgba(96,165,250,0.15)",
      dot: "rgba(96,165,250,0.2)",
    },
    blue: {
      circle1: "rgba(59,130,246,0.1)",
      circle2: "rgba(99,102,241,0.08)",
      circle3: "rgba(139,92,246,0.07)",
      ring: "rgba(59,130,246,0.12)",
      dot: "rgba(59,130,246,0.18)",
    },
  };

  const c = colors[variant] || colors.light;

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        overflow: "hidden",
        pointerEvents: "none",
        zIndex: 0,
      }}
      aria-hidden="true"
    >
      {/* Floating circle — top left */}
      <div
        style={{
          position: "absolute",
          top: "8%",
          left: "3%",
          width: "180px",
          height: "180px",
          borderRadius: "50%",
          background: `radial-gradient(circle, ${c.circle1} 0%, transparent 70%)`,
          animation: "anim-float 8s ease-in-out infinite",
        }}
      />

      {/* Floating circle — bottom right */}
      <div
        style={{
          position: "absolute",
          bottom: "12%",
          right: "5%",
          width: "240px",
          height: "240px",
          borderRadius: "50%",
          background: `radial-gradient(circle, ${c.circle2} 0%, transparent 70%)`,
          animation: "anim-float 10s ease-in-out infinite reverse",
        }}
      />

      {/* Small floating circle — mid left */}
      <div
        style={{
          position: "absolute",
          top: "55%",
          left: "6%",
          width: "100px",
          height: "100px",
          borderRadius: "50%",
          background: `radial-gradient(circle, ${c.circle3} 0%, transparent 70%)`,
          animation: "anim-float 6s ease-in-out infinite 2s",
        }}
      />

      {/* Ring — top right */}
      {(pattern === "mixed" || pattern === "circles") && (
        <div
          style={{
            position: "absolute",
            top: "15%",
            right: "8%",
            width: "120px",
            height: "120px",
            borderRadius: "50%",
            border: `2px solid ${c.ring}`,
            animation: "anim-float 7s ease-in-out infinite 1s",
          }}
        />
      )}

      {/* Ring — bottom left */}
      {(pattern === "mixed" || pattern === "circles") && (
        <div
          style={{
            position: "absolute",
            bottom: "20%",
            left: "10%",
            width: "80px",
            height: "80px",
            borderRadius: "50%",
            border: `2px solid ${c.ring}`,
            animation: "anim-float 9s ease-in-out infinite 3s",
          }}
        />
      )}

      {/* Dot cluster — right side */}
      {(pattern === "mixed" || pattern === "dots") && (
        <div style={{ position: "absolute", top: "30%", right: "3%", display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "12px" }}>
          {Array.from({ length: 9 }).map((_, i) => (
            <div
              key={i}
              style={{
                width: "5px",
                height: "5px",
                borderRadius: "50%",
                backgroundColor: c.dot,
                animation: `anim-float ${5 + (i % 3)}s ease-in-out infinite ${i * 0.3}s`,
              }}
            />
          ))}
        </div>
      )}

      {/* Dot cluster — left side */}
      {(pattern === "mixed" || pattern === "dots") && (
        <div style={{ position: "absolute", bottom: "35%", left: "2%", display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "10px" }}>
          {Array.from({ length: 12 }).map((_, i) => (
            <div
              key={i}
              style={{
                width: "4px",
                height: "4px",
                borderRadius: "50%",
                backgroundColor: c.dot,
                opacity: 0.5 + (i % 4) * 0.15,
                animation: `anim-float ${6 + (i % 4)}s ease-in-out infinite ${i * 0.2}s`,
              }}
            />
          ))}
        </div>
      )}

      {/* Decorative cross/plus — right center */}
      {pattern === "mixed" && (
        <div
          style={{
            position: "absolute",
            top: "45%",
            right: "12%",
            width: "20px",
            height: "20px",
            animation: "anim-spin-slow 20s linear infinite",
          }}
        >
          <div style={{ position: "absolute", top: "50%", left: 0, right: 0, height: "2px", backgroundColor: c.ring, transform: "translateY(-50%)" }} />
          <div style={{ position: "absolute", left: "50%", top: 0, bottom: 0, width: "2px", backgroundColor: c.ring, transform: "translateX(-50%)" }} />
        </div>
      )}
    </div>
  );
}
