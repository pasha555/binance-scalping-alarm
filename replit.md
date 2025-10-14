# RSI Bot Management Dashboard

## Overview

A comprehensive management dashboard for controlling multiple Binance Futures trading bots that analyze RSI (Relative Strength Index) indicators and funding rates. The system provides real-time bot control, coin blocking functionality, and Telegram notifications for trading signals across different timeframes (1m, 5m) and funding rate monitoring.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework**: React 18 with TypeScript and Vite
- **UI Library**: Radix UI primitives with shadcn/ui components (New York style)
- **Styling**: Tailwind CSS with custom dark-mode-first design system
- **State Management**: TanStack React Query for server state
- **Routing**: Wouter for client-side routing
- **Form Handling**: React Hook Form with Zod validation

**Design System**:
- Material Design 3 principles with trading platform aesthetics
- Dark mode by default with custom color palette focused on trading indicators
- Typography: Inter font for UI, JetBrains Mono for technical data
- Status-driven color coding (green for running/long, red for stopped/short, orange for warnings)

### Backend Architecture

**Runtime**: Node.js with Express.js
- **Language**: TypeScript with ES modules
- **API Pattern**: RESTful API endpoints under `/api` prefix
- **Process Management**: Child process spawning for Python bot control
- **Development Server**: Vite integration for HMR during development

**Key Routes**:
- `/api/blocked-coins` - CRUD operations for blocked cryptocurrency symbols
- `/api/bots` - Bot status monitoring and control
- `/api/bots/:botName/start` - Start individual bots
- `/api/bots/:botName/stop` - Stop individual bots

### Data Storage

**Database**: PostgreSQL (via Neon serverless)
- **ORM**: Drizzle ORM with Neon serverless adapter
- **Connection**: WebSocket-based connection pooling
- **Migrations**: Drizzle Kit for schema management

**Schema Design**:
- `blocked_coins` table: Stores cryptocurrency symbols to exclude from notifications
- `bot_status` table: Tracks running state and activity of each bot instance

**Storage Abstraction**:
- Interface-based storage layer (`IStorage`)
- In-memory implementation (`MemStorage`) for development/testing
- Database-backed implementation for production

### Bot Integration

**Bot Types**:
1. **1-Minute RSI Bot** (`bot_1m.py`) - Analyzes 1-minute candles
2. **5-Minute RSI Bot** (`bot_5m.py`) - Analyzes 5-minute candles  
3. **Funding Rate Bot** (`bot_funding.py`) - Monitors funding rate thresholds

**Bot Characteristics**:
- Python-based with asyncio for concurrent API calls
- RSI calculation using pandas and numpy
- Binance Futures API integration
- Telegram Bot API for notifications
- Blocked coin filtering via backend API
- Thread pool execution for parallel symbol processing

## External Dependencies

### Third-Party Services

**Binance Futures API**:
- Base URL: `https://fapi.binance.com`
- Endpoints: `/fapi/v1/exchangeInfo`, `/fapi/v1/klines`, `/fapi/v1/premiumIndex`
- Used for: Symbol discovery, candlestick data, funding rate information

**Telegram Bot API**:
- Used for: Sending trading signal notifications to group chats
- Multiple bot tokens configured for different timeframes
- Markdown formatting support for rich notifications

**Neon PostgreSQL**:
- Serverless PostgreSQL database
- WebSocket connection support
- Connection string via `DATABASE_URL` environment variable

### NPM Packages

**Core Framework**:
- `express` - Web server framework
- `react` & `react-dom` - UI library
- `vite` - Build tool and dev server
- `typescript` - Type safety

**Database & Validation**:
- `drizzle-orm` - Type-safe ORM
- `@neondatabase/serverless` - Neon database driver
- `zod` - Schema validation
- `drizzle-zod` - Zod integration for Drizzle

**UI Components**:
- `@radix-ui/*` - Headless UI primitives (20+ component packages)
- `tailwindcss` - Utility-first CSS framework
- `class-variance-authority` - Component variant management
- `lucide-react` - Icon library

**State & Data Fetching**:
- `@tanstack/react-query` - Server state management
- `react-hook-form` - Form state management
- `@hookform/resolvers` - Form validation resolvers

**Python Dependencies** (Bot Scripts):
- `requests` - HTTP client for Binance API
- `pandas` - Data manipulation for RSI calculations
- `numpy` - Numerical computations
- `aiohttp` - Async HTTP for funding rate bot
- `python-telegram-bot` - Telegram integration

### Development Tools

- `tsx` - TypeScript execution for development
- `esbuild` - Production bundling for server
- `drizzle-kit` - Database migrations
- `wouter` - Lightweight routing
- `@replit/vite-plugin-*` - Replit-specific development plugins