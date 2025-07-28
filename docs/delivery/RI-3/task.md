# RI-3: Commercial Book Metadata Service

## Description
Create a new catalogue service for commercial book metadata with proper Google Books API integration.

## Requirements
- New `/api/catalogue/book/search` endpoint
- Separate service for commercial book metadata
- Return structured metadata with purchase links
- Handle copyright restrictions appropriately

## Implementation Plan
1. Create new catalogue_service.py
2. Implement Google Books API integration
3. Add proper metadata formatting
4. Add purchase/library links

## Test Plan
- Unit tests for metadata retrieval
- Integration tests with Google Books API
- Tests for copyright compliance
- Performance tests for large result sets

## Files Modified
- `/python-services/services/catalogue_service.py` (new file)
- `/python-services/main.py` (add router)
- `/python-services/tests/test_catalogue_service.py` (new file)
