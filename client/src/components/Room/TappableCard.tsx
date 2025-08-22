import React from "react";
import Card from "./Card";
import { useRoom } from "../../contexts/roomContext";

interface Props {
  id: string;
  isTurn: boolean;
}

const TappableCard: React.FC<Props> = ({ id, isTurn }) => {
  const { playCard } = useRoom();

  const handleTapToPlay = () => {
    if (isTurn) {
      console.log("Tapped:", id);
      playCard(id);
    }
  };

  return (
    <button
      type="button"
      onClick={handleTapToPlay}
      className="transition-transform hover:scale-105 cursor-pointer"
    >
      <Card card={id} />
    </button>
  );
};

export default TappableCard;
