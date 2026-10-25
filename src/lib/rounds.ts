import type { Place } from "./types";

export type Round = { place: Place; startedAt: number };

const g = globalThis as unknown as { __rounds?: Map<string, Round> };
export const rounds: Map<string, Round> = (g.__rounds ??= new Map());