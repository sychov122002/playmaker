"use client";
import { useEffect, useState } from "react";
/** Current time; 0 before mount to avoid hydration mismatch. */
export function useNow(ms = 1000): number {
  const [now, setNow] = useState(0);
  useEffect(() => { const tick = () => setNow(Date.now()); tick(); const t = setInterval(tick, ms); return () => clearInterval(t); }, [ms]);
  return now;
}
