import React, { useState } from "react";
import BaseModal from "./BaseModal";

interface PlayComputerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const PlayComputerModal: React.FC<PlayComputerModalProps> = ({ isOpen, onClose }) => {
  const [difficulty, setDifficulty] = useState("easy");

  const handlePlayComputer = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Playing AI with difficulty:", difficulty);
    onClose();
  };

  return (
    <BaseModal isOpen={isOpen} onClose={onClose} title="Play Against AI">
      <form onSubmit={handlePlayComputer} className="space-y-4">
        <div>
          <label className="block text-gray-700">Select Difficulty</label>
          <select
            value={difficulty}
            onChange={(e) => setDifficulty(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded"
          >
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
          </select>
        </div>
        <button type="submit" className="w-full bg-red-600 text-white p-2 rounded hover:bg-red-700">
          Start Game
        </button>
      </form>
    </BaseModal>
  );
};

export default PlayComputerModal;
