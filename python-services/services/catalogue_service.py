"""
Catalogue Service - Commercial Book Metadata
Handles commercial book metadata with Google Books API integration
"""

from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel
from typing import List, Optional
import httpx
import os
from datetime import datetime

router = APIRouter()

# Google Books API configuration
GOOGLE_BOOKS_API_KEY = os.getenv("GOOGLE_BOOKS_API_KEY", "")
GOOGLE_BOOKS_BASE_URL = "https://www.googleapis.com/books/v1"

class CommercialBook(BaseModel):
    id: str
    title: str
    authors: List[str]
    publisher: Optional[str] = None
    published_date: Optional[str] = None
    description: str
    isbn: Optional[str] = None
    page_count: Optional[int] = None
    categories: List[str] = []
    thumbnail: Optional[str] = None
    preview_url: Optional[str] = None
    info_url: Optional[str] = None
    purchase_url: Optional[str] = None
    library_url: Optional[str] = None
    price: Optional[str] = None
    currency: Optional[str] = None

class BookSearchResponse(BaseModel):
    books: List[CommercialBook]
    total_items: int
    query: str
    page: int

@router.get("/catalogue/book/search")
async def search_commercial_books(
    q: str = Query(..., description="Search query"),
    max_results: int = Query(10, description="Maximum results to return"),
    page: int = Query(1, description="Page number"),
    order_by: str = Query("relevance", description="Sort order")
) -> BookSearchResponse:
    """Search commercial game-theory books using Google Books API."""
    
    if not GOOGLE_BOOKS_API_KEY:
        raise HTTPException(
            status_code=503,
            detail="Google Books API key not configured"
        )
    
    try:
        async with httpx.AsyncClient() as client:
            params = {
                'q': f'game theory {q}',
                'key': GOOGLE_BOOKS_API_KEY,
                'maxResults': max_results,
                'startIndex': (page - 1) * max_results,
                'orderBy': order_by
            }
            
            response = await client.get(f"{GOOGLE_BOOKS_BASE_URL}/volumes", params=params)
            
            if response.status_code != 200:
                raise HTTPException(
                    status_code=response.status_code,
                    detail="Failed to fetch books from Google Books API"
                )
            
            data = response.json()
            items = data.get('items', [])
            total_items = data.get('totalItems', 0)
            
            books = []
            for item in items:
                volume_info = item.get('volumeInfo', {})
                sale_info = item.get('saleInfo', {})
                
                # Extract ISBN
                isbn = None
                identifiers = volume_info.get('industryIdentifiers', [])
                for identifier in identifiers:
                    if identifier.get('type') in ['ISBN_13', 'ISBN_10']:
                        isbn = identifier.get('identifier')
                        break
                
                # Construct purchase URLs
                purchase_url = None
                library_url = None
                if sale_info.get('saleability') == 'FOR_SALE':
                    purchase_url = sale_info.get('buyLink')
                    # Construct WorldCat library URL
                    if isbn:
                        library_url = f"https://www.worldcat.org/isbn/{isbn}"
                
                # Extract price information
                price = None
                currency = None
                if 'listPrice' in sale_info:
                    price = sale_info['listPrice'].get('amount')
                    currency = sale_info['listPrice'].get('currencyCode')
                
                book = CommercialBook(
                    id=item.get('id', ''),
                    title=volume_info.get('title', ''),
                    authors=volume_info.get('authors', []),
                    publisher=volume_info.get('publisher'),
                    published_date=volume_info.get('publishedDate'),
                    description=volume_info.get('description', ''),
                    isbn=isbn,
                    page_count=volume_info.get('pageCount'),
                    categories=volume_info.get('categories', []),
                    thumbnail=volume_info.get('imageLinks', {}).get('thumbnail'),
                    preview_url=volume_info.get('previewLink'),
                    info_url=volume_info.get('infoLink'),
                    purchase_url=purchase_url,
                    library_url=library_url,
                    price=str(price) if price else None,
                    currency=currency
                )
                books.append(book)
            
            return BookSearchResponse(
                books=books,
                total_items=total_items,
                query=q,
                page=page
            )
            
    except httpx.RequestError as e:
        raise HTTPException(
            status_code=503,
            detail=f"Error connecting to Google Books API: {str(e)}"
        )

@router.get("/catalogue/book/{book_id}")
async def get_book_details(book_id: str) -> CommercialBook:
    """Get detailed information about a specific book."""
    
    if not GOOGLE_BOOKS_API_KEY:
        raise HTTPException(
            status_code=503,
            detail="Google Books API key not configured"
        )
    
    try:
        async with httpx.AsyncClient() as client:
            params = {'key': GOOGLE_BOOKS_API_KEY}
            response = await client.get(
                f"{GOOGLE_BOOKS_BASE_URL}/volumes/{book_id}",
                params=params
            )
            
            if response.status_code == 404:
                raise HTTPException(
                    status_code=404,
                    detail="Book not found"
                )
            
            if response.status_code != 200:
                raise HTTPException(
                    status_code=response.status_code,
                    detail="Failed to fetch book details"
                )
            
            data = response.json()
            volume_info = data.get('volumeInfo', {})
            sale_info = data.get('saleInfo', {})
            
            # Extract ISBN
            isbn = None
            identifiers = volume_info.get('industryIdentifiers', [])
            for identifier in identifiers:
                if identifier.get('type') in ['ISBN_13', 'ISBN_10']:
                    isbn = identifier.get('identifier')
                    break
            
            # Construct URLs
            purchase_url = None
            library_url = None
            if sale_info.get('saleability') == 'FOR_SALE':
                purchase_url = sale_info.get('buyLink')
                if isbn:
                    library_url = f"https://www.worldcat.org/isbn/{isbn}"
            
            # Extract price
            price = None
            currency = None
            if 'listPrice' in sale_info:
                price = sale_info['listPrice'].get('amount')
                currency = sale_info['listPrice'].get('currencyCode')
            
            return CommercialBook(
                id=data.get('id', ''),
                title=volume_info.get('title', ''),
                authors=volume_info.get('authors', []),
                publisher=volume_info.get('publisher'),
                published_date=volume_info.get('publishedDate'),
                description=volume_info.get('description', ''),
                isbn=isbn,
                page_count=volume_info.get('pageCount'),
                categories=volume_info.get('categories', []),
                thumbnail=volume_info.get('imageLinks', {}).get('thumbnail'),
                preview_url=volume_info.get('previewLink'),
                info_url=volume_info.get('infoLink'),
                purchase_url=purchase_url,
                library_url=library_url,
                price=str(price) if price else None,
                currency=currency
            )
            
    except httpx.RequestError as e:
        raise HTTPException(
            status_code=503,
            detail=f"Error connecting to Google Books API: {str(e)}"
        )
