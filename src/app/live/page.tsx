"use client";
import { OddsBtn } from "@/components/OddsBtn";
import { Crest } from "@/components/Crest";
import { liveReal } from "@/lib/events";
import { useFeedVersion } from "@/lib/feed";
import { useNow } from "@/lib/useNow";

export default function Live() {
  useFeedVersion();
  const now = useNow(5000);
  if (!now) return <div className="h-40 animate-pulse rounded-2xl bg-panel" />;
  const reals = liveReal();
  return (
    <div>
      <h1 className="mb-3 flex items-center gap-2 text-2xl font-black"><span className="live-dot" /> Live</h1>
      <h2 className="mb-2 text-[13px] font-extrabold uppercase tracking-wide text-accent">Real matches in play ({reals.length})</h2>
      {reals.length === 0 && <div className="mb-6 rounded-2xl bg-panel p-6 text-center text-sm text-muted">No real matches are in play right now. Scores update every ~40 seconds when games are on.</div>}
      <div className="mb-6 grid gap-3 md:grid-cols-2">
        {reals.map((ev) => (
          <div key={ev.id} className="rounded-2xl border border-line bg-panel p-4">
            <div className="flex items-center justify-between text-xs font-bold text-muted"><span>{ev.league}</span><span className="num flex items-center gap-1.5 text-[color:var(--hot)]"><span className="live-dot" />{ev.inplay!.clock || `${ev.inplay!.minute}'`}</span></div>
            <div className="my-3 grid grid-cols-[1fr_auto_1fr] items-center gap-3">
              <div className="flex items-center justify-end gap-2 text-right text-[15px] font-bold"><span className="truncate">{ev.home}</span><Crest name={ev.home} size={26} /></div>
              <div className="num rounded-xl bg-bg px-4 py-1.5 text-2xl font-black text-accent">{ev.inplay!.hs}:{ev.inplay!.as}</div>
              <div className="flex items-center gap-2 text-[15px] font-bold"><Crest name={ev.away} size={26} /><span className="truncate">{ev.away}</span></div>
            </div>
            {ev.markets.length > 0 ? (
              <div className="grid grid-cols-3 gap-1.5">
                <OddsBtn ev={ev} mk="1x2" out="1" short="1" /><OddsBtn ev={ev} mk="1x2" out="X" short="X" /><OddsBtn ev={ev} mk="1x2" out="2" short="2" />
                {ev.markets.slice(1).map((mk) => <div key={mk.key} className="col-span-3 grid grid-cols-2 gap-1.5"><OddsBtn ev={ev} mk={mk.key} out="over" /><OddsBtn ev={ev} mk={mk.key} out="under" /></div>)}
              </div>
            ) : <div className="text-center text-xs text-muted">Live score only: in-play betting is available for football.</div>}
          </div>
        ))}
      </div>
      <p className="mt-2 text-xs text-muted">Scores come from a public sports feed and refresh about every 40 seconds. In-play odds for football are calculated by our model from the score and the minute.</p>
    </div>
  );
}
