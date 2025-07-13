import React from "react";
import { FaUser } from "react-icons/fa";
import CardPile from "./CardPile";

interface OpponentProps {
  username: string;
  score: number;
  bids: string[]; // Array of card image URLs or card names
  // maxPoints: string;
  active: boolean;
}

const Opponent: React.FC<OpponentProps> = ({ username, score, bids, active }) => {
  const cardsLeftInHand: number = 5- Number(bids.length);
  return (
    <div className="min-w-72 text-white px-0 py-2 rounded-sm border-1 border-gray-500 ">
      {/* Opponent Header: Avatar + Username + Score */}
      <div className="flex items-center justify-between py-1 border-b-1 border-gray-500  px-4 lg:px-3">
        <div className="flex items-center gap-2">
          <FaUser size={18} className={active ? "text-yellow-400" : "text-gray-500"}/>
          <span className="text-sm font-bold">{username}</span>
        </div>
        <div className="flex justify-center items-center font-bold text-center text-sm gap-2">
          <img className="h-4 w-4" src="/images/game-elements/playing-card.png" alt="Cards in hand" />
          {cardsLeftInHand}
        </div>
        <span className={`flex justify-center items-center text-center text-yellow-400 text-md gap-2  font-bold ${active ? "text-yellow-400" : "text-gray-500"}`}>
          {/* <img className="h-4 w-4" src="/images/game-elements/target.png" alt="Target" /> */}
          <span className="text-yellow-400 text-[10px]">Points:</span>
          <span className="text-yellow-400 text-xl">{score}</span>
        </span>
      </div>

      {/* Played Cards Section */}
      <div className=" flex h-24 auto rounded-md justify-center items-center">
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
