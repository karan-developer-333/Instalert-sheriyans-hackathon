import Markdown from "react-markdown";

export function MarkdownRenderer({ content }) {
  if (!content) return null;

  return (
    <div className="markdown-content">
      <Markdown
        components={{
          h1: ({ children }) => (
            <h1 className="text-lg font-serif font-bold text-[#37322F] mt-3 mb-2">{children}</h1>
          ),
          h2: ({ children }) => (
            <h2 className="text-base font-serif font-semibold text-[#37322F] mt-3 mb-1.5">{children}</h2>
          ),
          h3: ({ children }) => (
            <h3 className="text-sm font-serif font-semibold text-[#37322F] mt-2 mb-1">{children}</h3>
          ),
          p: ({ children }) => (
            <p className="text-sm text-[#49423D] leading-relaxed mb-2 last:mb-0">{children}</p>
          ),
          ul: ({ children }) => (
            <ul className="list-disc list-inside space-y-1 mb-2 text-sm text-[#49423D]">{children}</ul>
          ),
          ol: ({ children }) => (
            <ol className="list-decimal list-inside space-y-1 mb-2 text-sm text-[#49423D]">{children}</ol>
          ),
          li: ({ children }) => (
            <li className="text-sm text-[#49423D] leading-relaxed">{children}</li>
          ),
          strong: ({ children }) => (
            <strong className="font-semibold text-[#37322F]">{children}</strong>
          ),
          em: ({ children }) => (
            <em className="italic text-[#605A57]">{children}</em>
          ),
          code: ({ children, className }) => {
            const isInline = !className;
            if (isInline) {
              return (
                <code className="px-1.5 py-0.5 bg-[#F7F5F3] border border-[rgba(55,50,47,0.12)] rounded text-xs font-mono text-[#37322F]">
                  {children}
                </code>
              );
            }
            return (
              <code className="block p-3 bg-[#F7F5F3] border border-[rgba(55,50,47,0.12)] rounded-lg text-xs font-mono text-[#37322F] overflow-x-auto mb-2">
                {children}
              </code>
            );
          },
          blockquote: ({ children }) => (
            <blockquote className="border-l-2 border-[#37322F]/20 pl-4 py-1 mb-2 text-sm text-[#605A57] italic">
              {children}
            </blockquote>
          ),
        }}
      >
        {content}
      </Markdown>
    </div>
  );
}
