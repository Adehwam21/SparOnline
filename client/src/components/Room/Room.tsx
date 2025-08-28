import React, { useState } from "react";
import GameBoard from "./GameBoard";
import RoomHUD from "./RoomHUD";
import Chat from "./Chat";
import { Player } from "../../types/game";
import { GameServerStats } from "../../contexts/roomContext";
import { AppDispatch} from "../../redux/reduxStore";
import { useDispatch } from "react-redux";
import { resetUnread } from "../../redux/slices/gameSlice";

interface RoomProps {
  deckCount: number;
  prizePool: number;
  players: Player[];
  currentTurn: string;
  currentUser: string;
  maxPoints: string;
  serverStats: GameServerStats;
  variant: string;
  onLeaveRoom: () => void;
  onSendMessageInChat: (sender: string, content: string, time: string) => Promise<void>;
}

const Room: React.FC<RoomProps> = ({
  deckCount,
  prizePool, 
  players,
  currentTurn,
  currentUser,
  serverStats,
  maxPoints,
  variant,
  onLeaveRoom,
  onSendMessageInChat,
}) => {
  const dispatch = useDispatch<AppDispatch>();
  const [isMuted, setIsMuted] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const activeConnectedPlayers = players.filter((p) => p.active && p.connected && !p.eliminated)
  const newDeckCount = deckCount - (activeConnectedPlayers.length*5)

  const handleToggleChat = () => {
    setShowChat((prev) => {
      const next = !prev;
      if (next) {
        // reset unread when chat is opened
        dispatch(resetUnread());
      }
      return next;
    });
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
        deckCount={newDeckCount}
        pot={prizePool}
        maxPoints={maxPoints}
        variant={variant}
        isMuted={isMuted}
        menuOpen={menuOpen}
        serverStats={serverStats}
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
