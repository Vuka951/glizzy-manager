"use client";

import { useEffect, useState } from "react";
import HeartIcon from "@/components/icons/HeartIcon";
import Icon from "@/components/icons/Icon";
import type { MeterDelta } from "@/lib/utils/matchMeters";

// Each icon rises gently for the whole of its life, holds its colour for the
// first part and thins out over the rest; a second meter waits its turn
const HOLD_MS = 300;
const FADE_MS = 500;
const LIFE_MS = HOLD_MS + FADE_MS;

// Which way the turn pushed the meters, the karton's own icons floating off
// the portrait one after another. Rising cholesterol and a falling appetite read
// red, the way the receipt colors them; cholesterol coming down reads green
export default function MatchMeterDelta({ delta }: { delta: MeterDelta }) {
  const lines = [
    {
      key: "stress",
      icon: <HeartIcon className="h-3 w-3" />,
      value: delta.stress,
      good: delta.stress < 0,
    },
    {
      key: "appetite",
      icon: <Icon name="hotdog" className="h-3 w-3" />,
      value: delta.appetite,
      good: delta.appetite > 0,
    },
  ].filter((line) => line.value !== 0);
  const [index, setIndex] = useState(0);
  useEffect(() => {
    const next = setTimeout(() => setIndex((i) => i + 1), LIFE_MS);
    return () => clearTimeout(next);
  }, [index]);
  const line = lines[index];
  if (!line) return null;
  return (
    <Pop key={line.key} good={line.good} up={line.value > 0}>
      {line.icon}
    </Pop>
  );
}

function Pop({
  good,
  up,
  children,
}: {
  good: boolean;
  up: boolean;
  children: React.ReactNode;
}) {
  const [rising, setRising] = useState(false);
  useEffect(() => {
    const lift = setTimeout(() => setRising(true), 20);
    return () => clearTimeout(lift);
  }, []);
  return (
    <span
      className={`flex items-center gap-0.5 whitespace-nowrap font-mono text-[10px] font-bold [text-shadow:0_1px_2px_rgba(0,0,0,0.9)] [transition:translate_800ms_linear,opacity_500ms_ease-out_300ms] ${
        good ? "text-emerald-300" : "text-red-400"
      } ${rising ? "-translate-y-4 opacity-0" : "translate-y-0 opacity-100"}`}
    >
      {up ? "▲" : "▼"}
      {children}
    </span>
  );
}
