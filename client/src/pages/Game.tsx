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
  const { join, consentedLeave, sendMessagesInChat, isConnected, isConnecting } = useRoom();
  const { id: roomId } = useParams();
  const navigate = useNavigate();

  const gameState = useSelector((state: RootState) => state.game);
  const currentUser = useSelector((state: RootState) => state.auth!.user!.username);
  const variant = gameState?.roomInfo?.variant
  const [isWaitingScreenOpen, setIsWaitingScreenOpen] = useState(true);
  const [gameOver, setGameOver] = useState(false);

  const handleCloseWaitingScreen = () => setIsWaitingScreenOpen(false);

  useEffect(() => {
    if (!isConnected && !isConnecting && roomId) {
      join(roomId, currentUser);
    }
  }, [roomId, isConnected, isConnecting, dispatch, join, currentUser]);


  useEffect(() => {
    if (
      gameState &&
      gameState.roomInfo?.gameStatus === "started" &&
      gameState.roomInfo.players
    ) {
      setIsWaitingScreenOpen(false);
    }

    if (gameState?.roomInfo?.gameStatus === "complete") {
      setGameOver(true);
    }
  }, [gameState]);

  const handleExit = () => {
    localStorage.removeItem("reconnection");
    console.log(localStorage.getItem("reconnection"))
    navigate("/");
  };

  const handleConsentedLeave = () => {
    consentedLeave(currentUser);
    localStorage.removeItem("reconnection");
    navigate("/"); // Navigate to landing page
  }

  if (!gameState?.roomInfo?.players) {
    return <div className="flex items-center bg-transparent justify-center h-screen text-white">Loading game...</div>;
  }

  return (
    <div className="text-white h-full bg-transparent">
      <WaitingScreen
        isOpen={isWaitingScreenOpen}
        roomId={roomId!}
        gameStatus={gameState.roomInfo!.gameStatus as "ready" | "started"}
        onClose={handleCloseWaitingScreen}
      />

      <Room
        players={Object.values(gameState.roomInfo?.players || {})}
        currentTurn={gameState.roomInfo?.currentTurn ?? ""}
        currentUser={currentUser}
        variant={variant!}
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
