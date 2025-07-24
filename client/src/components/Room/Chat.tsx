import React, { useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "../../redux/reduxStore"; // adjust path if needed

interface Message {
  sender: string | null;
  content: string | null;
  time: string | null;
}

interface ChatProps {
  currentUser: string;
  sendMessage: (sender:string, content:string, time:string) => Promise<void>;
  onClose?: () => void;
}

const Chat: React.FC<ChatProps> = ({ currentUser, sendMessage, onClose }) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const chatBoxRef = useRef<HTMLDivElement>(null);

  // Local input state
  const [newMessage, setNewMessage] = useState("");

  // Select messages from Redux
  const chatMessages: Message[] = useSelector(
    (state: RootState) => state.game.roomInfo?.chat?.messages || []
  );

  // Scroll to bottom when messages change
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [chatMessages]);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        chatBoxRef.current &&
        !chatBoxRef.current.contains(event.target as Node)
      ) {
        if (onClose) onClose();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onClose]);

  // Send message to server
  const handleSend = () => {
    if (!newMessage.trim()) return;

    const time = new Date().toLocaleTimeString();
    sendMessage(currentUser, newMessage, time);

    setNewMessage(""); // reset input
  };

  return (
    <div
      ref={chatBoxRef}
      className="flex flex-col w-full max-w-sm h-[500px] text-black bg-gray-100 rounded shadow-lg p-2"
    >
      <p className="text-[12px] font-semibold text-center text-gray-500 mb-1">Please be nice in chat.</p>
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto bg-white p-4 rounded shadow-inner space-y-3"
      >
        {chatMessages.map((msg, index) => {
          const isCurrentUser = msg.sender === currentUser;
          return (
            <div key={index} className={`flex flex-col ${isCurrentUser ? "items-end" : "items-start"}`}>
              <p className={`text-xs font-bold mb-1 ${isCurrentUser ? "text-green-700" : "text-blue-700"}`}>
                {isCurrentUser ? "You" : msg.sender}
              </p>
              <p
                className={`text-[12px] font-bold px-2 py-2 rounded-md max-w-[70%] ${
                  isCurrentUser
                    ? "bg-green-100 text-green-900"
                    : "bg-blue-100 text-gray-800"
                }`}
              >
                {msg.content}
              </p>
            </div>
          );
        })}
      </div>

      <div className="flex mt-2">
        <input
          type="text"
          className="flex-1 px-3 py-2 border border-gray-500 rounded-l text-[12px] font-semibold focus:outline-none"
          placeholder="Type your message..."
          maxLength={50}
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
        />
        <button
          onClick={handleSend}
          className="px-4 bg-blue-600 text-white font-semibold rounded-r hover:bg-blue-700"
        >
          Send
        </button>
      </div>
    </div>
  );
};

export default Chat;
