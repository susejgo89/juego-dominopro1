export type Tile = [number, number];

export type PlayerId = 'p1' | 'p2' | 'p3' | 'p4';

export interface Player {
  id: PlayerId;
  name: string;
  avatar: string;
  isBot: boolean;
  hand: Tile[];
  score: number;
  team: 1 | 2; // Team 1: p1 & p3 (Nosotros); Team 2: p2 & p4 (Ellos)
}

export type GameMode =
  | 'tradicional'
  | 'duelo1v1'
  | 'fantasmita'
  | 'pozo'
  | 'pintitin'
  | 'torneo';

export interface PlacedTile {
  tile: Tile;
  endPlaced: 'left' | 'right' | 'first';
  isDouble: boolean;
}

export interface BoardState {
  tiles: PlacedTile[];
  leftEnd: number | null;
  rightEnd: number | null;
}

export interface GameSettings {
  mode: GameMode;
  targetPoints: number; // e.g. 100 or 200
  turnDuration: number; // e.g. 15 or 30s
  hasPozo: boolean;
  tableId: string;
  tableName: string;
  isPrivate: boolean;
  entryFee: number;
}

export interface RoundResult {
  winnerId: PlayerId | null;
  winnerTeam: 1 | 2 | null;
  pointsEarned: number;
  reason: 'domino' | 'tranca' | 'capicua' | 'zapato';
  summary: string;
}

export interface ScoreEntry {
  round: number;
  team1Points: number;
  team2Points: number;
  winnerTeam: 1 | 2;
  notes: string;
}

