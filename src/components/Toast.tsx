"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";

type ToastItem = {
  id: number;
  message: string;
  type?: "info" | "success" | "warning";
};

type ToastContextType = {
  toast: (message: string, type?: ToastItem["type"]) => void;
};

const ToastContext = createContext<ToastContextType | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([]);

  const toast = useCallback(
    (message: string, type: ToastItem["type"] = "info") => {
      const id = Date.now() + Math.random();
      setItems((prev) => [...prev, { id, message, type }]);
    },
    []
  );

  useEffect(() => {
    if (items.length === 0) return;
    const timer = setTimeout(() => {
      setItems((prev) => prev.slice(1));
    }, 2800);
    return () => clearTimeout(timer);
  }, [items]);

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div className="pointer-events-none fixed bottom-6 right-6 z-[100] flex flex-col gap-2">
        {items.map((item) => (
          <div
            key={item.id}
            className={`pointer-events-auto animate-fade-in rounded-lg border border-border bg-card px-4 py-2.5 text-sm shadow-xl shadow-black/30 ${
              item.type === "success"
                ? "text-success"
                : item.type === "warning"
                  ? "text-warning"
                  : "text-foreground"
            }`}
          >
            {item.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}
