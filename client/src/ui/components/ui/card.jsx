
import { cn } from '../../../lib/utils';

function Card({ className, ...props }) {
  return (
    <div
      data-slot="card"
      className={cn('bg-card text-card-foreground flex flex-col gap-6 rounded-xl border py-6 shadow-sm', className)}
      {...props}
    />
  );
}

function CardHeader({ className, ...props }) {
  return (
    <div
      data-slot="card-header"
      className={cn('grid auto-rows-min grid-rows-[auto_auto] items-start gap-1.5 px-6 [.border-b]:pb-6', className)}
      {...props}
    />
  );
}

function CardTitle({ className, ...props }) {
  return (
    <div data-slot="card-title" className={cn('leading-none font-semibold', className)} {...props} />
  );
}

function CardDescription({ className, ...props }) {
  return (
    <div data-slot="card-description" className={cn('text-muted-foreground text-sm', className)} {...props} />
  );
}

function CardContent({ className, children, ...props }) {
  return (
    <div data-slot="card-content" className={cn('px-6', className)} {...props}>
      {typeof children === 'string' ? (
        <div className="max-h-[300px] overflow-y-auto overflow-x-hidden pr-2 min-w-0 scrollbar-thin scrollbar-thumb-[rgba(55,50,47,0.2)] scrollbar-track-transparent">
          <ReactMarkdown
            components={{
              h1: ({ children }) => <h1 className="text-2xl font-bold mt-4 mb-2 text-[#37322F]">{children}</h1>,
              h2: ({ children }) => <h2 className="text-xl font-semibold mt-3 mb-2 text-[#37322F]">{children}</h2>,
              h3: ({ children }) => <h3 className="text-lg font-medium mt-2 mb-1 text-[#37322F]">{children}</h3>,
              p: ({ children }) => <p className="mb-2 leading-relaxed last:mb-0 text-[#49423D]">{children}</p>,
              ul: ({ children }) => <ul className="list-disc list-inside space-y-1 mb-2 text-[#49423D]">{children}</ul>,
              ol: ({ children }) => <ol className="list-decimal list-inside space-y-1 mb-2 text-[#49423D]">{children}</ol>,
              li: ({ children }) => <li className="leading-relaxed">{children}</li>,
              strong: ({ children }) => <strong className="font-semibold text-[#37322F]">{children}</strong>,
              code: ({ className, children }) => {
                const isInline = !className;
                return isInline ? (
                  <code className="bg-[#F7F5F3] border border-[rgba(55,50,47,0.12)] px-1.5 py-0.5 rounded text-sm font-mono text-[#37322F] break-all">{children}</code>
                ) : (
                  <code className="block bg-[#F7F5F3] border border-[rgba(55,50,47,0.12)] p-3 rounded-lg text-sm font-mono overflow-x-auto mb-2 text-[#37322F]">{children}</code>
                );
              },
              blockquote: ({ children }) => (
                <blockquote className="border-l-2 border-[#37322F]/20 pl-4 py-1 mb-2 italic text-[#605A57]">{children}</blockquote>
              ),
            }}
          >
            {children}
          </ReactMarkdown>
        </div>
      ) : (
        children
      )}
    </div>
  );
}

function CardFooter({ className, ...props }) {
  return (
    <div data-slot="card-footer" className={cn('flex items-center px-6 [.border-t]:pt-6', className)} {...props} />
  );
}

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent };
