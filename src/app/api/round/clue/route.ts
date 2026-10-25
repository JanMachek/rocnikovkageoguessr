import { rounds } from "@/lib/rounds";
import { cluesUnlocked } from "@/lib/geo";

export async function POST(req: Request) {
  const { roundId } = await req.json();
  const round = rounds.get(roundId);
  if (!round) return Response.json({ error: "Kolo neexistuje" }, { status: 404 });

  const unlocked = cluesUnlocked(Date.now() - round.startedAt + 1000);
  return Response.json({ clues: round.place.clues.slice(0, unlocked) });
}