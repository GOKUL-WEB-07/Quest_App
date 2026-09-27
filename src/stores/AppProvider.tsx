import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import type { AppData } from "../types";
import { createData } from "../services/userService";
import { loadLocal, saveLocal } from "../services/persistenceService";
import { track } from "../services/analyticsService";

type Store = {
  data: AppData;
  ready: boolean;
  error: string;
  toast: string;
  mutate: (fn: (data: AppData) => AppData) => boolean;
  notify: (text: string) => void;
  clearError: () => void;
  retry: () => void;
};
const Context = createContext<Store | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [initial] = useState(() => {
    try {
      return { data: loadLocal(), error: "" };
    } catch (error) {
      return {
        data: createData(),
        error:
          error instanceof Error
            ? error.message
            : "Could not read your journal.",
      };
    }
  });
  const [data, setData] = useState(initial.data);
  const current = useRef(data);
  const [error, setError] = useState(initial.error);
  const [toast, setToast] = useState("");
  useEffect(() => {
    track("app_opened");
  }, []);
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(""), 4000);
      return () => clearTimeout(timer);
    }
  }, [toast]);
  const mutate = useCallback((fn: (data: AppData) => AppData) => {
    try {
      const next = fn(current.current);
      if (next === current.current) return true;
      saveLocal(next);
      current.current = next;
      setData(next);
      setError("");
      return true;
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Your change could not be saved.",
      );
      return false;
    }
  }, []);
  return (
    <Context.Provider
      value={{
        data,
        ready: true,
        error,
        toast,
        mutate,
        notify: setToast,
        clearError: () => setError(""),
        retry: () => {
          try {
            const saved = loadLocal();
            current.current = saved;
            setData(saved);
            setError("");
          } catch (error) {
            setError(
              error instanceof Error
                ? error.message
                : "Could not read your journal.",
            );
          }
        },
      }}
    >
      {children}
    </Context.Provider>
  );
}

export function useApp() {
  const value = useContext(Context);
  if (!value) throw new Error("Missing app provider");
  return value;
}
