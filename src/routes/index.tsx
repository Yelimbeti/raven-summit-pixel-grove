import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { Clapperboard, Gamepad2, Map, Plane, ShoppingBag, UtensilsCrossed } from "lucide-react";
import { useState } from "react";
import { CATEGORIES, type CategoryId } from "@/lib/decide";
import { createRoom } from "@/lib/decide.functions";

export const Route = createFileRoute("/")({ component: Home });

const ICONS = {
  movies: Clapperboard,
  food: UtensilsCrossed,
  plans: Map,
  games: Gamepad2,
  travel: Plane,
  order: ShoppingBag,
} as const;

function Home() {
  const navigate = useNavigate();
  const create = useServerFn(createRoom);
  const [category, setCategory] = useState<CategoryId>("movies");
  const [title, setTitle] = useState<string>(CATEGORIES[0].prompt);
  const [touched, setTouched] = useState(false);
  const [join, setJoin] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  function pick(id: CategoryId) {
    const next = CATEGORIES.find((c) => c.id === id)!;
    setCategory(id);
    if (!touched) setTitle(next.prompt);
  }

  async function onCreate(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      const { code } = await create({ data: { title: title.trim(), category } });
      await navigate({ to: "/r/$code", params: { code } });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not start.");
      setBusy(false);
    }
  }

  function onJoin(e: React.FormEvent) {
    e.preventDefault();
    const code = join.trim().toLowerCase();
    if (!/^[a-z]{3,8}\d{2}$/.test(code)) {
      setError("Codes look like mango42.");
      return;
    }
    void navigate({ to: "/r/$code", params: { code } });
  }

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-lg flex-col px-5 py-10">
      <p className="text-sm font-medium tracking-[0.18em] text-muted uppercase">Call It</p>
      <h1 className="mt-3 font-display text-5xl leading-[1.05] font-semibold text-ink">
        Stop arguing.
        <span className="block text-ember">Just pick.</span>
      </h1>
      <p className="mt-4 max-w-sm text-base leading-relaxed text-muted">
        Open a room, drop in options, and let the group vote. One phone or many — same short code.
      </p>

      <form onSubmit={onCreate} className="mt-8 rounded-2xl border border-line bg-surface p-4 shadow-sm">
        <p className="text-sm font-medium text-ink">What are you deciding?</p>
        <div className="mt-3 grid grid-cols-3 gap-2">
          {CATEGORIES.map((c) => {
            const Icon = ICONS[c.id];
            const on = c.id === category;
            return (
              <button
                key={c.id}
                type="button"
                onClick={() => pick(c.id)}
                className={`flex min-h-16 flex-col items-start justify-center gap-1 rounded-xl border px-3 py-2 text-left text-sm font-medium transition-colors ${
                  on
                    ? "border-ember bg-ember text-ember-ink"
                    : "border-line bg-bg text-ink hover:border-ink"
                }`}
              >
                <Icon size={18} strokeWidth={1.75} />
                {c.label}
              </button>
            );
          })}
        </div>
        <label className="mt-4 block text-sm font-medium text-ink" htmlFor="title">
          Question
        </label>
        <input
          id="title"
          value={title}
          maxLength={80}
          onChange={(e) => {
            setTouched(true);
            setTitle(e.target.value);
          }}
          className="mt-2 w-full rounded-xl border border-line bg-bg px-3 py-3 text-base text-ink outline-none focus:border-ember"
        />
        <button
          type="submit"
          disabled={busy || !title.trim()}
          className="mt-4 min-h-12 w-full rounded-xl bg-ink px-4 text-base font-semibold text-bg disabled:opacity-50"
        >
          {busy ? "Opening…" : "Open a room"}
        </button>
      </form>

      <form onSubmit={onJoin} className="mt-4 flex gap-2">
        <input
          value={join}
          onChange={(e) => setJoin(e.target.value)}
          placeholder="Join with a code"
          aria-label="Room code"
          className="min-h-12 min-w-0 flex-1 rounded-xl border border-line bg-surface px-3 text-base text-ink outline-none focus:border-ember"
        />
        <button type="submit" className="min-h-12 rounded-xl border border-ink px-4 font-semibold text-ink">
          Join
        </button>
      </form>
      {error ? <p className="mt-3 text-sm text-ember">{error}</p> : null}
    </main>
  );
}
