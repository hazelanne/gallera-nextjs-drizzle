import { useEffect, useRef, useState } from "react";

export type ConnectionStatus = "connected" | "disconnected" | "connecting";

export function useWebSocket(onMessage: (msg: any) => void) {
  const [status, setStatus] = useState<ConnectionStatus>("connecting");
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const ws = new WebSocket(`${protocol}//${window.location.host}/api/ws`);
    wsRef.current = ws;

    ws.onopen = () => setStatus("connected");
    ws.onclose = () => setStatus("disconnected");
    ws.onmessage = (event) => onMessage(JSON.parse(event.data));

    const pingInterval = setInterval(() => {
      if (ws.readyState === WebSocket.OPEN) ws.send(`{"event":"ping"}`);
    }, 29000);

    return () => {
      clearInterval(pingInterval);
      ws.close();
    };
  }, [onMessage]);

  return status;
}
