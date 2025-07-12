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
  const { join, isConnected, isConnecting } = useRoom();
  const { id: roomId } = useParams();
  const navigate = useNavigate();

  const gameState = useSelector((state: RootState) => state.game);
  const currentUser = useSelector((state: RootState) => state.auth?.user?.username) || "Guest";
  const [isWaitingScreenOpen, setIsWaitingScreenOpen] = useState(true);
  const [gameOver, setGameOver] = useState(false);

  const handleCloseWaitingScreen = () => setIsWaitingScreenOpen(false);

  useEffect(() => {
    if (!isConnected && !isConnecting && roomId) {
      join(roomId, currentUser, dispatch);
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
    navigate("/lobby"); // or any route you want
  };

  if (!gameState) {
    return <div className="flex items-center justify-center h-screen text-white">Loading game...</div>;
  }

  return (
    <div
      className="h-screen border-2 text-white"
      style={{
        backgroundImage: "url('/images/game-elements/board.jpg')",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
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
        maxPoints={gameState.roomInfo?.maxPoints ?? "0"}
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
