# RI-1: Google Books Integration in Resource Service

## Description
Replace the mock `/api/books/search` endpoint with production Google Books API integration and add open-access book caching.

## Requirements
- Integrate Google Books API for commercial book metadata
- Add open-access book caching (Bonanno, Osborne, etc.)
- Support search by title, author, keyword
- Return structured book data with preview links

## Implementation Plan
1. Update `resource_service.py` to use Google Books API
2. Add open-access book data caching
3. Implement search functionality
4. Add error handling and rate limiting
5. Update response models

## Test Plan
- Unit tests for Google Books API integration
- Integration tests for search endpoints
- Performance tests for caching
- Error handling tests

## Files Modified
- `/python-services/services/resource_service.py`
- `/python-services/tests/test_resource_service.py`
- `/python-services/requirements.txt` (add google-books-api client)
