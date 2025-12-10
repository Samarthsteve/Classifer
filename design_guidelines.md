# Design Guidelines: AI Doodle Classifier Exhibition Application

## Design Philosophy
**Exhibition-Grade Interactive Display**
- Museum/gallery aesthetic for public viewing
- Full-screen immersive experiences optimized for viewing distance
- High contrast, dramatic animations, large typography
- Core narrative: "Watching AI see" - every element serves this story

## Typography System
**Fonts:**
- Primary: Inter (weights: 900, 700, 500, 400)
- Monospace: JetBrains Mono (weights: 500, 400) for technical elements

**Hierarchy (20% larger than standard web):**
- Main predictions: text-6xl to text-8xl, font-black
- Confidence percentages: text-5xl to text-7xl, font-bold, font-mono
- Alternative predictions: text-2xl to text-3xl, font-medium
- Drawing prompts: text-2xl to text-3xl, font-medium
- Labels/instructions: text-sm, font-medium, uppercase, tracking-wider

## Color Palette
**Background:** Particle-based animated gradient
- Base gradient: Soft white (#FAFBFC) to pale blue (#F0F4F8)
- Floating particle dots with subtle shadows, gentle movement
- Calming, non-distracting ambient animation

**Accents:**
- Primary: #3B82F6 (blue) for interactive elements
- Success/predictions: #10B981 (emerald green)
- Text: gray-900 (primary), gray-600 (secondary)
- Confidence bars: Gradient from primary to lighter shades
- Canvas: White (#FFFFFF) background, black (#000000) strokes (3px width)

## Spacing System
**Tailwind Primitives:** 2, 4, 6, 8, 12, 16, 24
- Component padding: 6, 8
- Section spacing: 12, 16, 24
- Always use h-screen with flex flex-col for full viewport layouts

## Component Library

**Cards (Home Page):**
- shadow-lg, rounded-2xl
- min-h-64, p-12
- Hover: scale(1.05), duration-300
- flex flex-col items-center justify-center

**Buttons:**
- Clear: px-8 py-4, rounded-xl, border-2
- Done/Primary: px-12 py-4, rounded-xl, bg-blue-600 text-white
- Draw Again: px-16 py-6, text-xl, rounded-2xl, shadow-lg
- All: text-lg font-medium minimum, 44×44px touch targets
- Hover: opacity-90, scale(1.02)

**Canvas Interface:**
- Full-screen HTML5 canvas, responsive touch/mouse
- Top prompt: text-2xl, p-6, centered
- Bottom controls: Clear (left), Done (right)

**Results Display:**
- Drawing container: max-w-md, centered, 280×280px
- Training overlays: opacity-30, rotating cross-fade
- Main prediction: text-8xl font-black, centered
- Confidence: text-7xl font-mono, emerald-600
- Alternative predictions: max-w-2xl container, space-y-4
- Each row: Class name (w-32, text-2xl) + animated bar (h-12, rounded-lg) + percentage (w-20, text-2xl font-mono)

## Animations
**Timing (Exhibition-grade, slower than web):**
- Prediction entrance: opacity 0→1 + translateY(8px)→0, 500ms
- Confidence bars: width 0→X%, 700ms ease-out, stagger 75ms between bars
- Training overlays: Cross-fade rotation every 2s, duration-500
- Button hover: duration-300
- All transitions: Smooth, dramatic, no lag

**Effects:**
- Drawing strokes: Real-time smooth rendering
- Results appear: Fade-in 300ms
- Particle background: Continuous subtle floating motion

## Layout Specifications

**Home Page:**
- Centered title: text-6xl font-black
- Two-card grid with equal spacing
- Particle gradient background

**Tablet Drawing (Full-screen):**
- Top: Drawing prompt
- Center: Maximum canvas area
- Bottom: Clear (left) + Done (right)

**Desktop Results:**
- Top: Context text (text-3xl, py-8)
- Center: Drawing with training overlays
- Below: Main prediction + confidence
- Bottom section: Alternative predictions list
- Footer: Draw Again button

## Images
No hero images required. All visual content is generated from:
- User's canvas drawings (rendered at 280×280px)
- Training example images (fetched from backend, overlaid at opacity-30)
- Particle animation background (programmatic)