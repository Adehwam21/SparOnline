import React from "react";
import {
  FiMoreVertical,
  FiVolumeX,
  FiVolume2,
  FiMessageSquare,
  FiFlag,
  FiLogOut,
} from "react-icons/fi";

interface RoomHUDProps {
  deckCount: number;
  pot: number;
  maxPoints: string;
  variant: string;
  onToggleChat: () => void;
  onMenuToggle: () => void;
  onMuteToggle: () => void;
  onReportUser: () => void;
  onLeaveRoom: () => void;
  isMuted: boolean;
  menuOpen: boolean
}

const RoomHUD: React.FC<RoomHUDProps> = ({
  deckCount,
  // pot,
  maxPoints,
  variant,
  onToggleChat,
  onMenuToggle,
  onMuteToggle,
  onReportUser,
  onLeaveRoom,
  isMuted,
  menuOpen,
}) => {
  const imageUrl = variant === "survival" ? "/images/game-elements/skull-and-bones.png": "/images/game-elements/target.png"
  const variantImage = variant === "survival" ? "/images/game-elements/sword.png" : "/images/game-elements/flags.png"
  return (
    <div className="flex items-center font-semibold justify-between px-4 py-2 bg-black/70 text-white w-full">
      {/* Left side */}
      <div className="flex items-center gap-6">
        <div className="flex justify-center items-center text-center text-lg gap-2">
          <img className="h-6 w-6" src="/images/game-elements/deck-of-card.png" alt="Deck icon" />
          {deckCount}
        </div>
        {/* <div className="flex justify-center items-center text-center text-lg gap-2">
          <img className="h-6 w-6" src="/images/game-elements/money-bag.png" alt="Money bag" />
          {pot}
        </div> */}
        <div className="flex justify-center items-center text-center gap-2 text-yellow-400">
          <img className="h-6 w-6" src={imageUrl} alt="Game variant icon" />
          <span className="font-bold text-sm text-white">{maxPoints}</span>
        </div>
        <div className="flex justify-center items-center text-center gap-1 text-yellow-400">
          <img className="h-6 w-6" src={variantImage} alt="Game variant icon" />
        <span className="font-bold text-sm text-white ">{variant?.toUpperCase()}</span>
      </div>
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
          <div
            className="absolute right-0 top-14 w-48 bg-white text-black p-1 rounded shadow-lg z-50 transition-all duration-200 transform animate-fade-in"
          >
            <button
              onClick={onMuteToggle}
              className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100 rounded w-full text-left"
            >
              {isMuted ? <FiVolumeX /> : <FiVolume2 />}
              {isMuted ? "Unmute" : "Mute"}
            </button>

            <button
              onClick={onReportUser}
              className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100 rounded w-full text-left"
            >
              <FiFlag />
              Report User
            </button>

            <button
              onClick={onLeaveRoom}
              className="flex items-center gap-2 px-4 py-2 hover:bg-red-200 rounded w-full text-left text-red-600"
            >
              <FiLogOut />
              Leave Room
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default RoomHUD;
