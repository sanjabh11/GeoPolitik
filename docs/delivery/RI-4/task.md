# RI-4: YouTube Data API Integration

## Description
Replace mock video endpoints with production YouTube Data API integration and add playlist support.

## Requirements
- Replace mock `/api/videos/search` with YouTube Data API
- Add `/api/videos/playlist/<id>` endpoint
- Support playlist fetching and embedding
- Add proper error handling and rate limiting

## Implementation Plan
1. Update video service with YouTube Data API
2. Add playlist endpoint
3. Add caching for performance
4. Add proper error handling

## Test Plan
- Unit tests for YouTube API integration
- Integration tests for playlist fetching
- Performance tests with caching
- Error handling tests

## Files Modified
- `/python-services/services/resource_service.py` (update video endpoints)
- `/python-services/utils/youtube_client.py` (new utility)
- `/python-services/requirements.txt` (add google-api-python-client)
