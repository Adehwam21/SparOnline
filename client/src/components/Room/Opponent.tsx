import React from "react";
import { FaUser } from "react-icons/fa";
import CardPile from "./CardPile";

interface OpponentProps {
  username: string;
  score: number;
  bids: string[]; // Array of card image URLs or card names
}

const Opponent: React.FC<OpponentProps> = ({ username, score, bids }) => {
  return (
    <div className="bg-green-700 text-white px-2 py-2 rounded-lg shadow-lg">
      {/* Opponent Header: Avatar + Username + Score */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FaUser size={20} className="text-yellow-400" />
          <span className="text-sm font-semibold">{username}</span>
        </div>
        <span className=" text-yellow-400 rounded-md mx-2 text-lg font-bold">
          {score}
        </span>
      </div>

      {/* Played Cards Section */}
      <div className=" flex h-24 w-64 rounded-md justify-center items-center">
       {bids.length > 0 ? (
            <CardPile bids={bids}/>
       ):(
        <p className="text-yellow-500">No bids yet!</p>
       ) }
      </div>
    </div>
  );
};

export default Opponent;
