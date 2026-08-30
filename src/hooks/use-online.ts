"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";

export function useOnlineStatus() {
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      toast.success("You are back online", { id: "offline-banner" });
    };
    const handleOffline = () => {
      setIsOnline(false);
      toast.error("You are offline. Some actions may not work.", {
        id: "offline-banner",
        duration: Infinity,
      });
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  return isOnline;
}
