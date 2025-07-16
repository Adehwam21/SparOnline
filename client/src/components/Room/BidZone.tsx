import React from "react";
import { useDroppable } from "@dnd-kit/core";
import Card from "./Card";
import { TurnCountdown } from "./TurnCountdown";

interface BidZoneProps {
  bidCards: string[];
  score: number
}

const BidZone: React.FC<BidZoneProps> = ({ bidCards , score}) => {
  const { setNodeRef, isOver } = useDroppable({ id: "bid-zone" });

  return (
    <div>
      <TurnCountdown/>
      <div
        ref={setNodeRef}
        className={`h-28 min-w-64 flex flex-row-reverse justify-between gap-4 rounded-md items-center text-center text-white border-1 border-gray-500 text-sm font-bold p-2 transition-colors ${
          isOver ? "border-yellow-500 transform-border " : ""
        }`}
      >
        <div className="flex flex-col justify-start text-center items-center font-bold md:justify-center md:items-center">
          <span className="text-yellow-400 text-[10px]">Points</span>
          <span className="text-yellow-400 text-5xl">{score}</span>
        </div>

        <div className="flex min-w-64 h-full justify-between items-center text-center text-gray-200">
          {bidCards.length === 0 ? (
            <div className="flex w-full h-full justify-center items-center text-center">
              Drop a card to bid
            </div>
            ):(
              <div className="flex gap-0.5 p-0.5 justify-start items-center">
              {
                bidCards.map((card) => ( <Card key={card} card={card} />))
              }
            </div>)
          }
        </div>
      </div>
    </div>
  );
};

export default BidZone;
