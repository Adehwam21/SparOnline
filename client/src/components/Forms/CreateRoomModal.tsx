import React, { useState } from "react";
import BaseModal from "./BaseModal";

interface CreateRoomModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const CreateRoomModal: React.FC<CreateRoomModalProps> = ({ isOpen, onClose }) => {
  const [roomName, setRoomName] = useState("");
  const [maxPlayers, setMaxPlayers] = useState<number>(2);

  const handleCreateRoom = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Creating room:", { roomName, maxPlayers });
    onClose();
  };

  return (
    <BaseModal isOpen={isOpen} onClose={onClose} title="Create a Room">
      <form onSubmit={handleCreateRoom} className="space-y-4">
        <div>
          <label className="block text-gray-700">Room Name</label>
          <input
            type="text"
            value={roomName}
            onChange={(e) => setRoomName(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded"
            required
          />
        </div>
        <div>
          <label className="block text-gray-700">Max Players</label>
          <select
            value={maxPlayers}
            onChange={(e) => setMaxPlayers(Number(e.target.value))}
            className="w-full p-2 border border-gray-300 rounded"
          >
            <option value={2}>2 Players</option>
            <option value={4}>4 Players</option>
            <option value={6}>6 Players</option>
          </select>
        </div>
        <button type="submit" className="w-full bg-green-600 text-white p-2 rounded hover:bg-green-700">
          Create Room
        </button>
      </form>
    </BaseModal>
  );
};

export default CreateRoomModal;
