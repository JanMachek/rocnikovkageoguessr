import { rounds } from "@/lib/rounds";
import { ROUND_SECONDS } from "@/lib/config";
import { clueMultiplier, cluesUnlocked, distancePoints, haversineKm } from "@/lib/geo";

export async function POST(req: Request) {
  const { roundId, lat, lng } = await req.json();
  const round = rounds.get(roundId);
  if (!round) return Response.json({ error: "Kolo neexistuje" }, { status: 404 });
  rounds.delete(roundId); // každé kolo jde vyhodnotit jen jednou

  const elapsed = Date.now() - round.startedAt;
  const cluesUsed = cluesUnlocked(elapsed);
  const { place } = round;

  let distanceKm: number | null = null;
  let score = 0;

  const hasGuess = typeof lat === "number" && typeof lng === "number";
  const inTime = elapsed <= (ROUND_SECONDS + 3) * 1000;

  if (hasGuess && inTime) {
    distanceKm = haversineKm({ lat, lng }, place);
    score = Math.round(distancePoints(distanceKm) * clueMultiplier(cluesUsed));
  }

  return Response.json({
    distanceKm: distanceKm === null ? null : Math.round(distanceKm),
    score,
    cluesUsed,
    answer: {
      id: place.id,
      name: place.name,
      country: place.country,
      lat: place.lat,
      lng: place.lng,
    },
  });
}