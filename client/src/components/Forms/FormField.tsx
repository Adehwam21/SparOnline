import React from "react";
import { FaQuestionCircle } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";

interface FormFieldProps {
  label: string;
  tooltipText: string;
  children: React.ReactNode;
}

const FormField: React.FC<FormFieldProps> = ({ label, tooltipText, children }) => {
  const [tooltip, setTooltip] = React.useState(false);

  return (
    <div className="relative">
      <label className="text-gray-700 flex items-center gap-2">
        {label}
        <div className="relative flex flex-col items-center">
          <FaQuestionCircle
            className="text-gray-500 cursor-pointer hover:text-gray-700"
            onMouseEnter={() => setTooltip(true)}
            onMouseLeave={() => setTooltip(false)}
          />
          <AnimatePresence>
            {tooltip && (
              <motion.div
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 5 }}
                transition={{ duration: 0.3 }}
                className="absolute bg-gray-800 text-white text-xs px-2 py-1 rounded shadow-lg top-6 w-56 text-center"
              >
                {tooltipText}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </label>
      {children}
    </div>
  );
};

export default FormField;
