# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run setup       # First-time setup: install + prisma generate + migrate
npm run dev         # Dev server with Turbopack on port 3000
npm run build       # Production build
npm run lint        # ESLint (next lint)
npm run test        # Vitest test suite
npm run db:reset    # Reset SQLite database (prisma migrate reset --force)
```

Run a single test file:
```bash
npx vitest run src/components/chat/__tests__/ChatInterface.test.tsx
```

## Architecture

UIGen is a Next.js 15 (App Router) app that lets users describe React components in natural language and see live previews. Claude generates code via tool use; no files are written to disk.

### AI Code Generation Flow

1. User message → `ChatContext` (`useChat` hook) → `POST /api/chat`
2. API route calls Claude (`claude-haiku-4-5`) with two tools:
   - `str_replace_editor` — create/view/edit virtual files
   - `file_manager` — rename/delete virtual files
3. Tool calls update `VirtualFileSystem` (in-memory, client-side) via `FileSystemContext`
4. `PreviewFrame` transpiles JSX/TSX in-browser using Babel Standalone and renders live

If `ANTHROPIC_API_KEY` is not set, `MockLanguageModel` in `src/lib/provider.ts` returns static generated code (max 4 steps instead of 40).

### Virtual File System

`src/lib/file-system.ts` — `VirtualFileSystem` class holds files in memory. All paths start with `/` (e.g., `/App.jsx`). The system prompt in `src/lib/prompts/generation.tsx` enforces that `/App.jsx` is always the entry point and imports use the `@/` alias.

### State

Two React contexts wrap the app:
- `FileSystemContext` (`src/lib/contexts/file-system-context.tsx`) — owns file state, initializes from Prisma project data
- `ChatContext` (`src/lib/contexts/chat-context.tsx`) — owns conversation state, wires Vercel AI SDK's `useChat` to the API

### Auth

JWT stored in HTTP-only cookie (7-day TTL). `src/middleware.ts` verifies the session on every request. Server actions in `src/actions/` handle sign-up/sign-in with bcrypt. Anonymous users can generate but cannot save projects.

### Database

SQLite via Prisma. Two models: `User` (email + hashed password) and `Project` (messages + filesystem data serialized as JSON strings). Schema at `prisma/schema.prisma`.

### Preview

`src/lib/transform/jsx-transformer.ts` transpiles JSX/TSX client-side. `src/lib/transform/import-map-builder.ts` maps `@/` imports to virtual file URLs. Entry point detection prefers `App.jsx` → `index.jsx`.

### UI Layout

`src/app/main-content.tsx` uses `react-resizable-panels` for the three-panel split: Chat | Code Editor (with file tree tabs) | Live Preview. UI primitives come from Radix UI + Shadcn/ui (`src/components/ui/`).
