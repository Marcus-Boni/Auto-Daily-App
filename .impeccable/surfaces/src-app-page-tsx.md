---
version: 1
slug: "src-app-page-tsx"
primary_target: "src/app/page.tsx"
related_targets: []
---

# Homepage (/)

Scope: public homepage for the open-source Auto Daily project. Visitor mode: Persuade.
Audience: developers who use Azure DevOps and/or OptSolv Time Tracker and run a daily standup; secondarily devs who want to self-host or contribute.
Job: understand in seconds what Auto Daily does, trust that a person reviews the AI draft, then open the app (`/app`) or clone the repo.
Proof on hand: the real app components and its real copy; no testimonials, adoption numbers or benchmarks exist. Demonstration data is synthetic and labeled as such.
Constraints: Portuguese (pt-BR); brand from DESIGN.md is fixed; no claims beyond PRODUCT.md (commits only, no work items; Hugging Face provider; optional account with history and encrypted vault).

## Direction contract

THESIS: The homepage is the eighteen minutes before the 09:30 standup. Scroll is the clock and the real app does the work on a pinned stage. It refuses the category default of headline, three feature cards and a static screenshot.

OWN-WORLD: The established Auto Daily system: canvas #F5F7F6 / #131A17, action green #176344 / mint #86D6AD, ink #192820, Geist for voice and for the display clock (tabular figures), Geist Mono for code, hashes and small time data, 8/12 px radii, 1 px borders, the Daily aberto mark. Brand green owns one full field at 09:30. Real app components are the imagery.

STORY: The visitor watches a draft write itself from commits and hours, sees the review-first contract (AI drafts, a person confirms), believes the data handling is honest, then opens the app or clones the repo.

FIRST VIEWPORT: Left 5/12: oversized tabular clock 09:12 in Geist (Geist Mono was tried and rejected: its slashed zero reads as Ø at display size and its colon leaves a wide gap; tabular Geist keeps the measured, time-as-data character), headline "Seu trabalho, bem contado.", subtext under 20 words, primary "Abrir o app" and secondary "Ver no GitHub". Right 7/12: the real ReportDocument typesetting a synthetic daily, labeled fictitious. The integrations strip begins at the fold.

FORM: Surface structure 4 of 7 ("Contagem até a daily"), dealt lead, seed key 94f18649. User delegated the choice. Signature interaction: GSAP ScrollTrigger pins the stage while the clock scrubs 09:12 to 09:30 across five steps, smoothed by Lenis; at 09:30 a green field wipes in through clip-path.

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance

## Unresolved

- Hosted public URL for the app is whatever SITE_URL configures; homepage links stay relative.
