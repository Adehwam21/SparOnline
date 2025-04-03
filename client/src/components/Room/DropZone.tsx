import React, { useState } from "react";
import Card from "./Card";

interface DropZoneProps {
  isTurn: boolean;
  onCardDropped: (card: string) => void;
}

const DropZone: React.FC<DropZoneProps> = ({ isTurn, onCardDropped }) => {
  const [droppedCards, setDroppedCards] = useState<string[]>([]);

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (!isTurn) return; // Prevent drop if not the player's turn

    const card = e.dataTransfer.getData("text/plain").split("/").pop();
    const cardName = card!.split(".")[0]; // Selects only the card name, eg 6H
    if (!card || droppedCards.includes(cardName)) return; // Prevent duplicate drops

    setDroppedCards((prevCards) => [...prevCards, card]); // Add to drop zone
    onCardDropped(cardName); // Call the handler to remove the card from PlayerBar
  };

  const preventDrag = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault(); // Stop dragging inside DropZone
  };

  return (
    <div 
      className="h-28 min-w-72 flex flex-col items-center justify-center bg-green-900 rounded-sm text-white text-sm font-bold transition-all p-2"
      onDrop={handleDrop}
      onDragOver={(e) => e.preventDefault()} // Allow dropping from PlayerBar
    >
      {droppedCards.length === 0 ? (
        <span>{isTurn ? "Drop Card Here to bid" : "Not Your Turn"}</span>
      ) : (
        <div className="flex">
          {droppedCards.map((card, index) => (
            <div key={index} 
              draggable={false} // Disable dragging inside DropZone
              onDragStart={preventDrag} // Prevent drag events
              className="cursor-default" // Prevents visual drag cursor
            >
              <Card card={card} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DropZone;
