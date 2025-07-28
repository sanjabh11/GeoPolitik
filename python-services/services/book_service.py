"""
Open-access book search & reader service
Provides book search, metadata, PDF proxy, and TOC indexing for open-access books
"""

from typing import List, Dict, Any, Optional
from pydantic import BaseModel
from fastapi import APIRouter, HTTPException, Query, Path
import aiohttp
import asyncio
import json
import logging
from datetime import datetime
import re
from urllib.parse import urljoin, urlparse
import uuid
from pathlib import Path
import os

logger = logging.getLogger(__name__)

class BookSearchRequest(BaseModel):
    query: str
    author: Optional[str] = None
    title: Optional[str] = None
    subject: Optional[str] = None
    language: Optional[str] = "en"
    limit: Optional[int] = 20
    offset: Optional[int] = 0

class BookMetadata(BaseModel):
    id: str
    title: str
    authors: List[str]
    description: Optional[str]
    publisher: Optional[str]
    published_date: Optional[str]
    isbn: Optional[str]
    pages: Optional[int]
    language: Optional[str]
    subjects: List[str]
    thumbnail_url: Optional[str]
    pdf_url: Optional[str]
    epub_url: Optional[str]
    access_type: str  # "open", "limited", "restricted"
    source: str  # "google_books", "open_library", "arxiv", "springer", etc.

class BookChapter(BaseModel):
    id: str
    title: str
    page_start: Optional[int]
    page_end: Optional[int]
    level: int  # 0 for main chapters, 1 for sub-chapters, etc.
    parent_id: Optional[str]
    children: List[str] = []

class BookTOC(BaseModel):
    book_id: str
    chapters: List[BookChapter]
    total_chapters: int
    max_depth: int

class BookReaderRequest(BaseModel):
    book_id: str
    page: Optional[int] = 1
    format: str = "pdf"  # "pdf", "epub", "html"
    zoom: Optional[float] = 1.0

class BookSearchResponse(BaseModel):
    books: List[BookMetadata]
    total: int
    query: str
    source: str
    search_time: float

