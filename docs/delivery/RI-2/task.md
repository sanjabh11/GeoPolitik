# RI-2: Book TOC and Section Endpoints

## Description
Add `/api/books/<id>/toc` and `/api/books/<id>/section/<section_id>` endpoints for serving book table of contents and individual sections.

## Requirements
- Add TOC endpoint for book structure
- Add section endpoint for individual content serving
- Support PDF text extraction for open-access books
- Cache extracted content for performance

## Implementation Plan
1. Add new endpoints to resource service
2. Implement PDF text extraction
3. Add content caching layer
4. Create section navigation structure

## Test Plan
- Unit tests for PDF extraction
- Integration tests for section serving
- Performance tests for caching
- End-to-end tests for book navigation

## Files Modified
- `/python-services/services/resource_service.py` (new endpoints)
- `/python-services/utils/pdf_extractor.py` (new utility)
- `/python-services/requirements.txt` (add PyPDF2)
