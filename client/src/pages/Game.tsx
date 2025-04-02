import React, { useEffect, useState } from "react";
import Room from "../components/Room/Room";
import { GameState } from "../types/game";
import gameData from "../data/gameState.json"; // Import the JSON file

const GamePage: React.FC = () => {
  const [gameState, setGameState] = useState<GameState | null>(null);

  useEffect(() => {
    // Simulate fetching data from the server
    setTimeout(() => {
      setGameState(gameData);
    }, 1000); // Delay added to simulate a real API call
  }, []);

  if (!gameState) {
    return <div className="flex items-center p-15 justify-center h-screen text-white">Loading game...</div>
  }

  return (
    <div className="w-full p-10 bg-green-600 pt-30 text-white">
      <Room players={gameState.players} currentPlayerId={gameState.currentPlayerId} maxPoints={gameState.maxPoints} />
    </div>
  );
};

export default GamePage;
