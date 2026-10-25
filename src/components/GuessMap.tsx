"use client";

import { useEffect, useRef } from "react";
import * as maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";

type LatLng = { lat: number; lng: number };

type Props = {
  disabled: boolean;
  guess: LatLng | null;
  answer: LatLng | null;
  onGuess: (p: LatLng) => void;
};

export default function GuessMap({ disabled, guess, answer, onGuess }: Props) {
  const container = useRef<HTMLDivElement>(null);
  const map = useRef<maplibregl.Map | null>(null);
  const guessMarker = useRef<maplibregl.Marker | null>(null);
  const answerMarker = useRef<maplibregl.Marker | null>(null);

  
  const disabledRef = useRef(disabled);
  disabledRef.current = disabled;
  const onGuessRef = useRef(onGuess);
  onGuessRef.current = onGuess;

 
  useEffect(() => {
    const m = new maplibregl.Map({
      container: container.current!,
     
      style: "https://demotiles.maplibre.org/style.json",
      center: [15, 30],
      zoom: 1.5,
    });
    m.on("click", (e) => {
      if (disabledRef.current) return;
      onGuessRef.current({ lat: e.lngLat.lat, lng: e.lngLat.lng });
    });
    map.current = m;
    return () => m.remove();
  }, []);

  
  useEffect(() => {
    const m = map.current;
    if (!m) return;
    guessMarker.current?.remove();
    guessMarker.current = guess
      ? new maplibregl.Marker({ color: "#2563eb" }).setLngLat([guess.lng, guess.lat]).addTo(m)
      : null;
  }, [guess]);

  useEffect(() => {
    const m = map.current;
    if (!m) return;

    answerMarker.current?.remove();
    answerMarker.current = null;
    if (m.getLayer("line")) m.removeLayer("line");
    if (m.getSource("line")) m.removeSource("line");
    if (!answer) return;

    answerMarker.current = new maplibregl.Marker({ color: "#16a34a" })
      .setLngLat([answer.lng, answer.lat])
      .addTo(m);

    if (guess) {
      m.addSource("line", {
        type: "geojson",
        data: {
          type: "Feature",
          properties: {},
          geometry: {
            type: "LineString",
            coordinates: [
              [guess.lng, guess.lat],
              [answer.lng, answer.lat],
            ],
          },
        },
      });
      m.addLayer({
        id: "line",
        type: "line",
        source: "line",
        paint: { "line-color": "#444444", "line-width": 2, "line-dasharray": [2, 2] },
      });
    }
  }, [answer, guess]);

  return <div ref={container} style={{ width: "100%", height: "100%" }} />;
}