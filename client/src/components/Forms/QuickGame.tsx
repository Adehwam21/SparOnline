import React from 'react'
import BaseModal from './BaseModal';
interface QuickGameModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const QuickGame: React.FC<QuickGameModalProps> = ({isOpen, onClose}) => {
  return (
    <BaseModal isOpen={isOpen} onClose={onClose} title="Quick game">
      <div className="text-black flex justify-center items-center text-center text-bold text-3xl"> Coming Soon</div>
    </BaseModal>
  )
}