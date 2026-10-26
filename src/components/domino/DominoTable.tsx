"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Tile,
  BoardState,
  Player,
  PlayerId,
  GameSettings,
  RoundResult,
  ScoreEntry,
} from "@/types/domino";
import { DominoTile } from "./DominoTile";
import {
  dealDominoHands,
  getPlayableSides,
  canPlayAny,
  placeTileOnBoard,
  chooseBotMove,
  nextPlayer,
  calculateHandPoints,
} from "@/lib/dominoEngine";
import { sound } from "@/lib/dominoSound";
import {
  Volume2,
  VolumeX,
  ArrowLeft,
  RotateCcw,
  BookOpen,
  MessageSquare,
  Trophy,
  Clock,
  Sparkles,
} from "lucide-react";

interface DominoTableProps {
  settings: GameSettings;
  onExit: () => void;
}

export const DominoTable: React.FC<DominoTableProps> = ({ settings, onExit }) => {
  // Game state
  const [board, setBoard] = useState<BoardState>({
    tiles: [],
    leftEnd: null,
    rightEnd: null,
  });

  const [players, setPlayers] = useState<Record<PlayerId, Player>>({
    p1: {
      id: "p1",
      name: "Tú",
      avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&auto=format&fit=crop&q=80",
      isBot: false,
      hand: [],
      score: 0,
      team: 1,
    },
    p2: {
      id: "p2",
      name: "Carlos M.",
      avatar: "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=120&auto=format&fit=crop&q=80",
      isBot: true,
      hand: [],
      score: 0,
      team: 2,
    },
    p3: {
      id: "p3",
      name: "Sofía (Socia)",
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&auto=format&fit=crop&q=80",
      isBot: true,
      hand: [],
      score: 0,
      team: 1,
    },
    p4: {
      id: "p4",
      name: "Alejandro B.",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80",
      isBot: true,
      hand: [],
      score: 0,
      team: 2,
    },
  });

  const [pozo, setPozo] = useState<Tile[]>([]);
  const [currentTurn, setCurrentTurn] = useState<PlayerId>("p1");
  const [passCount, setPassCount] = useState(0);
  const [roundNumber, setRoundNumber] = useState(1);
  const [turnTimer, setTurnTimer] = useState(settings.turnDuration);
  const [teamScores, setTeamScores] = useState<{ team1: number; team2: number }>({
    team1: 0,
    team2: 0,
  });
  const [scoreHistory, setScoreHistory] = useState<ScoreEntry[]>([]);
  const [roundResult, setRoundResult] = useState<RoundResult | null>(null);
  const [pendingChoiceTile, setPendingChoiceTile] = useState<Tile | null>(null);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [showScorepad, setShowScorepad] = useState(false);
  const [chatMessages, setChatMessages] = useState<
    { sender: string; text: string; time: string }[]
  >([
    { sender: "Sistema", text: "¡Bienvenidos a la mesa! Buena suerte.", time: "00:01" },
  ]);
  const [showChat, setShowChat] = useState(false);
  const [activeReaction, setActiveReaction] = useState<string | null>(null);

  const boardScrollRef = useRef<HTMLDivElement>(null);

  // Finish round helper
  const finishRoundWithResult = (result: RoundResult, winnerTeam: 1 | 2, points: number) => {
    setRoundResult(result);

    const newTeamScores = {
      team1: teamScores.team1 + (winnerTeam === 1 ? points : 0),
      team2: teamScores.team2 + (winnerTeam === 2 ? points : 0),
    };

    setTeamScores(newTeamScores);

    setScoreHistory((prev) => [
      ...prev,
      {
        round: roundNumber,
        team1Points: newTeamScores.team1,
        team2Points: newTeamScores.team2,
        winnerTeam,
        notes: result.summary,
      },
    ]);
  };

  // Tranca (Cierre de mesa): Count points
  const handleTrancaEnd = () => {
    const p1Pts = calculateHandPoints(players.p1.hand);
    const p2Pts = calculateHandPoints(players.p2.hand);
    const p3Pts = calculateHandPoints(players.p3.hand);
    const p4Pts = calculateHandPoints(players.p4.hand);

    const team1Pts = p1Pts + p3Pts;
    const team2Pts = p2Pts + p4Pts;

    let winnerTeam: 1 | 2;
    let winnerId: PlayerId;
    let earned: number;

    if (team1Pts < team2Pts) {
      winnerTeam = 1;
      winnerId = p1Pts <= p3Pts ? "p1" : "p3";
      earned = team2Pts;
    } else {
      winnerTeam = 2;
      winnerId = p2Pts <= p4Pts ? "p2" : "p4";
      earned = team1Pts;
    }

    sound.playWin();

    const result: RoundResult = {
      winnerId,
      winnerTeam,
      pointsEarned: earned,
      reason: "tranca",
      summary: `¡Mesa trancada! Nosotros: ${team1Pts} pts vs Ellos: ${team2Pts} pts.`,
    };

    finishRoundWithResult(result, winnerTeam, earned);
  };

  // Normal Domino Win
  const handleRoundWin = (winnerId: PlayerId, reason: "domino" | "capicua") => {
    const winner = players[winnerId];
    const winnerTeam = winner.team;

    const rivalHandPoints =
      winnerTeam === 1
        ? calculateHandPoints(players.p2.hand) + calculateHandPoints(players.p4.hand)
        : calculateHandPoints(players.p1.hand) + calculateHandPoints(players.p3.hand);

    sound.playWin();

    const result: RoundResult = {
      winnerId,
      winnerTeam,
      pointsEarned: rivalHandPoints,
      reason,
      summary: `¡${winner.name} dominó la mano! +${rivalHandPoints} puntos para el Equipo ${
        winnerTeam === 1 ? "Nosotros" : "Ellos"
      }.`,
    };

    finishRoundWithResult(result, winnerTeam, rivalHandPoints);
  };

  // Execute Move
  const handleExecuteMove = (playerId: PlayerId, tile: Tile, side: "left" | "right") => {
    sound.playTileSlap();

    // Place on board
    const { newBoard } = placeTileOnBoard(board, tile, side);
    setBoard(newBoard);

    // Remove tile from player's hand
    const remainingHand = players[playerId].hand.filter(
      (t) => !(t[0] === tile[0] && t[1] === tile[1])
    );

    setPlayers((prev) => ({
      ...prev,
      [playerId]: { ...prev[playerId], hand: remainingHand },
    }));

    setPassCount(0);
    setTurnTimer(settings.turnDuration);

    // Check Win by Domino (player emptied hand)
    if (remainingHand.length === 0) {
      handleRoundWin(playerId, "domino");
      return;
    }

    // Scroll board to view
    setTimeout(() => {
      if (boardScrollRef.current) {
        boardScrollRef.current.scrollLeft =
          side === "left" ? 0 : boardScrollRef.current.scrollWidth;
      }
    }, 100);

    // Next turn
    setCurrentTurn(nextPlayer(playerId));
  };

  // Handle Pass
  const handlePass = (playerId: PlayerId) => {
    sound.playPassKnock();
    const newPassCount = passCount + 1;
    setPassCount(newPassCount);

    if (newPassCount >= 4) {
      handleTrancaEnd();
      return;
    }

    setTurnTimer(settings.turnDuration);
    setCurrentTurn(nextPlayer(playerId));
  };

  // Handle Draw from Pozo
  const handleDrawFromPozo = (playerId: PlayerId) => {
    if (pozo.length === 0) return;
    const drawn = pozo[0];
    const newPozo = pozo.slice(1);
    setPozo(newPozo);

    setPlayers((prev) => ({
      ...prev,
      [playerId]: { ...prev[playerId], hand: [...prev[playerId].hand, drawn] },
    }));

    sound.playTileSlap();
  };

  // Handle auto move on time expiration
  const handleTimeExpire = () => {
    if (currentTurn === "p1") {
      const myHand = players.p1.hand;
      const move = chooseBotMove(myHand, board);
      if (move) {
        handleExecuteMove("p1", move.tile, move.side);
      } else {
        handlePass("p1");
      }
    }
  };

  // Initialize hand/round
  const startNewRound = () => {
    const { hands, pozo: remainingPozo } = dealDominoHands(7);
    setBoard({ tiles: [], leftEnd: null, rightEnd: null });
    setPlayers((prev) => ({
      p1: { ...prev.p1, hand: hands.p1 },
      p2: { ...prev.p2, hand: hands.p2 },
      p3: { ...prev.p3, hand: hands.p3 },
      p4: { ...prev.p4, hand: hands.p4 },
    }));
    setPozo(remainingPozo);
    setPassCount(0);
    setRoundResult(null);
    setTurnTimer(settings.turnDuration);

    let starter: PlayerId = "p1";
    let highestDouble = -1;
    (["p1", "p2", "p3", "p4"] as PlayerId[]).forEach((pid) => {
      hands[pid].forEach(([a, b]) => {
        if (a === b && a > highestDouble) {
          highestDouble = a;
          starter = pid;
        }
      });
    });

    setCurrentTurn(starter);
  };

  useEffect(() => {
    startNewRound();
  }, []);

  // Timer countdown
  useEffect(() => {
    if (roundResult) return;
    const interval = setInterval(() => {
      setTurnTimer((prev) => {
        if (prev <= 1) {
          handleTimeExpire();
          return settings.turnDuration;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [currentTurn, roundResult]);

  // Bot Turn Automation
  useEffect(() => {
    if (roundResult) return;
    if (currentTurn !== "p1") {
      const botTimer = setTimeout(() => {
        const botHand = players[currentTurn].hand;
        const botMove = chooseBotMove(botHand, board);

        if (botMove) {
          handleExecuteMove(currentTurn, botMove.tile, botMove.side);
        } else {
          if (settings.hasPozo && pozo.length > 0) {
            handleDrawFromPozo(currentTurn);
          } else {
            handlePass(currentTurn);
          }
        }
      }, 1000);

      return () => clearTimeout(botTimer);
    }
  }, [currentTurn, board, pozo, roundResult]);

  // Human player clicked a tile
  const handleHumanTileClick = (tile: Tile) => {
    if (currentTurn !== "p1" || roundResult) return;

    const { canLeft, canRight } = getPlayableSides(tile, board);
    if (!canLeft && !canRight) return;

    if (canLeft && canRight && board.tiles.length > 0 && board.leftEnd !== board.rightEnd) {
      setPendingChoiceTile(tile);
    } else {
      const side = canLeft ? "left" : "right";
      handleExecuteMove("p1", tile, side);
    }
  };

  const myPlayableStatus = canPlayAny(players.p1.hand, board);

  const toggleSound = () => {
    const next = !soundEnabled;
    setSoundEnabled(next);
    sound.enabled = next;
  };

  const sendQuickEmoji = (emoji: string) => {
    setActiveReaction(emoji);
    setChatMessages((prev) => [
      ...prev,
      { sender: "Tú", text: emoji, time: new Date().toLocaleTimeString().slice(0, 5) },
    ]);
    setTimeout(() => setActiveReaction(null), 3000);
  };

  return (
    <div className="relative w-full min-h-screen bg-[#111216] text-slate-100 flex flex-col select-none overflow-hidden font-sans">
      {/* ================= TOP NAV BAR (UI Kit Style) ================= */}
      <header className="h-16 px-4 md:px-8 border-b border-[#232530] bg-[#16171e]/90 backdrop-blur-md flex items-center justify-between shrink-0 z-20">
        <div className="flex items-center gap-3">
          <button
            onClick={onExit}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#20222b] hover:bg-[#282a36] text-slate-300 hover:text-white transition-all text-xs font-medium border border-white/5"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Salir al Lobby</span>
          </button>
          <div className="h-4 w-px bg-slate-700/50 hidden sm:block"></div>
          <div className="flex items-center gap-2">
            <img
              src="/images/logo.png"
              alt="DominoPro1"
              className="h-8 w-auto object-contain"
            />
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-xs font-bold text-slate-200 tracking-wide uppercase">
              {settings.tableName}
            </span>
            <span className="text-[11px] text-slate-400 font-mono bg-[#1c1d25] px-2 py-0.5 rounded-md border border-white/5">
              {settings.tableId}
            </span>
          </div>
        </div>

        {/* Global Score Indicator in header */}
        <div className="flex items-center gap-4 bg-[#1e202a] px-4 py-1.5 rounded-2xl border border-white/5 shadow-inner">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-indigo-400">NOSOTROS</span>
            <span className="text-base font-black text-white">{teamScores.team1}</span>
          </div>
          <span className="text-xs text-slate-600 font-bold">VS</span>
          <div className="flex items-center gap-2">
            <span className="text-base font-black text-white">{teamScores.team2}</span>
            <span className="text-xs font-bold text-rose-400">ELLOS</span>
          </div>
          <span className="text-[10px] text-slate-400 font-medium ml-1">
            (a {settings.targetPoints} pts)
          </span>
        </div>

        {/* Header Tools */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowScorepad(!showScorepad)}
            title="Libreta de Puntos"
            className={`p-2 rounded-xl border border-white/5 transition-all ${
              showScorepad
                ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/30"
                : "bg-[#20222b] text-slate-300 hover:bg-[#282a36]"
            }`}
          >
            <BookOpen className="w-4 h-4" />
          </button>

          <button
            onClick={() => setShowChat(!showChat)}
            title="Chat y Reacciones"
            className={`p-2 rounded-xl border border-white/5 transition-all ${
              showChat
                ? "bg-indigo-600 text-white"
                : "bg-[#20222b] text-slate-300 hover:bg-[#282a36]"
            }`}
          >
            <MessageSquare className="w-4 h-4" />
          </button>

          <button
            onClick={toggleSound}
            title={soundEnabled ? "Silenciar" : "Activar sonido"}
            className="p-2 rounded-xl bg-[#20222b] hover:bg-[#282a36] text-slate-300 hover:text-white border border-white/5 transition-all"
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>
        </div>
      </header>

      {/* ================= TABLE FELT & BOARD AREA ================= */}
      <div className="relative flex-1 flex flex-col items-center justify-between p-3 md:p-6 overflow-hidden bg-gradient-to-b from-[#13151b] via-[#0e1014] to-[#121318]">
        {/* Table Felt Background with leather stitched rim */}
        <div className="absolute inset-4 md:inset-8 rounded-[36px] bg-gradient-to-br from-[#182a24] via-[#12201b] to-[#0c1613] border-8 border-[#2d2218] shadow-[inset_0_4px_30px_rgba(0,0,0,0.8),0_20px_50px_rgba(0,0,0,0.9)] pointer-events-none">
          <div className="absolute inset-0 opacity-15 flex items-center justify-center">
            <div className="text-center flex flex-col items-center">
              <img
                src="/images/logo.png"
                alt="DominoPro1"
                className="w-52 h-52 object-contain opacity-25 filter drop-shadow-[0_4px_20px_rgba(0,0,0,0.8)]"
              />
              <span className="text-2xl font-black uppercase tracking-widest text-amber-300/40 -mt-2">
                DOMINOPRO1
              </span>
            </div>
          </div>
        </div>

        {/* ---------------- NORTH STATION (Partner) ---------------- */}
        <div className="relative z-10 flex flex-col items-center">
          <div
            className={`flex items-center gap-3 px-4 py-1.5 rounded-2xl bg-[#181a24]/90 border transition-all ${
              currentTurn === "p3"
                ? "border-indigo-500 shadow-[0_0_20px_rgba(99,102,241,0.5)] scale-105"
                : "border-white/10"
            }`}
          >
            <div className="relative">
              <img
                src={players.p3.avatar}
                alt={players.p3.name}
                className="w-9 h-9 rounded-full object-cover border border-indigo-400/50"
              />
              <span className="absolute -bottom-1 -right-1 text-[9px] font-bold px-1 rounded bg-indigo-600 text-white">
                Socia
              </span>
            </div>
            <div>
              <div className="text-xs font-bold text-white flex items-center gap-1.5">
                <span>{players.p3.name}</span>
                {currentTurn === "p3" && (
                  <span className="text-[10px] text-indigo-400 animate-pulse font-medium">
                    (Pensando...)
                  </span>
                )}
              </div>
              <div className="text-[11px] text-slate-400 font-mono">
                {players.p3.hand.length} fichas
              </div>
            </div>
          </div>

          {/* North Tile backs rack */}
          <div className="flex gap-1.5 mt-2">
            {players.p3.hand.map((_, i) => (
              <DominoTile key={i} tile={[0, 0]} showBack size="sm" />
            ))}
          </div>
        </div>

        {/* ---------------- MIDDLE SECTION (WEST, BOARD TRAIN, EAST) ---------------- */}
        <div className="relative z-10 w-full flex-1 flex items-center justify-between px-2 md:px-6">
          {/* WEST STATION (Rival 1) */}
          <div className="flex flex-col items-center gap-2">
            <div
              className={`flex flex-col items-center p-3 rounded-2xl bg-[#181a24]/90 border transition-all ${
                currentTurn === "p2"
                  ? "border-rose-500 shadow-[0_0_20px_rgba(244,63,94,0.5)] scale-105"
                  : "border-white/10"
              }`}
            >
              <img
                src={players.p2.avatar}
                alt={players.p2.name}
                className="w-10 h-10 rounded-full object-cover border border-rose-500/50 mb-1"
              />
              <span className="text-xs font-bold text-white">{players.p2.name}</span>
              <span className="text-[10px] text-rose-400 font-mono">Rival</span>
              <span className="text-[11px] text-slate-400 font-mono mt-1">
                {players.p2.hand.length} fichas
              </span>
              {currentTurn === "p2" && (
                <div className="mt-1 flex items-center gap-1 text-[10px] text-amber-400">
                  <Clock className="w-3 h-3 animate-spin" />
                  <span>{turnTimer}s</span>
                </div>
              )}
            </div>

            {/* West Vertical Backs Rack */}
            <div className="flex flex-col gap-1">
              {players.p2.hand.map((_, i) => (
                <DominoTile key={i} tile={[0, 0]} showBack size="sm" orientation="horizontal" />
              ))}
            </div>
          </div>

          {/* CENTER DOMINO BOARD TRAIN */}
          <div
            ref={boardScrollRef}
            className="flex-1 mx-3 md:mx-6 min-h-[170px] max-h-[260px] overflow-x-auto overflow-y-hidden flex items-center justify-center scrollbar-none py-4"
          >
            {board.tiles.length === 0 ? (
              <div className="text-center p-6 rounded-3xl border border-dashed border-emerald-500/30 bg-emerald-950/20 backdrop-blur-xs">
                <Sparkles className="w-8 h-8 mx-auto text-amber-400 mb-2 animate-bounce" />
                <div className="text-sm font-semibold text-emerald-200">
                  Mesa lista para la primera ficha
                </div>
                <div className="text-xs text-emerald-400/70 mt-0.5">
                  Turno de salida: {players[currentTurn].name}
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-1 px-4">
                {/* Left End Indicator */}
                <div className="px-2 py-1 rounded-lg bg-indigo-900/60 border border-indigo-400/40 text-[11px] font-mono font-bold text-indigo-200 shadow-md">
                  Punta: {board.leftEnd}
                </div>

                {/* Domino Chain */}
                <div className="flex items-center gap-1">
                  {board.tiles.map((placed, idx) => (
                    <DominoTile
                      key={idx}
                      tile={placed.tile}
                      orientation={placed.isDouble ? "vertical" : "horizontal"}
                      size="md"
                      className="shadow-lg"
                    />
                  ))}
                </div>

                {/* Right End Indicator */}
                <div className="px-2 py-1 rounded-lg bg-indigo-900/60 border border-indigo-400/40 text-[11px] font-mono font-bold text-indigo-200 shadow-md">
                  Punta: {board.rightEnd}
                </div>
              </div>
            )}
          </div>

          {/* EAST STATION (Rival 2) */}
          <div className="flex flex-col items-center gap-2">
            <div
              className={`flex flex-col items-center p-3 rounded-2xl bg-[#181a24]/90 border transition-all ${
                currentTurn === "p4"
                  ? "border-rose-500 shadow-[0_0_20px_rgba(244,63,94,0.5)] scale-105"
                  : "border-white/10"
              }`}
            >
              <img
                src={players.p4.avatar}
                alt={players.p4.name}
                className="w-10 h-10 rounded-full object-cover border border-rose-500/50 mb-1"
              />
              <span className="text-xs font-bold text-white">{players.p4.name}</span>
              <span className="text-[10px] text-rose-400 font-mono">Rival</span>
              <span className="text-[11px] text-slate-400 font-mono mt-1">
                {players.p4.hand.length} fichas
              </span>
              {currentTurn === "p4" && (
                <div className="mt-1 flex items-center gap-1 text-[10px] text-amber-400">
                  <Clock className="w-3 h-3 animate-spin" />
                  <span>{turnTimer}s</span>
                </div>
              )}
            </div>

            {/* East Vertical Backs Rack */}
            <div className="flex flex-col gap-1">
              {players.p4.hand.map((_, i) => (
                <DominoTile key={i} tile={[0, 0]} showBack size="sm" orientation="horizontal" />
              ))}
            </div>
          </div>
        </div>

        {/* ---------------- SOUTH STATION (TÚ - Human Player Rack) ---------------- */}
        <div className="relative z-10 w-full flex flex-col items-center">
          {/* Reaction bubble if active */}
          {activeReaction && (
            <div className="absolute -top-12 z-20 text-3xl animate-bounce">
              {activeReaction}
            </div>
          )}

          {/* Quick Choice Prompt if tile can play on both sides */}
          {pendingChoiceTile && (
            <div className="mb-3 px-5 py-3 rounded-2xl bg-[#1f222e] border border-indigo-500/80 shadow-2xl flex items-center gap-4 animate-in fade-in slide-in-from-bottom-2">
              <span className="text-xs font-semibold text-slate-200">
                ¿En qué punta juegas la ficha [{pendingChoiceTile[0]}|{pendingChoiceTile[1]}]?
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    handleExecuteMove("p1", pendingChoiceTile, "left");
                    setPendingChoiceTile(null);
                  }}
                  className="px-3 py-1 text-xs font-bold rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white shadow-md transition-all"
                >
                  Izquierda (Punta {board.leftEnd})
                </button>
                <button
                  onClick={() => {
                    handleExecuteMove("p1", pendingChoiceTile, "right");
                    setPendingChoiceTile(null);
                  }}
                  className="px-3 py-1 text-xs font-bold rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white shadow-md transition-all"
                >
                  Derecha (Punta {board.rightEnd})
                </button>
                <button
                  onClick={() => setPendingChoiceTile(null)}
                  className="px-2 py-1 text-xs rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-300"
                >
                  Cancelar
                </button>
              </div>
            </div>
          )}

          {/* Action Bar (Turn, Pass button, Pozo) */}
          <div className="flex items-center gap-3 mb-2">
            <div
              className={`flex items-center gap-2.5 px-4 py-1.5 rounded-xl bg-[#1b1d27]/90 border ${
                currentTurn === "p1"
                  ? "border-emerald-500 text-emerald-300 shadow-[0_0_15px_rgba(16,185,129,0.3)]"
                  : "border-white/10 text-slate-400"
              }`}
            >
              <span className="text-xs font-bold">
                {currentTurn === "p1" ? "¡Es tu turno!" : `Turno: ${players[currentTurn].name}`}
              </span>
              {currentTurn === "p1" && (
                <span className="text-xs font-mono font-bold bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-md border border-emerald-500/30">
                  {turnTimer}s
                </span>
              )}
            </div>

            {/* Pass button */}
            {currentTurn === "p1" && !myPlayableStatus && (
              <button
                onClick={() => handlePass("p1")}
                className="px-4 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold shadow-lg shadow-amber-600/30 transition-all flex items-center gap-1.5 animate-bounce"
              >
                <span>¡Paso!</span>
              </button>
            )}

            {/* Pozo Button (if active) */}
            {settings.hasPozo && pozo.length > 0 && currentTurn === "p1" && (
              <button
                onClick={() => handleDrawFromPozo("p1")}
                className="px-4 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg transition-all flex items-center gap-1.5"
              >
                <span>Robar ({pozo.length})</span>
              </button>
            )}
          </div>

          {/* Human Player's Tile Rack */}
          <div className="p-3 px-6 rounded-3xl bg-[#191b24]/95 border border-[#2b2e3c] shadow-2xl flex items-center gap-3">
            {players.p1.hand.map((tile, idx) => {
              const { canLeft, canRight } = getPlayableSides(tile, board);
              const playable = currentTurn === "p1" && (canLeft || canRight);

              return (
                <DominoTile
                  key={idx}
                  tile={tile}
                  orientation="vertical"
                  size="lg"
                  isPlayable={playable}
                  onClick={() => handleHumanTileClick(tile)}
                />
              );
            })}
            {players.p1.hand.length === 0 && (
              <div className="text-xs text-slate-400 italic">Mano vacía</div>
            )}
          </div>
        </div>
      </div>

      {/* ================= ROUND RESULT POPUP / MODAL ================= */}
      {roundResult && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-md p-6 rounded-3xl bg-[#1c1e28] border border-white/10 shadow-2xl text-center flex flex-col items-center animate-in zoom-in-95 duration-200">
            <div
              className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-4 ${
                roundResult.winnerTeam === 1
                  ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                  : "bg-rose-500/20 text-rose-400 border border-rose-500/30"
              }`}
            >
              <Trophy className="w-8 h-8" />
            </div>

            <h3 className="text-xl font-black text-white uppercase tracking-wide">
              {roundResult.winnerTeam === 1 ? "¡Ganó tu equipo!" : "Ganó el equipo rival"}
            </h3>

            <p className="text-sm text-slate-300 mt-2 leading-relaxed">
              {roundResult.summary}
            </p>

            <div className="w-full my-5 p-4 rounded-2xl bg-[#14151c] border border-white/5 flex items-center justify-around">
              <div>
                <span className="text-xs text-slate-400 font-medium">Marcador Nosotros</span>
                <div className="text-2xl font-black text-indigo-400 mt-0.5">
                  {teamScores.team1}
                </div>
              </div>
              <div className="h-8 w-px bg-white/10"></div>
              <div>
                <span className="text-xs text-slate-400 font-medium">Marcador Ellos</span>
                <div className="text-2xl font-black text-rose-400 mt-0.5">
                  {teamScores.team2}
                </div>
              </div>
            </div>

            {/* Check Match Winner */}
            {teamScores.team1 >= settings.targetPoints ||
            teamScores.team2 >= settings.targetPoints ? (
              <div className="w-full">
                <div className="text-lg font-black text-amber-400 mb-4">
                  {teamScores.team1 >= settings.targetPoints
                    ? "🏆 ¡VICTORIA DE PARTIDA COMPLETA! 🏆"
                    : "Partida finalizada. ¡Buen intento!"}
                </div>
                <button
                  onClick={onExit}
                  className="w-full py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm shadow-xl transition-all"
                >
                  Volver al Menú Principal
                </button>
              </div>
            ) : (
              <button
                onClick={() => {
                  setRoundNumber((r) => r + 1);
                  startNewRound();
                }}
                className="w-full py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm shadow-lg shadow-indigo-600/30 transition-all flex items-center justify-center gap-2"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Siguiente Mano (Mano #{roundNumber + 1})</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* ================= DIGITAL SCOREPAD DRAWER ================= */}
      {showScorepad && (
        <div className="fixed top-16 right-0 bottom-0 w-80 bg-[#181a24] border-l border-white/10 shadow-2xl z-30 p-5 flex flex-col animate-in slide-in-from-right duration-200">
          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <div className="flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-indigo-400" />
              <h4 className="font-bold text-sm text-white">Libreta Digital de Puntos</h4>
            </div>
            <button
              onClick={() => setShowScorepad(false)}
              className="text-slate-400 hover:text-white text-xs"
            >
              Cerrar
            </button>
          </div>

          <div className="my-4 p-3 rounded-xl bg-[#12131a] flex justify-between text-center">
            <div>
              <div className="text-[11px] text-slate-400">Nosotros</div>
              <div className="text-xl font-black text-indigo-400">{teamScores.team1}</div>
            </div>
            <div className="text-xs font-bold text-slate-600 flex items-center">Meta: {settings.targetPoints}</div>
            <div>
              <div className="text-[11px] text-slate-400">Ellos</div>
              <div className="text-xl font-black text-rose-400">{teamScores.team2}</div>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto space-y-2 text-xs">
            {scoreHistory.length === 0 ? (
              <div className="text-center text-slate-500 py-8">
                Aún no hay manos finalizadas.
              </div>
            ) : (
              scoreHistory.map((entry, idx) => (
                <div
                  key={idx}
                  className="p-2.5 rounded-lg bg-[#202330] border border-white/5 flex items-center justify-between"
                >
                  <div>
                    <div className="font-bold text-white">Mano #{entry.round}</div>
                    <div className="text-[10px] text-slate-400 truncate max-w-[160px]">
                      {entry.notes}
                    </div>
                  </div>
                  <div className="text-right font-mono font-bold">
                    <span className="text-indigo-400">{entry.team1Points}</span> -{" "}
                    <span className="text-rose-400">{entry.team2Points}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* ================= CHAT & QUICK REACTIONS DRAWER ================= */}
      {showChat && (
        <div className="fixed top-16 right-0 bottom-0 w-80 bg-[#181a24] border-l border-white/10 shadow-2xl z-30 p-5 flex flex-col animate-in slide-in-from-right duration-200">
          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <div className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-indigo-400" />
              <h4 className="font-bold text-sm text-white">Mesa de Chat</h4>
            </div>
            <button
              onClick={() => setShowChat(false)}
              className="text-slate-400 hover:text-white text-xs"
            >
              Cerrar
            </button>
          </div>

          <div className="my-3">
            <span className="text-[11px] text-slate-400 font-medium">Reacciones rápidas:</span>
            <div className="flex gap-2 mt-2">
              {["👏", "🔥", "🏆", "🎲", "💤", "😂"].map((emoji) => (
                <button
                  key={emoji}
                  onClick={() => sendQuickEmoji(emoji)}
                  className="p-2 rounded-xl bg-[#202330] hover:bg-[#2c3042] text-base transition-all"
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto space-y-2.5 text-xs py-2">
            {chatMessages.map((msg, i) => (
              <div key={i} className="p-2 rounded-xl bg-[#202330] border border-white/5">
                <div className="flex justify-between items-center text-[10px] text-slate-400 mb-0.5">
                  <span className="font-bold text-indigo-300">{msg.sender}</span>
                  <span>{msg.time}</span>
                </div>
                <div className="text-slate-100">{msg.text}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

