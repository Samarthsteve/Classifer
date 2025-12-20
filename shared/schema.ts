import { sql } from "drizzle-orm";
import { pgTable, text, varchar } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// Doodle Classifier Types
export const DOODLE_CLASSES = [
  'cat', 'dog', 'bird', 'fish', 'tree', 'flower', 'house', 'car', 'bicycle', 'airplane',
  'boat', 'umbrella', 'cup', 'chair', 'table', 'book', 'clock', 'computer', 'phone', 'apple',
  'banana', 'sun', 'moon', 'star', 'cloud', 'mountain', 'face', 'eye', 'hand', 'heart'
] as const;

export type DoodleClass = typeof DOODLE_CLASSES[number];

// Digit Classifier Types
export const DIGIT_CLASSES = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'] as const;

export type DigitClass = typeof DIGIT_CLASSES[number];

export interface Prediction {
  class: DoodleClass;
  confidence: number;
}

export interface PredictionResult {
  predictions: Prediction[];
  trainingExamples: Record<string, string[]>;
  userDrawing: string;
}

export interface DrawingPayload {
  displayImage: string;
  modelData: number[];
  width: number;
  height: number;
}

export const drawingPayloadSchema = z.object({
  displayImage: z.string().startsWith('data:image/'),
  modelData: z.array(
    z.number()
      .refine((n) => Number.isFinite(n) && !Number.isNaN(n), "Must be finite")
      .refine((n) => n >= 0 && n <= 1, "Must be between 0 and 1")
  ).length(784),
  width: z.literal(28),
  height: z.literal(28),
});

export interface DrawingSubmission {
  drawing: DrawingPayload;
  timestamp: string;
}

export const drawingSubmissionSchema = z.object({
  drawing: drawingPayloadSchema,
  timestamp: z.string(),
});

// WebSocket message types
export type WebSocketMessage = 
  | { type: 'drawing_submitted'; payload: DrawingSubmission }
  | { type: 'prediction_result'; payload: PredictionResult }
  | { type: 'reset' }
  | { type: 'reset_canvas' }
  | { type: 'connected'; payload: { mode: string } }
  | { type: 'error'; payload: { message: string } }
  | { type: 'navigate_to_doodle' }
  | { type: 'navigate_to_digit' }
  | { type: 'navigate_to_home' }
  | { type: 'start_drawing' };
