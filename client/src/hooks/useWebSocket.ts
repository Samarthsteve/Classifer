import { useEffect, useRef, useState, useCallback } from "react";
import type { WebSocketMessage, PredictionResult, DrawingPayload } from "@shared/schema";

interface UseWebSocketOptions {
  mode: "tablet" | "desktop";
  onPredictionResult?: (result: PredictionResult) => void;
  onResetCanvas?: () => void;
  onConnected?: () => void;
  onDisconnected?: () => void;
  onError?: (message: string) => void;
  onStartDrawing?: () => void;
  onNavigateToHome?: () => void;
}

export function useWebSocket(options: UseWebSocketOptions) {
  const { mode, onPredictionResult, onResetCanvas, onConnected, onDisconnected, onError, onStartDrawing, onNavigateToHome } = options;
  const [isConnected, setIsConnected] = useState(false);
  const [isReconnecting, setIsReconnecting] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const connect = useCallback(() => {
    // Check if WebSocket is supported
    if (typeof WebSocket === "undefined") {
      console.warn("WebSocket not supported in this browser");
      return;
    }

    // Use environment variable for WebSocket URL in production, fallback to same-origin for development
    let wsUrl: string;
    try {
      if (import.meta.env.VITE_WS_URL) {
        wsUrl = import.meta.env.VITE_WS_URL;
      } else {
        const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
        const host = window.location.host;
        if (!host) {
          console.warn("Unable to determine host for WebSocket connection");
          return;
        }
        wsUrl = `${protocol}//${host}/ws`;
      }
    } catch (urlError) {
      console.error("Failed to construct WebSocket URL:", urlError);
      return;
    }
    
    try {
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        setIsConnected(true);
        setIsReconnecting(false);
        try {
          ws.send(JSON.stringify({ type: "connected", payload: { mode } }));
        } catch (sendError) {
          console.error("Failed to send connected message:", sendError);
        }
        onConnected?.();
      };

      ws.onmessage = (event) => {
        try {
          const message: WebSocketMessage = JSON.parse(event.data);
          
          switch (message.type) {
            case "prediction_result":
              onPredictionResult?.(message.payload);
              break;
            case "reset_canvas":
              onResetCanvas?.();
              break;
            case "error":
              onError?.(message.payload?.message || "An error occurred");
              break;
            case "start_drawing":
              onStartDrawing?.();
              break;
            case "navigate_to_home":
              onNavigateToHome?.();
              break;
          }
        } catch (error) {
          console.error("Failed to parse WebSocket message:", error);
        }
      };

      ws.onclose = () => {
        setIsConnected(false);
        onDisconnected?.();
        
        if (!reconnectTimeoutRef.current) {
          setIsReconnecting(true);
          reconnectTimeoutRef.current = setTimeout(() => {
            reconnectTimeoutRef.current = null;
            connect();
          }, 3000);
        }
      };

      ws.onerror = (errorEvent) => {
        console.warn("WebSocket error occurred, will attempt to reconnect");
        try {
          ws.close();
        } catch (closeError) {
          // Ignore close errors
        }
      };
    } catch (error) {
      console.error("WebSocket connection failed:", error);
      setIsReconnecting(true);
      if (!reconnectTimeoutRef.current) {
        reconnectTimeoutRef.current = setTimeout(() => {
          reconnectTimeoutRef.current = null;
          connect();
        }, 3000);
      }
    }
  }, [mode, onPredictionResult, onResetCanvas, onConnected, onDisconnected, onStartDrawing, onNavigateToHome]);

  useEffect(() => {
    connect();

    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [connect]);

  const submitDrawing = useCallback((payload: DrawingPayload) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type: "drawing_submitted",
        payload: {
          drawing: payload,
          timestamp: new Date().toISOString(),
        },
      }));
    }
  }, []);

  const sendReset = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: "reset" }));
    }
  }, []);

  const sendNavigateToDoodle = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: "navigate_to_doodle" }));
    }
  }, []);

  const sendNavigateToHome = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: "navigate_to_home" }));
    }
  }, []);

  return {
    isConnected,
    isReconnecting,
    submitDrawing,
    sendReset,
    sendNavigateToDoodle,
    sendNavigateToHome,
  };
}
