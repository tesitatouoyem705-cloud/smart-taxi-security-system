import React, { createContext, useContext, useState, useCallback } from "react";
import { CheckCircle2, AlertTriangle, AlertOctagon, Info, X } from "lucide-react";

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback(({ title, message, type = "info", duration = 4000 }) => {
    const id = Date.now() + Math.random();
    const newToast = { id, title, message, type };
    setToasts((prev) => [...prev, newToast]);

    if (duration > 0) {
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, duration);
    }
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const success = useCallback((message, title = "Success") => addToast({ message, title, type: "success" }), [addToast]);
  const error = useCallback((message, title = "Error") => addToast({ message, title, type: "error" }), [addToast]);
  const warning = useCallback((message, title = "Warning") => addToast({ message, title, type: "warning" }), [addToast]);
  const emergency = useCallback((message, title = "EMERGENCY ALERT") => addToast({ message, title, type: "emergency", duration: 8000 }), [addToast]);
  const info = useCallback((message, title = "Notice") => addToast({ message, title, type: "info" }), [addToast]);

  return (
    <ToastContext.Provider value={{ addToast, removeToast, success, error, warning, emergency, info }}>
      {children}
      {/* Toast Notification Container */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3 max-w-sm w-full pointer-events-none">
        {toasts.map((toast) => {
          let borderClass = "border-purple-500/30 bg-purple-950/80";
          let icon = <Info className="w-5 h-5 text-purple-400 shrink-0" />;

          if (toast.type === "success") {
            borderClass = "border-emerald-500/40 bg-emerald-950/85 text-emerald-100";
            icon = <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />;
          } else if (toast.type === "error") {
            borderClass = "border-rose-500/40 bg-rose-950/85 text-rose-100";
            icon = <AlertOctagon className="w-5 h-5 text-rose-400 shrink-0" />;
          } else if (toast.type === "warning") {
            borderClass = "border-amber-500/40 bg-amber-950/85 text-amber-100";
            icon = <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />;
          } else if (toast.type === "emergency") {
            borderClass = "border-red-500 bg-red-950/95 text-red-100 animate-bounce shadow-2xl shadow-red-500/50";
            icon = <AlertOctagon className="w-6 h-6 text-red-400 shrink-0 animate-pulse" />;
          }

          return (
            <div
              key={toast.id}
              className={`pointer-events-auto p-4 rounded-xl border backdrop-blur-xl shadow-xl flex items-start gap-3 transition-all duration-300 transform translate-y-0 ${borderClass}`}
            >
              {icon}
              <div className="flex-1 min-w-0">
                {toast.title && <h4 className="text-sm font-semibold tracking-wide mb-0.5">{toast.title}</h4>}
                <p className="text-xs text-slate-200 leading-relaxed break-words">{toast.message}</p>
              </div>
              <button
                onClick={() => removeToast(toast.id)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) throw new Error("useToast must be used within ToastProvider");
  return context;
};

export default ToastContext;
