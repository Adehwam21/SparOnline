import React, { useState } from "react";
import Card from "./Card";

interface DropZoneProps {
  isTurn: boolean;
}

const DropZone: React.FC<DropZoneProps> = ({ isTurn }) => {
  const [droppedCards, setDroppedCards] = useState<string[]>([]);

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (isTurn) {
      const card = e.dataTransfer.getData("text/plain");
      setDroppedCards((prevCards) => [...prevCards, card]); // Store dropped card
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault(); // Allow drop
  };

  return (
    <div 
      className={`w-80 h-28 flex flex-col items-center justify-center bg-green-700 rounded-t-lg text-white font-bold transition-all p-2`}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
    >
      {droppedCards.length === 0 ? (
        <span>{isTurn ? "Drop Card Here" : "Not Your Turn"}</span>
      ) : (
        <div className="flex">
          {droppedCards.map((card) => (
            <Card card={card}/>
          ))}
        </div>
      )}
    </div>
  );
};

export default DropZone;
