import { useState, useCallback, useEffect } from "react";
import DrawingCanvas from "./DrawingCanvas";
import ResultsDisplay from "./ResultsDisplay";
import { useWebSocket } from "@/hooks/useWebSocket";
import { useToast } from "@/hooks/use-toast";
import type { PredictionResult, DrawingPayload } from "@shared/schema";

type ViewMode = "tablet" | "desktop";

function getViewMode(): ViewMode {
  if (typeof window === "undefined") return "desktop";
  
  const params = new URLSearchParams(window.location.search);
  const modeParam = params.get("mode");
  
  if (modeParam === "tablet") return "tablet";
  if (modeParam === "desktop") return "desktop";
  
  return window.innerWidth < 768 ? "tablet" : "desktop";
}

export default function DoodleClassifier() {
  const [viewMode, setViewMode] = useState<ViewMode>(() => getViewMode());
  const [result, setResult] = useState<PredictionResult | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const handleResize = () => {
      const params = new URLSearchParams(window.location.search);
      if (!params.get("mode")) {
        setViewMode(window.innerWidth < 768 ? "tablet" : "desktop");
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handlePredictionResult = useCallback((predictionResult: PredictionResult) => {
    setResult(predictionResult);
    setIsProcessing(false);
  }, []);

  const handleResetCanvas = useCallback(() => {
    setResult(null);
    setIsProcessing(false);
  }, []);

  const handleError = useCallback((message: string) => {
    setIsProcessing(false);
    toast({
      title: "Error",
      description: message,
      variant: "destructive",
    });
  }, [toast]);

  const { isConnected, isReconnecting, submitDrawing, sendReset } = useWebSocket({
    mode: viewMode,
    onPredictionResult: handlePredictionResult,
    onResetCanvas: handleResetCanvas,
    onError: handleError,
  });

  const handleSubmit = useCallback((payload: DrawingPayload) => {
    setIsProcessing(true);
    submitDrawing(payload);
  }, [submitDrawing]);

  const handleReset = useCallback(() => {
    setResult(null);
    sendReset();
  }, [sendReset]);

  if (viewMode === "tablet") {
    return (
      <DrawingCanvas
        onSubmit={handleSubmit}
        isProcessing={isProcessing}
        isConnected={isConnected}
        isReconnecting={isReconnecting}
      />
    );
  }

  return (
    <ResultsDisplay
      result={result}
      onReset={handleReset}
      isConnected={isConnected}
      isReconnecting={isReconnecting}
    />
  );
}
