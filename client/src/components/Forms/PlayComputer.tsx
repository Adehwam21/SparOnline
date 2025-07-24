// import React, { useState } from "react";
import BaseModal from "./BaseModal";
// import FormField from "./FormField";

interface PlayComputerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const PlayComputerModal: React.FC<PlayComputerModalProps> = ({ isOpen, onClose }) => {
  // const [difficulty, setDifficulty] = useState("easy");
  // const [maxPoints, setMaxPoints] = useState(5);
  // const [gameMode, setGameMode] = useState("race");

  // const handlePlayComputer = (e: React.FormEvent) => {
  //   e.preventDefault();
  //   console.log("Playing AI with difficulty:", difficulty);
  //   onClose();
  // };

  return (
    // <BaseModal isOpen={isOpen} onClose={onClose} title="Play Against AI">
    //   <form onSubmit={handlePlayComputer} className="space-y-4 text-black">
    //     {/* Game Difficulty */}
    //     <FormField label="Difficulty" tooltipText="Set the difficulty of the AI.">
    //       <select
    //         value={difficulty}
    //         onChange={(e) => setDifficulty(e.target.value)}
    //         className="w-full p-2 border border-gray-300 rounded"
    //       >
    //         <option value="easy">Easy</option>
    //         <option value="medium">Medium</option>
    //         <option value="hard">Hard</option>
    //       </select>
    //     </FormField>

    //     {/* Maximum Points */}
    //     <FormField label="Set the Maximum Points" tooltipText="Choose the maximum number of points.">
    //       <select
    //         value={maxPoints}
    //         onChange={(e) => setMaxPoints(Number(e.target.value))}
    //         className="w-full p-2 border border-gray-300 rounded"
    //       >
    //         <option value={5}>5</option>
    //         <option value={10}>10</option>
    //         <option value={15}>15</option>
    //       </select>
    //     </FormField>

    //     {/* Game Mode */}
    //     <FormField label="Mode" tooltipText="Race: Be the fastest to reach maximum points. Survival: Be the last man standing to win.">
    //       <select
    //         value={gameMode}
    //         onChange={(e) => setGameMode(e.target.value)}
    //         className="w-full p-2 border border-gray-300 rounded"
    //       >
    //         <option value="race">Race</option>
    //         <option value="survival">Survival</option>
    //       </select>
    //     </FormField>

    //     <button type="submit" className="w-full bg-green-600 text-white p-2 rounded hover:bg-green-700">
    //       Start Game
    //     </button>
    //   </form>
    // </BaseModal>
    <BaseModal isOpen={isOpen} onClose={onClose} title="Play Against AI">
      <div className="text-black flex justify-center items-center p-5 text-center text-bold text-3xl"> Coming Soon</div>
    </BaseModal>
  );
};

export default PlayComputerModal;
