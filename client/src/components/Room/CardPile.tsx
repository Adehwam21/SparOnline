import React from "react";
import Card from "./Card";

interface CardPileProps {
  bids: string[];
}

const CardPile: React.FC<CardPileProps> = ({ bids }) => {
  return (
    <div className="flex justify-center items-center relative h-24 w-full mx-3">
      {bids.map((card, index) => (
        <div
          key={index}
          className="absolute transition-all"
          style={{ left: `${index * 3}rem` }}
        >
          <Card card={card} />
        </div>
      ))}
    </div>
  );
};

export default CardPile;
