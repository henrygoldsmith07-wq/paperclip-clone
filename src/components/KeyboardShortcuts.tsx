"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useApp } from "@/context/AppContext";
import { useToast } from "@/components/Toast";

export default function KeyboardShortcuts() {
  const router = useRouter();
  const { simulateTick } = useApp();
  const { toast } = useToast();
  const gPressed = useRef(false);
  const gTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.isContentEditable
      ) {
        return;
      }

      const key = e.key.toLowerCase();

      if (key === "s" && !e.metaKey && !e.ctrlKey && !e.altKey && !gPressed.current) {
        e.preventDefault();
        simulateTick();
        toast("⚡ Simulation tick complete", "success");
        return;
      }

      if (key === "g" && !e.metaKey && !e.ctrlKey) {
        gPressed.current = true;
        if (gTimeout.current) clearTimeout(gTimeout.current);
        gTimeout.current = setTimeout(() => {
          gPressed.current = false;
        }, 800);
        return;
      }

      if (gPressed.current) {
        gPressed.current = false;
        if (gTimeout.current) clearTimeout(gTimeout.current);

        switch (key) {
          case "d":
            router.push("/dashboard");
            break;
          case "a":
            router.push("/dashboard/agents");
            break;
          case "t":
            router.push("/dashboard/tasks");
            break;
          case "o":
            router.push("/dashboard/org");
            break;
          case "g":
            router.push("/dashboard/goals");
            break;
          case "s":
            router.push("/dashboard/settings");
            break;
        }
      }
    };

    window.addEventListener("keydown", handler);
    return () => {
      window.removeEventListener("keydown", handler);
      if (gTimeout.current) clearTimeout(gTimeout.current);
    };
  }, [router, simulateTick, toast]);

  return null;
}
