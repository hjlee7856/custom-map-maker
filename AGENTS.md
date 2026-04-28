# AGENTS.md

## Language
- Always answer in Korean.

## Encoding
- All text files must be saved as UTF-8.
- When editing files that contain Korean text, verify the file renders correctly after the change.
- If Korean text appears broken in terminal output, re-read the file with explicit UTF-8 before editing.
- Prefer replacing corrupted strings immediately rather than preserving broken text.

## Purpose
- Reduce unnecessary changes
- Maintain consistency
- Ensure correctness through verification
- Prefer simplicity over cleverness

## Core Rules
- Implement only what was requested.
- Modify only what is required.
- Match existing style.
- Verify every change with a runnable outcome when possible.

<!-- BEGIN:nextjs-agent-rules -->

# Next.js: ALWAYS read docs before coding

Before any Next.js work, find and read the relevant doc in `node_modules/next/dist/docs/`. Your training data is outdated — the docs are the source of truth.

<!-- END:nextjs-agent-rules -->