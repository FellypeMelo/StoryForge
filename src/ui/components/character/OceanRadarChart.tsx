import React from "react";
import { OceanScores } from "../../../domain/character";

interface OceanRadarChartProps {
  scores: OceanScores;
  size?: number;
}

export function OceanRadarChart({ scores, size = 300 }: OceanRadarChartProps) {
  const center = size / 2;
  const radius = (size / 2) * 0.8;
  
  const traits: { key: keyof OceanScores; label: string }[] = [
    { key: "openness", label: "O" },
    { key: "conscientiousness", label: "C" },
    { key: "extraversion", label: "E" },
    { key: "agreeableness", label: "A" },
    { key: "neuroticism", label: "N" },
  ];

  const getPoint = (index: number, value: number, maxRadius: number) => {
    const angle = (Math.PI * 2 * index) / traits.length - Math.PI / 2;
    const r = (value / 100) * maxRadius;
    return {
      x: center + r * Math.cos(angle),
      y: center + r * Math.sin(angle),
    };
  };

  const points = traits
    .map((trait, i) => {
      const p = getPoint(i, scores[trait.key], radius);
      return `${p.x},${p.y}`;
    })
    .join(" ");

  // Grid levels (20%, 40%, 60%, 80%, 100%)
  const gridLevels = [20, 40, 60, 80, 100];

  return (
    <div className="flex justify-center items-center" data-testid="ocean-radar-chart">
      <svg width={size} height={size} className="overflow-visible">
        {/* Grids */}
        {gridLevels.map((level) => (
          <polygon
            key={level}
            points={traits
              .map((_, i) => {
                const p = getPoint(i, level, radius);
                return `${p.x},${p.y}`;
              })
              .join(" ")}
            className="fill-none stroke-border-subtle stroke-[0.5]"
          />
        ))}

        {/* Axis */}
        {traits.map((trait, i) => {
          const p = getPoint(i, 100, radius);
          const labelP = getPoint(i, 115, radius);
          return (
            <g key={trait.key}>
              <line
                x1={center}
                y1={center}
                x2={p.x}
                y2={p.y}
                className="stroke-border-subtle stroke-[0.5]"
              />
              <text
                x={labelP.x}
                y={labelP.y}
                textAnchor="middle"
                dominantBaseline="middle"
                className="text-[10px] font-mono fill-text-muted font-bold"
              >
                {trait.label}
              </text>
            </g>
          );
        })}

        {/* Data Area */}
        <polygon
          points={points}
          className="fill-text-main/10 stroke-text-main stroke-2 transition-all duration-500 ease-in-out"
        />
        
        {/* Data Points */}
        {traits.map((trait, i) => {
          const p = getPoint(i, scores[trait.key], radius);
          return (
            <circle
              key={trait.key}
              cx={p.x}
              cy={p.y}
              r={3}
              className="fill-bg-base stroke-text-main stroke-2 transition-all duration-500 ease-in-out"
            />
          );
        })}
      </svg>
    </div>
  );
}
