import React from "react";
import { useDroppable } from "@dnd-kit/core";
import Card from "./Card";

interface BidZoneProps {
  bidCards: string[];
}

const BidZone: React.FC<BidZoneProps> = ({ bidCards }) => {
  const { setNodeRef, isOver } = useDroppable({ id: "bid-zone" });

  return (
    <div
      ref={setNodeRef}
      className={`h-28 min-w-72 flex flex-col items-center justify-center rounded-sm text-white text-sm font-bold p-2 transition-colors ${
        isOver ? "bg-green-900" : "bg-green-900"
      }`}
    >
      {bidCards.length === 0 ? (
        <span>Drop card to bid</span>
      ) : (
        <div className="flex gap-1">
          {bidCards.map((card) => (
            <Card key={card} card={card} />
          ))}
        </div>
      )}
    </div>
  );
};

export default BidZone;
