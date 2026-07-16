"use client";

/**
 * Beginly Logo — Signature v3.4
 *
 * Geometry sourced directly from the official brand SVG files:
 *   variant="mark"   → Beginly_Core_Mark_Full_Colour.svg
 *   variant="lockup" → Beginly_Horizontal_Lockup_No_Tagline.svg (no tagline)
 *                      Custom tagline extension when tagline={true}
 *
 * Mark scale upgraded from .55 → .90 so the B fills the lockup height.
 *
 * theme="default" → navy B on transparent (for light backgrounds)
 * theme="light"   → white B on transparent (for dark backgrounds)
 * tagline={true}  → adds "Open what comes next." in coral (lockup only)
 *
 * The circular app mark lives only in public/favicon.svg — it is never
 * rendered in UI components per the v3.4 brand spec.
 */

import { useId } from "react";

interface LogoProps {
  size?: number;
  variant?: "mark" | "lockup";
  theme?: "default" | "light";
  tagline?: boolean;
  className?: string;
}

export default function Logo({
  size = 40,
  variant = "mark",
  theme = "default",
  tagline = false,
  className,
}: LogoProps) {
  const uid = useId().replace(/:/g, "x");
  const isLight = theme === "light";
  const bFill = isLight ? "#FFFFFF" : "#071B34";
  const textFill = isLight ? "#FFFFFF" : "#071B34";

  // Ray-of-light gradient: coral → bright amber → fully transparent
  // The ivory end-stop was near-invisible on white; transparent makes the
  // taper read as a genuine shaft of light rather than a washed-out stripe.
  const defs = (
    <defs>
      <linearGradient id={`${uid}b`} x1="0" x2="1" y1="0" y2="0">
        <stop offset="0"    stopColor="#FF7358" stopOpacity="1" />
        <stop offset="0.52" stopColor="#F8B547" stopOpacity="0.92" />
        <stop offset="1"    stopColor="#FFE066" stopOpacity="0" />
      </linearGradient>
      {/* Soft glow that makes the beam bloom */}
      <filter id={`${uid}g`} x="-20%" y="-60%" width="140%" height="220%">
        <feGaussianBlur in="SourceGraphic" stdDeviation="6" result="blur" />
        <feComposite in="SourceGraphic" in2="blur" operator="over" />
      </filter>
    </defs>
  );

  // Exact paths from Beginly_Core_Mark_Full_Colour.svg
  const markPaths = (
    <>
      <path d="M132 122 H242 C324 122 376 164 376 232 C376 276 350 306 305 320 C362 336 396 372 396 428 C396 500 338 542 242 542 H132 Z" fill={bFill} />
      <path d="M176 188 L250 206 L250 432 L176 414 Z" fill="#041225" />
      <path d="M176 188 L190 191 L190 417 L176 414 Z" fill="#FF7358" />
      <path d="M190 192 L239 211 L239 402 L190 416 Z" fill="#F6EBDD" />
      <path d="M190 192 L197 195 L197 414 L190 416 Z" fill="#FF7358" opacity="0.98" />
      <circle cx="225" cy="307" r="4.5" fill="#041225" />
      {/* Glow halo behind the beam */}
      <path d="M190 416 L242 402 L526 478 L456 516 L292 466 L214 438 Z"
        fill={`url(#${uid}b)`} opacity="0.45" filter={`url(#${uid}g)`} />
      {/* Crisp beam on top */}
      <path d="M190 416 L242 402 L526 478 L456 516 L292 466 L214 438 Z"
        fill={`url(#${uid}b)`} opacity="0.95" />
    </>
  );

  if (variant === "lockup") {
    if (tagline) {
      // With tagline — viewBox 0 0 1600 520
      // Mark at scale .90 centered vertically: B spans y=71→449, beam right x=385
      // Wordmark at x=465 y=330, tagline at x=469 y=455
      const vW = 1600, vH = 520;
      const w = Math.round(size * (vW / vH));
      return (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox={`0 0 ${vW} ${vH}`}
          width={w}
          height={size}
          aria-label="Beginly — Open what comes next."
          role="img"
          className={className}
          style={{ display: "block", flexShrink: 0 }}
        >
          {defs}
          <g transform="translate(-89,-39) scale(.90)">{markPaths}</g>
          <text
            x="465"
            y="330"
            fontFamily='"EB Garamond", "Noto Serif Display", Georgia, serif'
            fontSize="230"
            fill={textFill}
          >
            Beginly
          </text>
          <text
            x="469"
            y="455"
            fontFamily='"EB Garamond", "Noto Serif Display", Georgia, serif'
            fontSize="95"
            fill="#FF7358"
          >
            Open what comes next.
          </text>
        </svg>
      );
    }

    // Without tagline — viewBox 0 0 1400 430
    // Mark at scale .90: B spans y=26→404, beam right x=374, wordmark at x=430
    const vW = 1400, vH = 430;
    const w = Math.round(size * (vW / vH));
    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox={`0 0 ${vW} ${vH}`}
        width={w}
        height={size}
        aria-label="Beginly"
        role="img"
        className={className}
        style={{ display: "block", flexShrink: 0 }}
      >
        {defs}
        <g transform="translate(-99,-84) scale(.90)">{markPaths}</g>
        <text
          x="430"
          y="305"
          fontFamily='"EB Garamond", "Noto Serif Display", Georgia, serif'
          fontSize="205"
          fill={textFill}
        >
          Beginly
        </text>
      </svg>
    );
  }

  // Standalone mark — viewBox crops to B + beam extent (x 100–560, y 100–570)
  const w = Math.round(size * (460 / 470));
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="100 100 460 470"
      width={w}
      height={size}
      aria-label="Beginly"
      role="img"
      className={className}
      style={{ display: "block", flexShrink: 0 }}
    >
      {defs}
      {markPaths}
    </svg>
  );
}
