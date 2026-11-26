"use client";
import { useEffect } from "react";
import { Btn, Card } from "@/components/ui";
import { clearInbox, markAllRead, useStore } from "@/lib/store";

export default function Inbox() {
  const st = useStore();
  useEffect(() => { const t = setTimeout(markAllRead, 1500); return () => clearTimeout(t); }, []);
  return (
    <>
      <h1 className="text-2xl font-black">Notifications</h1>
      <Card right={st.inbox.length > 0 ? <Btn kind="ghost" onClick={clearInbox}>Clear all</Btn> : undefined}>
        {st.inbox.length === 0 && <div className="py-6 text-center text-sm text-muted">No notifications yet. Bet results and bonuses will appear here.</div>}
        <div className="divide-y divide-line">
          {st.inbox.map((m) => (
            <div key={m.id} className="flex items-start gap-3 py-3">
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-panel2">{m.icon}</span>
              <div className="min-w-0 flex-1"><div className="flex items-center gap-2 text-sm font-bold">{m.title}{!m.read && <span className="h-2 w-2 rounded-full bg-accent" />}</div><div className="text-sm text-muted">{m.body}</div><div className="mt-0.5 text-[11px] text-muted">{new Date(m.at).toLocaleString("en-GB")}</div></div>
            </div>
          ))}
        </div>
      </Card>
    </>
  );
}
