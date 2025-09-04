import React, { useEffect, useState } from "react";
import Room from "../components/Room/Room";
import WaitingScreen from "../components/Room/WaitingScreen";
import { GameCompleteModal } from "../components/Room/GameComplete";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../redux/reduxStore";
import { useRoom } from "../contexts/roomContext";
import { useParams, useNavigate } from "react-router-dom";

const GamePage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { join, consentedLeave, sendMessagesInChat, isConnected, isConnecting, serverStats } = useRoom();
  const { id: roomId } = useParams();
  const navigate = useNavigate();

  const gameState = useSelector((state: RootState) => state.game);
  const userId = useSelector((state: RootState) => state.auth!.user!._id)
  const currentUser = useSelector((state: RootState) => state.auth!.user!.username);
  const variant = gameState?.roomInfo?.variant
  const [isWaitingScreenOpen, setIsWaitingScreenOpen] = useState(true);
  const [gameOver, setGameOver] = useState(false);

  const handleCloseWaitingScreen = () => setIsWaitingScreenOpen(false);

  useEffect(() => {
    if (!isConnected && !isConnecting && roomId) {
      join(roomId, userId,  currentUser);
    }
  }, [roomId, isConnected, isConnecting, dispatch, join, userId, currentUser]);


  useEffect(() => {
    if (
      gameState &&
      gameState.roomInfo?.gameStatus === "started" &&
      gameState.roomInfo.players
    ) {
      setTimeout(()=>{
        setIsWaitingScreenOpen(false)
      }, 2000)
      
    }

    if (gameState?.roomInfo?.gameStatus === "complete") {
      setGameOver(true);
    } else {
      setGameOver(false);
    }
  }, [gameState]);

  const handleExit = () => {
    localStorage.removeItem("reconnection");
    navigate("/play");
  };

  const handleConsentedLeave = () => {
    consentedLeave(currentUser);
    localStorage.removeItem("reconnection");
    navigate("/play"); // Navigate to landing page
  }

  if (!gameState?.roomInfo?.players) {
    return <div className="flex items-center font-bold text-2xl bg-transparent justify-center h-screen text-white">Please wait. . .</div>;
  }

  return (
    <div className="text-white h-full bg-transparent">
      <WaitingScreen
        isOpen={isWaitingScreenOpen}
        roomId={roomId!}
        gameStatus={gameState.roomInfo!.gameStatus as "ready" | "started" | "complete"}
        players={Object.values(gameState.roomInfo.players || {})}
        maxPlayers={gameState.roomInfo.maxPlayers ?? 4} 
        currentUser={currentUser}
        onClose={handleCloseWaitingScreen}
      />

      <Room
        players={Object.values(gameState.roomInfo?.players || {})}
        deckCount={gameState.roomInfo?.deck?.length || 0}
        prizePool={gameState.roomInfo?.prizePool || 0}
        currentTurn={gameState.roomInfo?.currentTurn ?? ""}
        currentUser={currentUser}
        variant={variant!}
        serverStats = {serverStats!}
        maxPoints={gameState.roomInfo?.maxPoints ?? "0"}
        onLeaveRoom={handleConsentedLeave}
        onSendMessageInChat={sendMessagesInChat}
      />

      <GameCompleteModal
        isOpen={gameOver}
        players={Object.values(gameState.roomInfo?.players || {})}
        winner={gameState.roomInfo?.gameWinner ?? ""}
        onExit={handleExit}
      />
    </div>
  );
};

export default GamePage;
