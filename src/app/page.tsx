"use client";

import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import type { Clue } from "@/lib/types";
import { ROUNDS, ROUND_SECONDS, CLUE_EVERY_MS } from "@/lib/config";

const GuessMap = dynamic(() => import("@/components/GuessMap"), { ssr: false });

type LatLng = { lat: number; lng: number };
type Result = {
  distanceKm: number | null;
  score: number;
  cluesUsed: number;
  answer: { id: string; name: string; country: string; lat: number; lng: number };
};

const CLUE_EVERY_S = CLUE_EVERY_MS / 1000;

export default function Home() {
  const [roundId, setRoundId] = useState<string | null>(null);
  const [clues, setClues] = useState<Clue[]>([]);
  const [guess, setGuess] = useState<LatLng | null>(null);
  const [result, setResult] = useState<Result | null>(null);
  const [roundNo, setRoundNo] = useState(0);
  const [total, setTotal] = useState(0);
  const [elapsed, setElapsed] = useState(0);

  const played = useRef<string[]>([]);
  const submitting = useRef(false);

  async function startRound() {
    submitting.current = false;
    setResult(null);
    setGuess(null);
    setElapsed(0);
    const r = await fetch("/api/round/start", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ exclude: played.current }),
    }).then((res) => res.json());
    setRoundId(r.roundId);
    setClues([r.clue]);
    setRoundNo((n) => n + 1);
  }

  async function loadClues() {
    if (!roundId) return;
    const r = await fetch("/api/round/clue", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ roundId }),
    }).then((res) => res.json());
    if (r.clues) setClues(r.clues);
  }

  async function submit() {
    if (!roundId || submitting.current) return;
    submitting.current = true;
    const r: Result = await fetch("/api/round/guess", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ roundId, lat: guess?.lat, lng: guess?.lng }),
    }).then((res) => res.json());
    played.current.push(r.answer.id);
    setResult(r);
    setTotal((t) => t + r.score);
  }

  function resetGame() {
    played.current = [];
    setRoundId(null);
    setResult(null);
    setGuess(null);
    setClues([]);
    setRoundNo(0);
    setTotal(0);
  }

  // odpočet
  useEffect(() => {
    if (!roundId || result) return;
    const t = setInterval(() => setElapsed((e) => e + 1), 1000);
    return () => clearInterval(t);
  }, [roundId, result]);


  useEffect(() => {
    if (!roundId || result) return;
    if (elapsed > 0 && elapsed % CLUE_EVERY_S === 0 && elapsed < ROUND_SECONDS) loadClues();
    if (elapsed >= ROUND_SECONDS) submit();
   
  }, [elapsed]);

  const lastRound = roundNo >= ROUNDS;

  return (
    <main className="game">
      <aside className="panel">
        <h1>Název hry</h1>

        {!roundId ? (
          <button onClick={startRound}>Hrát</button>
        ) : (
          <>
            <div className="meta">
              Kolo {roundNo}/{ROUNDS} · Skóre {total} · {Math.max(0, ROUND_SECONDS - elapsed)} s
            </div>

            <ol className="clues">
              {clues.map((c) => (
                <li key={c.level}>
                  {c.image && <img src={c.image} alt="" />}
                  {c.text}
                </li>
              ))}
            </ol>

            {!result && (
              <button disabled={!guess} onClick={submit}>
                Potvrdit tip
              </button>
            )}

            {result && (
              <div className="result">
                <h2>
                  {result.answer.name}, {result.answer.country}
                </h2>
                {result.distanceKm === null ? (
                  <p>Bez tipu, 0 bodů.</p>
                ) : (
                  <p>
                    Vzdálenost: {result.distanceKm} km · indicií: {result.cluesUsed}
                  </p>
                )}
                <p className="points">+{result.score} bodů</p>

                {lastRound ? (
                  <>
                    <p>Konec hry! Celkem: {total} bodů</p>
                    <button onClick={resetGame}>Hrát znovu</button>
                  </>
                ) : (
                  <button onClick={startRound}>Další kolo</button>
                )}
              </div>
            )}
          </>
        )}
      </aside>

      <div className="mapWrap">
        <GuessMap
          disabled={!roundId || !!result}
          guess={guess}
          answer={result ? result.answer : null}
          onGuess={setGuess}
        />
      </div>
    </main>
  );
}