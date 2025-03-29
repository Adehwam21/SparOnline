import React, { useState } from "react";
import BaseModal from "./BaseModal";

interface JoinRoomModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const JoinRoomModal: React.FC<JoinRoomModalProps> = ({ isOpen, onClose }) => {
  const [roomCode, setRoomCode] = useState("");

  const handleJoinRoom = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Joining room:", { roomCode });
    onClose();
  };

  return (
    <BaseModal isOpen={isOpen} onClose={onClose} title="Join a Room">
      <form onSubmit={handleJoinRoom} className="space-y-4">
        <div>
          <label className="block text-gray-700">Room Code</label>
          <input
            type="text"
            value={roomCode}
            onChange={(e) => setRoomCode(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded"
            required
          />
        </div>
        <button type="submit" className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700">
          Join Room
        </button>
      </form>
    </BaseModal>
  );
};

export default JoinRoomModal;
