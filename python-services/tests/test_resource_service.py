"""
Unit tests for resource service endpoints
"""

import pytest
from fastapi.testclient import TestClient
from main import app

client = TestClient(app)

class TestResourceEndpoints:
    
    def test_search_books(self):
        """Test book search endpoint"""
        response = client.get("/api/books/search?q=game")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        assert len(data) > 0
        assert "title" in data[0]
        assert "authors" in data[0]
        assert "description" in data[0]
    
    def test_search_books_empty_query(self):
        """Test book search with empty query"""
        response = client.get("/api/books/search?q=")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
    
    def test_search_videos(self):
        """Test video search endpoint"""
        response = client.get("/api/videos/search?q=nash")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        assert len(data) > 0
        assert "title" in data[0]
        assert "channel" in data[0]
        assert "embed_url" in data[0]
    
    def test_search_videos_empty_query(self):
        """Test video search with empty query"""
        response = client.get("/api/videos/search?q=")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
    
    def test_book_search_specific_query(self):
        """Test book search with specific query"""
        response = client.get("/api/books/search?q=binmore")
        assert response.status_code == 200
        data = response.json()
        # Should return Binmore's book
        titles = [book["title"] for book in data]
        assert any("Game Theory" in title for title in titles)
    
    def test_video_search_specific_query(self):
        """Test video search with specific query"""
        response = client.get("/api/videos/search?q=yale")
        assert response.status_code == 200
        data = response.json()
        # Should return Yale lecture
        channels = [video["channel"] for video in data]
        assert any("Yale" in channel for channel in channels)

if __name__ == "__main__":
    pytest.main([__file__, "-v"])
