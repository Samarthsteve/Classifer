# AI Doodle Classifier - Design Guidelines

## Design Philosophy
**Exhibition-Grade Interactive Display - Dark Space Theme**
- Immersive dark space aesthetic with animated star field
- Museum/gallery quality for public viewing
- High contrast, dramatic animations, large typography
- Core narrative: "Watching AI see" - every element serves this story

## Typography System
**Fonts:**
- Primary: Inter (weights: 900, 700, 500, 400)
- Monospace: JetBrains Mono (weights: 500, 400) for technical elements

**Hierarchy (20% larger than standard web):**
- Main predictions: text-5xl to text-7xl, font-black
- Confidence percentages: text-4xl to text-6xl, font-bold, font-mono
- Alternative predictions: text-xl to text-2xl, font-medium
- Drawing prompts: text-xl to text-2xl, font-semibold
- Labels/instructions: text-xs to text-sm, font-medium, uppercase, tracking-widest

## Color Palette
**Background:** Dark space with animated particles
- Base: Deep space blue (#080C18) with radial gradients
- Stars: White with varying opacity and twinkle effects
- Particles: Blue tones (slate-300 to blue-400) with glow effects

**Text Colors:**
- Primary: white, text-white
- Secondary: slate-400
- Tertiary: slate-500, slate-600

**Accents:**
- Primary: Blue gradient (blue-600 to cyan-600)
- Success/Live: Emerald (emerald-400, emerald-500) with glow
- Interactive: Blue-400 to cyan-400
- Confidence bars: Gradient from blue-600 via blue-500 to cyan-500

**Canvas:** White (#FFFFFF) background, black (#000000) strokes (4px width)

## Exhibition Header
- Position: Fixed top-left (top-4 left-4)
- Green flashing indicator with glow effect
- Text: "GSV AI EXHIBITION" in monospace, uppercase, tracking-widest
- Always visible with z-50

## Spacing System
**Tailwind Primitives:** 2, 3, 4, 6, 8, 10, 12, 16
- Component padding: 4, 6, 8, 10
- Section spacing: 8, 12, 16
- Full viewport layouts: h-screen with flex flex-col

## Component Library

**Cards (Home Page):**
- bg-slate-900/80 backdrop-blur-sm
- border border-slate-700/50
- rounded-2xl
- Hover: border-blue-500/50, shadow-glow, scale-[1.02]
- Gradient overlays on hover

**Buttons:**
- Primary: bg-gradient-to-r from-blue-600 to-cyan-600
- Rounded-xl with shadow-lg shadow-blue-500/25
- Hover: shadow-2xl, scale-105
- Disabled: opacity-40
- Icon buttons: p-3 with rounded-lg

**Tool Bar (Drawing Canvas):**
- bg-slate-800/80 backdrop-blur-sm
- border border-slate-700/50 rounded-xl
- Active tool: bg-blue-600 with shadow-lg
- Inactive: text-slate-400 hover:text-white

**Canvas Interface:**
- Large responsive canvas (up to 700px)
- White background with border-4 border-slate-700/50
- rounded-xl shadow-2xl shadow-black/50

**Idle Screen (Desktop):**
- Centered content with animated icon
- Pulsing rings around main icon
- Animated dots loading indicator
- "Awaiting Input" status badge

**Results Display:**
- Drawing container: w-56/w-64, centered
- Main prediction: text-5xl to text-7xl, gradient text
- Confidence: text-4xl to text-6xl, cyan-400, font-mono
- Alternative predictions in bg-slate-900/50 container

## Animations
**Timing (Exhibition-grade, slower than web):**
- Fade in: 0.6s ease-out
- Scale in: 0.5s ease-out
- Confidence bars: 0.7s ease-out with staggered delays
- Hover transitions: 0.3s to 0.5s
- Particle twinkle: Continuous with varied speeds

**Custom Animations:**
- fade-in-up: translateY(20px) to 0
- scale-in: scale(0.9) to 1
- float: translateY oscillation
- Flashing indicator: opacity toggle with glow

## Layout Patterns
**Home Page:** Full screen centered with grid cards
**Drawing Canvas (Tablet):** 
- Header with prompt
- Large centered canvas
- Bottom toolbar with tools and submit button
**Results Display (Desktop):**
- Idle state: Centered waiting animation
- Active state: Drawing preview, prediction, alternatives

## Connection Status
- Position: Fixed bottom-left
- Green dot with glow when connected
- Red dot when disconnected
- Text: xs, slate-500

## Images
No hero images required. All visual content is generated from:
- User's canvas drawings (rendered at 280x280px)
- Training example images (fetched from backend, overlaid at opacity-20)
- Particle animation background (programmatic stars and particles)
