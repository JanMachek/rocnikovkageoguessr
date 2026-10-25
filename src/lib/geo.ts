import { CLUE_EVERY_MS, MAX_CLUES } from "./config";

type LatLng = { lat: number; lng: number };

export function haversineKm(a: LatLng, b: LatLng): number {
  const R = 6371;
  const rad = (d: number) => (d * Math.PI) / 180;
  const dLat = rad(b.lat - a.lat);
  const dLng = rad(b.lng - a.lng);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}


export function distancePoints(km: number): number {
  return 5000 * Math.exp(-km / 1500);
}


export function clueMultiplier(cluesUsed: number): number {
  return [1, 0.8, 0.6, 0.4][cluesUsed - 1] ?? 0.4;
}


export function cluesUnlocked(elapsedMs: number): number {
  return Math.min(MAX_CLUES, 1 + Math.floor(elapsedMs / CLUE_EVERY_MS));
}