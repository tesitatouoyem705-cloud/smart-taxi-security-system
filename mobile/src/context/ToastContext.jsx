import React, { createContext, useContext, useState, useCallback } from "react";
import { CheckCircle2, AlertTriangle, AlertOctagon, Info, X } from "lucide-react";
import { NativeService } from "../services/native";

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = "info", duration = 4000) => {
    const id = Date.now() + Math.random();
    
    // Trigger mobile haptics based on toast urgency
    if (type === "error" || type === "emergency") NativeService.triggerHaptic("error");
    else if (type === "warning") NativeService.triggerHaptic("warning");
    else if (type === "success") NativeService.triggerHaptic("success");
    else NativeService.triggerHaptic("light");

    setToasts((prev) => [...prev, { id, message, type, duration }]);

    if (duration > 0) {
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, duration);
    }
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ addToast, removeToast }}>
      {children}

      {/* Floating Mobile Toast Overlay */}
      <div className="fixed top-12 left-0 right-0 z-50 pointer-events-none px-4 flex flex-col items-center gap-2">
        {toasts.map((t) => {
          let bgClass = "bg-slate-900/90 border-slate-700 text-slate-100";
          let Icon = Info;
          let iconColor = "text-cyan-400";

          if (t.type === "success") {
            bgClass = "bg-emerald-950/95 border-emerald-500/40 text-emerald-100 shadow-lg shadow-emerald-950/50";
            Icon = CheckCircle2;
            iconColor = "text-emerald-400";
          } else if (t.type === "warning") {
            bgClass = "bg-amber-950/95 border-amber-500/40 text-amber-100 shadow-lg shadow-amber-950/50";
            Icon = AlertTriangle;
            iconColor = "text-amber-400";
          } else if (t.type === "error" || t.type === "emergency") {
            bgClass = "bg-red-950/95 border-red-500/50 text-red-100 shadow-xl shadow-red-950/80 animate-sos-strobe";
            Icon = AlertOctagon;
            iconColor = "text-red-400";
          }

          return (
            <div
              key={t.id}
              className={`pointer-events-auto w-full max-w-sm flex items-center gap-3 p-3.5 rounded-2xl backdrop-blur-2xl border transition-all transform animate-in slide-in-from-top-4 duration-200 ${bgClass}`}
            >
              <div className="p-1.5 rounded-xl bg-white/10 shrink-0">
                <Icon className={`w-5 h-5 ${iconColor}`} />
              </div>
              <p className="text-xs font-semibold leading-snug flex-1">{t.message}</p>
              <button
                onClick={() => removeToast(t.id)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 shrink-0"
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
