import { useState, useCallback, useEffect } from "react";
import DigitCanvas from "./DigitCanvas";
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
  
  return window.innerWidth <= 1080 ? "tablet" : "desktop";
}

export default function DigitClassifier() {
  const [viewMode, setViewMode] = useState<ViewMode>(() => getViewMode());
  const [result, setResult] = useState<PredictionResult | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();


  useEffect(() => {
    const handleResize = () => {
      const params = new URLSearchParams(window.location.search);
      if (!params.get("mode")) {
        setViewMode(window.innerWidth <= 1080 ? "tablet" : "desktop");
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

  const { isConnected, isReconnecting, submitDrawing, sendReset, sendNavigateToDigit } = useWebSocket({
    mode: viewMode,
    onPredictionResult: handlePredictionResult,
    onResetCanvas: handleResetCanvas,
    onError: handleError,
  });

  // Notify tablets when desktop enters the digit classifier
  useEffect(() => {
    if (viewMode === "desktop" && isConnected) {
      sendNavigateToDigit();
    }
  }, [viewMode, isConnected, sendNavigateToDigit]);

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
      <DigitCanvas
        onSubmit={handleSubmit}
        isProcessing={isProcessing}
        isConnected={isConnected}
        isReconnecting={isReconnecting}
        hasResult={result !== null}
        result={result}
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
