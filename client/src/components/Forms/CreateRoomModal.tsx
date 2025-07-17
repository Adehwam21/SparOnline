import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import BaseModal from "./BaseModal";
import FormField from "./FormField";
import { useSelector, useDispatch } from "react-redux";
import { createMultiplayerRoom } from "../../services/game";
import { AppDispatch, RootState } from "../../redux/reduxStore";
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
  const [variant, setGameVariant] = useState("race");
  const [entryFee, setEntryFee] = useState(0);


  const handleCreateRoom = async (e: React.FormEvent) => {
    e.preventDefault();
  
    try {
      const data = await createMultiplayerRoom({
        roomName,
        roomType: "mpr",
        maxPlayers: String(maxPlayers),
        maxPoints: String(maxPoints),
        variant,
        creator
      });
  
      if (!data?.colyseusRoomId) throw new Error("Room creation failed");
  
      dispatch(setGameState(data));
      console.log(data)

      // Redirect and waiting screen
      navigate(`/game/${data.colyseusRoomId}`);
      onClose();
    } catch (err) {
      console.error("Error creating room:", err);
    }
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
            <option value={20}>30</option>
          </select>
        </FormField>

        {/* Game Mode */}
        <FormField
          label="Variant"
          tooltipText="Race: Fastest to reach maximum points wins. Survival: Last man standing wins."
        >
          <select
            value={variant}
            onChange={(e) => setGameVariant(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded"
          >
            <option value="race">Race</option>
            <option value="survival">Survival</option>
          </select>
        </FormField>

        <FormField label="Entry fee" tooltipText="Tokens needed for room entry.">
          <select
            value={entryFee}
            onChange={(e) => setEntryFee(Number(e.target.value))}
            className="w-full p-2 border border-gray-300 rounded"
          >
            <option value={0}>Free</option>
            <option value={100}>100</option>
            <option value={500}>500</option>
            <option value={1000}>1k</option>
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
