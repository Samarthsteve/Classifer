import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { DOODLE_CLASSES, type DoodleClass, type PredictionResult, drawingSubmissionSchema } from "@shared/schema";

// Store connected clients by mode
const clients = {
  tablet: new Set<WebSocket>(),
  desktop: new Set<WebSocket>(),
};

// Mock prediction function - TODO: Replace with real CNN model inference
// The modelData parameter is a 28x28 (784 elements) normalized grayscale array
function mockPredict(displayImage: string, modelData: number[]): PredictionResult {
  // In a real implementation, modelData would be fed to a CNN model
  // modelData is a flat array of 784 values (28x28), normalized 0-1
  // where 0 = white (no ink) and 1 = black (ink)
  
  // For now, we just use mock predictions
  // TODO: Replace with actual TensorFlow.js or ONNX model inference
  
  // Randomly select 4 classes
  const shuffled = [...DOODLE_CLASSES].sort(() => Math.random() - 0.5);
  const selectedClasses = shuffled.slice(0, 4) as DoodleClass[];

  // Generate realistic probabilities
  const topConfidence = 0.60 + Math.random() * 0.30; // 60-90%
  const secondConfidence = 0.05 + Math.random() * 0.20; // 5-25%
  const thirdConfidence = 0.02 + Math.random() * 0.08; // 2-10%
  const fourthConfidence = Math.max(0.01, 1 - topConfidence - secondConfidence - thirdConfidence);

  const predictions = [
    { class: selectedClasses[0], confidence: topConfidence },
    { class: selectedClasses[1], confidence: secondConfidence },
    { class: selectedClasses[2], confidence: thirdConfidence },
    { class: selectedClasses[3], confidence: fourthConfidence },
  ];

  // Generate placeholder training examples
  const trainingExamples: Record<string, string[]> = {};
  for (const pred of predictions) {
    trainingExamples[pred.class] = [
      `/api/placeholder/${pred.class}/1`,
      `/api/placeholder/${pred.class}/2`,
      `/api/placeholder/${pred.class}/3`,
    ];
  }

  return {
    predictions,
    trainingExamples,
    userDrawing: displayImage,
  };
}

// Pastel colors for placeholder images
const PASTEL_COLORS: Record<string, string> = {
  cat: "#FFD6E0",
  dog: "#C9E4DE",
  bird: "#C6DEF1",
  fish: "#DBCDF0",
  tree: "#C9E4DE",
  flower: "#FFD6E0",
  house: "#F7D9C4",
  car: "#C6DEF1",
  bicycle: "#DBCDF0",
  airplane: "#C6DEF1",
  boat: "#C9E4DE",
  umbrella: "#FFD6E0",
  cup: "#F7D9C4",
  chair: "#F2E5D9",
  table: "#F2E5D9",
  book: "#DBCDF0",
  clock: "#C6DEF1",
  computer: "#C9E4DE",
  phone: "#C6DEF1",
  apple: "#FFD6E0",
  banana: "#FAEDCB",
  sun: "#FAEDCB",
  moon: "#C6DEF1",
  star: "#FAEDCB",
  cloud: "#C6DEF1",
  mountain: "#C9E4DE",
  face: "#FFD6E0",
  eye: "#C6DEF1",
  hand: "#F7D9C4",
  heart: "#FFD6E0",
};

