"use client";

import React, { useState } from "react";
import { GameMode, GameSettings } from "@/types/domino";
import {
  LayoutGrid,
  Radio,
  Trophy,
  BookOpen,
  HelpCircle,
  Plus,
  Coins,
  ChevronDown,
  User,
  History,
  Moon,
  LogOut,
  MoreVertical,
  Award,
} from "lucide-react";

interface DominoLobbyProps {
  onStartGame: (settings: GameSettings) => void;
  activeTableExists?: boolean;
  onReturnToTable?: () => void;
}

export const DominoLobby: React.FC<DominoLobbyProps> = ({
  onStartGame,
  activeTableExists = false,
  onReturnToTable,
}) => {
  // Navigation tabs
  const [activeTab, setActiveTab] = useState<
    "modes" | "live" | "tournaments" | "scorepad" | "ranking" | "help"
  >("modes");
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);

  // User profile state
  const [playerName, setPlayerName] = useState("Alexander Herzog");
  const [userCoins] = useState(2450);

  // New Table Form state
  const [createMode, setCreateMode] = useState<GameMode>("tradicional");
  const [createTargetPts, setCreateTargetPts] = useState(100);
  const [createTurnTime, setCreateTurnTime] = useState(15);
  const [createEntryFee] = useState(20);
  const [createIsPrivate] = useState(false);

  // Interactive Scorepad calculator state for the "Libreta" view
  const [scoreTeam1, setScoreTeam1] = useState(0);
  const [scoreTeam2, setScoreTeam2] = useState(0);
  const [scoreHistory, setScoreHistory] = useState<
    { round: number; t1: number; t2: number; delta: number; team: 1 | 2 }[]
  >([]);
  const [inputPoints, setInputPoints] = useState<number>(0);

  // Game Modes definition with exact UI Kit card styling
  const gameModesList = [
    {
      id: "tradicional",
      mode: "tradicional" as GameMode,
      title: "Tradicional por Parejas",
      subtitle: "Clásico 4 Jugadores · 2v2",
      badge: "Más Jugado",
      badgeColor: "bg-indigo-500/20 text-indigo-300 border-indigo-500/30",
      host: "Anastasia V.",
      hostAvatar:
        "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80",
      playersRequired: "4 Jugadores",
      targetPoints: "100 / 200 pts",
      description:
        "El dominó de toda la vida: parejas cruzadas, salida con la mayor ficha, juego estratégico a tranca y paso.",
      accentGradient: "from-indigo-600/30 via-indigo-900/10 to-transparent",
      recommended: true,
    },
    {
      id: "duelo1v1",
      mode: "duelo1v1" as GameMode,
      title: "Duelo Mano a Mano (1v1)",
      subtitle: "Rápido · 7 fichas",
      badge: "Intenso",
      badgeColor: "bg-rose-500/20 text-rose-300 border-rose-500/30",
      host: "Martin David",
      hostAvatar:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80",
      playersRequired: "2 Jugadores",
      targetPoints: "100 pts",
      description:
        "Tú contra un único rival frente a frente. 7 fichas cada uno, cálculo exhaustivo de fichas libres.",
      accentGradient: "from-rose-600/30 via-rose-900/10 to-transparent",
      recommended: false,
    },
    {
      id: "fantasmita",
      mode: "fantasmita" as GameMode,
      title: "Modo Fantasmita",
      subtitle: "3 Jugadores o 2 + Bot",
      badge: "Dinámico",
      badgeColor: "bg-purple-500/20 text-purple-300 border-purple-500/30",
      host: "Dwinawan",
      hostAvatar:
        "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&auto=format&fit=crop&q=80",
      playersRequired: "3 Jugadores",
      targetPoints: "100 pts",
      description:
        "Ideal cuando faltan participantes. El fantasma juega automáticamente o almacena fichas ciegas.",
      accentGradient: "from-purple-600/30 via-purple-900/10 to-transparent",
      recommended: false,
    },
    {
      id: "pozo",
      mode: "pozo" as GameMode,
      title: "Dominó con Pozo",
      subtitle: "Robo en Pozo hasta jugar",
      badge: "Emocionante",
      badgeColor: "bg-amber-500/20 text-amber-300 border-amber-500/30",
      host: "Taras Migulko",
      hostAvatar:
        "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=120&auto=format&fit=crop&q=80",
      playersRequired: "2 a 4 Jugadores",
      targetPoints: "150 pts",
      description:
        "Si no tienes ficha para jugar en tu turno, debes robar del pozo acumulado hasta encontrar una válida.",
      accentGradient: "from-amber-600/30 via-amber-900/10 to-transparent",
      recommended: false,
    },
    {
      id: "pintitin",
      mode: "pintitin" as GameMode,
      title: "Modo Pintitín",
      subtitle: "Rondas Rápidas Express",
      badge: "Veloz",
      badgeColor: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
      host: "Brent Schoepf",
      hostAvatar:
        "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=120&auto=format&fit=crop&q=80",
      playersRequired: "4 Jugadores",
      targetPoints: "50 pts",
      description:
        "Formato express con conteo individual de fichas por mano. El que sume menos castigo gana.",
      accentGradient: "from-emerald-600/30 via-emerald-900/10 to-transparent",
      recommended: false,
    },
    {
      id: "torneo",
      mode: "torneo" as GameMode,
      title: "Torneo Semanal Élite",
      subtitle: "Bracket Eliminatorio",
      badge: "Premios 10,000 🪙",
      badgeColor: "bg-yellow-500/20 text-yellow-300 border-yellow-500/30",
      host: "DominoPro1 Oficial",
      hostAvatar:
        "/images/logo.png",
      playersRequired: "16 Jugadores",
      targetPoints: "Eliminación directa",
      description:
        "Compite en rondas eliminatorias con premios acumulados en monedas y puntos para el ranking global.",
      accentGradient: "from-yellow-600/30 via-yellow-900/10 to-transparent",
      recommended: true,
    },
  ];

  // Quick launch game
  const handleQuickPlay = (mode: GameMode, targetPoints = 100, hasPozo = false) => {
    onStartGame({
      mode,
      targetPoints,
      turnDuration: 15,
      hasPozo,
      tableId: `#DOM-${Math.floor(1000 + Math.random() * 9000)}`,
      tableName: `Mesa ${mode.toUpperCase()}`,
      isPrivate: false,
      entryFee: 20,
    });
  };

  // Launch created custom table
  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setShowCreateModal(false);
    onStartGame({
      mode: createMode,
      targetPoints: createTargetPts,
      turnDuration: createTurnTime,
      hasPozo: createMode === "pozo",
      tableId: `#DOM-${Math.floor(1000 + Math.random() * 9000)}`,
      tableName: `Mesa de ${playerName}`,
      isPrivate: createIsPrivate,
      entryFee: createEntryFee,
    });
  };

  return (
    <div className="min-h-screen bg-[#121316] text-[#e2e4ea] flex flex-col font-sans select-none">
      {/* ================= HEADER (Signature Web Service UI Kit) ================= */}
      <header className="h-18 px-6 md:px-12 border-b border-[#21232c] bg-[#16171e]/95 backdrop-blur-md sticky top-0 z-40 flex items-center justify-between">
        {/* Brand Logo */}
        <div className="flex items-center gap-3">
          <img
            src="/images/logo.png"
            alt="DominoPro1"
            className="h-11 w-auto object-contain drop-shadow-[0_2px_12px_rgba(245,158,11,0.35)] hover:scale-105 transition-transform"
          />
          <div>
            <span className="font-black text-xl tracking-tight text-white flex items-center gap-1">
              DOMINO<span className="text-amber-400">PRO1</span>
            </span>
            <span className="text-[10px] text-amber-300/80 block -mt-1 tracking-wider uppercase font-semibold">
              Torneos & Mesas Online
            </span>
          </div>
        </div>

        {/* Center Navigation Links */}
        <nav className="hidden lg:flex items-center gap-1 bg-[#1c1d25] p-1.5 rounded-2xl border border-white/5">
          <button
            onClick={() => setActiveTab("modes")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
              activeTab === "modes"
                ? "bg-[#272935] text-white shadow-md"
                : "text-slate-400 hover:text-slate-200 hover:bg-white/5"
            }`}
          >
            <LayoutGrid className="w-4 h-4 text-indigo-400" />
            <span>Mesas & Modos</span>
          </button>

          <button
            onClick={() => setActiveTab("live")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
              activeTab === "live"
                ? "bg-[#272935] text-white shadow-md"
                : "text-slate-400 hover:text-slate-200 hover:bg-white/5"
            }`}
          >
            <Radio className="w-4 h-4 text-rose-400" />
            <span>Salas en Vivo</span>
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping"></span>
          </button>

          <button
            onClick={() => setActiveTab("tournaments")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
              activeTab === "tournaments"
                ? "bg-[#272935] text-white shadow-md"
                : "text-slate-400 hover:text-slate-200 hover:bg-white/5"
            }`}
          >
            <Trophy className="w-4 h-4 text-amber-400" />
            <span>Torneos</span>
          </button>

          <button
            onClick={() => setActiveTab("scorepad")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
              activeTab === "scorepad"
                ? "bg-[#272935] text-white shadow-md"
                : "text-slate-400 hover:text-slate-200 hover:bg-white/5"
            }`}
          >
            <BookOpen className="w-4 h-4 text-emerald-400" />
            <span>Libreta Digital</span>
          </button>

          <button
            onClick={() => setActiveTab("ranking")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
              activeTab === "ranking"
                ? "bg-[#272935] text-white shadow-md"
                : "text-slate-400 hover:text-slate-200 hover:bg-white/5"
            }`}
          >
            <Award className="w-4 h-4 text-purple-400" />
            <span>Ranking</span>
          </button>

          <button
            onClick={() => setActiveTab("help")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
              activeTab === "help"
                ? "bg-[#272935] text-white shadow-md"
                : "text-slate-400 hover:text-slate-200 hover:bg-white/5"
            }`}
          >
            <HelpCircle className="w-4 h-4 text-slate-400" />
            <span>Reglamento</span>
          </button>
        </nav>

        {/* Right Action Tools: + Create, Coins Chip, User Avatar */}
        <div className="flex items-center gap-3">
          {/* Create Button (UI Kit + pill) */}
          <button
            onClick={() => setShowCreateModal(true)}
            className="w-9 h-9 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white flex items-center justify-center shadow-md shadow-indigo-600/30 transition-all hover:scale-105 active:scale-95"
            title="Crear Mesa"
          >
            <Plus className="w-5 h-5" />
          </button>

          {/* Coins Chip */}
          <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-[#1f212a] border border-white/5 shadow-inner">
            <Coins className="w-4 h-4 text-amber-400" />
            <span className="text-xs font-bold text-white font-mono">
              {userCoins.toLocaleString()}
            </span>
          </div>

          {/* User Profile Avatar with Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowUserDropdown(!showUserDropdown)}
              className="flex items-center gap-2 p-1 pl-1.5 rounded-2xl bg-[#1f212a] hover:bg-[#272935] border border-white/5 transition-all"
            >
              <img
                src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&auto=format&fit=crop&q=80"
                alt="Avatar"
                className="w-8 h-8 rounded-xl object-cover"
              />
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 pr-0.5" />
            </button>

            {/* Dropdown Menu (UI Kit Popup) */}
            {showUserDropdown && (
              <div className="absolute right-0 mt-2 w-56 p-2 rounded-2xl bg-[#1c1d25] border border-[#2d2f3d] shadow-2xl z-50 animate-in fade-in zoom-in-95 duration-150">
                <div className="px-3 py-2 border-b border-white/5 mb-1">
                  <div className="text-xs font-bold text-white">{playerName}</div>
                  <div className="text-[11px] text-slate-400">Nivel 14 · Jugador Élite</div>
                </div>

                <button
                  onClick={() => {
                    setShowUserDropdown(false);
                    setShowProfileModal(true);
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-slate-300 hover:text-white hover:bg-[#252834] transition-all text-left"
                >
                  <User className="w-4 h-4 text-indigo-400" />
                  <span>Mi perfil</span>
                </button>

                <button
                  onClick={() => {
                    setShowUserDropdown(false);
                    setActiveTab("scorepad");
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-slate-300 hover:text-white hover:bg-[#252834] transition-all text-left"
                >
                  <History className="w-4 h-4 text-emerald-400" />
                  <span>Historial de partidas</span>
                </button>

                <div className="my-1 border-t border-white/5"></div>

                <div className="flex items-center justify-between px-3 py-2 text-xs text-slate-300">
                  <div className="flex items-center gap-2">
                    <Moon className="w-4 h-4 text-slate-400" />
                    <span>Modo oscuro</span>
                  </div>
                  <div className="w-8 h-4 rounded-full bg-indigo-600 flex items-center justify-end px-0.5">
                    <div className="w-3 h-3 rounded-full bg-white"></div>
                  </div>
                </div>

                <div className="my-1 border-t border-white/5"></div>

                <button
                  onClick={() => setShowUserDropdown(false)}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-rose-400 hover:bg-rose-500/10 transition-all text-left"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Cerrar sesión</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Floating Resume Match Pill (inspired by Dominastia & UI Kit) */}
      {activeTableExists && onReturnToTable && (
        <div className="sticky top-20 z-30 mx-auto max-w-xl w-full px-4 -mb-8 pointer-events-auto">
          <div className="p-3 px-5 rounded-2xl bg-gradient-to-r from-indigo-900/90 via-indigo-800/90 to-purple-900/90 border border-indigo-500/50 shadow-2xl backdrop-blur-md flex items-center justify-between animate-pulse">
            <div className="flex items-center gap-3">
              <span className="w-3 h-3 rounded-full bg-emerald-400 animate-ping"></span>
              <div>
                <div className="text-xs font-bold text-white">Tienes una mesa activa en curso</div>
                <div className="text-[11px] text-indigo-200">Tu asiento te está esperando</div>
              </div>
            </div>
            <button
              onClick={onReturnToTable}
              className="px-4 py-1.5 rounded-xl bg-white text-indigo-950 font-bold text-xs shadow-md hover:bg-indigo-50 transition-all"
            >
              Volver a la Mesa
            </button>
          </div>
        </div>
      )}

      {/* ================= MAIN CONTENT ================= */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-6 md:p-10 space-y-8">
        {/* VIEW 1: MODES & LOBBY */}
        {activeTab === "modes" && (
          <>
            {/* Top Bar: Title & Filter Pills */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl font-black tracking-tight text-white">
                  Modalidades de Dominó
                </h1>
                <p className="text-xs text-slate-400 mt-1">
                  Selecciona una mesa para jugar de inmediato o crea una personalizada con amigos.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="px-4 py-2.5 rounded-2xl bg-[#20222c] hover:bg-[#282a37] border border-white/5 text-xs font-bold text-white flex items-center gap-2 shadow-sm transition-all"
                >
                  <Plus className="w-4 h-4 text-indigo-400" />
                  <span>+ Crear Mesa</span>
                </button>
              </div>
            </div>

            {/* Mode Cards Grid (exact UI Kit card layout) */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {gameModesList.map((item) => (
                <div
                  key={item.id}
                  className="group relative rounded-3xl bg-[#1e2029] border border-[#2b2d39] hover:border-indigo-500/50 shadow-xl hover:shadow-[0_12px_32px_rgba(79,70,229,0.2)] transition-all duration-200 p-5 flex flex-col justify-between"
                >
                  {/* Card Header */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={item.hostAvatar}
                        alt={item.host}
                        className="w-10 h-10 rounded-2xl object-cover border border-white/10"
                      />
                      <div>
                        <div className="text-sm font-bold text-white">{item.host}</div>
                        <div className="text-[11px] text-slate-400 font-medium">
                          {item.subtitle}
                        </div>
                      </div>
                    </div>
                    <button className="text-slate-500 hover:text-slate-300 p-1">
                      <MoreVertical className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Card Banner / Visual Preview */}
                  <div
                    className={`relative w-full h-44 rounded-2xl bg-gradient-to-br ${item.accentGradient} border border-white/5 p-4 flex flex-col justify-between overflow-hidden mb-5`}
                  >
                    <div className="flex items-center justify-between">
                      <span
                        className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${item.badgeColor}`}
                      >
                        {item.badge}
                      </span>
                      <span className="text-[11px] font-mono text-slate-300 bg-black/40 backdrop-blur-xs px-2.5 py-1 rounded-lg">
                        {item.playersRequired}
                      </span>
                    </div>

                    {/* Decorative Domino pieces in preview */}
                    <div className="flex items-center justify-center gap-3 py-2">
                      <div className="w-10 h-20 rounded-md bg-[#faf8f2] border border-[#d6cfbe] shadow-lg flex flex-col justify-around items-center p-1 transform -rotate-12">
                        <div className="w-1.5 h-1.5 rounded-full bg-slate-900"></div>
                        <div className="w-6 h-px bg-slate-400"></div>
                        <div className="w-1.5 h-1.5 rounded-full bg-slate-900"></div>
                      </div>
                      <div className="w-10 h-20 rounded-md bg-[#faf8f2] border border-[#d6cfbe] shadow-lg flex flex-col justify-around items-center p-1 transform rotate-6 scale-110">
                        <div className="flex gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-slate-900"></span>
                          <span className="w-1.5 h-1.5 rounded-full bg-slate-900"></span>
                        </div>
                        <div className="w-6 h-px bg-slate-400"></div>
                        <div className="flex gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-slate-900"></span>
                          <span className="w-1.5 h-1.5 rounded-full bg-slate-900"></span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-xs text-slate-300">
                      <span className="font-semibold text-white">{item.title}</span>
                      <span className="font-mono text-slate-400">{item.targetPoints}</span>
                    </div>
                  </div>

                  {/* Card Description */}
                  <p className="text-xs text-slate-400 leading-relaxed mb-5 line-clamp-2">
                    {item.description}
                  </p>

                  {/* Action Button (exact Web Service UI Kit button: Perform a task style) */}
                  <button
                    onClick={() => handleQuickPlay(item.mode)}
                    className="w-full py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 group-hover:shadow-indigo-600/50 transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <span>Jugar ahora</span>
                  </button>
                </div>
              ))}
            </div>
          </>
        )}

        {/* VIEW 2: SALAS EN VIVO */}
        {activeTab === "live" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-black text-white">Mesas Públicas en Vivo</h2>
                <p className="text-xs text-slate-400 mt-1">
                  Únete a cualquier partida abierta con jugadores reales y bots.
                </p>
              </div>
              <button
                onClick={() => setShowCreateModal(true)}
                className="px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-bold shadow-md"
              >
                + Crear Sala Nueva
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { id: "MESA-101", name: "Duelo Caliente", mode: "1v1", players: 1, max: 2, pts: 100 },
                { id: "MESA-102", name: "Reyes del Doble Seis", mode: "Tradicional 2v2", players: 3, max: 4, pts: 200 },
                { id: "MESA-103", name: "Mano Rápida Pozo", mode: "Con Pozo", players: 2, max: 4, pts: 100 },
                { id: "MESA-104", name: "Mesa San Juan Élite", mode: "Tradicional 2v2", players: 2, max: 4, pts: 100 },
              ].map((table) => (
                <div
                  key={table.id}
                  className="p-5 rounded-2xl bg-[#1e2029] border border-white/5 flex items-center justify-between hover:border-indigo-500/40 transition-all"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                      <span className="font-bold text-sm text-white">{table.name}</span>
                      <span className="text-[11px] font-mono text-slate-500">{table.id}</span>
                    </div>
                    <div className="text-xs text-slate-400 mt-1">
                      {table.mode} · a {table.pts} pts
                    </div>
                    <div className="text-xs text-indigo-400 mt-2 font-mono">
                      {table.players}/{table.max} puestos ocupados
                    </div>
                  </div>
                  <button
                    onClick={() => handleQuickPlay("tradicional", table.pts)}
                    className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md transition-all"
                  >
                    Unirse a la Mesa
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* VIEW 3: TORNEOS */}
        {activeTab === "tournaments" && (
          <div className="space-y-6">
            <div className="p-8 rounded-3xl bg-gradient-to-r from-amber-950/40 via-amber-900/20 to-[#1e2029] border border-amber-500/30 flex flex-col md:flex-row items-center justify-between gap-6">
              <div>
                <span className="text-[10px] font-bold px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 uppercase tracking-widest">
                  Gran Torneo de Temporada
                </span>
                <h2 className="text-3xl font-black text-white mt-3">Copa DominoPro1 Internacional</h2>
                <p className="text-xs text-slate-300 mt-2 max-w-lg leading-relaxed">
                  16 parejas disputando el trofeo de la temporada. Partidas de eliminación directa a 200 puntos.
                </p>
                <div className="flex items-center gap-4 mt-4 font-mono text-xs text-amber-400">
                  <span>🏆 Premio: 10,000 Monedas</span>
                  <span>·</span>
                  <span>👥 14/16 Inscritos</span>
                </div>
              </div>
              <button
                onClick={() => handleQuickPlay("torneo", 200)}
                className="px-6 py-3 rounded-2xl bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-sm shadow-xl shadow-amber-500/20 transition-all shrink-0 cursor-pointer"
              >
                Inscribirme al Torneo
              </button>
            </div>
          </div>
        )}

        {/* VIEW 4: DIGITAL SCOREPAD (Libreta Digital de Puntos) */}
        {activeTab === "scorepad" && (
          <div className="max-w-3xl mx-auto space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-black text-white">Libreta Digital de Puntos</h2>
              <p className="text-xs text-slate-400 mt-1">
                Anotador profesional de dominó para tus partidas físicas u online.
              </p>
            </div>

            {/* Scorepad Board Card */}
            <div className="p-6 rounded-3xl bg-[#1e2029] border border-white/10 shadow-2xl space-y-6">
              {/* Score Columns */}
              <div className="grid grid-cols-2 gap-4 text-center">
                <div className="p-5 rounded-2xl bg-[#14151c] border border-indigo-500/30">
                  <div className="text-xs font-bold text-indigo-400 uppercase tracking-wider">
                    Nosotros (Equipo 1)
                  </div>
                  <div className="text-5xl font-black text-white mt-2">{scoreTeam1}</div>
                </div>

                <div className="p-5 rounded-2xl bg-[#14151c] border border-rose-500/30">
                  <div className="text-xs font-bold text-rose-400 uppercase tracking-wider">
                    Ellos (Equipo 2)
                  </div>
                  <div className="text-5xl font-black text-white mt-2">{scoreTeam2}</div>
                </div>
              </div>

              {/* Add points form */}
              <div className="p-4 rounded-2xl bg-[#252834] flex flex-col sm:flex-row items-center gap-3">
                <input
                  type="number"
                  placeholder="Puntos ganados (ej. 24)"
                  value={inputPoints || ""}
                  onChange={(e) => setInputPoints(Number(e.target.value))}
                  className="flex-1 px-4 py-2.5 rounded-xl bg-[#1a1b22] border border-white/5 text-sm text-white outline-none focus:border-indigo-500"
                />
                <button
                  onClick={() => {
                    if (inputPoints <= 0) return;
                    setScoreTeam1((prev) => prev + inputPoints);
                    setScoreHistory((prev) => [
                      ...prev,
                      {
                        round: prev.length + 1,
                        t1: scoreTeam1 + inputPoints,
                        t2: scoreTeam2,
                        delta: inputPoints,
                        team: 1,
                      },
                    ]);
                    setInputPoints(0);
                  }}
                  className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs"
                >
                  + Sumar a Nosotros
                </button>
                <button
                  onClick={() => {
                    if (inputPoints <= 0) return;
                    setScoreTeam2((prev) => prev + inputPoints);
                    setScoreHistory((prev) => [
                      ...prev,
                      {
                        round: prev.length + 1,
                        t1: scoreTeam1,
                        t2: scoreTeam2 + inputPoints,
                        delta: inputPoints,
                        team: 2,
                      },
                    ]);
                    setInputPoints(0);
                  }}
                  className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs"
                >
                  + Sumar a Ellos
                </button>
                <button
                  onClick={() => {
                    setScoreTeam1(0);
                    setScoreTeam2(0);
                    setScoreHistory([]);
                  }}
                  className="px-3 py-2.5 rounded-xl bg-[#1a1b22] hover:bg-slate-700 text-slate-300 text-xs font-medium"
                >
                  Reiniciar
                </button>
              </div>

              {/* Round History Table */}
              <div className="space-y-2">
                <span className="text-xs font-bold text-slate-400">Historial de Manos:</span>
                <div className="max-h-48 overflow-y-auto space-y-1.5 text-xs">
                  {scoreHistory.length === 0 ? (
                    <div className="text-center text-slate-500 py-4">Sin anotaciones aún</div>
                  ) : (
                    scoreHistory.map((item, idx) => (
                      <div
                        key={idx}
                        className="p-2.5 rounded-xl bg-[#171821] flex items-center justify-between font-mono"
                      >
                        <span className="text-slate-400">Mano #{item.round}</span>
                        <span className={item.team === 1 ? "text-indigo-400" : "text-rose-400"}>
                          +{item.delta} pts para {item.team === 1 ? "Nosotros" : "Ellos"}
                        </span>
                        <span className="text-white font-bold">
                          {item.t1} - {item.t2}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* VIEW 5: RANKING GLOBAL */}
        {activeTab === "ranking" && (
          <div className="max-w-3xl mx-auto space-y-6">
            <div>
              <h2 className="text-2xl font-black text-white">Ranking de Maestros del Dominó</h2>
              <p className="text-xs text-slate-400 mt-1">
                Clasificación de la temporada según victorias y puntos de elo.
              </p>
            </div>

            <div className="rounded-3xl bg-[#1e2029] border border-white/10 overflow-hidden shadow-xl">
              {[
                { rank: 1, name: "Alexander Herzog (Tú)", elo: 2450, wins: 96, winrate: "68%", badge: "🥇 Gran Maestro" },
                { rank: 2, name: "Carlos Mendoza", elo: 2380, wins: 88, winrate: "64%", badge: "🥈 Maestro" },
                { rank: 3, name: "Sofía Romero", elo: 2310, wins: 82, winrate: "61%", badge: "🥉 Maestro" },
                { rank: 4, name: "Alejandro Batista", elo: 2240, wins: 75, winrate: "58%", badge: "Diamante" },
                { rank: 5, name: "Mateo Silva", elo: 2190, wins: 69, winrate: "55%", badge: "Diamante" },
              ].map((p) => (
                <div
                  key={p.rank}
                  className="p-4 px-6 border-b border-white/5 flex items-center justify-between hover:bg-white/5 transition-all text-xs"
                >
                  <div className="flex items-center gap-4">
                    <span className="font-mono font-black text-base text-indigo-400 w-6">
                      #{p.rank}
                    </span>
                    <div>
                      <div className="font-bold text-white text-sm">{p.name}</div>
                      <div className="text-[11px] text-slate-400">{p.badge}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-6 font-mono text-right">
                    <div>
                      <div className="text-slate-400 text-[10px]">Victorias</div>
                      <div className="font-bold text-emerald-400">{p.wins} ({p.winrate})</div>
                    </div>
                    <div>
                      <div className="text-slate-400 text-[10px]">ELO</div>
                      <div className="font-black text-amber-400 text-sm">{p.elo}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* VIEW 6: REGLAMENTO Y AYUDA */}
        {activeTab === "help" && (
          <div className="max-w-3xl mx-auto space-y-6">
            <h2 className="text-2xl font-black text-white">Reglas y Guía del Juego</h2>
            <div className="p-6 rounded-3xl bg-[#1e2029] border border-white/10 space-y-4 text-xs text-slate-300 leading-relaxed">
              <h3 className="text-sm font-bold text-indigo-400">1. Objetivo y Jugadores</h3>
              <p>
                El dominó se juega con 28 fichas (del doble blanco [0|0] al doble seis [6|6]). En el modo por parejas tradicional compiten 4 jugadores agrupados de dos en dos, ubicados en posiciones alternas.
              </p>
              <h3 className="text-sm font-bold text-indigo-400">2. Salida</h3>
              <p>
                En la primera mano sale el jugador con el [6|6] (doble seis). En las manos siguientes, sale el jugador ganador de la ronda anterior o en sentido horario.
              </p>
              <h3 className="text-sm font-bold text-indigo-400">3. Tranca o Cierre</h3>
              <p>
                Si ningún jugador puede colocar ficha en ninguna de las dos puntas, la partida se declara cerrada o &quot;trancada&quot;. En este caso, cada pareja suma los puntos de las fichas restantes en sus manos y gana la pareja con menor puntuación acumulada.
              </p>
            </div>
          </div>
        )}
      </main>

      {/* ================= MODAL: CREAR MESA (Web Service UI Kit Task Creation style) ================= */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-xl p-8 rounded-3xl bg-[#1c1d25] border border-[#2e313f] shadow-2xl animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-4 border-b border-white/5 mb-6">
              <div>
                <h3 className="text-lg font-black text-white">Configurar Nueva Mesa</h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Personaliza los parámetros de juego para tu sala.
                </p>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-slate-400 hover:text-white text-sm"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-6">
              {/* Select Mode */}
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-2">
                  Modalidad de juego
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(
                    [
                      { mode: "tradicional", label: "2v2 Clásico" },
                      { mode: "duelo1v1", label: "1v1 Duelo" },
                      { mode: "pozo", label: "Con Pozo" },
                    ] as const
                  ).map((m) => (
                    <button
                      key={m.mode}
                      type="button"
                      onClick={() => setCreateMode(m.mode)}
                      className={`py-3 px-3 rounded-2xl border text-xs font-bold transition-all ${
                        createMode === m.mode
                          ? "bg-indigo-600 border-indigo-400 text-white shadow-md shadow-indigo-600/30"
                          : "bg-[#252834] border-transparent text-slate-400 hover:text-white"
                      }`}
                    >
                      {m.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Target Points & Timer */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-2">
                    Meta de Puntos
                  </label>
                  <select
                    value={createTargetPts}
                    onChange={(e) => setCreateTargetPts(Number(e.target.value))}
                    className="w-full px-4 py-3 rounded-2xl bg-[#252834] border border-white/5 text-xs text-white outline-none focus:border-indigo-500"
                  >
                    <option value={100}>100 Puntos</option>
                    <option value={200}>200 Puntos</option>
                    <option value={50}>50 Puntos (Rápido)</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-2">
                    Tiempo por turno
                  </label>
                  <select
                    value={createTurnTime}
                    onChange={(e) => setCreateTurnTime(Number(e.target.value))}
                    className="w-full px-4 py-3 rounded-2xl bg-[#252834] border border-white/5 text-xs text-white outline-none focus:border-indigo-500"
                  >
                    <option value={15}>15 Segundos</option>
                    <option value={30}>30 Segundos</option>
                  </select>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="w-full py-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm shadow-xl shadow-indigo-600/30 transition-all cursor-pointer"
              >
                Crear Mesa y Empezar
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: PERFIL (Web Service UI Kit Profile Style) ================= */}
      {showProfileModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-xl p-8 rounded-3xl bg-[#1c1d25] border border-[#2e313f] shadow-2xl animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-4 border-b border-white/5 mb-6">
              <h3 className="text-lg font-black text-white">Perfil de Jugador</h3>
              <button
                onClick={() => setShowProfileModal(false)}
                className="text-slate-400 hover:text-white text-sm"
              >
                ✕
              </button>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-6 mb-6">
              <img
                src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=160&auto=format&fit=crop&q=80"
                alt="Profile"
                className="w-24 h-24 rounded-3xl object-cover border-2 border-indigo-500/50 shadow-xl"
              />
              <div className="flex-1 w-full">
                <label className="text-xs font-bold text-slate-400 block mb-1">Nombre</label>
                <input
                  type="text"
                  value={playerName}
                  onChange={(e) => setPlayerName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-2xl bg-[#252834] border border-white/5 text-sm text-white font-bold outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            {/* Profile Stats Cards (matching Promotion Service - Profile - Dark.png) */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
              <div className="p-3 rounded-2xl bg-[#232532] text-center border border-white/5">
                <div className="text-lg font-black text-white">142</div>
                <div className="text-[10px] text-slate-400 uppercase font-medium">Partidas</div>
              </div>
              <div className="p-3 rounded-2xl bg-[#232532] text-center border border-white/5">
                <div className="text-lg font-black text-emerald-400">96</div>
                <div className="text-[10px] text-slate-400 uppercase font-medium">Victorias</div>
              </div>
              <div className="p-3 rounded-2xl bg-[#232532] text-center border border-white/5">
                <div className="text-lg font-black text-indigo-400">68%</div>
                <div className="text-[10px] text-slate-400 uppercase font-medium">Winrate</div>
              </div>
              <div className="p-3 rounded-2xl bg-[#232532] text-center border border-white/5">
                <div className="text-lg font-black text-amber-400">5 🔥</div>
                <div className="text-[10px] text-slate-400 uppercase font-medium">Racha</div>
              </div>
            </div>

            <button
              onClick={() => setShowProfileModal(false)}
              className="w-full py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg transition-all"
            >
              Guardar Cambios
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
