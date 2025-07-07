import React from "react";
import Card from "./Card";

interface BidZoneProps {
  /** Array of card codes the player has bid, e.g. ["6H", "JD"] */
  bidCards: string[];
}

const BidZone: React.FC<BidZoneProps> = ({ bidCards }) => (
  <div className="h-28 min-w-72 flex flex-col items-center justify-center bg-green-900 rounded-sm text-white text-sm font-bold transition-all p-2">
    {bidCards.length === 0 ? (
      <span>No bids yet</span>
    ) : (
      <div className="flex justify-center items-center">
        {bidCards.map((card, index) => (
          <div key={index} className="cursor-default">
            <Card card={card} />
          </div>
        ))}
      </div>
    )}
  </div>
);

export default BidZone;
