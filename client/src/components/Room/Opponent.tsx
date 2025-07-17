import React from "react";
import { FaUser } from "react-icons/fa";
import CardPile from "./CardPile";

interface OpponentProps {
  username: string;
  score: number;
  bids: string[];
  active: boolean;
  connected: boolean;
  eliminated: boolean;
  isOpponentTurn: boolean;
}

const Opponent: React.FC<OpponentProps> = ({
  username,
  score,
  bids,
  isOpponentTurn,
  active,
  eliminated,
  connected,
}) => {
  const cardsLeftInHand = 5 - bids.length;

  // Determine base color
  const highlightBorder = isOpponentTurn && connected && !eliminated;
  const highlighttext = active && connected && !eliminated;
  const textColor = highlighttext ? "text-yellow-400" : "";
  const borderColor = highlightBorder ? "border-yellow-400" : "border-gray-500";

  return (
    <div className={`min-w-72 px-0 py-2 rounded-sm border ${borderColor}`}>
      {/* Opponent Header: Avatar + Username + Score */}
      <div className={`flex items-center justify-between py-1 border-b ${borderColor} px-4 lg:px-3`}>
        <div className="flex items-center gap-2">
          <FaUser size={18} className={textColor} />
          <span className={`text-sm font-bold ${textColor}`}>{username}</span>
        </div>
        <div className={`flex justify-center items-center font-bold text-center text-sm gap-2 ${textColor}`}>
          <img className="h-4 w-4" src="/images/game-elements/playing-card.png" alt="Cards in hand" />
          {cardsLeftInHand}
        </div>
        <span className={`flex justify-center items-center text-center gap-2 font-bold ${textColor}`}>
          <span className="text-[10px]">Points:</span>
          <span className="text-xl">{score}</span>
        </span>
      </div>

      {/* Played Cards Section */}
      <div className="flex h-24 auto rounded-md justify-center items-center">
        {bids.length > 0 ? (
          <CardPile bids={bids} />
        ) : (
          <p className="text-white font-bold text-sm">No bids yet!</p>
        )}
      </div>
    </div>
  );
};

export default Opponent;
