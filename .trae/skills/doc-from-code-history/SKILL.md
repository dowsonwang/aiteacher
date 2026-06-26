---
name: "doc-from-code-history"
description: "Generates AI-readable product docs by reverse-engineering an existing demo’s code and prior discussion notes. Invoke when user asks for a product spec/doc from a built prototype."
---

# Doc From Code + History

## Purpose

Turn an existing prototype/demo (especially React/Vite SPA demos with mock data) into a product document that developers (and AI coding agents) can follow directly.

The document should describe “what the product does” (pages, modules, data concepts, interactions, states, constraints), not “how to code it” (no API design, no database tables, no framework tutorials unless explicitly requested).

## When To Invoke

Invoke when the user asks to:
- “Write a product/feature document based on the current code”
- “Reverse engineer the demo into an AI-readable PRD/spec”
- “Summarize features/logic/relationships from the repo + our prior discussion”
- “Produce a deliverable doc for developers from a prototype”

## Required Inputs

If not provided, ask for the minimum missing info:
- Output language (default: Chinese if user speaks Chinese; otherwise English)
- Document target: Demo spec only, Real-product spec only, or both
- Any modules to exclude (default: exclude Live-related content unless the user explicitly wants it)
- Output destination path(s) under `.trae/documents/`

## What To Read (Repository)

Do not guess the stack. Confirm by reading:
- Routing: `src/App.jsx` (routes, page entry points, nested routes, params, query usage)
- Layout: `src/layouts/*` (global shell, nav, topbar)
- Pages: `src/pages/*` (page responsibilities, empty states, navigation)
- Store/state: `src/stores/*` (Zustand slices, persist keys, state machines, mock billing/credits logic)
- Data: `src/data/*` (mock entities, IDs, relationships, assets)
- Components: `src/components/*` (key UI modules and their props)
- Public assets: `public/images`, `public/videos` (what’s real assets vs generated)
- Existing docs: `.trae/documents/*` (use as context; don’t duplicate inconsistently)

## What To Read (History / Discussion)

Use any available sources in priority order:
1) The user’s current conversation + provided summaries
2) Project docs under `.trae/documents/` that reflect iteration decisions
3) `git diff` / `git log` (optional) to infer recent changes

If the prior discussion is not available in the current session, ask the user to paste:
- The last “requirements summary” or
- A bullet list of key product decisions and constraints

## Output Requirements

### Document Style
- Product-first: describe behavior, not implementation steps
- Concrete: exact labels, tabs, buttons, empty states, and “what happens next”
- Page-by-page: every page described with modules and interactions
- Data/relationship clarity: IDs, entities, and how pages reference each other
- Call out “Mock vs Real”: explicitly mark which parts are demo mock logic
- Keep “Live” content excluded by default unless user explicitly requests it

### Structure (Recommended)

1) **Product Overview**
   - What the demo is
   - Core user value
   - What is intentionally mocked

2) **Information Architecture**
   - Top-level navigation
   - Route map (path → purpose)

3) **Core Concepts & Data**
   - Entities (Character, Conversation, Message, Shorts, Subscription, Diamonds/Credits, Favorites, Worldbook, etc.)
   - Key relationships (e.g., Conversation → Character; Message → Attachments)
   - Persisted state scope (what survives refresh)

4) **Page-by-Page Specification**
   For each page:
   - Purpose
   - Entry points (how user gets here)
   - Modules/sections on the page
   - Display rules (what shows/hides)
   - Interactions (click/hover/tabs/modals)
   - Empty states and error states
   - Key copy (user-facing text)

5) **Key User Flows**
   - Onboarding/login gate
   - Start a chat → conversation creation → messaging loop
   - Request image/video flow (user request → AI reply)
   - Favorites gate flow
   - Subscription management flow (if present)
   - Shorts viewing flow

6) **Demo → Real Product Notes (Optional)**
   - What should become server-backed
   - What should become account-scoped
   - What needs abuse/safety constraints (especially SFW boundaries)
   - What should be analytics/tracking points (only as product events, not implementation)

### Deliverables

Write to one or two Markdown files under `.trae/documents/` (pick based on the user’s request):
- `产品功能文档-<ProductName>-Demo.md`
- `产品功能文档-<ProductName>-真实产品版.md`

## Quality Checklist (Before Final Output)

- Every route/page is covered and consistent with current code
- Every “gate” (login, empty state) is described
- Every credit/quota rule is described in plain language
- Recent UI/behavior changes from discussion are reflected
- No implementation instructions about APIs/DB unless explicitly requested
- No Live content unless explicitly requested

## Example Invocation Prompt (Use Internally)

“Read the current repo, then produce a page-by-page product doc describing features, data concepts, and user flows. Use our prior discussion constraints. Mark what’s mocked. Exclude Live content unless requested. Output Markdown under `.trae/documents/`.”

