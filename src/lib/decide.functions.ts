import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { getSql } from "@/lib/db";
import { isCategory, randomCode } from "@/lib/decide";

const codeSchema = z
  .string()
  .trim()
  .toLowerCase()
  .regex(/^[a-z]{3,8}\d{2}$/);

const voterSchema = z.string().trim().min(8).max(64).regex(/^[a-zA-Z0-9_-]+$/);

const labelSchema = z.string().trim().min(1).max(80);

export type RoomOption = { id: number; label: string; votes: number };

export type RoomView = {
  code: string;
  title: string;
  category: string;
  status: "open" | "closed";
  options: RoomOption[];
  myVote: number | null;
  voters: number;
};

async function loadRoom(code: string, voterKey: string): Promise<RoomView | null> {
  const sql = await getSql();
  const rooms = await sql<{ code: string; title: string; category: string; status: string }>`
    select code, title, category, status from rooms where code = ${code}
  `;
  const room = rooms[0];
  if (!room) return null;

  const options = await sql<{ id: number; label: string; votes: number }>`
    select o.id, o.label, count(v.voter_key)::int as votes
    from options o
    left join votes v on v.option_id = o.id
    where o.room_code = ${code}
    group by o.id, o.label, o.created_at
    order by o.created_at asc
  `;

  const mine = await sql<{ option_id: number }>`
    select option_id from votes where room_code = ${code} and voter_key = ${voterKey}
  `;
  const tally = await sql<{ n: number }>`
    select count(*)::int as n from votes where room_code = ${code}
  `;

  return {
    code: room.code,
    title: room.title,
    category: room.category,
    status: room.status === "closed" ? "closed" : "open",
    options,
    myVote: mine[0]?.option_id ?? null,
    voters: tally[0]?.n ?? 0,
  };
}

export const createRoom = createServerFn({ method: "POST" })
  .validator(
    z.object({
      title: z.string().trim().min(1).max(80),
      category: z.string(),
    }),
  )
  .handler(async ({ data }): Promise<{ code: string }> => {
    if (!isCategory(data.category)) throw new Error("Pick a category.");
    const sql = await getSql();
    for (let i = 0; i < 8; i++) {
      const code = randomCode();
      const existing = await sql<{ code: string }>`select code from rooms where code = ${code}`;
      if (existing.length) continue;
      await sql`
        insert into rooms (code, title, category) values (${code}, ${data.title}, ${data.category})
      `;
      return { code };
    }
    throw new Error("Could not open a room. Try again.");
  });

export const getRoom = createServerFn({ method: "POST" })
  .validator(z.object({ code: codeSchema, voterKey: voterSchema }))
  .handler(async ({ data }): Promise<RoomView | null> => loadRoom(data.code, data.voterKey));

export const addOption = createServerFn({ method: "POST" })
  .validator(z.object({ code: codeSchema, label: labelSchema }))
  .handler(async ({ data }): Promise<{ ok: true }> => {
    const sql = await getSql();
    const rooms = await sql<{ status: string }>`select status from rooms where code = ${data.code}`;
    if (!rooms[0]) throw new Error("That room does not exist.");
    if (rooms[0].status === "closed") throw new Error("Voting is closed.");
    const dup = await sql<{ id: number }>`
      select id from options where room_code = ${data.code} and lower(label) = lower(${data.label})
    `;
    if (dup.length) throw new Error("That option is already on the list.");
    const count = await sql<{ n: number }>`select count(*)::int as n from options where room_code = ${data.code}`;
    if ((count[0]?.n ?? 0) >= 12) throw new Error("Twelve options is plenty.");
    await sql`insert into options (room_code, label) values (${data.code}, ${data.label})`;
    return { ok: true };
  });

export const castVote = createServerFn({ method: "POST" })
  .validator(z.object({ code: codeSchema, optionId: z.number().int().positive(), voterKey: voterSchema }))
  .handler(async ({ data }): Promise<{ ok: true }> => {
    const sql = await getSql();
    const rooms = await sql<{ status: string }>`select status from rooms where code = ${data.code}`;
    if (!rooms[0]) throw new Error("That room does not exist.");
    if (rooms[0].status === "closed") throw new Error("Voting is closed.");
    const opt = await sql<{ id: number }>`
      select id from options where id = ${data.optionId} and room_code = ${data.code}
    `;
    if (!opt[0]) throw new Error("That option is gone.");
    await sql`
      insert into votes (room_code, option_id, voter_key)
      values (${data.code}, ${data.optionId}, ${data.voterKey})
      on conflict (room_code, voter_key) do update set option_id = excluded.option_id
    `;
    return { ok: true };
  });

export const setStatus = createServerFn({ method: "POST" })
  .validator(z.object({ code: codeSchema, status: z.enum(["open", "closed"]) }))
  .handler(async ({ data }): Promise<{ ok: true }> => {
    const sql = await getSql();
    const updated = await sql<{ code: string }>`
      update rooms set status = ${data.status} where code = ${data.code} returning code
    `;
    if (!updated[0]) throw new Error("That room does not exist.");
    return { ok: true };
  });
