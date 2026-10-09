import { o as __toESM } from "../_runtime.mjs";
import { S as require_jsx_runtime, Y as require_react, y as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { a as setStatus, i as getRoom, n as castVote, o as useServerFn, t as addOption } from "./decide.functions-DjidTE_9.mjs";
import { l as Check, s as Copy } from "../_libs/lucide-react.mjs";
import { n as Route } from "./router-BkDiaabd.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/r._code-CTjehB1c.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var KEY = "callit-voter";
function getVoterKey() {
	const existing = localStorage.getItem(KEY);
	if (existing && /^[a-zA-Z0-9_-]{8,64}$/.test(existing)) return existing;
	const bytes = /* @__PURE__ */ new Uint8Array(12);
	crypto.getRandomValues(bytes);
	const next = Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
	localStorage.setItem(KEY, next);
	return next;
}
function RoomPage() {
	const { code } = Route.useParams();
	const [voterKey, setVoterKey] = (0, import_react.useState)("");
	const [room, setRoom] = (0, import_react.useState)(void 0);
	const [draft, setDraft] = (0, import_react.useState)("");
	const [error, setError] = (0, import_react.useState)("");
	const [copied, setCopied] = (0, import_react.useState)(false);
	const fetchRoom = useServerFn(getRoom);
	const add = useServerFn(addOption);
	const vote = useServerFn(castVote);
	const status = useServerFn(setStatus);
	const load = (0, import_react.useCallback)(async (key) => {
		try {
			const next = await fetchRoom({ data: {
				code,
				voterKey: key
			} });
			setRoom(next);
		} catch {
			setError("Could not load this room.");
		}
	}, [code, fetchRoom]);
	(0, import_react.useEffect)(() => {
		const key = getVoterKey();
		setVoterKey(key);
		load(key);
		const id = window.setInterval(() => void load(key), 2500);
		return () => window.clearInterval(id);
	}, [load]);
	const leader = (0, import_react.useMemo)(() => topOption(room), [room]);
	async function onAdd(e) {
		e.preventDefault();
		if (!draft.trim() || !voterKey) return;
		setError("");
		try {
			await add({ data: {
				code,
				label: draft.trim()
			} });
			setDraft("");
			await load(voterKey);
		} catch (err) {
			setError(err instanceof Error ? err.message : "Could not add that.");
		}
	}
	async function onVote(optionId) {
		if (!voterKey) return;
		setError("");
		try {
			await vote({ data: {
				code,
				optionId,
				voterKey
			} });
			await load(voterKey);
		} catch (err) {
			setError(err instanceof Error ? err.message : "Vote failed.");
		}
	}
	async function toggleLock() {
		if (!room || !voterKey) return;
		setError("");
		try {
			await status({ data: {
				code,
				status: room.status === "open" ? "closed" : "open"
			} });
			await load(voterKey);
		} catch (err) {
			setError(err instanceof Error ? err.message : "Could not update the room.");
		}
	}
	async function copyCode() {
		const url = `${window.location.origin}/r/${code}`;
		try {
			await navigator.clipboard.writeText(url);
		} catch {}
		setCopied(true);
		window.setTimeout(() => setCopied(false), 1600);
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
		className: "mx-auto flex min-h-dvh w-full max-w-lg flex-col px-5 py-8",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex items-center justify-between gap-3",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
				to: "/",
				className: "text-sm font-medium tracking-[0.18em] text-muted uppercase",
				children: "Call It"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
				type: "button",
				onClick: () => void copyCode(),
				className: "inline-flex min-h-11 items-center gap-2 rounded-full border border-line bg-surface px-3 text-sm font-semibold text-ink",
				children: [copied ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, { size: 16 }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Copy, { size: 16 }), code]
			})]
		}), room === void 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "mt-16 text-muted",
			children: "Opening the room…"
		}) : room === null ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mt-16",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "font-display text-4xl font-semibold",
				children: "No room with that code."
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
				to: "/",
				className: "mt-6 inline-flex min-h-11 items-center font-semibold text-ember",
				children: "Start a new one"
			})]
		}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-8 text-sm font-medium text-muted capitalize",
				children: room.category
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "mt-1 font-display text-4xl leading-tight font-semibold text-ink",
				children: room.title
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "mt-2 text-sm text-muted",
				children: [
					room.voters,
					" ",
					room.voters === 1 ? "vote" : "votes",
					room.status === "closed" ? " · locked" : " · open"
				]
			}),
			room.status === "closed" && leader ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-5 rounded-2xl bg-pine px-4 py-4 text-pine-soft",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm font-medium tracking-wide uppercase",
						children: "The call"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-1 font-display text-3xl font-semibold text-bg",
						children: leader.label
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "mt-1 text-sm",
						children: [
							leader.votes,
							" ",
							leader.votes === 1 ? "vote" : "votes"
						]
					})
				]
			}) : null,
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
				className: "mt-6 flex flex-col gap-2",
				children: room.options.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", {
					className: "rounded-2xl border border-dashed border-line px-4 py-6 text-sm text-muted",
					children: "Nothing on the list yet. Add the first option."
				}) : room.options.map((option) => {
					const mine = room.myVote === option.id;
					const width = room.voters === 0 ? 0 : Math.round(option.votes / room.voters * 100);
					return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						type: "button",
						disabled: room.status === "closed",
						onClick: () => void onVote(option.id),
						className: `relative w-full overflow-hidden rounded-2xl border px-4 py-3 text-left disabled:opacity-90 ${mine ? "border-ember bg-surface" : "border-line bg-surface"}`,
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "absolute inset-y-0 left-0 bg-pine-soft",
							style: { width: `${width}%` },
							"aria-hidden": true
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "relative flex items-center justify-between gap-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-base font-medium text-ink",
								children: option.label
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-sm font-semibold text-muted",
								children: option.votes
							})]
						})]
					}) }, option.id);
				})
			}),
			room.status === "open" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
				onSubmit: onAdd,
				className: "mt-4 flex gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
					value: draft,
					maxLength: 80,
					onChange: (e) => setDraft(e.target.value),
					placeholder: "Add an option",
					"aria-label": "New option",
					className: "min-h-12 min-w-0 flex-1 rounded-xl border border-line bg-surface px-3 text-base outline-none focus:border-ember"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "submit",
					disabled: !draft.trim(),
					className: "min-h-12 rounded-xl bg-ink px-4 font-semibold text-bg disabled:opacity-40",
					children: "Add"
				})]
			}) : null,
			error ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-3 text-sm text-ember",
				children: error
			}) : null,
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				type: "button",
				onClick: () => void toggleLock(),
				disabled: room.options.length === 0,
				className: "mt-6 min-h-12 rounded-xl bg-ember px-4 font-semibold text-ember-ink disabled:opacity-40",
				children: room.status === "open" ? "Call it" : "Reopen voting"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-3 text-sm leading-relaxed text-muted",
				children: "Share the code so everyone can vote from their own phone. Tap an option to vote, or tap another to switch."
			})
		] })]
	});
}
function topOption(room) {
	if (!room || room.options.length === 0) return null;
	return [...room.options].sort((a, b) => b.votes - a.votes || a.id - b.id)[0];
}
//#endregion
export { RoomPage as component };
