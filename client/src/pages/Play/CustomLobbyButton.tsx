import React from "react";
import { IconType } from "react-icons";

interface CustomButtonProps {
  label: string;
  icon: IconType;
  onClick: () => void;
}

const CustomLobbyButton: React.FC<CustomButtonProps> = ({ label, icon: Icon, onClick }) => {
  return (
    <button
      onClick={onClick}
      className="flex flex-row sm:flex-col items-center justify-center bg-green-900 text-white p-6 rounded-lg shadow-md transition-transform duration-300 transform hover:scale-105 hover:text-yellow-300 focus:outline-none focus:ring focus:ring-yellow-300 w-full"
    >
      <Icon size={48} className="mb-2 mr-3 sm:mb-0 sm:mr-0" />
      <span className="text-lg font-semibold">{label}</span>
    </button>
  );
};

export default CustomLobbyButton;
