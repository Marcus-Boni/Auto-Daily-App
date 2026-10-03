<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# AGENTS.md - Workspace Agent Instructions

## 📌 Project Identity
**Auto Daily App** is an intelligent standup generator web app integrating Azure DevOps, Harvest, and Hugging Face Inference API.

- **Stack**: Next.js 16 (App Router, Turbopack), React 19, TypeScript 5, Tailwind CSS 4, Biome 2.5, Zustand, Zod.

---

## 🛠️ Verification Commands

Agents must run these verification commands before marking tasks complete:

```bash
# Linting & code formatting
npm run check

# Type safety verification
npm run type-check

# Production build verification
npm run build
```

---

## 🧭 Architecture Quick Reference

- **`src/app/`**: Next.js App Router (pages and API routes `/api/azure`, `/api/harvest`, `/api/generate`).
- **`src/components/`**: UI components. Reusable Radix/shadcn primitives in `src/components/ui/`.
- **`src/hooks/`**: Custom hooks, specifically `useUserConfig` for local user preferences & credentials.
- **`src/lib/`**: External services (`ai-service.ts`, `azure-service.ts`, `harvest-service.ts`) and constants.
- **`src/types/`**: TypeScript data contracts and payload schemas.
- **`.agents/skills/`**: Installed agent skills:
  - `find-skills`: Discover and install skills from the agent ecosystem (`npx skills`).
  - `vercel-react-best-practices`: Official performance guidelines from Vercel.
  - `frontend-design`: Anthropic official design patterns.
  - `nextjs-app-router-patterns`: Best practices for Next.js App Router.

---

## 📋 Behavioral Guidelines for AI Agents

1. **Format with Biome**: Ensure all edited files are formatted and linted with `npm run check`.
2. **Types over anys**: Maintain strict TypeScript typing.
3. **Client vs Server**: Only add `"use client"` when component requires client-side state/lifecycle hooks.
4. **Preserve Security**: Do not log or expose tokens (`HUGGINGFACE_API_KEY`, user PATs).
