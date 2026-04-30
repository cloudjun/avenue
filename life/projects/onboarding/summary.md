# Onboarding Project Summary

## Goal
Build the #1 AI note-taking app that becomes your 2nd human brain.

## Status
- Core AI pipeline (AVE-4), Note ingestion pipeline (AVE-3), and Functional UI (AVE-13) are all completed and committed.
- Emergency auth fallback (username-only guest mode) implemented via AVE-41 and delegated for production deployment via AVE-42.
- The project is undergoing final production deployment of the fallback.

## Key Components
- `apps/api`: Backend service with AI processing and hybrid search.
- `apps/web`: Frontend Next.js application with functional UI and API proxies.
- `packages/ai`: AI logic (chunking, embedding, tagging).
- `packages/db`: Database schema with pgvector support.
