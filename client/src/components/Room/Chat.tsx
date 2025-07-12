import React, { useEffect, useRef, useState } from "react";

// Message type
interface Message {
  id: number;
  sender: string;
  content: string;
}

// Mock messages for demo
const initialMessages: Message[] = [
  { id: 1, sender: "Alice", content: "Hey there!" },
  { id: 2, sender: "Alice", content: "Anyone here?" },
  { id: 3, sender: "Bob", content: "Hi Alice!" },
  { id: 4, sender: "Bob", content: "I'm here." },
  { id: 5, sender: "Alice", content: "Great!" },
];

// Group messages by sender
const groupMessages = (messages: Message[]) => {
  const grouped: { sender: string; messages: string[] }[] = [];

  for (const { sender, content } of messages) {
    const lastGroup = grouped[grouped.length - 1];
    if (lastGroup && lastGroup.sender === sender) {
      lastGroup.messages.push(content);
    } else {
      grouped.push({ sender, messages: [content] });
    }
  }

  return grouped;
};

interface ChatProps {
  currentUser: string;
  messages?: Message[];
  onSendMessage?: (message: string) => void;
}

const Chat: React.FC<ChatProps> = ({
  currentUser,
  messages = initialMessages,
  onSendMessage,
}) => {
  const [chatMessages, setChatMessages] = useState<Message[]>(messages);
  const [newMessage, setNewMessage] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  const groupedMessages = groupMessages(chatMessages);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [chatMessages]);

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
    <div className="flex flex-col h-full w-full p-4 bg-gray-100">
      <h2 className="text-lg font-semibold mb-2">Game Chat</h2>

      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto bg-white p-4 rounded shadow-md space-y-4"
      >
        {groupedMessages.map((group, index) => (
          <div key={index} className="mb-2">
            <p
              className={`text-sm font-semibold mb-1 ${
                group.sender === currentUser ? "text-green-700" : "text-blue-700"
              }`}
            >
              {group.sender === currentUser ? "You" : group.sender}
            </p>
            {group.messages.map((msg, i) => (
              <p
                key={i}
                className={`ml-3 text-sm px-2 py-1 rounded-md ${
                  group.sender === currentUser
                    ? "bg-green-100 text-green-900"
                    : "bg-blue-100 text-gray-800"
                }`}
              >
                {msg}
              </p>
            ))}
          </div>
        ))}
      </div>

      <div className="flex mt-2">
        <input
          type="text"
          className="flex-1 px-3 py-2 border rounded-l focus:outline-none"
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
