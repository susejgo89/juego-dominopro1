"use client";

import React from "react";
import { Tile } from "@/types/domino";

interface DominoTileProps {
  tile: Tile;
  orientation?: "vertical" | "horizontal";
  size?: "sm" | "md" | "lg";
  isPlayable?: boolean;
  isSelected?: boolean;
  onClick?: () => void;
  className?: string;
  showBack?: boolean;
}

const pipPatterns: Record<number, [number, number][]> = {
  0: [],
  1: [[50, 50]],
  2: [
    [25, 25],
    [75, 75],
  ],
  3: [
    [25, 25],
    [50, 50],
    [75, 75],
  ],
  4: [
    [25, 25],
    [75, 25],
    [25, 75],
    [75, 75],
  ],
  5: [
    [25, 25],
    [75, 25],
    [50, 50],
    [25, 75],
    [75, 75],
  ],
  6: [
    [25, 20],
    [75, 20],
    [25, 50],
    [75, 50],
    [25, 80],
    [75, 80],
  ],
};

function HalfTile({
  value,
  width,
  height,
}: {
  value: number;
  width: number;
  height: number;
}) {
  const pips = pipPatterns[value] || [];
  const pipRadius = Math.max(2, Math.round(Math.min(width, height) * 0.085));

  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 100 100"
      className="shrink-0 block"
    >
      {pips.map(([cx, cy], idx) => (
        <circle
          key={idx}
          cx={cx}
          cy={cy}
          r={pipRadius * 1.6}
          fill="#1c1b18"
          stroke="#000000"
          strokeWidth="1.5"
        />
      ))}
    </svg>
  );
}

export const DominoTile: React.FC<DominoTileProps> = ({
  tile,
  orientation = "vertical",
  size = "md",
  isPlayable = false,
  isSelected = false,
  onClick,
  className = "",
  showBack = false,
}) => {
  // Dimensions based on size
  const dims = {
    sm: { w: 22, h: 44, half: 21 },
    md: { w: 34, h: 68, half: 33 },
    lg: { w: 46, h: 92, half: 45 },
  }[size];

  const isVertical = orientation === "vertical";
  const [val1, val2] = tile;

  if (showBack) {
    return (
      <div
        className={`relative rounded-md shadow-md border border-[#2b2d38] bg-gradient-to-br from-[#1f212a] via-[#171821] to-[#101117] flex items-center justify-center transition-all ${className}`}
        style={{
          width: isVertical ? dims.w : dims.h,
          height: isVertical ? dims.h : dims.w,
        }}
      >
        <div className="w-2.5 h-2.5 rounded-full bg-indigo-500/30 border border-indigo-400/40"></div>
      </div>
    );
  }

  return (
    <div
      onClick={isPlayable || onClick ? onClick : undefined}
      className={`relative select-none transition-all duration-150 rounded-[6px] 
        bg-gradient-to-b from-[#fefefc] via-[#f7f5ed] to-[#ede8db]
        border border-[#cdc5b0]
        shadow-[0_3px_8px_rgba(0,0,0,0.35),inset_0_1px_1px_rgba(255,255,255,0.9),inset_0_-1px_1px_rgba(0,0,0,0.15)]
        ${isPlayable ? "cursor-pointer hover:-translate-y-2 hover:shadow-[0_8px_20px_rgba(79,70,229,0.45)] ring-2 ring-indigo-400/80 animate-pulse" : ""}
        ${isSelected ? "-translate-y-2 ring-3 ring-indigo-500 shadow-[0_10px_24px_rgba(79,70,229,0.6)]" : ""}
        ${onClick && !isPlayable ? "cursor-default" : ""}
        ${className}`}
      style={{
        width: isVertical ? dims.w : dims.h,
        height: isVertical ? dims.h : dims.w,
        display: "inline-flex",
        flexDirection: isVertical ? "column" : "row",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {/* First half */}
      <div className="flex items-center justify-center">
        <HalfTile
          value={val1}
          width={isVertical ? dims.w : dims.half}
          height={isVertical ? dims.half : dims.w}
        />
      </div>

      {/* Center divider line & brass spinner */}
      <div
        className="relative bg-[#a69d87] shrink-0 shadow-[0_1px_1px_rgba(255,255,255,0.7)]"
        style={{
          width: isVertical ? "82%" : "1.5px",
          height: isVertical ? "1.5px" : "82%",
        }}
      >
        {/* Brass center spinner pip */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-gradient-to-br from-[#ffd778] via-[#c69a3b] to-[#7f5c15] shadow-xs"></div>
      </div>

      {/* Second half */}
      <div className="flex items-center justify-center">
        <HalfTile
          value={val2}
          width={isVertical ? dims.w : dims.half}
          height={isVertical ? dims.half : dims.w}
        />
      </div>
    </div>
  );
};

