import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { DOODLE_CLASSES, type DoodleClass, type PredictionResult, drawingSubmissionSchema } from "@shared/schema";
import { PredictionServiceClient } from "@google-cloud/aiplatform";
import { existsSync } from "fs";

// Store connected clients by mode
const clients = {
  tablet: new Set<WebSocket>(),
  desktop: new Set<WebSocket>(),
};

// Vertex AI prediction function
async function vertexPredict(displayImage: string, modelData: number[]): Promise<PredictionResult> {
  try {
    const projectId = process.env.VERTEX_PROJECT_ID;
    const region = process.env.VERTEX_REGION || "us-central1";
    const endpointId = process.env.VERTEX_ENDPOINT_ID;
    const credentialsPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;

    // Validate configuration
    if (!projectId || !endpointId) {
      console.error("Missing Vertex AI configuration: VERTEX_PROJECT_ID or VERTEX_ENDPOINT_ID");
      throw new Error("Vertex AI not configured");
    }

    if (!credentialsPath) {
      console.error("Missing GOOGLE_APPLICATION_CREDENTIALS environment variable");
      throw new Error("Google Cloud authentication not configured");
    }

    // Check if credentials file exists
    if (!existsSync(credentialsPath)) {
      console.error(`Google Cloud credentials file not found at: ${credentialsPath}`);
      throw new Error("Google Cloud credentials file not found");
    }

    // Extract base64 image from data URL
    const base64Image = displayImage.replace(/^data:image\/[a-z]+;base64,/, "");

    // Initialize Vertex AI client
    const client = new PredictionServiceClient({
      apiEndpoint: `${region}-aiplatform.googleapis.com`,
    });

    // Construct endpoint path
    const endpoint = `projects/${projectId}/locations/${region}/endpoints/${endpointId}`;

    // Call Vertex AI endpoint
    const request = {
      endpoint,
      instances: [
        {
          content: base64Image,
        },
      ],
      parameters: {
        confidenceThreshold: 0.4,
        maxPredictions: 5,
      },
    };

    const [response] = await client.predict(request);

    // Parse Vertex AI response
    const predictions: Array<{ class: DoodleClass; confidence: number }> = [];

    if (response.predictions && Array.isArray(response.predictions)) {
      for (const pred of response.predictions) {
        if (pred && typeof pred === "object") {
          const displayNames = (pred as Record<string, unknown>).displayNames as string[] | undefined;
          const confidences = (pred as Record<string, unknown>).confidences as number[] | undefined;

          if (displayNames && confidences && displayNames.length > 0) {
            for (let i = 0; i < Math.min(displayNames.length, confidences.length); i++) {
              const className = displayNames[i].toLowerCase() as DoodleClass;
              if (DOODLE_CLASSES.includes(className)) {
                predictions.push({
                  class: className,
                  confidence: confidences[i],
                });
              }
            }
          }
        }
      }
    }

    // Sort by confidence and take top 3
    const sortedPredictions = predictions
      .sort((a, b) => b.confidence - a.confidence)
      .slice(0, 3);

    // Generate placeholder training examples
    const trainingExamples: Record<string, string[]> = {};
    for (const pred of sortedPredictions) {
      trainingExamples[pred.class] = [
        `/api/placeholder/${pred.class}/1`,
        `/api/placeholder/${pred.class}/2`,
        `/api/placeholder/${pred.class}/3`,
      ];
    }

    return {
      predictions: sortedPredictions,
      trainingExamples,
      userDrawing: displayImage,
    };
  } catch (error) {
    console.error("Vertex AI prediction error:", error);
    throw error;
  }
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
  // Log Vertex AI configuration status on startup
  const projectId = process.env.VERTEX_PROJECT_ID;
  const endpointId = process.env.VERTEX_ENDPOINT_ID;
  const credentialsPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;

  if (!projectId || !endpointId || !credentialsPath) {
    console.warn("⚠️  Vertex AI not fully configured. To enable predictions, set these environment variables:");
    if (!projectId) console.warn("  - VERTEX_PROJECT_ID: Your GCP project ID");
    if (!endpointId) console.warn("  - VERTEX_ENDPOINT_ID: Your deployed endpoint ID");
    if (!credentialsPath) console.warn("  - GOOGLE_APPLICATION_CREDENTIALS: Path to service account JSON");
    if (!credentialsPath || (credentialsPath && !existsSync(credentialsPath))) {
      console.warn("  - Upload your service account JSON file and set its path");
    }
    console.warn("");
  } else if (existsSync(credentialsPath)) {
    console.log("✓ Vertex AI configured and ready");
  }

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
            
            // Call Vertex AI prediction asynchronously
            (async () => {
              try {
                const result = await vertexPredict(displayImage, modelData);
                
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
              } catch (predictionError) {
                console.error("Prediction failed:", predictionError);
                
                // Send error to tablet
                const errorMsg = JSON.stringify({
                  type: "error",
                  payload: { message: "Prediction service unavailable. Please try again." },
                });
                
                if (ws.readyState === WebSocket.OPEN) {
                  ws.send(errorMsg);
                }
                
                // Notify all desktop clients to reset their waiting state
                clients.desktop.forEach((client) => {
                  if (client.readyState === WebSocket.OPEN) {
                    client.send(JSON.stringify({ type: "reset_canvas" }));
                  }
                });
              }
            })();
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
