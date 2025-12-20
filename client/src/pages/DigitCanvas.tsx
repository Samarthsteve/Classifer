import DigitEducation from "./DigitEducation";
import type { DrawingPayload, PredictionResult } from "@shared/schema";

interface DigitCanvasProps {
  onSubmit: (payload: DrawingPayload) => void;
  isProcessing: boolean;
  isConnected: boolean;
  isReconnecting: boolean;
  hasResult?: boolean;
  result?: PredictionResult | null;
}

export default function DigitCanvas(props: DigitCanvasProps) {
  return <DigitEducation {...props} />;
}
