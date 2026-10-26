"use client";

import React, { useState } from "react";
import { GameSettings } from "@/types/domino";
import { DominoLobby } from "@/components/lobby/DominoLobby";
import { DominoTable } from "@/components/domino/DominoTable";

export default function Home() {
  const [view, setView] = useState<"lobby" | "table">("lobby");
  const [activeSettings, setActiveSettings] = useState<GameSettings | null>(null);

  const handleStartGame = (settings: GameSettings) => {
    setActiveSettings(settings);
    setView("table");
  };

  const handleExitToLobby = () => {
    setView("lobby");
  };

  const handleReturnToTable = () => {
    if (activeSettings) {
      setView("table");
    }
  };

  return (
    <div className="min-h-screen bg-[#121316] text-white">
      {view === "table" && activeSettings ? (
        <DominoTable settings={activeSettings} onExit={handleExitToLobby} />
      ) : (
        <DominoLobby
          onStartGame={handleStartGame}
          activeTableExists={!!activeSettings}
          onReturnToTable={handleReturnToTable}
        />
      )}
    </div>
  );
}
