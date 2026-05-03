import { useState, useEffect, useRef } from "react";
import { getSocket, sendMessage } from "../../utils/socket/socket";
import { useDispatch, useSelector } from "react-redux";
import { addMessage } from "../../store/slices/socket.slice";
import { Send } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { ScrollArea } from "./ui/scroll-area";

export default function ChatBox({ incidentId, joinCode }) {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const messages = useSelector((state) => state.socket.messages[incidentId] || []);
  const [input, setInput] = useState("");
  const messagesEndRef = useRef(null);

  useEffect(() => {
    const socket = getSocket();
    const handleReceiveMessage = (data) => {
      const parsed = typeof data === "string" ? JSON.parse(data) : data;
      if (parsed.tempId === incidentId) {
        dispatch(
          addMessage({
            incidentId,
            message: {
              _id: parsed._id || Date.now().toString(),
              content: parsed.content,
              sender: parsed.sender,
              senderRole: parsed.senderRole || "user",
            },
          })
        );
      }
    };
    socket.on("receive-message", handleReceiveMessage);
    return () => socket.off("receive-message", handleReceiveMessage);
  }, [incidentId, dispatch]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = () => {
    if (!input.trim()) return;
    const tempId = incidentId;
    dispatch(
      addMessage({
        incidentId,
        message: { _id: Date.now().toString(), content: input.trim(), sender: user?.username || "You", senderRole: "user" },
      })
    );
    sendMessage({ message: input.trim(), tempId, joinCode, userId: user?._id });
    setInput("");
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-xl border border-[rgba(55,50,47,0.12)]">
      <div className="px-4 py-3 border-b border-[rgba(55,50,47,0.12)]">
        <h3 className="text-sm font-semibold text-[#37322F]">Chat</h3>
      </div>

      <ScrollArea className="flex-1 p-4 min-h-[300px] max-h-[400px]">
        {messages.length === 0 ? (
          <p className="text-center text-sm text-[#605A57]/60 py-8">No messages yet. Start the conversation!</p>
        ) : (
          <div className="space-y-3">
            {messages.map((msg, i) => (
              <div key={msg._id || i} className={`flex ${msg.senderRole === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-xs px-4 py-2 rounded-2xl text-sm ${
                  msg.senderRole === "user"
                    ? "bg-[#37322F] text-white rounded-br-sm"
                    : "bg-[#F7F5F3] text-[#37322F] rounded-bl-sm"
                }`}>
                  <p>{msg.content}</p>
                  <p className={`text-xs mt-1 ${msg.senderRole === "user" ? "text-white/60" : "text-[#605A57]/60"}`}>
                    {msg.sender}
                  </p>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        )}
      </ScrollArea>

      <div className="px-4 py-3 border-t border-[rgba(55,50,47,0.12)]">
        <div className="flex items-center gap-2">
          <Input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder="Type a message..."
            className="flex-1"
          />
          <Button onClick={handleSend} disabled={!input.trim()} size="icon" className="bg-[#37322F] hover:bg-[#37322F]/90 shrink-0">
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
