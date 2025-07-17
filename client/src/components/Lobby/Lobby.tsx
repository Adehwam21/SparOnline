import React, { useState } from "react";
import CustomButton from "./CustomLobbyButton";
import CreateRoomModal from "../Forms/CreateRoomModal";
import JoinRoomModal from "../Forms/JoinRoomModal";
import PlayComputer from "../Forms/PlayComputer";
import Header from "../Header";
import { FaPlusCircle, FaUsers, FaBolt, FaRobot } from "react-icons/fa";
import { QuickGame } from "../Forms/QuickGame";

const Lobby: React.FC = () => {
  const [isCreateRoomModalOpen, setIsCreateRoomModalOpen] = useState<boolean>(false);
  const [isJoinRoomModalOpen, setIsJoinRoomModalOpen] = useState<boolean>(false);
  const [isPlayComputerOpen, setIsPlayComputerOpen] = useState<boolean>(false);
  const [isQuickGameModalOpen, setIsQuickGameModalOpen] = useState<boolean>(false);

  const handleOpenCreateRoomModal = () => setIsCreateRoomModalOpen(true);
  const handleOpenJoinRoomModal = () => setIsJoinRoomModalOpen(true);
  const handleOpenQuickGameModal = () => setIsQuickGameModalOpen(true);
  const handleOpenPlayComputer = () => setIsPlayComputerOpen(true);

  const handleCloseCreateRoomModal = () => setIsCreateRoomModalOpen(false);
  const handleCloseJoinRoomModal = () => setIsJoinRoomModalOpen(false);
  const handleCloseQuickGameModal = () => setIsQuickGameModalOpen(false);
  const handleClosePlayComputer = () => setIsPlayComputerOpen(false);

  return (
    <div className="flex items-center bg-transparent justify-center min-h-screen ">
        <Header />
        {/* Buttons Grid */}
        <div className="flex flex-col space-y-3 p-10 pt-20  w-full sm:w-fit sm:space-y-0 sm:grid sm:grid-cols-2 sm:gap-6">
          <CustomButton label="Create Room" icon={FaPlusCircle} onClick={handleOpenCreateRoomModal} />
          <CustomButton label="Join Room" icon={FaUsers} onClick={handleOpenJoinRoomModal} />
          <CustomButton label="Quick Pairing" icon={FaBolt} onClick={handleOpenQuickGameModal} />
          <CustomButton label="Play Computer" icon={FaRobot} onClick={handleOpenPlayComputer} />
        </div>

      {/* Modals */}
      <CreateRoomModal isOpen={isCreateRoomModalOpen} onClose={handleCloseCreateRoomModal} />
      <JoinRoomModal isOpen={isJoinRoomModalOpen} onClose={handleCloseJoinRoomModal} />
      <QuickGame isOpen={isQuickGameModalOpen} onClose={handleCloseQuickGameModal} />
      <PlayComputer isOpen={isPlayComputerOpen} onClose={handleClosePlayComputer} />
    </div>
  );
};

export default Lobby;
