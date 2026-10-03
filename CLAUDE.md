<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Claude Code & AI Agent Guide - Auto Daily App

## 📌 Project Overview
**Auto Daily App** is an intelligent web application that automates the generation of Daily Scrum reports.
It integrates with **Azure DevOps** (commits), **OptSolv Time Tracker** (timesheets / time entries), and the **Hugging Face Inference API** to produce structured, professional standup reports.

- **Framework**: Next.js 16 (App Router, Turbopack, standalone deployment)
- **UI & Styling**: React 19, Tailwind CSS 4, Radix UI, Lucide React, Sonner (Toasts)
- **State Management**: Zustand with localStorage persistence
- **Validation & Tooling**: Zod, Biome v2.5 (linter & formatter), TypeScript 5

---

## 🚀 Key Commands

Always run these commands before submitting changes:

```bash
# Start development server
npm run dev

# Run TypeScript type check
npm run type-check

# Run Biome lint & format validation (with auto-fixes)
npm run check

# Production build test
npm run build
```

---

## 🏛️ Architecture & Directory Structure

```
├── .agents/skills/        # Project-level agent skills (Vercel, Anthropic, Next.js)
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── azure/route.ts       # Azure DevOps commit retrieval
│   │   │   ├── optsolv/route.ts     # OptSolv Time Tracker v1 integration
│   │   │   └── generate/route.ts    # Hugging Face AI Daily report generation
│   │   ├── globals.css              # Tailwind CSS 4 imports & root variables
│   │   ├── layout.tsx               # Root layout (Viewport + Metadata + ThemeProvider)
│   │   └── page.tsx                 # Main application dashboard
│   ├── components/
│   │   ├── ui/                      # Radix UI / shadcn accessible primitives
│   │   ├── app-shell.tsx            # Navigation header & footer
│   │   ├── daily-generator.tsx      # Main daily generation workspace
│   │   ├── settings-panel.tsx       # Local user credentials & configuration modal
│   │   ├── config-status.tsx        # Visual status indicator for configured services
│   │   └── theme-toggle.tsx         # Dark / Light theme switch
│   ├── hooks/
│   │   └── use-user-config.ts       # Zustand store for user settings & API tokens
│   ├── lib/
│   │   ├── ai-service.ts            # Hugging Face Chat Completions client
│   │   ├── azure-service.ts         # Azure DevOps REST client & commit parser
│   │   ├── optsolv-service.ts       # OptSolv Time Tracker v1 REST API client
│   │   ├── constants.ts             # Default prompts, formatting templates, system messages
│   │   └── utils.ts                 # Classname merge utility (clsx + twMerge)
│   └── types/
│       └── index.ts                 # Core TypeScript interfaces & schemas
```

---

## 🧠 Agent Best Practices & Rules

1. **Strict Code Quality with Biome**:
   - Biome v2.5 is the sole linter and formatter. Run `npm run check` after modifying any file.
   - Do not disable Biome rules with ad-hoc ignore comments unless explicitly discussed.

2. **React 19 & Next.js 16 Conventions**:
   - Default to Server Components where possible.
   - Use `"use client"` directive on components requiring browser APIs, Zustand hooks, or interactive state.
   - Export `viewport` separately from `metadata` in Next.js layouts (`export const viewport: Viewport = { ... }`).

3. **Styling & UI**:
   - Follow Tailwind CSS 4 syntax. Theme tokens are configured via `@theme inline` in `src/app/globals.css`.
   - Maintain dark/light mode parity using semantic tokens (`bg-background`, `text-foreground`, `border-border`).
   - Use components from `src/components/ui/` for consistency.

4. **Security & Data Privacy**:
   - User tokens (Azure DevOps PAT, OptSolv Integration Key / Token) must stay exclusively in local browser storage (`localStorage`) and should only be transmitted via server actions / API proxy calls in headers.
   - The Hugging Face API key is managed via `HUGGINGFACE_API_KEY` in `.env.local` on the server side.

5. **Commit Message Format**:
   - Follow Conventional Commits:
     - `feat:` new user functionality
     - `fix:` bug fixes
     - `chore:` maintenance, dependencies, configuration
     - `refactor:` code reorganization without behavior change
