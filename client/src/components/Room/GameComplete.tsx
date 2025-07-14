// components/GameCompleteModal.tsx
import React from "react";
import { Player } from "../../types/game"; // adjust path based on your Player type

interface GameCompleteModalProps {
  isOpen: boolean;
  players: Player[];
  winner: string;
  onRestart?: () => void;
  onExit?: () => void;
}

export const GameCompleteModal: React.FC<GameCompleteModalProps> = ({
  isOpen,
  players,
  winner,
  onExit,
}) => {
  if (!isOpen) return null;

  const sortedPlayers = [...players].sort((a, b) => b.score - a.score);

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-white p-6 rounded-2xl w-full max-w-md shadow-lg text-black text-center">
        <h2 className="text-2xl font-bold mb-4">🏆 Game Ended</h2>
        <p className="mb-6 text-lg">Winner: <span className="font-bold text-green-600">{winner}</span></p>

        <ul className="space-y-2 flex flex-col justify-center items-center text-center">
          {sortedPlayers.map((player) => (
            <li key={player.username} className="flex justify-around space-x-5">
              <span>{player.username}</span>
              <span className="font-bold">{player.score} pts</span>
            </li>
          ))}
        </ul>

        <div className="mt-6 flex justify-around">
          <button
            onClick={onExit}
            className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
          >
            Leave
          </button>
        </div>
      </div>
    </div>
  );
};
