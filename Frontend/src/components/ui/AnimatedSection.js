"use client";

import { useRef, useEffect, useState } from "react";

/**
 * AnimatedSection — wraps children in a scroll-triggered animation.
 *
 * @param {string}  animation  - "fadeUp" | "fadeIn" | "slideLeft" | "slideRight" | "scaleIn"
 * @param {number}  delay      - delay in ms before animation starts (default 0)
 * @param {number}  duration   - animation duration in ms (default 700)
 * @param {number}  threshold  - IntersectionObserver threshold 0–1 (default 0.15)
 * @param {boolean} stagger    - if true, staggers direct children instead of animating the wrapper
 * @param {number}  staggerGap - ms between each child animation when stagger=true (default 120)
 * @param {string}  className  - extra classes
 * @param {object}  style      - extra inline styles
 */
export default function AnimatedSection({
  children,
  animation = "fadeUp",
  delay = 0,
  duration = 700,
  threshold = 0.15,
  stagger = false,
  staggerGap = 120,
  className = "",
  style = {},
  as: Tag = "div",
}) {
  const ref = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(el);
        }
      },
      { threshold }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold]);

  const animationName = `anim-${animation}`;

  // For stagger mode, we apply animation to each direct child
  if (stagger) {
    return (
      <Tag
        ref={ref}
        className={className}
        style={style}
      >
        {Array.isArray(children)
          ? children.map((child, i) => (
              <div
                key={i}
                style={{
                  opacity: isVisible ? 1 : 0,
                  animation: isVisible
                    ? `${animationName} ${duration}ms cubic-bezier(0.22, 1, 0.36, 1) ${delay + i * staggerGap}ms forwards`
                    : "none",
                }}
              >
                {child}
              </div>
            ))
          : children}
      </Tag>
    );
  }

  return (
    <Tag
      ref={ref}
      className={className}
      style={{
        ...style,
        opacity: isVisible ? 1 : 0,
        animation: isVisible
          ? `${animationName} ${duration}ms cubic-bezier(0.22, 1, 0.36, 1) ${delay}ms forwards`
          : "none",
      }}
    >
      {children}
    </Tag>
  );
}
