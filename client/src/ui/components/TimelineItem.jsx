export function TimelineItem({ message }) {
  return (
    <div className="relative">
      {/* Timeline dot */}
      <div className="absolute -left-6 top-1.5 w-5 h-5 rounded-full bg-[#37322F] border-2 border-white flex items-center justify-center z-10">
        <div className="w-1.5 h-1.5 rounded-full bg-white" />
      </div>
      
      {/* Message bubble */}
      <div className="bg-[#F7F5F3] rounded-lg px-4 py-2.5">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs font-semibold text-[#37322F]">{message.sender}</span>
          <span className="text-xs text-[#605A57]/50">
            {message.createdAt 
              ? new Date(message.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) 
              : ""}
          </span>
        </div>
        <p className="text-sm text-[#49423D]">{message.content}</p>
      </div>
    </div>
  );
}