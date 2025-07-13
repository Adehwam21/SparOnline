import React from "react";
import { FaUser } from "react-icons/fa";
import DraggableCard from "./DraggableCard";

interface PlayerBarProps {
  username: string;
  // score: number;
  playableCards: string[];
  isTurn: boolean;
  isActive: boolean;
  // maxPoints: string;
}

const PlayerBar: React.FC<PlayerBarProps> = ({
  username,
  // score,
  playableCards,
  isTurn,
  isActive,
}) => (
  <div className="min-w-75 min-h-36 max-w-4xl text-white p-2 md:p-4 flex flex-col md:flex-row items-center justify-center space-y-4 md:space-y-0 md:space-x-4">
    {/* Player Info */}
    <div className="flex flex-row md:flex-col md:space-y-2 justify-center md:justify-between items-center space-x-4 md:space-x-0">
      <div className="flex items-center space-x-2">
        <FaUser size={20} className={isActive ? "text-green-400" : "text-gray-500"} />
        <span className="font-bold text-sm md:text-base">{username}</span>
      </div>
      <div
        className={`w-full flex justify-center items-center text-center md:justify-center md:items-center p-2 text-[10px] font-sm font-bold ${
          isTurn ? "bg-green-500 px-3" : "bg-red-500"
        }`}
      >
        {isTurn ? "Bid" : "Hold"}
      </div>
      {/* <div className="w-full flex justify-center text-center items-center text-yellow-400 text-3xl p-1 font-bold md:justify-center md:items-center">
        {score}
      </div> */}
    </div>

    {/* Hand */}
    <div className="flex justify-center items-center gap-2 p-2 rounded-sm w-full md:w-auto">
      {playableCards.map((card) => (
        <DraggableCard key={card} id={card} />
      ))}
    </div>
  </div>
);

export default PlayerBar;
