import React from "react";
import { FaUser } from "react-icons/fa";
import Card from "./Card";

interface PlayerBarProps {
  username: string;
  score: number;
  playableCards: string[];
  isTurn: boolean;
  maxPoints: string;
  onShuffle?: () => void;
}

const PlayerBar: React.FC<PlayerBarProps> = ({ username, score, playableCards, isTurn, maxPoints }) => {
  return (
    <div className="bg-green-700 text-white p-2 md:p-4 rounded-lg shadow-lg w-3xl max-w-4xl mx-auto flex items-center justify-evenly">
      
      {/* Player Info (2/10) */}
      <div className="flex flex-col justify-center items-center">
        <FaUser className="text-yellow-400 text-2xl" />
        <span className="text-lg font-semibold">{username}</span>
        <div className={`text-center px-3 py-1 text-sm rounded-md ${isTurn ? "bg-green-500" : "bg-red-500"}`}>
          {isTurn ? "Your Turn" : "Waiting..."}
        </div>
      </div>

      {/* Playable Cards (4/10) */}
      <div className=" p-2 rounded-md flex gap-1 overflow-x-auto">
        {playableCards.length > 0 ? (
          playableCards.map((card, index) => (
            <div 
              key={index} 
              draggable
              className="cursor-pointer transition-transform transform hover:scale-110"
              onDragStart={(e) => e.dataTransfer.setData("text/plain", card)} // Set dragged card data
            >
              <Card card={card}/>
            </div>
          ))
        ) : (
          <p className="text-gray-400 text-xs"></p>
        )}
      </div>

      {/* Score (2/10) */}
      <div className="flex flex-col items-center">
        <p className="rounded-md text-sm font-bold">
          Score
        </p>
        <div className="text-yellow-300 rounded-md text-5xl font-bold">
          {score}
        </div>
        <p className="rounded-md text-sm font-bold">out of {maxPoints}</p>
      </div>

      {/* Turn Indicator + Shuffle (2/10)
      <div className="flex flex-col items-center space-y-2">
        <button 
          onClick={onShuffle} 
          className="bg-yellow-500 hover:bg-yellow-400 text-gray-900 py-2 px-4 rounded-lg transition-all flex items-center gap-2"
        >
          <FaRandom />
        </button>
      </div> */}

    </div>
  );
};

export default PlayerBar;
