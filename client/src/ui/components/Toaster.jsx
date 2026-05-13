import { Toaster as SonnerToaster } from "sonner";

export default function Toaster() {
  return (
    <SonnerToaster
      position="top-right"
      toastOptions={{
        style: {
          background: "#fff",
          border: "1px solid rgba(55,50,47,0.12)",
          color: "#37322F",
          borderRadius: "0.625rem",
          boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
          fontSize: "14px",
        },
        success: {
          icon: (
            <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center shrink-0">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
          ),
        },
        error: {
          icon: (
            <div className="w-5 h-5 rounded-full bg-red-100 flex items-center justify-center shrink-0">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </div>
          ),
        },
        className: "font-sans",
      }}
    />
  );
}