class BookService:
    def __init__(self):
        self.google_books_api_key = os.getenv("GOOGLE_BOOKS_API_KEY", "")
        self.open_library_base = "https://openlibrary.org"
        self.google_books_base = "https://www.googleapis.com/books/v1"
        self.arxiv_base = "http://export.arxiv.org/api/query"
        self.springer_base = "https://link.springer.com"
        
        # Cache for book metadata
        self.book_cache: Dict[str, BookMetadata] = {}
        self.toc_cache: Dict[str, BookTOC] = {}
        
    async def search_open_library(self, query: str, limit: int = 20, offset: int = 0) -> List[BookMetadata]:
        """Search Open Library for open-access books"""
        
        url = f"{self.open_library_base}/search.json"
        params = {
            "q": query,
            "limit": limit,
            "offset": offset,
            "has_fulltext": "true"
        }
        
        async with aiohttp.ClientSession() as session:
            try:
                async with session.get(url, params=params) as response:
                    if response.status == 200:
                        data = await response.json()
                        books = []
                        
                        for doc in data.get("docs", []):
                            book = BookMetadata(
                                id=f"openlibrary_{doc.get('key', '').split('/')[-1]}",
                                title=doc.get("title", "Unknown Title"),
                                authors=doc.get("author_name", []),
                                description=doc.get("first_sentence", [None])[0],
                                publisher=doc.get("publisher", [None])[0],
                                published_date=doc.get("publish_date", [None])[0],
                                isbn=doc.get("isbn", [None])[0],
                                pages=doc.get("number_of_pages_median"),
                                language=doc.get("language", [None])[0],
                                subjects=doc.get("subject", []),
                                thumbnail_url=f"https://covers.openlibrary.org/b/id/{doc.get('cover_i')}-L.jpg" if doc.get('cover_i') else None,
                                pdf_url=None,  # Will be populated from editions
                                epub_url=None,
                                access_type="open",
                                source="open_library"
                            )
                            books.append(book)
                        
                        return books
            except Exception as e:
                logger.error(f"Open Library search error: {e}")
        
        return []

    async def search_google_books(self, query: str, limit: int = 20, offset: int = 0) -> List[BookMetadata]:
        """Search Google Books API"""
        
        if not self.google_books_api_key:
            logger.warning("Google Books API key not configured")
            return []
        
        url = f"{self.google_books_base}/volumes"
        params = {
            "q": query,
            "maxResults": limit,
            "startIndex": offset,
            "key": self.google_books_api_key
        }
        
        async with aiohttp.ClientSession() as session:
            try:
                async with session.get(url, params=params) as response:
                    if response.status == 200:
                        data = await response.json()
                        books = []
                        
                        for item in data.get("items", []):
                            volume_info = item.get("volumeInfo", {})
                            access_info = item.get("accessInfo", {})
                            
                            book = BookMetadata(
                                id=f"google_{item.get('id', '')}",
                                title=volume_info.get("title", "Unknown Title"),
                                authors=volume_info.get("authors", []),
                                description=volume_info.get("description"),
                                publisher=volume_info.get("publisher"),
                                published_date=volume_info.get("publishedDate"),
                                isbn=next((id["identifier"] for id in volume_info.get("industryIdentifiers", []) if id["type"] == "ISBN_13"), None),
                                pages=volume_info.get("pageCount"),
                                language=volume_info.get("language"),
                                subjects=volume_info.get("categories", []),
                                thumbnail_url=volume_info.get("imageLinks", {}).get("thumbnail"),
                                pdf_url=access_info.get("pdf", {}).get("acsTokenLink"),
                                epub_url=access_info.get("epub", {}).get("acsTokenLink"),
                                access_type=access_info.get("accessViewStatus", "restricted"),
                                source="google_books"
                            )
                            books.append(book)
                        
                        return books
            except Exception as e:
                logger.error(f"Google Books search error: {e}")
        
        return []

    async def search_arxiv_books(self, query: str, limit: int = 20, offset: int = 0) -> List[BookMetadata]:
        """Search arXiv for academic books and lecture notes"""
        
        url = self.arxiv_base
        params = {
            "search_query": f"all:{query}",
            "start": offset,
            "max_results": limit,
            "sortBy": "relevance",
            "sortOrder": "descending"
        }
        
        async with aiohttp.ClientSession() as session:
            try:
                async with session.get(url, params=params) as response:
                    if response.status == 200:
                        content = await response.text()
                        
                        # Parse arXiv XML response
                        import xml.etree.ElementTree as ET
                        root = ET.fromstring(content)
                        
                        books = []
                        for entry in root.findall("{http://www.w3.org/2005/Atom}entry"):
                            title = entry.find("{http://www.w3.org/2005/Atom}title").text
                            authors = [author.find("{http://www.w3.org/2005/Atom}name").text 
                                     for author in entry.findall("{http://www.w3.org/2005/Atom}author")]
                            summary = entry.find("{http://www.w3.org/2005/Atom}summary").text
                            published = entry.find("{http://www.w3.org/2005/Atom}published").text
                            pdf_url = next((link.attrib["href"] 
                                          for link in entry.findall("{http://www.w3.org/2005/Atom}link") 
                                          if link.attrib.get("title") == "pdf"), None)
                            
                            book = BookMetadata(
                                id=f"arxiv_{entry.find('{http://www.w3.org/2005/Atom}id').text.split('/')[-1]}",
                                title=title,
                                authors=authors,
                                description=summary,
                                published_date=published,
                                pdf_url=pdf_url,
                                epub_url=None,
                                access_type="open",
                                source="arxiv"
                            )
                            books.append(book)
                        
                        return books
            except Exception as e:
                logger.error(f"arXiv search error: {e}")
        
        return []

    async def generate_toc_from_pdf(self, book_id: str, pdf_url: str) -> BookTOC:
        """Generate table of contents from PDF"""
        
        # Mock TOC generation - in real implementation, use PDF parsing libraries
        chapters = [
            BookChapter(
                id=f"{book_id}_ch1",
                title="Introduction",
                page_start=1,
                page_end=10,
                level=0
            ),
            BookChapter(
                id=f"{book_id}_ch2",
                title="Game Theory Fundamentals",
                page_start=11,
                page_end=35,
                level=0
            ),
            BookChapter(
                id=f"{book_id}_ch2_1",
                title="Nash Equilibrium",
                page_start=15,
                page_end=25,
                level=1,
                parent_id=f"{book_id}_ch2"
            ),
            BookChapter(
                id=f"{book_id}_ch3",
                title="Advanced Topics",
                page_start=36,
                page_end=50,
                level=0
            )
        ]
        
        toc = BookTOC(
            book_id=book_id,
            chapters=chapters,
            total_chapters=len(chapters),
            max_depth=1
        )
        
        return toc

    async def search_books(self, request: BookSearchRequest) -> BookSearchResponse:
        """Search across all book sources"""
        
        start_time = datetime.utcnow()
        
        # Search multiple sources concurrently
        tasks = [
            self.search_open_library(request.query, request.limit, request.offset),
            self.search_google_books(request.query, request.limit, request.offset),
            self.search_arxiv_books(request.query, request.limit, request.offset)
        ]
        
        results = await asyncio.gather(*tasks, return_exceptions=True)
        
        books = []
        for result in results:
            if isinstance(result, list):
                books.extend(result)
        
        # Filter by additional criteria
        if request.author:
            books = [b for b in books if any(request.author.lower() in author.lower() for author in b.authors)]
        if request.title:
            books = [b for b in books if request.title.lower() in b.title.lower()]
        if request.subject:
            books = [b for b in books if any(request.subject.lower() in subject.lower() for subject in b.subjects)]
        
        search_time = (datetime.utcnow() - start_time).total_seconds()
        
        return BookSearchResponse(
            books=books[:request.limit],
            total=len(books),
            query=request.query,
            source="aggregated",
            search_time=search_time
        )

    async def get_book_reader_url(self, book_id: str, page: int = 1, format: str = "pdf") -> Dict[str, Any]:
        """Get reader URL for book"""
        
        # In real implementation, this would proxy PDF content
        # For now, return the direct URL
        return {
            "book_id": book_id,
            "page": page,
            "format": format,
            "reader_url": f"/api/books/{book_id}/reader?page={page}&format={format}",
            "toc_url": f"/api/books/{book_id}/toc"
        }

