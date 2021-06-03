import { useEffect } from "react";

export function useHashChange(onHashChange: (this: Window, ev: HashChangeEvent) => any) {
  useEffect(() => {
    window.addEventListener("hashchange", onHashChange);

    return () => window.removeEventListener("hashchange", onHashChange);
  }, []);
}
