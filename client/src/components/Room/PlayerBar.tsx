/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useState } from "react";
import Card from "./Card";
import { FaUser } from "react-icons/fa";

interface PlayerBarProps {
  username: string;
  score: number;
  playableCards: string[];
  isTurn: boolean;
  maxPoints: string;
  onCardDropped: (cardName: string) => void
  
}

const PlayerBar: React.FC<PlayerBarProps> = ({ username, score, playableCards, isTurn, maxPoints, onCardDropped }) => {
  const [cards, setCards] = useState<string[]>(playableCards);
  const [draggedCardIndex, setDraggedCardIndex] = useState<number | null>(null);

  // Handle drag start
  const handleDragStart = (index: number, card: string, e: React.DragEvent<HTMLDivElement>) => {
    setDraggedCardIndex(index);
    e.dataTransfer.setData("text/plain", card); 
  };

  // Handle drag over another card
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>, index: number) => {
    e.preventDefault();
    if (draggedCardIndex === null || draggedCardIndex === index) return;

    const updatedCards = [...cards];
    [updatedCards[draggedCardIndex], updatedCards[index]] = [updatedCards[index], updatedCards[draggedCardIndex]];

    setCards(updatedCards); // ✅ Update state to trigger re-render
    setDraggedCardIndex(index);
  };

  return (
    <div className="min-w-72 min-h-36 bg-green-900 text-white p-2 md:p-4 rounded-sm shadow-lg max-w-4xl flex flex-col md:flex-row items-center justify-around space-y-4 md:space-y-0 md:space-x-4">
      
      {/* Player Info */}
      <div className="flex flex-row space-x-4 md:flex-row justify-between items-center">
        <div className="flex flex-row space-x-4 md:space-y-4 md:flex-col justify-between items-center">
          <div className="flex flex-row justify-center items-center lg:mx-3 space-x-2">
            <FaUser size={20} className={`${isTurn ? "text-green-500" : "text-red-500"}`}/>
            <span className="text-sm md:text-base text-center font-bold">{username}</span>
          </div>
          <div className={`text-center px-3 py-1 text-sm font-bold rounded-sm ${isTurn ? "bg-green-500" : "bg-red-500"}`}>
            {isTurn ? "Your Turn" : "Waiting..."}
          </div>
        </div>

        {/* Score Section */}
        <p className="text-yellow-300 text-2xl md:text-3xl font-bold">
          {score}<span className="text-lg md:text-xl font-bold">/{maxPoints}</span>
        </p>
      </div>

      {/* Playable Cards (Scrollable) */}
      <div className="p-1 rounded-md flex gap-1 overflow-x-auto w-full md:w-auto">
        {cards.map((card, index) => (
          <div
            key={index}
            draggable
            className="cursor-pointer transition-transform transform hover:scale-110"
            onDragStart={(e) => handleDragStart(index, card, e)}
            onDragOver={(e) => handleDragOver(e, index)}
          >
            <Card card={card} />
          </div>
        ))}
      </div>
    </div>
  );
};

export default PlayerBar;
