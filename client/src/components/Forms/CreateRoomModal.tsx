import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import BaseModal from "./BaseModal";
import FormField from "./FormField";
import { useSelector } from "react-redux";
import { createMultiplayerRoom } from "../../services/game";
import { AppDispatch, RootState } from "../../redux/reduxStore";
import { useDispatch } from "react-redux";
import { setGameState } from "../../redux/slices/gameSlice";


interface CreateRoomModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const CreateRoomModal: React.FC<CreateRoomModalProps> = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const creator = useSelector((state: RootState) => state.auth?.user?.username) || "Guest";
  const [roomName, setRoomName] = useState("");
  const [maxPlayers, setMaxPlayers] = useState(2);
  const [maxPoints, setMaxPoints] = useState(5);
  const [gameMode, setGameMode] = useState("race");


  const handleCreateRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    const data = await createMultiplayerRoom({ roomName, maxPlayers: String(maxPlayers), maxPoints: String(maxPoints), gameMode, creator })
    dispatch(setGameState(data))
    navigate(`/game/${data!.roomInfo!.roomId}`);
    onClose();
  };

  return (
    <BaseModal isOpen={isOpen} onClose={onClose} title="Create a Room">
      <form onSubmit={handleCreateRoom} className="space-y-4 text-black">
        {/* Room Name */}
        <FormField label="Custom Room Name" tooltipText="Set a custom name for your room.">
          <input
            type="text"
            value={roomName}
            onChange={(e) => setRoomName(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded"
            required
          />
        </FormField>

        {/* Maximum Points */}
        <FormField label="Set the Maximum Points" tooltipText="Choose the maximum number of points.">
          <select
            value={maxPoints}
            onChange={(e) => setMaxPoints(Number(e.target.value))}
            className="w-full p-2 border border-gray-300 rounded"
          >
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={15}>15</option>
            <option value={20}>20</option>
          </select>
        </FormField>

        {/* Game Mode */}
        <FormField label="Game Mode" tooltipText="Race: Be the fastest to reach maximum points. Survival: Be the last man standing to win.">
          <select
            value={gameMode}
            onChange={(e) => setGameMode(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded"
          >
            <option value="race">Race</option>
            <option value="survival">Survival</option>
          </select>
        </FormField>

        {/* Number of Players */}
        <FormField label="Number of Players" tooltipText="Choose how many players can join this room.">
          <select
            value={maxPlayers}
            onChange={(e) => setMaxPlayers(Number(e.target.value))}
            className="w-full p-2 border border-gray-300 rounded"
          >
            <option value={2}>2 Players</option>
            <option value={3}>3 Players</option>
            <option value={4}>4 Players</option>
          </select>
        </FormField>

        {/* Submit Button */}
        <button type="submit" className="w-full bg-green-600 text-white p-2 rounded hover:bg-green-700">
          Create Game
        </button>
      </form>
    </BaseModal>
  );
};

export default CreateRoomModal;
