# AI Doodle Classifier

## Overview

An exhibition-grade interactive web application for AI doodle classification. Users draw on a tablet interface while spectators view real-time AI predictions on a desktop display. The app features a dark space theme with animated particle backgrounds, designed for museum/gallery public viewing with large typography and dramatic animations.

The system uses a dual-screen setup connected via WebSocket:
- **Tablet view**: Drawing canvas for participants
- **Desktop view**: Results display showing AI predictions with confidence bars

Currently uses mock predictions with architecture ready for CNN model integration.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite with custom configuration
- **Routing**: Wouter (lightweight React router)
- **State Management**: TanStack React Query for server state
- **Styling**: Tailwind CSS with shadcn/ui component library
- **View Mode Detection**: URL parameters (`?mode=tablet` or `?mode=desktop`) or automatic screen width detection (<=1080px = tablet)

### Backend Architecture
- **Runtime**: Node.js with Express
- **Language**: TypeScript compiled with esbuild
- **Real-time Communication**: WebSocket (ws library) for tablet/desktop sync
- **API Pattern**: REST endpoints with WebSocket for real-time updates
- **Build Output**: Single bundled file at `dist/index.cjs`

### Data Flow
1. Tablet sends drawing data via WebSocket
2. Server processes with mock prediction (placeholder for CNN model)
3. Server broadcasts results to all connected desktop clients
4. Desktop displays predictions with animated confidence bars

### Key Design Decisions
- **Dual-screen architecture**: Separates drawing input from results display for exhibition use
- **WebSocket over polling**: Enables instant real-time updates between devices
- **Mock prediction system**: Placeholder implementation ready for TensorFlow.js or ONNX model integration
- **Split deployment support**: Frontend can deploy to Vercel, backend to Railway/Render

### Data Storage
- **Current**: In-memory storage (MemStorage class) for user data
- **Schema**: Drizzle ORM with PostgreSQL schema defined but optional
- **Drawing Data**: Base64 images and normalized 28x28 grayscale arrays for model input

## External Dependencies

### Third-Party Services
- **PostgreSQL**: Optional database (Drizzle ORM configured, not required for core functionality)
- **Google Fonts**: Inter and JetBrains Mono typefaces

### Environment Variables
| Variable | Purpose |
|----------|---------|
| `DATABASE_URL` | PostgreSQL connection (optional) |
| `VITE_API_BASE_URL` | Backend API URL for split deployment |
| `VITE_WS_URL` | WebSocket URL for split deployment |
| `ALLOWED_ORIGINS` | CORS whitelist for production |
| `API_ONLY` | Skip static file serving when true |

### Key NPM Packages
- `ws`: WebSocket server implementation
- `drizzle-orm`: Database ORM (PostgreSQL)
- `@radix-ui/*`: Accessible UI primitives for shadcn components
- `@tanstack/react-query`: Server state management
- `zod`: Runtime schema validation for API payloads