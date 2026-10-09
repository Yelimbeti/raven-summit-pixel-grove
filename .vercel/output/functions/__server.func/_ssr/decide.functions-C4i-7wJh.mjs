import { n as TSS_SERVER_FUNCTION, t as createServerFn } from "./ssr.mjs";
import { n as isCategory, r as randomCode } from "./decide-CCZChBCr.mjs";
import { a as string, i as object, r as number, t as _enum } from "../_libs/zod.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/decide.functions-C4i-7wJh.js
var createServerRpc = (serverFnMeta, splitImportFn) => {
	const url = "/_serverFn/" + serverFnMeta.id;
	return Object.assign(splitImportFn, {
		url,
		serverFnMeta,
		[TSS_SERVER_FUNCTION]: true
	});
};
var _0002_rooms_default = "create table if not exists rooms (\n  code text primary key,\n  title text not null,\n  category text not null,\n  status text not null default 'open',\n  created_at timestamptz not null default now()\n);\n\ncreate table if not exists options (\n  id serial primary key,\n  room_code text not null references rooms(code),\n  label text not null,\n  created_at timestamptz not null default now()\n);\n\ncreate index if not exists options_room_idx on options (room_code);\n\ncreate table if not exists votes (\n  room_code text not null,\n  option_id integer not null references options(id) on delete cascade,\n  voter_key text not null,\n  primary key (room_code, voter_key)\n);\n\ncreate index if not exists votes_option_idx on votes (option_id);\n";
/**
* Migration bookkeeping shared by the two appliers — `scripts/migrate.mjs`
* (deploy, `readdir`) and `src/lib/db.ts` (PGLite preview, `import.meta.glob`).
*
* Applied files are keyed by BASENAME, so the same file applies once no matter
* which directory it is globbed from. That is what makes the auth schema safe to
* copy from `migrations/auth/` into `migrations/` when an app turns sign-in on:
* a database that already has `0001_auth.sql` will not re-run it.
*
* Neither applier descends into subdirectories, so `migrations/auth/*.sql` is
* out of scope for both until it is copied up.
*/
/**
* The `_migrations` key for a migration path (or bare filename).
* @param {string} path
* @returns {string}
*/
function migrationName(path) {
	return path.split("/").pop() ?? path;
}
/**
* @param {string} path
* @returns {boolean}
*/
function isMigrationFile(path) {
	return path.endsWith(".sql");
}
/**
* Migrations in `paths` that are not yet in `applied`, in apply order.
* Non-`.sql` entries (a `readdir` also yields `migrations/auth/`) are dropped.
* @param {Iterable<string>} paths
* @param {Iterable<string>} applied
* @returns {Array<{ name: string, path: string }>}
*/
function pendingMigrations(paths, applied) {
	const done = new Set(applied);
	return [...paths].filter(isMigrationFile).map((path) => ({
		name: migrationName(path),
		path
	})).sort((a, b) => a.name.localeCompare(b.name)).filter(({ name }) => !done.has(name));
}
var rawDatabaseUrl = typeof process !== "undefined" ? process.env.DATABASE_URL : void 0;
var databaseUrl = rawDatabaseUrl && rawDatabaseUrl.trim() ? rawDatabaseUrl : void 0;
/**
* Active backend: real **Neon** when `DATABASE_URL` is set (deployed / configured
* sandbox), otherwise a local embedded **PGLite** (Postgres compiled to WASM) so
* the app has a working database even with nothing configured — the live preview
* included. Swap in Neon later by just setting `DATABASE_URL`; no code changes.
*/
var dbSource = databaseUrl ? "neon" : "pglite";
/**
* Init state lives on globalThis as promises: dev HMR creates new instances of
* this module, and two instances racing module-level state would open a second
* pool or run two concurrent PGLite migration passes (whose duplicate
* `_migrations` insert rejects — and would get memoized, poisoning every later
* `getSql()`). A failed init clears its slot so the next call retries.
*/
var globalRef = globalThis;
/**
* Result-type parity: Postgres sends every value as text plus a type OID — the
* JS value is the DRIVER's parsing choice, and pg and PGLite disagree (pg:
* int8 -> string, date -> local-midnight Date; PGLite: int8 -> BigInt, which
* JSON.stringify rejects, date -> UTC Date). Normalize both so preview and
* production return identical, JSON-safe shapes:
*   int8/bigint (incl. count(*)) -> number (past 2^53 loses precision — cast
*                                   `::text` if you ever need huge integers)
*   date                         -> 'YYYY-MM-DD' string
*   interval                     -> Postgres interval text
* numeric already comes back as a string on both (arbitrary precision).
*/
var OID_INT8 = 20;
var OID_DATE = 1082;
var OID_INTERVAL = 1186;
var identity = (v) => v;
/** Wrap a query runner in the tagged-template + `.query()` `Sql` surface. */
function toSql(run) {
	const sql = (async (strings, ...values) => {
		let text = strings[0];
		for (let i = 0; i < values.length; i += 1) text += `$${i + 1}${strings[i + 1]}`;
		return run(text, values);
	});
	sql.query = (text, params = []) => run(text, params);
	return sql;
}
function createNeonSql() {
	globalRef.__pgSqlPromise__ ??= (async () => {
		const { Pool, types } = await import("../_libs/pg.mjs").then((n) => n.t);
		types.setTypeParser(OID_INT8, Number);
		types.setTypeParser(OID_DATE, identity);
		types.setTypeParser(OID_INTERVAL, identity);
		const pool = new Pool({ connectionString: databaseUrl });
		return toSql(async (text, params) => {
			return (await pool.query(text, params)).rows;
		});
	})().catch((err) => {
		globalRef.__pgSqlPromise__ = void 0;
		throw err;
	});
	return globalRef.__pgSqlPromise__;
}
async function createPgliteSql() {
	globalRef.__pgliteInstance__ ??= (async () => {
		const { PGlite } = await import("../_libs/electric-sql__pglite.mjs").then((n) => n.t);
		const pg = new PGlite({ parsers: {
			[OID_INT8]: Number,
			[OID_DATE]: identity,
			[OID_INTERVAL]: identity
		} });
		await pg.waitReady;
		await pg.exec("create table if not exists _migrations (name text primary key, applied_at timestamptz not null default now())");
		return pg;
	})().catch((err) => {
		globalRef.__pgliteInstance__ = void 0;
		throw err;
	});
	const pg = await globalRef.__pgliteInstance__;
	const migrate = async () => {
		const migrations = /* #__PURE__ */ Object.assign({ "/migrations/0002_rooms.sql": _0002_rooms_default });
		const done = (await pg.query("select name from _migrations")).rows.map((r) => r.name);
		for (const { name, path } of pendingMigrations(Object.keys(migrations), done)) await pg.transaction(async (tx) => {
			await tx.exec(migrations[path]);
			await tx.query("insert into _migrations (name) values ($1)", [name]);
		});
	};
	const pass = (globalRef.__pgliteMigrateChain__ ?? Promise.resolve()).catch(() => void 0).then(migrate);
	globalRef.__pgliteMigrateChain__ = pass;
	await pass;
	return toSql(async (text, params) => {
		return (await pg.query(text, params)).rows;
	});
}
var sqlPromise = null;
async function createSql() {
	if (typeof window !== "undefined") throw new Error("@/lib/db is server-only — call getSql() from a createServerFn handler or a server route loader, never from client code.");
	return dbSource === "neon" ? createNeonSql() : createPgliteSql();
}
/**
* Get the shared, **server-only** SQL client. Neon when `DATABASE_URL` is set,
* otherwise the local PGLite fallback. Memoized — safe to call per request.
*
* Schema comes from `migrations/*.sql`, auto-applied before the first query on
* both backends — define tables there, never inline in server functions.
*/
function getSql() {
	sqlPromise ??= createSql().catch((err) => {
		sqlPromise = null;
		throw err;
	});
	return sqlPromise;
}
/**
* Finish DB bootstrap before the server handles traffic.
*
* - **PGLite** (preview / no `DATABASE_URL`): open the in-memory DB and apply
*   `migrations/*.sql`. Idempotent — concurrent callers share one promise.
* - **Neon**: no-op (pool is created lazily on first query).
*
* Vite `configureServer` awaits this at dev startup; production imports of this
* module kick it off immediately (see bottom of file).
*/
function ensureDbReady() {
	if (dbSource !== "pglite") return Promise.resolve();
	return getSql().then(() => void 0);
}
var globalBoot = globalThis;
if (typeof window === "undefined" && dbSource === "pglite") globalBoot.__pgBootstrapPromise__ ??= ensureDbReady().catch((err) => {
	globalBoot.__pgBootstrapPromise__ = void 0;
	console.error("[db] PGLite bootstrap failed:", err);
	throw err;
});
var codeSchema = string().trim().toLowerCase().regex(/^[a-z]{3,8}\d{2}$/);
var voterSchema = string().trim().min(8).max(64).regex(/^[a-zA-Z0-9_-]+$/);
var labelSchema = string().trim().min(1).max(80);
async function loadRoom(code, voterKey) {
	const sql = await getSql();
	const room = (await sql`
    select code, title, category, status from rooms where code = ${code}
  `)[0];
	if (!room) return null;
	const options = await sql`
    select o.id, o.label, count(v.voter_key)::int as votes
    from options o
    left join votes v on v.option_id = o.id
    where o.room_code = ${code}
    group by o.id, o.label, o.created_at
    order by o.created_at asc
  `;
	const mine = await sql`
    select option_id from votes where room_code = ${code} and voter_key = ${voterKey}
  `;
	const tally = await sql`
    select count(*)::int as n from votes where room_code = ${code}
  `;
	return {
		code: room.code,
		title: room.title,
		category: room.category,
		status: room.status === "closed" ? "closed" : "open",
		options,
		myVote: mine[0]?.option_id ?? null,
		voters: tally[0]?.n ?? 0
	};
}
var createRoom_createServerFn_handler = createServerRpc({
	id: "225d1af2057fbe0020919d526935498b40e9efc9e6cdaca4b32e59bc20b583a4",
	name: "createRoom",
	filename: "src/lib/decide.functions.ts"
}, (opts) => createRoom.__executeServer(opts));
var createRoom = createServerFn({ method: "POST" }).validator(object({
	title: string().trim().min(1).max(80),
	category: string()
})).handler(createRoom_createServerFn_handler, async ({ data }) => {
	if (!isCategory(data.category)) throw new Error("Pick a category.");
	const sql = await getSql();
	for (let i = 0; i < 8; i++) {
		const code = randomCode();
		if ((await sql`select code from rooms where code = ${code}`).length) continue;
		await sql`
        insert into rooms (code, title, category) values (${code}, ${data.title}, ${data.category})
      `;
		return { code };
	}
	throw new Error("Could not open a room. Try again.");
});
var getRoom_createServerFn_handler = createServerRpc({
	id: "e0f4b95563cb30d1609476a6b1d4994563d0f0d66df9445f1b5a9b63d31c2f66",
	name: "getRoom",
	filename: "src/lib/decide.functions.ts"
}, (opts) => getRoom.__executeServer(opts));
var getRoom = createServerFn({ method: "POST" }).validator(object({
	code: codeSchema,
	voterKey: voterSchema
})).handler(getRoom_createServerFn_handler, async ({ data }) => loadRoom(data.code, data.voterKey));
var addOption_createServerFn_handler = createServerRpc({
	id: "a5f40664bec6742d535741a0c24ccc4204a2aa3e6f274045d79799e833bc30ea",
	name: "addOption",
	filename: "src/lib/decide.functions.ts"
}, (opts) => addOption.__executeServer(opts));
var addOption = createServerFn({ method: "POST" }).validator(object({
	code: codeSchema,
	label: labelSchema
})).handler(addOption_createServerFn_handler, async ({ data }) => {
	const sql = await getSql();
	const rooms = await sql`select status from rooms where code = ${data.code}`;
	if (!rooms[0]) throw new Error("That room does not exist.");
	if (rooms[0].status === "closed") throw new Error("Voting is closed.");
	if ((await sql`
      select id from options where room_code = ${data.code} and lower(label) = lower(${data.label})
    `).length) throw new Error("That option is already on the list.");
	if (((await sql`select count(*)::int as n from options where room_code = ${data.code}`)[0]?.n ?? 0) >= 12) throw new Error("Twelve options is plenty.");
	await sql`insert into options (room_code, label) values (${data.code}, ${data.label})`;
	return { ok: true };
});
var castVote_createServerFn_handler = createServerRpc({
	id: "ac18b05d6aa657850187963465d4f8981200402daef509af567701578ec99aab",
	name: "castVote",
	filename: "src/lib/decide.functions.ts"
}, (opts) => castVote.__executeServer(opts));
var castVote = createServerFn({ method: "POST" }).validator(object({
	code: codeSchema,
	optionId: number().int().positive(),
	voterKey: voterSchema
})).handler(castVote_createServerFn_handler, async ({ data }) => {
	const sql = await getSql();
	const rooms = await sql`select status from rooms where code = ${data.code}`;
	if (!rooms[0]) throw new Error("That room does not exist.");
	if (rooms[0].status === "closed") throw new Error("Voting is closed.");
	if (!(await sql`
      select id from options where id = ${data.optionId} and room_code = ${data.code}
    `)[0]) throw new Error("That option is gone.");
	await sql`
      insert into votes (room_code, option_id, voter_key)
      values (${data.code}, ${data.optionId}, ${data.voterKey})
      on conflict (room_code, voter_key) do update set option_id = excluded.option_id
    `;
	return { ok: true };
});
var setStatus_createServerFn_handler = createServerRpc({
	id: "d7983fe5bbf9f31537ce171772ce03ebf5939bb57f1fd7af73589a61f868978f",
	name: "setStatus",
	filename: "src/lib/decide.functions.ts"
}, (opts) => setStatus.__executeServer(opts));
var setStatus = createServerFn({ method: "POST" }).validator(object({
	code: codeSchema,
	status: _enum(["open", "closed"])
})).handler(setStatus_createServerFn_handler, async ({ data }) => {
	if (!(await (await getSql())`
      update rooms set status = ${data.status} where code = ${data.code} returning code
    `)[0]) throw new Error("That room does not exist.");
	return { ok: true };
});
//#endregion
export { addOption_createServerFn_handler, castVote_createServerFn_handler, createRoom_createServerFn_handler, getRoom_createServerFn_handler, setStatus_createServerFn_handler };
