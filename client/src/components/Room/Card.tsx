import React from "react";

interface CardProps {
  card:  string;

}

const Card: React.FC<CardProps> = ({ card }) => {
  return (
    <div className={`relative h-20  rounded-lg`}>
      <img
        src={`images/cards/${card.toUpperCase()}.png`}
        alt={card.toUpperCase()}
        className="w-full h-full object-cover border border-green-700"
      />
    </div>
  );
};

export default Card;
