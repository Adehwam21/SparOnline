import React, { useState } from "react";
import GameBoard from "./GameBoard";
import RoomHUD from "./RoomHUD";
import Chat from "./Chat";
import { Player } from "../../types/game";

interface RoomProps {
  players: Player[];
  currentTurn: string;
  currentUser: string;
  maxPoints: string;
  variant: string;
  onLeaveRoom: () => void;
  onSendMessageInChat: (sender: string, content: string, time: string) => Promise<void>;
}

const Room: React.FC<RoomProps> = ({
  players,
  currentTurn,
  currentUser,
  maxPoints,
  variant,
  onLeaveRoom,
  onSendMessageInChat,
}) => {
  const [isMuted, setIsMuted] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const handleToggleChat = () => {
    setShowChat((prev) => !prev);
    setMenuOpen(false);
  };

  const handleMenuToggle = () => {
    setMenuOpen((prev) => !prev);
    setShowChat(false);
  };

  return (
    <div className="relative flex flex-col items-center justify-evenly text-white gap-10">
      {/* Room HUD */}
      <RoomHUD
        deckCount={20}
        pot={100}
        maxPoints={maxPoints}
        variant={variant}
        isMuted={isMuted}
        menuOpen={menuOpen}
        onToggleChat={handleToggleChat}
        onMenuToggle={handleMenuToggle}
        onMuteToggle={() => setIsMuted((prev) => !prev)}
        onReportUser={() => console.log("Report sent")}
        onLeaveRoom={onLeaveRoom}
      />

      {/* Game Board */}
      <GameBoard
        players={players}
        currentTurn={currentTurn}
        currentUser={currentUser}
        maxPoints={maxPoints}
      />

      {/* Chat Panel */}
      {showChat && (
        <div className="absolute top-16 right-4 w-80 h-96 z-50 shadow-lg bg-white rounded-lg">
          <Chat currentUser={currentUser} sendMessage={onSendMessageInChat} />
        </div>
      )}
    </div>
  );
};

export default Room;
