import React, { useState } from "react";
import BaseModal from "./BaseModal";
import FormField from "./FormField";
import { useNavigate } from "react-router-dom";

interface JoinRoomModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const JoinRoomModal: React.FC<JoinRoomModalProps> = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const [roomLink, setRoomCode] = useState("");


  const handleJoinRoom = (e: React.FormEvent) => {
    e.preventDefault();
    const roomId = roomLink.split("/").pop(); // Extract the room ID from the link
    navigate(`/game/${roomId}`);
    onClose();
  };

  return (
    <BaseModal isOpen={isOpen} onClose={onClose} title="Join a Room">
      <form onSubmit={handleJoinRoom} className="space-y-4 text-black">
      <FormField label="Room code or link" tooltipText="Enter the room code or the room link">
          <input
            type="text"
            value={roomLink}
            onChange={(e) => setRoomCode(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded"
            required
          />
        </FormField>
        <button type="submit" className="w-full bg-green-600 text-white p-2 rounded hover:bg-green-700">
          Join Room
        </button>
      </form>
    </BaseModal>
  );
};

export default JoinRoomModal;
