export type Clue = { level: number; text: string; image?: string };

export type Place = {
  id: string;
  name: string;
  country: string;
  lat: number;
  lng: number;
  difficulty: "easy" | "medium" | "hard";
  clues: Clue[];
};