import React, { useState } from "react";
import GameBoard from "./GameBoard";
import RoomHUD from "./RoomHUD";
import Chat from "./Chat";

interface RoomProps {
  players: {
    id: string;
    username: string;
    score: number;
    hand: string[];
    bids: string[];
    active: boolean;
  }[];
  currentTurn: string;
  currentUser: string;
  maxPoints: string;
  onLeaveRoom: () => void;
}

const Room: React.FC<RoomProps> = ({
  players,
  currentTurn,
  currentUser,
  maxPoints,
  onLeaveRoom
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
    <div className="relative h-full bg-transparent flex flex-col items-center justify-center text-white gap-10"
      style={{
        backgroundImage: "url('/images/game-elements/board.jpg')",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      {/* Room HUD */}
      <RoomHUD
        deckCount={20}
        pot={100}
        maxPoints={maxPoints}
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
          <Chat currentUser={currentUser} />
        </div>
      )}
    </div>
  );
};

export default Room;
