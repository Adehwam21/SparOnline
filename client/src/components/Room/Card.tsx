import React from "react";

interface CardProps {
  card:  string;

}

const Card: React.FC<CardProps> = ({ card }) => {
  return (
    <div className={`relative h-16 md:h-16`}>
      <img
        src={`/images/cards/${card.toUpperCase()}.png`}
        alt={card.toUpperCase()}
        className="w-full h-full object-cover rounded-sm"
      />
    </div>
  );
};

export default Card;
