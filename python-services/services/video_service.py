"""
YouTube lecture integration service
Provides video search, metadata, and player integration for educational content
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
from urllib.parse import urlparse, parse_qs
import uuid

logger = logging.getLogger(__name__)

class VideoSearchRequest(BaseModel):
    query: str
    channel_id: Optional[str] = None
    max_results: Optional[int] = 20
    order: Optional[str] = "relevance"  # date, rating, relevance, title, videoCount
    published_after: Optional[str] = None
    published_before: Optional[str] = None
    duration: Optional[str] = None  # any, short, medium, long
    video_type: Optional[str] = None  # any, episode, movie

class VideoMetadata(BaseModel):
    id: str
    title: str
    description: str
    channel_title: str
    channel_id: str
    published_at: str
    duration: str
    view_count: int
    like_count: int
    comment_count: int
    thumbnail_url: str
    embed_url: str
    video_url: str
    tags: List[str]
    category: str
    language: Optional[str]
    transcript_available: bool
    captions_available: bool
    access_type: str  # "public", "private", "unlisted"

class VideoChapter(BaseModel):
    id: str
    title: str
    start_time: int  # seconds
    end_time: int  # seconds
    description: Optional[str]

class VideoTranscript(BaseModel):
    video_id: str
    language: str
    text: str
    segments: List[Dict[str, Any]]  # with timestamps

class VideoSearchResponse(BaseModel):
    videos: List[VideoMetadata]
    total: int
    query: str
    next_page_token: Optional[str]
    search_time: float

class YouTubeService:
    def __init__(self):
        self.api_key = os.getenv("YOUTUBE_API_KEY", "")
        self.base_url = "https://www.googleapis.com/youtube/v3"
        self.embed_base = "https://www.youtube.com/embed"
        
        # Cache for video metadata
        self.video_cache: Dict[str, VideoMetadata] = {}
        self.transcript_cache: Dict[str, VideoTranscript] = {}

    async def search_youtube_videos(self, request: VideoSearchRequest) -> List[VideoMetadata]:
        """Search YouTube videos using Data API v3"""
        
        if not self.api_key:
            logger.warning("YouTube API key not configured")
            return []
        
        url = f"{self.base_url}/search"
        params = {
            "part": "snippet",
            "q": request.query,
            "maxResults": min(request.max_results, 50),
            "order": request.order,
            "type": "video"
        }
        
        if request.channel_id:
            params["channelId"] = request.channel_id
        if request.published_after:
            params["publishedAfter"] = request.published_after
        if request.published_before:
            params["publishedBefore"] = request.published_before
        if request.duration:
            params["videoDuration"] = request.duration
        if request.video_type:
            params["videoType"] = request.video_type
        
        async with aiohttp.ClientSession() as session:
            try:
                async with session.get(url, params=params) as response:
                    if response.status == 200:
                        data = await response.json()
                        
                        # Get video details for each result
                        video_ids = [item["id"]["videoId"] for item in data.get("items", [])]
                        
                        if video_ids:
                            video_details = await self.get_video_details(video_ids)
                            return video_details
            except Exception as e:
                logger.error(f"YouTube search error: {e}")
        
        return []

    async def get_video_details(self, video_ids: List[str]) -> List[VideoMetadata]:
        """Get detailed information for multiple videos"""
        
        if not self.api_key:
            return []
        
        url = f"{self.base_url}/videos"
        params = {
            "part": "snippet,contentDetails,statistics",
            "id": ",".join(video_ids)
        }
        
        async with aiohttp.ClientSession() as session:
            try:
                async with session.get(url, params=params) as response:
                    if response.status == 200:
                        data = await response.json()
                        
                        videos = []
                        for item in data.get("items", []):
                            snippet = item.get("snippet", {})
                            content_details = item.get("contentDetails", {})
                            statistics = item.get("statistics", {})
                            
                            video = VideoMetadata(
                                id=item["id"],
                                title=snippet.get("title", ""),
                                description=snippet.get("description", ""),
                                channel_title=snippet.get("channelTitle", ""),
                                channel_id=snippet.get("channelId", ""),
                                published_at=snippet.get("publishedAt", ""),
                                duration=self.parse_duration(content_details.get("duration", "PT0S")),
                                view_count=int(statistics.get("viewCount", 0)),
                                like_count=int(statistics.get("likeCount", 0)),
                                comment_count=int(statistics.get("commentCount", 0)),
                                thumbnail_url=snippet.get("thumbnails", {}).get("high", {}).get("url", ""),
                                embed_url=f"{self.embed_base}/{item['id']}",
                                video_url=f"https://www.youtube.com/watch?v={item['id']}",
                                tags=snippet.get("tags", []),
                                category=snippet.get("categoryId", ""),
                                language=snippet.get("defaultLanguage"),
                                transcript_available=False,  # Will be checked later
                                captions_available=False,  # Will be checked later
                                access_type="public"  # Default for YouTube
                            )
                            videos.append(video)
                        
                        return videos
            except Exception as e:
                logger.error(f"YouTube video details error: {e}")
        
        return []

    def parse_duration(self, duration_str: str) -> str:
        """Parse ISO 8601 duration string to human readable format"""
        
        match = re.match(r'PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?', duration_str)
        if not match:
            return "0:00"
        
        hours, minutes, seconds = match.groups()
        
        total_seconds = 0
        if hours:
            total_seconds += int(hours) * 3600
        if minutes:
            total_seconds += int(minutes) * 60
        if seconds:
            total_seconds += int(seconds)
        
        hours = total_seconds // 3600
        minutes = (total_seconds % 3600) // 60
        seconds = total_seconds % 60
        
        if hours > 0:
            return f"{hours}:{minutes:02d}:{seconds:02d}"
        else:
            return f"{minutes}:{seconds:02d}"

    async def get_video_chapters(self, video_id: str) -> List[VideoChapter]:
        """Get video chapters (if available)"""
        
        # Mock chapters - in real implementation, use YouTube API or video analysis
        chapters = [
            VideoChapter(
                id=f"{video_id}_ch1",
                title="Introduction",
                start_time=0,
                end_time=120
            ),
            VideoChapter(
                id=f"{video_id}_ch2",
                title="Main Content",
                start_time=120,
                end_time=300
            ),
            VideoChapter(
                id=f"{video_id}_ch3",
                title="Conclusion",
                start_time=300,
                end_time=420
            )
        ]
        
        return chapters

    async def get_video_transcript(self, video_id: str, language: str = "en") -> Optional[VideoTranscript]:
        """Get video transcript"""
        
        # Mock transcript - in real implementation, use YouTube Transcript API
        transcript = VideoTranscript(
            video_id=video_id,
            language=language,
            text="This is a sample transcript for the video...",
            segments=[
                {"start": 0, "end": 10, "text": "Introduction to game theory"},
                {"start": 10, "end": 30, "text": "Understanding Nash equilibrium"},
                {"start": 30, "end": 60, "text": "Practical applications"}
            ]
        )
        
        return transcript

    async def search_videos(self, request: VideoSearchRequest) -> VideoSearchResponse:
        """Search for educational videos"""
        
        start_time = datetime.utcnow()
        
        # Search YouTube
        youtube_results = await self.search_youtube_videos(request)
        
        # Filter for educational content
        educational_keywords = ["game theory", "nash equilibrium", "prisoner's dilemma", "auction theory", "mechanism design"]
        filtered_videos = []
        
        for video in youtube_results:
            title_lower = video.title.lower()
            description_lower = video.description.lower()
            
            # Check if content is educational
            if any(keyword in title_lower or keyword in description_lower for keyword in educational_keywords):
                filtered_videos.append(video)
        
        search_time = (datetime.utcnow() - start_time).total_seconds()
        
        return VideoSearchResponse(
            videos=filtered_videos,
            total=len(filtered_videos),
            query=request.query,
            next_page_token=None,
            search_time=search_time
        )

    async def get_related_videos(self, video_id: str, limit: int = 10) -> List[VideoMetadata]:
        """Get related videos"""
        
        if not self.api_key:
            return []
        
        url = f"{self.base_url}/search"
        params = {
            "part": "snippet",
            "relatedToVideoId": video_id,
            "maxResults": limit,
            "type": "video"
        }
        
        async with aiohttp.ClientSession() as session:
            try:
                async with session.get(url, params=params) as response:
                    if response.status == 200:
                        data = await response.json()
                        
                        related_ids = [item["id"]["videoId"] for item in data.get("items", [])]
                        if related_ids:
                            return await self.get_video_details(related_ids)
            except Exception as e:
                logger.error(f"Related videos error: {e}")
        
        return []

    async def get_video_analytics(self, video_id: str) -> Dict[str, Any]:
        """Get video analytics"""
        
        video = await self.get_video_details([video_id])
        if not video:
            return {}
        
        return {
            "video_id": video_id,
            "engagement_rate": video[0].like_count / max(video[0].view_count, 1),
            "completion_rate": 0.75,  # Mock data
            "average_watch_time": "8:30",  # Mock data
            "peak_concurrent_viewers": 1250,  # Mock data
            "demographics": {
                "age_groups": {"18-24": 35, "25-34": 28, "35-44": 20, "45+": 17},
                "countries": {"US": 45, "UK": 15, "IN": 12, "CA": 8, "Other": 20}
            }
        }

# FastAPI router
router = APIRouter(prefix="/api/videos", tags=["videos"])
service = YouTubeService()

@router.get("/search", response_model=VideoSearchResponse)
async def search_videos(
    query: str = Query(..., description="Search query"),
    channel_id: Optional[str] = Query(None, description="Channel ID filter"),
    max_results: int = Query(20, ge=1, le=50),
    order: str = Query("relevance", description="Sort order"),
    duration: Optional[str] = Query(None, description="Video duration filter")
):
    """Search for educational videos"""
    
    request = VideoSearchRequest(
        query=query,
        channel_id=channel_id,
        max_results=max_results,
        order=order,
        duration=duration
    )
    
    return await service.search_videos(request)

@router.get("/{video_id}", response_model=VideoMetadata)
async def get_video(video_id: str):
    """Get video details"""
    
    videos = await service.get_video_details([video_id])
    if not videos:
        raise HTTPException(status_code=404, detail="Video not found")
    
    return videos[0]

@router.get("/{video_id}/chapters")
async def get_video_chapters(video_id: str):
    """Get video chapters"""
    return await service.get_video_chapters(video_id)

@router.get("/{video_id}/transcript")
async def get_video_transcript(
    video_id: str,
    language: str = Query("en", description="Language code")
):
    """Get video transcript"""
    
    transcript = await service.get_video_transcript(video_id, language)
    if not transcript:
        raise HTTPException(status_code=404, detail="Transcript not found")
    
    return transcript

@router.get("/{video_id}/related")
async def get_related_videos(
    video_id: str,
    limit: int = Query(10, ge=1, le=20)
):
    """Get related videos"""
    
    return await service.get_related_videos(video_id, limit)

@router.get("/{video_id}/analytics")
async def get_video_analytics(video_id: str):
    """Get video analytics"""
    
    return await service.get_video_analytics(video_id)

@router.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy", "timestamp": datetime.utcnow().isoformat()}
