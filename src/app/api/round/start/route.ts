import { randomUUID } from "crypto";
import { PLACES } from "@/data/places";
import { rounds } from "@/lib/rounds";

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const exclude: string[] = Array.isArray(body.exclude) ? body.exclude : [];

  const pool = PLACES.filter((p) => !exclude.includes(p.id));
  const list = pool.length ? pool : PLACES;
  const place = list[Math.floor(Math.random() * list.length)];

  const roundId = randomUUID();
  rounds.set(roundId, { place, startedAt: Date.now() });

  return Response.json({ roundId, clue: place.clues[0] });
}