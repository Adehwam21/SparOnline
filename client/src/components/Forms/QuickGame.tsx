import React, { useState } from "react";
import BaseModal from "./BaseModal";
import { quickGameTables } from "../../config/quickGameTables";
import { motion } from "framer-motion";
import { FaUser } from "react-icons/fa";

const survivalIcon = "/images/game-elements/sword.png";
const raceIcon = "/images/game-elements/finish.png"
const coinIcon = "/images/game-elements/coin.png";

interface QuickGameModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStartQuickGame?: (roomOptions: typeof quickGameTables[0]) => void;
}

const QuickGame: React.FC<QuickGameModalProps> = ({ isOpen, onClose, onStartQuickGame }) => {
  const [activeVariant, setActiveVariant] = useState<"race" | "survival">("race");
  const filteredRooms = quickGameTables.filter((room) => room.variant === activeVariant);

  // function to pick button styles based on stakes + variant
// function to pick button styles based on stakes + variant
  const getButtonClasses = (entryFee: number, variant: "race" | "survival") => {
    const isRace = variant === "race";

    if (entryFee === 0) {
      return isRace
        ? "bg-green-100 text-green-800"
        : "bg-yellow-100 text-yellow-800";
    }
    if (entryFee < 100) {
      return isRace
        ? "bg-green-200 text-green-900"
        : "bg-yellow-200 text-yellow-900";
    }
    if (entryFee < 1000) {
      return isRace
        ? "bg-green-500 text-white"
        : "bg-yellow-500 text-black";
    }
    return isRace
      ? "bg-gradient-to-br from-green-600 to-green-800 text-white border-2 border-green-900"
      : "bg-gradient-to-br from-yellow-500 to-yellow-700 text-black border-2 border-yellow-800";
  };


  return (
    <BaseModal isOpen={isOpen} onClose={onClose} title="Quick Game">
      <div className="text-black space-y-6">
        {/* Tabs */}
        <div className="flex justify-center gap-4 mb-4">
          <button
            className={`px-4 py-2 flex items-center gap-2 rounded-lg font-bold transition ${
              activeVariant === "race" ? "bg-green-600 text-white" : "bg-gray-200"
            }`}
            onClick={() => setActiveVariant("race")}
          >
            <img src={raceIcon} alt="Race" className="w-5 h-5" />
            Race
          </button>
          <button
            className={`px-4 py-2 flex items-center gap-2 rounded-lg font-bold transition ${
              activeVariant === "survival" ? "bg-yellow-600 text-white" : "bg-gray-200"
            }`}
            onClick={() => setActiveVariant("survival")}
          >
            <img src={survivalIcon} alt="Survival" className="w-5 h-5" />
            Survival
          </button>
        </div>

        {/* Grid of Rooms */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredRooms.map((room, idx) => (
            <motion.button
              key={idx}
              whileHover={{ scale: 1.05 }}
              className={`p-3 flex flex-col justify-center items-center text-center rounded-xl shadow-md cursor-pointer hover:shadow-lg transition ${getButtonClasses(room.entryFee, activeVariant)}`}
              onClick={() => onStartQuickGame?.(room)}
            >
              <h3 className="text-[14px] font-bold mb-1">{room.name}</h3>

              {/* Entry Fee */}
              <div className="flex items-center gap-1 text-md font-bold">
                <img src={coinIcon} alt="Coins" className="w-3 h-3" />
                <span>{room.entryFee === 0 ? "Free" : room.entryFee}</span>
              </div>

              {/* Players & Points */}
              <div className="flex items-center gap-1 text-[13px] font-semibold">
                <FaUser size={14} color= {`${activeVariant === "race" ? "blue" : "green"}`} />
                <span>{room.maxPlayers}P</span> •
                <span>{room.maxPoints}pts</span>
              </div>
            </motion.button>
          ))}
        </div>
      </div>
    </BaseModal>
  );
};

export default QuickGame;
