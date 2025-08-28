import React, { useEffect, useState } from "react";
import { Player } from "../../types/game";
import { useSelector } from "react-redux";
import { RootState } from "../../redux/reduxStore";
import Confetti from "react-confetti";

interface GameCompleteModalProps {
  isOpen: boolean;
  players: Player[];
  winner: string;
  onRestart?: () => void;
  onExit?: () => void;
}

const getMedal = (rank: number): string => {
  switch (rank) {
    case 1:
      return "🥇";
    case 2:
      return "🥈";
    case 3:
      return "🥉";
    default:
      return `${rank}.`;
  }
};

export const GameCompleteModal: React.FC<GameCompleteModalProps> = ({
  isOpen,
  players,
  winner,
  onExit,
}) => {
  const [windowSize, setWindowSize] = useState({ width: 0, height: 0 });
  const currentPlayer = useSelector((state: RootState) => state.auth.user?.username);
  // const payouts = useSelector((state: RootState) => state.game.roomInfo!.payouts! || []);

  const sortedPlayers = [...players].sort((a, b) => b.score - a.score);
  const firstPlace = sortedPlayers[0]?.username;

  useEffect(() => {
    const handleResize = () =>
      setWindowSize({ width: window.innerWidth, height: window.innerHeight });
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-green/90 backdrop-blur-2xl">
      {/* Show confetti only if current user is the winner */}
      {currentPlayer === firstPlace && (
        <Confetti width={windowSize.width} height={windowSize.height} recycle={false} numberOfPieces={300} />
      )}

      <div className="bg-white p-6 rounded-2xl w-full max-w-md shadow-lg text-black text-center">
        <h2 className="text-2xl font-bold mb-4">🏆 Game Ended</h2>
        <p className="mb-6 text-lg">
          Winner:{" "}
          <span className="font-bold text-green-600">
            {winner === currentPlayer ? "You" : winner}
          </span>
        </p>

        <ul className="space-y-2 flex flex-col justify-center items-center text-center">
          {sortedPlayers.map((player, index) => {
            const isCurrentUser = player.username === currentPlayer;
            // const payout = payouts.find(p => p.userId === player.mongoId)!.amount ?? 0;

            return (
              <li
                key={player.username}
                className={`flex justify-between items-center w-full max-w-xs px-4 py-2 rounded-md ${
                  isCurrentUser
                    ? "bg-yellow-100 font-bold border border-yellow-500" : ""
                }`}
              >
                <span className="w-6 text-left">{getMedal(index + 1)}</span>
                <span className="flex-1 text-left">
                  {isCurrentUser ? "You" : player.username}
                </span>
                <div className="flex flex-col items-end">
                  <span className="font-bold">{player.score} pts</span>
                  {/* {payout > 0 && (
                    <span className="text-xs text-green-600">+{payout} coins</span>
                  )} */}
                </div>
              </li>
            );
          })}
        </ul>

        <div className="mt-6 flex justify-around">
          <button
            onClick={onExit}
            className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
          >
            Leave
          </button>
        </div>
      </div>
    </div>
  );
};
