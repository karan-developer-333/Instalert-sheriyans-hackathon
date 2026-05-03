import { useEffect, useRef } from "react";
import { ScrollArea } from "./ui/scroll-area";
import { Loader2 } from "lucide-react";
import { TimelineItem } from "./TimelineItem";

export function TimelineWrapper({ 
  messages = [], 
  loading = false, 
  emptyMessage = "No reports yet.",
  onSendMessage,
}) {
  const messagesEndRef = useRef(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <>
    <div className="flex flex-col h-full">
      <ScrollArea className="flex-1 pr-2">
        {loading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-[#37322F]" />
          </div>
        ) : messages.length === 0 ? (
          <p className="text-center text-xs text-[#605A57]/60 py-8">
            {emptyMessage}
          </p>
        ) : (
          <div className="relative pl-6 py-2">
            {/* Vertical timeline line */}
            <div className="absolute left-[11px] top-2 bottom-0 w-[2px] bg-[#37322F]/15" />
            
            {/* Messages */}
            <div className="space-y-4">
              {messages.map((msg, index) => (
                <TimelineItem 
                  key={msg._id} 
                  message={msg}
                  isLast={index === messages.length - 1}
                />
              ))}
              <div ref={messagesEndRef} />
            </div>
          </div>
        )}
      </ScrollArea>

      
    </div>
      {onSendMessage && (
        <div className="absolute left-0 bottom-0 w-full bg-white p-4 border-t border-[rgba(55,50,47,0.12)]">
          {onSendMessage()}
        </div>
      )}
      </>
  );
}