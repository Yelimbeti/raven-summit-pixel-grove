//#region node_modules/.nitro/vite/services/ssr/assets/decide-CCZChBCr.js
var CATEGORIES = [
	{
		id: "movies",
		label: "Movies",
		prompt: "What should we watch?"
	},
	{
		id: "food",
		label: "Food",
		prompt: "Where should we eat?"
	},
	{
		id: "plans",
		label: "Plans",
		prompt: "What should we do?"
	},
	{
		id: "games",
		label: "Games",
		prompt: "What should we play?"
	},
	{
		id: "travel",
		label: "Travel",
		prompt: "Where should we go?"
	},
	{
		id: "order",
		label: "Order",
		prompt: "What should we order?"
	}
];
function isCategory(value) {
	return CATEGORIES.some((c) => c.id === value);
}
var WORDS = [
	"mango",
	"cedar",
	"olive",
	"maple",
	"coral",
	"ember",
	"pesto",
	"cocoa",
	"amber",
	"basil",
	"linen",
	"honey",
	"cider",
	"flint",
	"bloom",
	"river",
	"comet",
	"pearl",
	"sage",
	"plum"
];
function randomCode() {
	return `${WORDS[Math.floor(Math.random() * WORDS.length)]}${Math.floor(10 + Math.random() * 90)}`;
}
//#endregion
export { isCategory as n, randomCode as r, CATEGORIES as t };
