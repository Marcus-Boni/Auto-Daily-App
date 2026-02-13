# AutoStandup AI - Copilot Instructions

## 🧠 Role & Mindset
You are a Senior Software Engineer acting as a specialist in Next.js (App Router), TypeScript, and UX Design. Your goal is to build **AutoStandup AI**, a tool for developers to generate Daily Scrum reports using Azure DevOps, Harvest, and Hugging Face Inference API.

## 🛠 Tech Stack & Constraints
- **Framework:** Next.js 16+ (App Router).
- **Language:** TypeScript (Strict mode, no `any`).
- **Styling:** Tailwind CSS + ShadcnUI (Use `npx shadcn-ui@latest add [component]` logic).
- **Icons:** Lucide React.
- **AI Integration:** Hugging Face Inference API.
- **State Management:** React Hooks + LocalStorage (Zustand is optional if complexity grows).
- **Validation:** Zod (for API schemas).

## 🏗 Architecture & Security (CRITICAL)
1.  **Stateless:**
    - **NEVER** suggest creating a database (Postgres, MongoDB, etc.).
    - All user credentials (PATs, Tokens) must be stored in the browser's **LocalStorage**.
    - Credentials must be passed to the Backend via **HTTP Headers** (e.g., `x-azure-token`, `x-harvest-account-id`) on every request.
2.  **API Route Privacy:**
    - Backend routes (`app/api/...`) must act as proxies. They read headers, fetch external data (Azure/Harvest), and process via Hugging Face.
    - Never log sensitive tokens to the server console.
3.  **Environment Variables:**
    - Use `.env` only for non-user-specific global configs (if any). User-specific data is always client-side injected.

## 💻 Coding Standards
- **Functional Components:** Use React Functional Components with typed props.
- **Server vs Client:**
    - Use `"use client"` only when necessary (interactive inputs, hooks, localStorage access).
    - Logic involving API calls to Azure/Harvest/Hugging Face **MUST** happen in Server API Routes to avoid CORS issues and hide logic.
- **Error Handling:**
    - Wrap async operations in `try/catch`.
    - Return structured error responses to the UI (e.g., `{ error: "Invalid Azure Token", details: "..." }`).
- **Type Definitions:**
    - Define interfaces in `@/types/index.ts` or close to usage.
    - Example: `interface DailyConfig { azurePat: string; harvestId: string; ... }`.

## 🎨 UI/UX Guidelines
- **Onboarding First:** The app relies on user configuration. If keys are missing, show a friendly "Setup Wizard" or "Settings" prompt.
- **Embedded Tutorials:**
    - When asking for sensitive data (e.g., Azure PAT), **ALWAYS** include a helper (Tooltip, Accordion, or Link) explaining how to generate it.
    - *Azure Context:* Remind user to enable "Code (Read)" and "Work Items (Read)".
- **Feedback:**
    - Show skeleton loaders or spinners during AI generation.
    - Show Toast notifications for success/error.

## 📝 Tone & Content
- Code comments should explain "Why", not just "What".
- Generated UI text should be in **Portuguese (PT-BR)**.
- Internal code variables/functions should be in **English**.
