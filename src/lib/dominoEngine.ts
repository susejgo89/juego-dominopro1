import { Tile, PlacedTile, BoardState, PlayerId } from "@/types/domino";

export function generateDominoSet(): Tile[] {
  const set: Tile[] = [];
  for (let i = 0; i <= 6; i++) {
    for (let j = i; j <= 6; j++) {
      set.push([i, j]);
    }
  }
  return set;
}

export function shuffleTiles(tiles: Tile[]): Tile[] {
  const arr = [...tiles];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export function dealDominoHands(tileCountPerPlayer = 7): {
  hands: { p1: Tile[]; p2: Tile[]; p3: Tile[]; p4: Tile[] };
  pozo: Tile[];
} {
  const pool = shuffleTiles(generateDominoSet());
  const p1 = pool.splice(0, tileCountPerPlayer);
  const p2 = pool.splice(0, tileCountPerPlayer);
  const p3 = pool.splice(0, tileCountPerPlayer);
  const p4 = pool.splice(0, tileCountPerPlayer);

  // Sort each hand by double first, then descending total
  const sortHand = (hand: Tile[]) =>
    hand.sort((a, b) => {
      const aDouble = a[0] === a[1] ? 100 : 0;
      const bDouble = b[0] === b[1] ? 100 : 0;
      return bDouble + (b[0] + b[1]) - (aDouble + (a[0] + a[1]));
    });

  return {
    hands: {
      p1: sortHand(p1),
      p2: sortHand(p2),
      p3: sortHand(p3),
      p4: sortHand(p4),
    },
    pozo: pool,
  };
}

export function getPlayableSides(
  tile: Tile,
  board: BoardState
): { canLeft: boolean; canRight: boolean } {
  if (board.tiles.length === 0) {
    return { canLeft: true, canRight: true };
  }

  const { leftEnd, rightEnd } = board;
  if (leftEnd === null || rightEnd === null) {
    return { canLeft: false, canRight: false };
  }

  const canLeft = tile[0] === leftEnd || tile[1] === leftEnd;
  const canRight = tile[0] === rightEnd || tile[1] === rightEnd;

  return { canLeft, canRight };
}

export function canPlayAny(hand: Tile[], board: BoardState): boolean {
  if (board.tiles.length === 0) return hand.length > 0;
  return hand.some((tile) => {
    const { canLeft, canRight } = getPlayableSides(tile, board);
    return canLeft || canRight;
  });
}

export function placeTileOnBoard(
  board: BoardState,
  tile: Tile,
  side: "left" | "right"
): { newBoard: BoardState; placed: PlacedTile } {
  const isDouble = tile[0] === tile[1];

  if (board.tiles.length === 0) {
    const placed: PlacedTile = { tile, endPlaced: "first", isDouble };
    return {
      newBoard: {
        tiles: [placed],
        leftEnd: tile[0],
        rightEnd: tile[1],
      },
      placed,
    };
  }

  let orientedTile: Tile = [...tile];
  let newLeft = board.leftEnd!;
  let newRight = board.rightEnd!;

  if (side === "left") {
    // We connect to leftEnd
    if (orientedTile[1] === newLeft) {
      newLeft = orientedTile[0];
    } else if (orientedTile[0] === newLeft) {
      orientedTile = [orientedTile[1], orientedTile[0]];
      newLeft = orientedTile[0];
    }
    const placed: PlacedTile = { tile: orientedTile, endPlaced: "left", isDouble };
    return {
      newBoard: {
        tiles: [placed, ...board.tiles],
        leftEnd: newLeft,
        rightEnd: newRight,
      },
      placed,
    };
  } else {
    // We connect to rightEnd
    if (orientedTile[0] === newRight) {
      newRight = orientedTile[1];
    } else if (orientedTile[1] === newRight) {
      orientedTile = [orientedTile[1], orientedTile[0]];
      newRight = orientedTile[1];
    }
    const placed: PlacedTile = { tile: orientedTile, endPlaced: "right", isDouble };
    return {
      newBoard: {
        tiles: [...board.tiles, placed],
        leftEnd: newLeft,
        rightEnd: newRight,
      },
      placed,
    };
  }
}

export function calculateHandPoints(hand: Tile[]): number {
  return hand.reduce((sum, [a, b]) => sum + a + b, 0);
}

export function chooseBotMove(
  hand: Tile[],
  board: BoardState
): { tile: Tile; side: "left" | "right" } | null {
  if (hand.length === 0) return null;

  if (board.tiles.length === 0) {
    // First play: prefer highest double or highest tile
    let best = hand[0];
    for (const t of hand) {
      if (t[0] === t[1] && (best[0] !== best[1] || t[0] > best[0])) {
        best = t;
      }
    }
    return { tile: best, side: "right" };
  }

  const validMoves: { tile: Tile; side: "left" | "right"; score: number }[] = [];

  for (const tile of hand) {
    const { canLeft, canRight } = getPlayableSides(tile, board);
    const weight = tile[0] + tile[1] + (tile[0] === tile[1] ? 10 : 0);

    if (canLeft) {
      validMoves.push({ tile, side: "left", score: weight });
    }
    if (canRight) {
      validMoves.push({ tile, side: "right", score: weight });
    }
  }

  if (validMoves.length === 0) return null;

  // Pick highest scoring move (play heavy tiles / doubles first)
  validMoves.sort((a, b) => b.score - a.score);
  return { tile: validMoves[0].tile, side: validMoves[0].side };
}

export function nextPlayer(current: PlayerId): PlayerId {
  switch (current) {
    case "p1":
      return "p2";
    case "p2":
      return "p3";
    case "p3":
      return "p4";
    case "p4":
      return "p1";
  }
}

