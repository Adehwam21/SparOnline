import React from "react";
import { FaUser } from "react-icons/fa";
import CardPile from "./CardPile";

interface OpponentProps {
  username: string;
  score: number;
  bids: string[]; // Array of card image URLs or card names
  maxPoints: string;
}

const Opponent: React.FC<OpponentProps> = ({ username, score, bids, maxPoints }) => {
  return (
    <div className="bg-green-700 text-white px-2 py-2 rounded-lg shadow-lg">
      {/* Opponent Header: Avatar + Username + Score */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FaUser size={20} className="text-yellow-400" />
          <span className="text-sm font-bold">{username}</span>
        </div>
        <span className=" text-yellow-400 space-x-2 text-2xl font-bold">
            {score}<span className="text-sm text font-bold">/{maxPoints}</span>
        </span>
      </div>

      {/* Played Cards Section */}
      <div className=" flex h-24 w-64 rounded-md justify-center items-center">
       {bids.length > 0 ? (
            <CardPile bids={bids}/>
       ):(
        <p className="text-white font-bold text-sm">No bids yet!</p>
       ) }
      </div>
    </div>
  );
};

export default Opponent;
