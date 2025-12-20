import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { DOODLE_CLASSES, type DoodleClass, type PredictionResult, drawingSubmissionSchema } from "@shared/schema";
import { existsSync } from "fs";
import fetch from "node-fetch";
import { GoogleAuth } from "google-auth-library";
import sharp from "sharp";

let lastDisplayImage: string | null = null;


async function preprocessDisplayImage(displayImage: string): Promise<string> {
  // Remove data URL prefix
  const base64 = displayImage.replace(
    /^data:image\/[a-zA-Z]+;base64,/,
    ""
  );

  const buffer = Buffer.from(base64, "base64");

  const processed = await sharp(buffer)
    // 🔥 CRITICAL STEP: remove transparency
    .flatten({ background: "#ffffff" }) // canvas bg → solid white
    // 🔥 Now invert safely
    .negate()
    .png()
    .toBuffer();

  return processed.toString("base64");
}


// Store connected clients by mode
const clients = {
  tablet: new Set<WebSocket>(),
  desktop: new Set<WebSocket>(),
};

// Vertex AI prediction function
async function vertexPredict(
  displayImage: string,
  _modelData: number[]
): Promise<PredictionResult> {
  const projectId = process.env.VERTEX_PROJECT_ID;
  const region = process.env.VERTEX_REGION || "us-central1";
  const endpointId = process.env.VERTEX_ENDPOINT_ID;

  if (!projectId || !endpointId) {
    throw new Error("Vertex AI environment variables not set");
  }

  console.log("🟢 VertexPredict called");
  console.log("📌 Project:", projectId);
  console.log("📌 Region:", region);
  console.log("📌 Endpoint:", endpointId);

  lastDisplayImage = displayImage;


  // Remove data URL prefix
  const base64Image = await preprocessDisplayImage(displayImage);


  console.log("🖼️ Image base64 length:", base64Image.length);

  // Get OAuth access token
  const auth = new GoogleAuth({
    scopes: ["https://www.googleapis.com/auth/cloud-platform"],
  });
  const client = await auth.getClient();
  const accessTokenResponse = await client.getAccessToken();

  if (!accessTokenResponse.token) {
    throw new Error("Failed to obtain access token");
  }

  console.log("🔑 Access token obtained");

  const url = `https://${region}-aiplatform.googleapis.com/v1/projects/${projectId}/locations/${region}/endpoints/${endpointId}:predict`;

  const body = {
    instances: [
      {
        content: base64Image,
      },
    ],
    parameters: {
      confidenceThreshold: 0,
      maxPredictions: 5,
    },
  };

  console.log("➡️ Sending request to Vertex AI");
  console.log("➡️ Request body keys:", Object.keys(body));

  const response = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessTokenResponse.token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  console.log("⬅️ Vertex AI HTTP status:", response.status);

  const rawText = await response.text();

  if (!response.ok) {
    console.error("❌ Vertex AI error response:");
    console.error(rawText);
    throw new Error("Vertex AI prediction failed");
  }

  console.log("✅ Raw Vertex AI response:");
  console.log(rawText);

  const json = JSON.parse(rawText);

  console.log("🧠 Parsed response object:");
  console.dir(json, { depth: null });

  const predictions: { class: DoodleClass; confidence: number }[] = [];

  for (const pred of json.predictions ?? []) {
    const names = pred.displayNames;
    const scores = pred.confidences;

    if (Array.isArray(names) && Array.isArray(scores)) {
      for (let i = 0; i < names.length; i++) {
        const className = names[i].toLowerCase() as DoodleClass;
        const confidence = scores[i];

        console.log(`🔍 Found prediction: ${className} → ${confidence}`);

        predictions.push({
          class: className,
          confidence,
        });

      }
    }
  }

  predictions.sort((a, b) => b.confidence - a.confidence);

  const topPredictions = predictions.slice(0, 3);

  console.log("🏆 Top predictions:", topPredictions);

  const trainingExamples: Record<string, string[]> = {};
  for (const pred of topPredictions) {
    trainingExamples[pred.class] = [
      `/api/placeholder/${pred.class}/1`,
      `/api/placeholder/${pred.class}/2`,
      `/api/placeholder/${pred.class}/3`,
    ];
  }

  return {
    predictions: topPredictions,
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
  app.get("/api/debug-image", async (_req, res) => {
    if (!lastDisplayImage) {
      return res.status(400).send("No image yet");
    }

    const base64 = await preprocessDisplayImage(lastDisplayImage);
    const buffer = Buffer.from(base64, "base64");

    res.setHeader("Content-Type", "image/png");
    res.send(buffer);
  });



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

          case "navigate_to_digit":
            // Desktop navigated to digit classifier - notify all tablets to start drawing
            const startDigitDrawingMessage = JSON.stringify({ type: "start_drawing" });
            
            clients.tablet.forEach((client) => {
              if (client.readyState === WebSocket.OPEN) {
                client.send(startDigitDrawingMessage);
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

