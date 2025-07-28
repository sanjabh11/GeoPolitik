# PBI-Resource-Integration-MVP

## Overview
Slimmed-down MVP to deliver minimal resource integration: read-only metadata endpoints for books & videos, basic usage tracking, and Gambit consolidation. Scope limited to **metadata only** (no PDF mirroring or annotation).

## User Stories
- As a learner I can search and view metadata for open-access game-theory books.  
- As a learner I can search and watch curated YouTube lecture videos.  
- As a learner my resource usage is tracked so that progress is visible.

## Acceptance Criteria
1. `/api/books/search?q=keyword` returns JSON with title, author, open-access link, preview.  
2. `/api/videos/search?q=keyword` returns JSON with title, channel, embed URL.  
3. Supabase tables `books`, `videos`, `user_resource_progress` exist and track views.  
4. Single consolidated Gambit endpoint at `/gambit/*` (FastAPI) replaces Edge duplication.  
5. README / PRDs updated to reflect actual MVP scope.

## Technical Scope
- **Backend**: FastAPI micro-service `resource_service.py` (books, videos).  
- **DB Migration**: SQL files for new tables.  
- **Frontend**: React components for search + embed.  
- **Tests**: Unit tests for endpoints & React hooks.

## Out of scope (future)
- PDF streaming, annotation, commercial-book metadata, collaborative notes.