# FastAPI router
router = APIRouter(prefix="/api/books", tags=["books"])
service = BookService()

@router.get("/search", response_model=BookSearchResponse)
async def search_books(
    query: str = Query(..., description="Search query"),
    author: Optional[str] = Query(None, description="Author filter"),
    title: Optional[str] = Query(None, description="Title filter"),
    subject: Optional[str] = Query(None, description="Subject filter"),
    language: Optional[str] = Query("en", description="Language filter"),
    limit: int = Query(20, ge=1, le=100),
    offset: int = Query(0, ge=0)
):
    """Search for books across multiple sources"""
    
    request = BookSearchRequest(
        query=query,
        author=author,
        title=title,
        subject=subject,
        language=language,
        limit=limit,
        offset=offset
    )
    
    return await service.search_books(request)

@router.get("/{book_id}", response_model=BookMetadata)
async def get_book(book_id: str):
    """Get book metadata"""
    
    # Search for specific book
    if book_id.startswith("openlibrary_"):
        # Implementation would fetch from Open Library
        pass
    elif book_id.startswith("google_"):
        # Implementation would fetch from Google Books
        pass
    elif book_id.startswith("arxiv_"):
        # Implementation would fetch from arXiv
        pass
    
    raise HTTPException(status_code=404, detail="Book not found")

@router.get("/{book_id}/toc", response_model=BookTOC)
async def get_book_toc(book_id: str):
    """Get book table of contents"""
    
    # Mock TOC - in real implementation, parse from PDF
    toc = await service.generate_toc_from_pdf(book_id, "")
    return toc

@router.get("/{book_id}/reader")
async def get_book_reader(
    book_id: str,
    page: int = Query(1, ge=1),
    format: str = Query("pdf", regex="^(pdf|epub|html)$")
):
    """Get book reader URL"""
    
    return await service.get_book_reader_url(book_id, page, format)

@router.get("/{book_id}/pdf")
async def get_book_pdf(book_id: str):
    """Get PDF content for book"""
    
    # In real implementation, this would proxy PDF content
    return {"message": "PDF content would be served here", "book_id": book_id}

@router.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy", "timestamp": datetime.utcnow().isoformat()}
