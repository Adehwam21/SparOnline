import React from "react";
import { motion } from "framer-motion";
import { FaTimes } from "react-icons/fa";

interface BaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

const BaseModal: React.FC<BaseModalProps> = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/50 backdrop-blur-sm">
      <motion.div 
        initial={{ opacity: 0, y: -50 }} 
        animate={{ opacity: 1, y: 0 }} 
        exit={{ opacity: 0, y: -50 }} 
        className="bg-white p-6 rounded-lg mx-4 shadow-lg w-full max-w-md relative"
      >
        <button className="absolute top-3 right-3 text-gray-500 hover:text-red-500" onClick={onClose}>
          <FaTimes size={20} />
        </button>
        <h2 className="text-xl font-bold text-center text-green-800">{title}</h2>
        <div className="mt-4">{children}</div>
      </motion.div>
    </div>
  );
};

export default BaseModal;
