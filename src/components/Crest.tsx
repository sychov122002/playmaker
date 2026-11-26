import { hash } from "@/lib/rng";
const HUES = [18, 28, 205, 150, 280, 340, 48, 185];
/** Team badge generated from the name (no real logos are used). */
export function Crest({ name, size = 28 }: { name: string; size?: number }) {
  const h = HUES[hash(name) % HUES.length];
  const ini = name.replace(/[^A-Za-zÀ-ÿ0-9 ]/g, "").split(" ").filter(Boolean).slice(0, 2).map((w) => w[0]).join("").toUpperCase();
  return <span aria-hidden className="grid shrink-0 place-items-center rounded-full font-extrabold text-white" style={{ width: size, height: size, fontSize: size * 0.38, background: `linear-gradient(145deg, hsl(${h} 70% 48%), hsl(${(h + 30) % 360} 65% 30%))` }}>{ini}</span>;
}
