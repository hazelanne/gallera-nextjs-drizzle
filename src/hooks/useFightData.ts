"use client";

import { useState } from "react";
import { useWebSocket } from "./useWebSocket";

export interface Fight {
  id: string;
  left: string;
  right: string;
  status: string;
}

export function useFightData(initialFight: Fight | null) {
  const [currentFight, setCurrentFight] = useState<Fight | null>(initialFight);

  useWebSocket("ws://localhost:3000/api/ws", (data) => {
    if (data.type === "fight_update") {
      setCurrentFight(data.fight);
    }
  }, []);

  return { currentFight, setCurrentFight };
}
