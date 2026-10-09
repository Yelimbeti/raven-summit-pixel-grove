import { o as __toESM } from "../_runtime.mjs";
import { S as require_jsx_runtime, Y as require_react, b as useNavigate } from "../_libs/@tanstack/react-router+[...].mjs";
import { t as CATEGORIES } from "./decide-CCZChBCr.mjs";
import { o as useServerFn, r as createRoom } from "./decide.functions-DjidTE_9.mjs";
import { a as Map, c as Clapperboard, i as Plane, o as Gamepad2, r as ShoppingBag, t as UtensilsCrossed } from "../_libs/lucide-react.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/routes-VEXHE0ay.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var ICONS = {
	movies: Clapperboard,
	food: UtensilsCrossed,
	plans: Map,
	games: Gamepad2,
	travel: Plane,
	order: ShoppingBag
};
function Home() {
	const navigate = useNavigate();
	const create = useServerFn(createRoom);
	const [category, setCategory] = (0, import_react.useState)("movies");
	const [title, setTitle] = (0, import_react.useState)(CATEGORIES[0].prompt);
	const [touched, setTouched] = (0, import_react.useState)(false);
	const [join, setJoin] = (0, import_react.useState)("");
	const [busy, setBusy] = (0, import_react.useState)(false);
	const [error, setError] = (0, import_react.useState)("");
	function pick(id) {
		const next = CATEGORIES.find((c) => c.id === id);
		setCategory(id);
		if (!touched) setTitle(next.prompt);
	}
	async function onCreate(e) {
		e.preventDefault();
		setError("");
		setBusy(true);
		try {
			const { code } = await create({ data: {
				title: title.trim(),
				category
			} });
			await navigate({
				to: "/r/$code",
				params: { code }
			});
		} catch (err) {
			setError(err instanceof Error ? err.message : "Could not start.");
			setBusy(false);
		}
	}
	function onJoin(e) {
		e.preventDefault();
		const code = join.trim().toLowerCase();
		if (!/^[a-z]{3,8}\d{2}$/.test(code)) {
			setError("Codes look like mango42.");
			return;
		}
		navigate({
			to: "/r/$code",
			params: { code }
		});
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
		className: "mx-auto flex min-h-dvh w-full max-w-lg flex-col px-5 py-10",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm font-medium tracking-[0.18em] text-muted uppercase",
				children: "Call It"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h1", {
				className: "mt-3 font-display text-5xl leading-[1.05] font-semibold text-ink",
				children: ["Stop arguing.", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "block text-ember",
					children: "Just pick."
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-4 max-w-sm text-base leading-relaxed text-muted",
				children: "Open a room, drop in options, and let the group vote. One phone or many — same short code."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
				onSubmit: onCreate,
				className: "mt-8 rounded-2xl border border-line bg-surface p-4 shadow-sm",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm font-medium text-ink",
						children: "What are you deciding?"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mt-3 grid grid-cols-3 gap-2",
						children: CATEGORIES.map((c) => {
							const Icon = ICONS[c.id];
							const on = c.id === category;
							return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
								type: "button",
								onClick: () => pick(c.id),
								className: `flex min-h-16 flex-col items-start justify-center gap-1 rounded-xl border px-3 py-2 text-left text-sm font-medium transition-colors ${on ? "border-ember bg-ember text-ember-ink" : "border-line bg-bg text-ink hover:border-ink"}`,
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, {
									size: 18,
									strokeWidth: 1.75
								}), c.label]
							}, c.id);
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
						className: "mt-4 block text-sm font-medium text-ink",
						htmlFor: "title",
						children: "Question"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						id: "title",
						value: title,
						maxLength: 80,
						onChange: (e) => {
							setTouched(true);
							setTitle(e.target.value);
						},
						className: "mt-2 w-full rounded-xl border border-line bg-bg px-3 py-3 text-base text-ink outline-none focus:border-ember"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "submit",
						disabled: busy || !title.trim(),
						className: "mt-4 min-h-12 w-full rounded-xl bg-ink px-4 text-base font-semibold text-bg disabled:opacity-50",
						children: busy ? "Opening…" : "Open a room"
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
				onSubmit: onJoin,
				className: "mt-4 flex gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
					value: join,
					onChange: (e) => setJoin(e.target.value),
					placeholder: "Join with a code",
					"aria-label": "Room code",
					className: "min-h-12 min-w-0 flex-1 rounded-xl border border-line bg-surface px-3 text-base text-ink outline-none focus:border-ember"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "submit",
					className: "min-h-12 rounded-xl border border-ink px-4 font-semibold text-ink",
					children: "Join"
				})]
			}),
			error ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-3 text-sm text-ember",
				children: error
			}) : null
		]
	});
}
//#endregion
export { Home as component };
