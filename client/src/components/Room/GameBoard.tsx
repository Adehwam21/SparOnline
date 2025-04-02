import React, { useState } from "react";
import Opponent from "./Opponent";
import PlayerBar from "./PlayerBar";
import DropZone from "./DropZone";

interface GameBoardProps {
  players: { id: string; username: string; score: number; bids: string[] }[];
  currentPlayerId: string;
  maxPoints: string;
}

const GameBoard: React.FC<GameBoardProps> = ({ players, currentPlayerId, maxPoints }) => {
  const player = players.find((p) => p.id === currentPlayerId);
  const opponents = players.filter((p) => p.id !== currentPlayerId);
  const isTurn = player!.id === currentPlayerId;

  const [playableCards, setPlayableCards] = useState<string[]>(player?.bids || []);

  // This function is called when a card is dropped in DropZone
  const handleCardDropped = (card: string) => {
    setPlayableCards((prevCards) => prevCards.filter((c) => c !== card)); // Remove dropped card
  };

  return (
    <div className="relative w-full h-screen flex flex-col items-center justify-center bg-green-600 text-white">
      {/* Opponents (Mobile: Stack, Desktop: Positioned) */}
      <div className="w-full flex mb-5 flex-col md:flex-row items-center justify-center gap-4 md:absolute md:top-5">
        {opponents.length > 0 &&
          opponents.map((opponent, index) => (
            <div
              key={index}
              className={`w-full md:w-auto ${opponents.length === 1 ? "text-center" : ""}`}
            >
              <Opponent {...opponent} maxPoints={maxPoints} />
            </div>
          ))}
      </div>

      {/* Player Section (Bottom) */}
      {/* Drop Zone and Player Bar */}
      {player && (
        <div className="relative p-2 flex flex-col justify-center space-y-4 items-center w-full">
          <DropZone
            isTurn={isTurn}
            onCardDropped={handleCardDropped} // Pass handleCardDropped to DropZone
          />
          <PlayerBar
            username={player.username}
            score={player.score}
            playableCards={playableCards} // Pass playableCards as prop
            isTurn={isTurn}
            maxPoints={maxPoints}
            onCardDropped={handleCardDropped} // Pass handleCardDropped to PlayerBar
          />
        </div>
      )}
    </div>
  );
};

export default GameBoard;
