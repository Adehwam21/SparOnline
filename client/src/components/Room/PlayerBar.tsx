import React, { useState } from "react";
import Card from "./Card";
import { FaUser } from "react-icons/fa";
import { useRoom } from "../../contexts/roomContext";
import { useDispatch } from "react-redux";
import { AppDispatch } from "../../redux/reduxStore";

interface PlayerBarProps {
  username: string;
  score: number;
  playableCards: string[];
  isTurn: boolean;
  maxPoints: string;
}

const PlayerBar: React.FC<PlayerBarProps> = ({
  username,
  score,
  playableCards,
  isTurn,
  maxPoints,
}) => {
  const dispatch = useDispatch<AppDispatch>();
  const { playCard } = useRoom();

  const [selectedCard, setSelectedCard] = useState<string | null>(null);

  /** Toggle selection; click again to unselect */
  const handleCardSelect = (card: string) =>
    setSelectedCard(prev => (prev === card ? null : card));

  /** Send the chosen card to the server */
  const handleCardPlayed = () => {
    if (!selectedCard) return;
    playCard(selectedCard, dispatch);
    setSelectedCard(null); // clear local selection
  };

  return (
    <div className="min-w-72 min-h-36 max-w-4xl bg-green-900 text-white p-2 md:p-4 rounded-sm shadow-lg flex flex-col md:flex-row items-center justify-around space-y-4 md:space-y-0 md:space-x-4">
      {/* Player Info & Score */}
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2">
          <FaUser size={20} className={isTurn ? "text-green-400" : "text-red-400"} />
          <span className="font-bold text-sm md:text-base">{username}</span>
        </div>

        <div
          className={`px-3 py-1 rounded-sm text-sm font-bold ${
            isTurn ? "bg-green-500" : "bg-red-500"
          }`}
        >
          {isTurn ? "Your Turn" : "Waiting..."}
        </div>

        <p className="text-yellow-300 text-2xl md:text-3xl font-bold ml-4">
          {score}
          <span className="text-lg md:text-xl">/{maxPoints}</span>
        </p>
      </div>

      {/* Playable Cards */}
      <div className="flex gap-2 overflow-x-auto p-2 rounded-sm w-full md:w-auto">
        {playableCards.map(card => (
          <div
            key={card}
            onClick={() => handleCardSelect(card)}
            className={`cursor-pointer transition-transform hover:scale-105 ${
              selectedCard === card ? "ring-2 ring-yellow-400 rounded-sm" : ""
            }`}
          >
            <Card card={card} />
          </div>
        ))}
      </div>

      {/* Bid Button */}
      <button
        onClick={handleCardPlayed}
        disabled={!isTurn || !selectedCard}
        className={`px-6 py-2 rounded-md font-semibold transition-colors ${
          !isTurn || !selectedCard
            ? "bg-gray-500 cursor-not-allowed"
            : "bg-yellow-500 hover:bg-yellow-600"
        }`}
      >
        Bid
      </button>
    </div>
  );
};

export default PlayerBar;
