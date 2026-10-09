import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { Check, Copy } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { addOption, castVote, getRoom, setStatus, type RoomView } from "@/lib/decide.functions";
import { getVoterKey } from "@/lib/voter";

export const Route = createFileRoute("/r/$code")({ component: RoomPage });

function RoomPage() {
  const { code } = Route.useParams();
  const [voterKey, setVoterKey] = useState("");
  const [room, setRoom] = useState<RoomView | null | undefined>(undefined);
  const [draft, setDraft] = useState("");
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const fetchRoom = useServerFn(getRoom);
  const add = useServerFn(addOption);
  const vote = useServerFn(castVote);
  const status = useServerFn(setStatus);

  const load = useCallback(async (key: string) => {
    try {
      const next = await fetchRoom({ data: { code, voterKey: key } });
      setRoom(next);
    } catch {
      setError("Could not load this room.");
    }
  }, [code, fetchRoom]);

  useEffect(() => {
    const key = getVoterKey();
    setVoterKey(key);
    void load(key);
    const id = window.setInterval(() => void load(key), 2500);
    return () => window.clearInterval(id);
  }, [load]);

  const leader = useMemo(() => topOption(room), [room]);

  async function onAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!draft.trim() || !voterKey) return;
    setError("");
    try {
      await add({ data: { code, label: draft.trim() } });
      setDraft("");
      await load(voterKey);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not add that.");
    }
  }

  async function onVote(optionId: number) {
    if (!voterKey) return;
    setError("");
    try {
      await vote({ data: { code, optionId, voterKey } });
      await load(voterKey);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Vote failed.");
    }
  }

  async function toggleLock() {
    if (!room || !voterKey) return;
    setError("");
    try {
      await status({ data: { code, status: room.status === "open" ? "closed" : "open" } });
      await load(voterKey);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not update the room.");
    }
  }

  async function copyCode() {
    const url = `${window.location.origin}/r/${code}`;
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      /* ignore */
    }
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  }

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-lg flex-col px-5 py-8">
      <div className="flex items-center justify-between gap-3">
        <Link to="/" className="text-sm font-medium tracking-[0.18em] text-muted uppercase">
          Call It
        </Link>
        <button
          type="button"
          onClick={() => void copyCode()}
          className="inline-flex min-h-11 items-center gap-2 rounded-full border border-line bg-surface px-3 text-sm font-semibold text-ink"
        >
          {copied ? <Check size={16} /> : <Copy size={16} />}
          {code}
        </button>
      </div>

      {room === undefined ? (
        <p className="mt-16 text-muted">Opening the room…</p>
      ) : room === null ? (
        <div className="mt-16">
          <h1 className="font-display text-4xl font-semibold">No room with that code.</h1>
          <Link to="/" className="mt-6 inline-flex min-h-11 items-center font-semibold text-ember">
            Start a new one
          </Link>
        </div>
      ) : (
        <>
          <p className="mt-8 text-sm font-medium text-muted capitalize">{room.category}</p>
          <h1 className="mt-1 font-display text-4xl leading-tight font-semibold text-ink">{room.title}</h1>
          <p className="mt-2 text-sm text-muted">
            {room.voters} {room.voters === 1 ? "vote" : "votes"}
            {room.status === "closed" ? " · locked" : " · open"}
          </p>

          {room.status === "closed" && leader ? (
            <div className="mt-5 rounded-2xl bg-pine px-4 py-4 text-pine-soft">
              <p className="text-sm font-medium tracking-wide uppercase">The call</p>
              <p className="mt-1 font-display text-3xl font-semibold text-bg">{leader.label}</p>
              <p className="mt-1 text-sm">
                {leader.votes} {leader.votes === 1 ? "vote" : "votes"}
              </p>
            </div>
          ) : null}

          <ul className="mt-6 flex flex-col gap-2">
            {room.options.length === 0 ? (
              <li className="rounded-2xl border border-dashed border-line px-4 py-6 text-sm text-muted">
                Nothing on the list yet. Add the first option.
              </li>
            ) : (
              room.options.map((option) => {
                const mine = room.myVote === option.id;
                const width = room.voters === 0 ? 0 : Math.round((option.votes / room.voters) * 100);
                return (
                  <li key={option.id}>
                    <button
                      type="button"
                      disabled={room.status === "closed"}
                      onClick={() => void onVote(option.id)}
                      className={`relative w-full overflow-hidden rounded-2xl border px-4 py-3 text-left disabled:opacity-90 ${
                        mine ? "border-ember bg-surface" : "border-line bg-surface"
                      }`}
                    >
                      <span
                        className="absolute inset-y-0 left-0 bg-pine-soft"
                        style={{ width: `${width}%` }}
                        aria-hidden
                      />
                      <span className="relative flex items-center justify-between gap-3">
                        <span className="text-base font-medium text-ink">{option.label}</span>
                        <span className="text-sm font-semibold text-muted">{option.votes}</span>
                      </span>
                    </button>
                  </li>
                );
              })
            )}
          </ul>

          {room.status === "open" ? (
            <form onSubmit={onAdd} className="mt-4 flex gap-2">
              <input
                value={draft}
                maxLength={80}
                onChange={(e) => setDraft(e.target.value)}
                placeholder="Add an option"
                aria-label="New option"
                className="min-h-12 min-w-0 flex-1 rounded-xl border border-line bg-surface px-3 text-base outline-none focus:border-ember"
              />
              <button
                type="submit"
                disabled={!draft.trim()}
                className="min-h-12 rounded-xl bg-ink px-4 font-semibold text-bg disabled:opacity-40"
              >
                Add
              </button>
            </form>
          ) : null}

          {error ? <p className="mt-3 text-sm text-ember">{error}</p> : null}

          <button
            type="button"
            onClick={() => void toggleLock()}
            disabled={room.options.length === 0}
            className="mt-6 min-h-12 rounded-xl bg-ember px-4 font-semibold text-ember-ink disabled:opacity-40"
          >
            {room.status === "open" ? "Call it" : "Reopen voting"}
          </button>
          <p className="mt-3 text-sm leading-relaxed text-muted">
            Share the code so everyone can vote from their own phone. Tap an option to vote, or tap another to switch.
          </p>
        </>
      )}
    </main>
  );
}

function topOption(room: RoomView | null | undefined) {
  if (!room || room.options.length === 0) return null;
  return [...room.options].sort((a, b) => b.votes - a.votes || a.id - b.id)[0];
}