function generatePlaceholderSVG(className: string, variant: number): string {
  const color = PASTEL_COLORS[className] || "#E0E0E0";
  const variantOffset = variant * 20;
  
  return `<svg xmlns="http://www.w3.org/2000/svg" width="280" height="280" viewBox="0 0 280 280">
    <rect width="280" height="280" fill="${color}"/>
    <rect x="${10 + variantOffset}" y="${10 + variantOffset}" width="${260 - variantOffset * 2}" height="${260 - variantOffset * 2}" fill="white" opacity="0.3" rx="20"/>
    <text x="140" y="140" font-family="Inter, sans-serif" font-size="28" font-weight="600" fill="#333" text-anchor="middle" dominant-baseline="middle" text-transform="capitalize">${className}</text>
    <text x="140" y="175" font-family="Inter, sans-serif" font-size="14" fill="#666" text-anchor="middle" dominant-baseline="middle">Training Example ${variant}</text>
  </svg>`;
}

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // API endpoint for placeholder training images
  app.get("/api/placeholder/:className/:variant", (req, res) => {
    const { className, variant } = req.params;
    const svg = generatePlaceholderSVG(className, parseInt(variant) || 1);
    
    res.setHeader("Content-Type", "image/svg+xml");
    res.setHeader("Cache-Control", "public, max-age=86400");
    res.send(svg);
  });

  // WebSocket server on distinct path
  const wss = new WebSocketServer({ server: httpServer, path: "/ws" });

  wss.on("connection", (ws: WebSocket) => {
    let clientMode: "tablet" | "desktop" | null = null;

    ws.on("message", (data: Buffer) => {
      try {
        const message = JSON.parse(data.toString());

        switch (message.type) {
          case "connected":
            // Register client mode
            clientMode = message.payload?.mode as "tablet" | "desktop";
            if (clientMode === "tablet" || clientMode === "desktop") {
              clients[clientMode].add(ws);
            }
            break;

          case "drawing_submitted":
            // Validate the drawing submission using Zod schema
            const parseResult = drawingSubmissionSchema.safeParse(message.payload);
            
            if (!parseResult.success) {
              console.error("Invalid drawing payload:", parseResult.error.message);
              // Send error back to the tablet
              const errorMsg = JSON.stringify({
                type: "error",
                payload: { message: "Invalid drawing data. Please try again." },
              });
              
              if (ws.readyState === WebSocket.OPEN) {
                ws.send(errorMsg);
              }
              
              // Also notify all desktop clients to reset their waiting state
              clients.desktop.forEach((client) => {
                if (client.readyState === WebSocket.OPEN) {
                  client.send(JSON.stringify({ type: "reset_canvas" }));
                }
              });
              return;
            }
            
            const validatedSubmission = parseResult.data;
            const { displayImage, modelData } = validatedSubmission.drawing;
            
            // Generate mock prediction using the validated 28x28 modelData
            // TODO: In future, pass modelData to actual CNN model for inference
            const result = mockPredict(displayImage, modelData);
            
            // Broadcast to all desktop clients
            const resultMessage = JSON.stringify({
              type: "prediction_result",
              payload: result,
            });
            
            clients.desktop.forEach((client) => {
              if (client.readyState === WebSocket.OPEN) {
                client.send(resultMessage);
              }
            });
            
            // Also send back to the tablet that submitted
            if (ws.readyState === WebSocket.OPEN) {
              ws.send(resultMessage);
            }
            break;

          case "reset":
            // Desktop requested reset - notify all tablets
            const resetMessage = JSON.stringify({ type: "reset_canvas" });
            
            clients.tablet.forEach((client) => {
              if (client.readyState === WebSocket.OPEN) {
                client.send(resetMessage);
              }
            });
            break;

          case "navigate_to_doodle":
            // Desktop navigated to doodle classifier - notify all tablets to start drawing
            const startDrawingMessage = JSON.stringify({ type: "start_drawing" });
            
            clients.tablet.forEach((client) => {
              if (client.readyState === WebSocket.OPEN) {
                client.send(startDrawingMessage);
              }
            });
            break;

          case "navigate_to_home":
            // Desktop navigated back to home - notify all tablets
            const goHomeMessage = JSON.stringify({ type: "navigate_to_home" });
            
            clients.tablet.forEach((client) => {
              if (client.readyState === WebSocket.OPEN) {
                client.send(goHomeMessage);
              }
            });
            break;
        }
      } catch (error) {
        console.error("WebSocket message error:", error);
      }
    });

    ws.on("close", () => {
      // Remove from client sets
      if (clientMode) {
        clients[clientMode].delete(ws);
      }
    });

    ws.on("error", (error) => {
      console.error("WebSocket error:", error);
    });
  });

  return httpServer;
}
