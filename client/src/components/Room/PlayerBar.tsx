import React from "react";
import { FaUser } from "react-icons/fa";
import DraggableCard from "./DraggableCard";

interface PlayerBarProps {
  username: string;
  score: number;
  playableCards: string[];
  isTurn: boolean;
  maxPoints: string;
}

const PlayerBar: React.FC<PlayerBarProps> = ({
  username,
  score,
  playableCards,
  isTurn,
  maxPoints,
}) => (
  <div className="min-w-72 min-h-36 max-w-4xl bg-green-900 text-white p-2 md:p-4 rounded-sm shadow-lg flex flex-col md:flex-row items-center justify-around space-y-4 md:space-y-0 md:space-x-4">
    {/* Player Info */}
    <div className="flex items-center space-x-4">
      <div className="flex items-center space-x-2">
        <FaUser size={20} className={isTurn ? "text-green-400" : "text-red-400"} />
        <span className="font-bold text-sm md:text-base">{username}</span>
      </div>
      <div
        className={`px-3 py-1 rounded-sm text-sm font-bold ${
          isTurn ? "bg-green-500" : "bg-red-500"
        }`}
      >
        {isTurn ? "Your Turn" : "Waiting..."}
      </div>
      <p className="text-yellow-300 text-2xl md:text-3xl font-bold ml-4">
        {score}
        <span className="text-lg md:text-xl">/{maxPoints}</span>
      </p>
    </div>

    {/* Hand */}
    <div className="flex gap-2 p-2 rounded-sm w-full md:w-auto">
      {playableCards.map((card) => (
        <DraggableCard key={card} id={card} />
      ))}
    </div>
  </div>
);

export default PlayerBar;
