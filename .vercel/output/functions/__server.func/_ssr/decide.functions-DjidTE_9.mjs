import { o as __toESM } from "../_runtime.mjs";
import { G as isRedirect, Y as require_react, x as useRouter } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as TSS_SERVER_FUNCTION, r as getServerFnById, t as createServerFn } from "./ssr.mjs";
import { a as string, i as object, r as number, t as _enum } from "../_libs/zod.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/decide.functions-DjidTE_9.js
var import_react = /* @__PURE__ */ __toESM(require_react());
function useServerFn(serverFn) {
	const router = useRouter();
	return import_react.useCallback(async (...args) => {
		try {
			const res = await serverFn(...args);
			if (isRedirect(res)) throw res;
			return res;
		} catch (err) {
			if (isRedirect(err)) {
				err.options._fromLocation = router.stores.location.get();
				return router.navigate(router.resolveRedirect(err).options);
			}
			throw err;
		}
	}, [router, serverFn]);
}
var createSsrRpc = (functionId) => {
	const url = "/_serverFn/" + functionId;
	const serverFnMeta = { id: functionId };
	const fn = async (...args) => {
		return (await getServerFnById(functionId, { origin: "server" }))(...args);
	};
	return Object.assign(fn, {
		url,
		serverFnMeta,
		[TSS_SERVER_FUNCTION]: true
	});
};
var codeSchema = string().trim().toLowerCase().regex(/^[a-z]{3,8}\d{2}$/);
var voterSchema = string().trim().min(8).max(64).regex(/^[a-zA-Z0-9_-]+$/);
var labelSchema = string().trim().min(1).max(80);
var createRoom = createServerFn({ method: "POST" }).validator(object({
	title: string().trim().min(1).max(80),
	category: string()
})).handler(createSsrRpc("225d1af2057fbe0020919d526935498b40e9efc9e6cdaca4b32e59bc20b583a4"));
var getRoom = createServerFn({ method: "POST" }).validator(object({
	code: codeSchema,
	voterKey: voterSchema
})).handler(createSsrRpc("e0f4b95563cb30d1609476a6b1d4994563d0f0d66df9445f1b5a9b63d31c2f66"));
var addOption = createServerFn({ method: "POST" }).validator(object({
	code: codeSchema,
	label: labelSchema
})).handler(createSsrRpc("a5f40664bec6742d535741a0c24ccc4204a2aa3e6f274045d79799e833bc30ea"));
var castVote = createServerFn({ method: "POST" }).validator(object({
	code: codeSchema,
	optionId: number().int().positive(),
	voterKey: voterSchema
})).handler(createSsrRpc("ac18b05d6aa657850187963465d4f8981200402daef509af567701578ec99aab"));
var setStatus = createServerFn({ method: "POST" }).validator(object({
	code: codeSchema,
	status: _enum(["open", "closed"])
})).handler(createSsrRpc("d7983fe5bbf9f31537ce171772ce03ebf5939bb57f1fd7af73589a61f868978f"));
//#endregion
export { setStatus as a, getRoom as i, castVote as n, useServerFn as o, createRoom as r, addOption as t };
