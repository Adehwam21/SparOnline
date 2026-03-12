/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from "react";
import BaseModal from "./BaseModal";
import FormField from "./FormField";
import { useNavigate } from "react-router-dom";
import { AppDispatch, RootState } from "../../redux/reduxStore";
import { useDispatch, useSelector } from "react-redux";
import { createSinglePlayerRoom } from "../../services/game";
import { setGameState } from "../../redux/slices/gameSlice"

interface PlayComputerModalProps {
  isOpen:   boolean;
  onClose:  () => void;
}

const PlayComputerModal: React.FC<PlayComputerModalProps> = ({ isOpen, onClose }) => {
  const navigate  = useNavigate();
  const dispatch  = useDispatch<AppDispatch>();
  const creator   = useSelector((state: RootState) => state.auth?.user?.username) || "Guest";

  const [difficulty, setDifficulty] = useState("easy");
  const [maxPoints,  setMaxPoints]  = useState(5);
  const [gameMode,   setGameMode]   = useState("race");
  const [loading,    setLoading]    = useState(false);
  const [error,      setError]      = useState<string | null>(null);

  const handlePlayComputer = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const data = await createSinglePlayerRoom({
        maxPlayers: "2",
        maxPoints:     String(maxPoints),
        variant:       gameMode,
        creator,
        botDifficulty: difficulty,
      });

      if (!data?.colyseusRoomId) throw new Error("Room creation failed");

      dispatch(setGameState(data));
      navigate(`/game/${data.colyseusRoomId}`);
      onClose();
    } catch (err: any) {
      setError(err.message ?? "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <BaseModal isOpen={isOpen} onClose={onClose} title="Play Against AI">
      <form onSubmit={handlePlayComputer} className="space-y-4 text-black">

        <FormField label="Difficulty" tooltipText="Set the difficulty of the AI.">
          <select
            value={difficulty}
            onChange={(e) => setDifficulty(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded"
          >
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
          </select>
        </FormField>

        <FormField label="Maximum Points" tooltipText="Choose the maximum number of points.">
          <select
            value={maxPoints}
            onChange={(e) => setMaxPoints(Number(e.target.value))}
            className="w-full p-2 border border-gray-300 rounded"
          >
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={15}>15</option>
          </select>
        </FormField>

        <FormField
          label="Mode"
          tooltipText="Race: first to reach max points wins. Survival: last to reach zero wins."
        >
          <select
            value={gameMode}
            onChange={(e) => setGameMode(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded"
          >
            <option value="race">Race</option>
            <option value="survival">Survival</option>
          </select>
        </FormField>

        {error && (
          <p className="text-red-500 text-sm">{error}</p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-green-600 text-white p-2 rounded hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "Creating room..." : "Start Game"}
        </button>

      </form>
    </BaseModal>
  );
};

export default PlayComputerModal;