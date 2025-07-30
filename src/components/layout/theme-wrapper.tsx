"use client";
import React from "react";
import { useAppStore } from "@/store";

export function ThemeWrapper({ children }: { children: React.ReactNode }) {
  const theme = useAppStore((state) => state.theme);
  React.useEffect(() => {
    if (typeof window !== "undefined") {
      document.documentElement.classList.toggle("dark", theme === "dark");
    }
  }, [theme]);
  return <>{children}</>;
} 