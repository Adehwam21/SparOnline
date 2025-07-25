import React from "react";
import {
  FiMoreVertical,
  FiMessageSquare,
  FiLogOut,
} from "react-icons/fi";
// import { BiSolidServer } from "react-icons/bi";
// import { FaSignal } from "react-icons/fa";
import { formatPrizePool } from "../../utils/helpers";
import { GameServerStats } from "../../contexts/roomContext";

interface RoomHUDProps {
  deckCount: number;
  pot: number;
  maxPoints: string;
  variant: string | null;
  onToggleChat: () => void;
  onMenuToggle: () => void;
  onMuteToggle: () => void;
  onReportUser: () => void;
  onLeaveRoom: () => void;
  serverStats: GameServerStats;
  isMuted: boolean;
  menuOpen: boolean;
}

const RoomHUD: React.FC<RoomHUDProps> = ({
  deckCount,
  pot,
  maxPoints,
  variant,
  onToggleChat,
  onMenuToggle,
  serverStats,
  onLeaveRoom,
  menuOpen,
}) => {
  const imageUrl =
    variant === "survival"
      ? "/images/game-elements/skull-and-bones.png"
      : "/images/game-elements/target.png";

  const variantImage =
    variant === "survival"
      ? "/images/game-elements/sword.png"
      : "/images/game-elements/finish.png";

  console.log(serverStats);
  return (
    <div className="flex items-center font-semibold justify-between px-4 py-2 bg-black/40 backdrop-blur-2xl relative z-50 text-white w-full">
      {/* Left side */}
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2 text-sm">
          <img className="h-6 w-6" src="/images/game-elements/deck-of-card.png" alt="Deck icon" />
          {deckCount}
        </div>

        <div className="flex items-center gap-2 text-sm font-bold">
          <img className="h-6 w-6" src="/images/game-elements/money-bag.png" alt="Money bag" />
          {formatPrizePool(pot)}
        </div>

        <div className="flex items-center gap-2 text-yellow-400 text-sm">
          <img className="h-6 w-6" src={imageUrl} alt="Game type icon" />
          <span className="font-bold text-white">{maxPoints}</span>
        </div>
      </div>

      {/* Center */}
      <div className="flex items-center gap-1 text-yellow-400">
        <img className="h-6 w-6" src={variantImage} alt="Game variant icon" />
        <span className="font-bold text-sm text-white">{variant?.toUpperCase()}</span>
      </div>

      {/* Right side */}
      <div className="relative flex gap-3.5">
        <button
          onClick={onToggleChat}
          className="flex items-center gap-2 px-3 py-1 bg-blue-600 hover:bg-blue-700 rounded shadow"
        >
          <FiMessageSquare size={16} />
          <span className="text-sm">Chat</span>
        </button>

        <button
          onClick={onMenuToggle}
          className="p-2 rounded-full hover:bg-white/10"
        >
          <FiMoreVertical size={20} />
        </button>

        {menuOpen && (
          <div className="absolute right-0 top-14 w-56 bg-white flex flex-col text-black p-2 rounded shadow-lg z-50 transition-all duration-200 animate-fade-in">
            <button
              onClick={onLeaveRoom}
              className="flex items-center gap-2 px-4 py-2 hover:bg-red-200 rounded w-full text-left text-red-600"
            >
              <FiLogOut />
              Leave Room
            </button>

            <div className="border-t border-gray-200 mt-2 p-1 flex justify-start text-start items-start font-light text-sm">
              Ping:{" "}
              <span
                className={`ml-1 font-bold ${
                  Number(serverStats?.rttEstimate) > 200 ? "text-red-500" : "text-green-400"
                }`}
              >
                {serverStats?.rttEstimate !== null && serverStats?.rttEstimate !== undefined
                  ? `${serverStats.rttEstimate} ms`
                  : "N/A"}
              </span>
            </div>


            <div className="flex justify-start p-1 text-start items-start font-light text-sm ">
              Server: {" "}
              <span className="font-bold">{serverStats?.processingTime !== null && serverStats?.processingTime !== undefined ? `${serverStats.processingTime} ms` : "N/A"}</span>
            </div>

          </div>
        )}
      </div>
    </div>
  );
};

export default RoomHUD;
