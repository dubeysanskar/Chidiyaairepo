"use client";

import { useState, useRef, useCallback } from "react";

interface VideoPlayerProps {
  src: string;
  poster: string;
  style?: React.CSSProperties;
  containerStyle?: React.CSSProperties;
}

/**
 * Custom video player that shows a thumbnail with play button initially,
 * and shows the thumbnail again with a retry/replay button after the video ends.
 */
export default function VideoPlayer({ src, poster, style, containerStyle }: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [state, setState] = useState<"idle" | "playing" | "ended">("idle");

  const handlePlay = useCallback(() => {
    if (videoRef.current) {
      videoRef.current.play();
      setState("playing");
    }
  }, []);

  const handleReplay = useCallback(() => {
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
      videoRef.current.play();
      setState("playing");
    }
  }, []);

  const handleEnded = useCallback(() => {
    setState("ended");
  }, []);

  // When user manually plays via native controls
  const handleVideoPlay = useCallback(() => {
    setState("playing");
  }, []);

  const handlePause = useCallback(() => {
    if (videoRef.current && videoRef.current.ended) {
      setState("ended");
    }
  }, []);

  return (
    <div
      style={{
        position: "relative",
        borderRadius: "12px",
        overflow: "hidden",
        backgroundColor: "#0f172a",
        ...containerStyle,
      }}
    >
      <video
        ref={videoRef}
        preload="metadata"
        playsInline
        controls={state === "playing"}
        onEnded={handleEnded}
        onPlay={handleVideoPlay}
        onPause={handlePause}
        poster={poster}
        style={{
          width: "100%",
          height: "auto",
          display: "block",
          objectFit: "contain",
          ...style,
        }}
      >
        <source src={src} type="video/mp4" />
        Your browser does not support the video tag.
      </video>

      {/* Play button overlay for idle state */}
      {state === "idle" && (
        <div
          onClick={handlePlay}
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            background: "rgba(0,0,0,0.25)",
            transition: "background 0.2s ease",
          }}
        >
          <div
            style={{
              width: "64px",
              height: "64px",
              borderRadius: "50%",
              background: "linear-gradient(135deg, #3b82f6, #6366f1)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 8px 24px rgba(59,130,246,0.4)",
              transition: "transform 0.2s ease, box-shadow 0.2s ease",
            }}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
              <polygon points="8,5 20,12 8,19" />
            </svg>
          </div>
        </div>
      )}

      {/* Replay overlay for ended state */}
      {state === "ended" && (
        <div
          onClick={handleReplay}
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            background: "rgba(0,0,0,0.55)",
            gap: "12px",
          }}
        >
          <div
            style={{
              width: "64px",
              height: "64px",
              borderRadius: "50%",
              background: "linear-gradient(135deg, #3b82f6, #6366f1)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 8px 24px rgba(59,130,246,0.4)",
            }}
          >
            {/* Replay icon */}
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="1 4 1 10 7 10" />
              <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
            </svg>
          </div>
          <span
            style={{
              color: "white",
              fontSize: "14px",
              fontWeight: "600",
              letterSpacing: "0.3px",
            }}
          >
            Watch Again
          </span>
        </div>
      )}
    </div>
  );
}
