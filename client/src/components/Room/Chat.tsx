import React, { useEffect, useRef, useState } from "react";

// Message type
interface Message {
  id: number;
  sender: string;
  content: string;
}

const initialMessages: Message[] = [
  { id: 1, sender: "Alice", content: "Hey there!" },
  { id: 2, sender: "Bob", content: "Hi Alice!" },
];

interface ChatProps {
  currentUser: string;
  messages?: Message[];
  onSendMessage?: (message: string) => void;
  onClose?: () => void; // NEW: Callback to close the chat
}

const Chat: React.FC<ChatProps> = ({
  currentUser,
  messages = initialMessages,
  onSendMessage,
  onClose, // NEW
}) => {
  const [chatMessages, setChatMessages] = useState<Message[]>(messages);
  const [newMessage, setNewMessage] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const chatBoxRef = useRef<HTMLDivElement>(null); // NEW

  // Scroll to bottom on new messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [chatMessages]);

  // Click outside to close
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

  const handleSend = () => {
    if (!newMessage.trim()) return;

    const newMsg: Message = {
      id: chatMessages.length + 1,
      sender: currentUser,
      content: newMessage,
    };

    setChatMessages([...chatMessages, newMsg]);
    if (onSendMessage) onSendMessage(newMessage);
    setNewMessage("");
  };

  return (
    <div
      ref={chatBoxRef}
      className="flex flex-col w-full max-w-sm h-[500px] text-black bg-gray-100 rounded shadow-lg p-2"
    >
      <h2 className="text-md font-semibold  mb-2">Chat</h2>

      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto bg-white p-4 rounded shadow-inner space-y-3"
      >
        {chatMessages.map((msg) => {
          const isCurrentUser = msg.sender === currentUser;
          return (
            <div
              key={msg.id}
              className={`flex flex-col ${
                isCurrentUser ? "items-end" : "items-start"
              }`}
            >
              <p
                className={`text-xs font-semibold mb-1 ${
                  isCurrentUser ? "text-green-700" : "text-blue-700"
                }`}
              >
                {isCurrentUser ? "You" : msg.sender}
              </p>
              <p
                className={`text-sm px-3 py-2 rounded-md max-w-[70%] ${
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
          className="flex-1 px-3 py-2 border  border-gray-500 rounded-l focus:outline-none"
          placeholder="Type your message..."
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
