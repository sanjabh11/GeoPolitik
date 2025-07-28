import React, { useState, useEffect, useRef } from 'react';
import { useVideoProgress } from '../hooks/useVideoProgress';
import { videoService } from '../services/videoService';

interface VideoPlayerProps {
  videoId: string;
  playlistId?: string;
  className?: string;
}

interface Chapter {
  id: string;
  title: string;
  startTime: number;
  endTime?: number;
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({ 
  videoId, 
  playlistId, 
  className 
}) => {
  const [video, setVideo] = useState<any>(null);
  const [playlist, setPlaylist] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [currentChapter, setCurrentChapter] = useState<Chapter | null>(null);
  
  const { progress, updateProgress } = useVideoProgress(videoId);
  const playerRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    loadVideoContent();
  }, [videoId, playlistId]);

  const loadVideoContent = async () => {
    try {
      setLoading(true);
      
      // Load video details
      const videoData = await videoService.getVideo(videoId);
      setVideo(videoData);
      
      // Load playlist if provided
      if (playlistId) {
        const playlistData = await videoService.getPlaylist(playlistId);
        setPlaylist(playlistData);
      }
      
      // Generate chapters based on description or transcript
      const generatedChapters = generateChapters(videoData?.description || '');
      setChapters(generatedChapters);
      
      setLoading(false);
    } catch (error) {
      console.error('Error loading video content:', error);
      setLoading(false);
    }
  };

  const generateChapters = (description: string): Chapter[] => {
    // Simple chapter generation based on timestamps in description
    const chapters: Chapter[] = [];
    const timestampRegex = /(\d{1,2}):(\d{2})/g;
    const matches = Array.from(description.matchAll(timestampRegex));
    
    matches.forEach((match, index) => {
      const minutes = parseInt(match[1]);
      const seconds = parseInt(match[2]);
      const startTime = minutes * 60 + seconds;
      
      chapters.push({
        id: `chapter-${index}`,
        title: `Chapter ${index + 1}`,
        startTime: startTime,
        endTime: index < matches.length - 1 ? 
          (parseInt(matches[index + 1][1]) * 60 + parseInt(matches[index + 1][2])) : 
          undefined
      });
    });
    
    return chapters;
  };

  const handlePlayerMessage = (event: MessageEvent) => {
    if (event.data.event === 'onStateChange') {
      setIsPlaying(event.data.info === 1);
    }
    
    if (event.data.event === 'onProgress') {
      const { currentTime, duration } = event.data;
      setCurrentTime(currentTime);
      setDuration(duration);
      updateProgress(Math.round((currentTime / duration) * 100));
      
      // Update current chapter
      const chapter = chapters.find(ch => 
        currentTime >= ch.startTime && 
        (!ch.endTime || currentTime < ch.endTime)
      );
      setCurrentChapter(chapter || null);
    }
  };

  useEffect(() => {
    window.addEventListener('message', handlePlayerMessage);
    return () => window.removeEventListener('message', handlePlayerMessage);
  }, [chapters]);

  const seekToChapter = (chapter: Chapter) => {
    if (playerRef.current) {
      playerRef.current.contentWindow?.postMessage({
        event: 'command',
        func: 'seekTo',
        args: [chapter.startTime]
      }, '*');
    }
  };

  const renderPlayer = () => {
    if (loading) return <div className="text-center p-8">Loading...</div>;
    if (!video) return <div className="text-center p-8">Video not found</div>;
    
    return (
      <div className="relative w-full">
        <iframe
          ref={playerRef}
          src={`https://www.youtube.com/embed/${videoId}?enablejsapi=1&origin=${window.location.origin}`}
          className="w-full aspect-video rounded-lg"
          allowFullScreen
        />
      </div>
    );
  };

  const renderPlaylist = () => {
    if (!playlist || playlist.length === 0) return null;
    
    return (
      <div className="w-80 bg-gray-50 border-l border-gray-200 p-4 overflow-y-auto">
        <h3 className="font-semibold mb-4">Playlist</h3>
        {playlist.map((video, index) => (
          <div
            key={video.id}
            className="mb-3 p-3 bg-white rounded shadow cursor-pointer hover:bg-gray-100"
            onClick={() => window.location.href = `/video/${video.id}`}
          >
            <img
              src={video.thumbnail}
              alt={video.title}
              className="w-full aspect-video rounded mb-2"
            />
            <h4 className="text-sm font-medium">{video.title}</h4>
            <p className="text-xs text-gray-600">{video.channel}</p>
          </div>
        ))}
      </div>
    );
  };

  const renderChapters = () => {
    if (chapters.length === 0) return null;
    
    return (
      <div className="w-64 bg-gray-50 border-r border-gray-200 p-4 overflow-y-auto">
        <h3 className="font-semibold mb-4">Chapters</h3>
        {chapters.map((chapter) => (
          <button
            key={chapter.id}
            onClick={() => seekToChapter(chapter)}
            className={`block w-full text-left p-2 mb-1 rounded text-sm ${
              currentChapter?.id === chapter.id
                ? 'bg-blue-500 text-white'
                : 'hover:bg-gray-100'
            }`}
          >
            <div className="font-medium">{chapter.title}</div>
            <div className="text-xs opacity-75">
              {Math.floor(chapter.startTime / 60)}:{(chapter.startTime % 60).toString().padStart(2, '0')}
            </div>
          </button>
        ))}
      </div>
    );
  };

  return (
    <div className={`flex h-screen ${className}`}>
      {renderChapters()}
      
      <div className="flex-1 flex flex-col">
        <div className="flex-1 overflow-hidden">
          {renderPlayer()}
        </div>
        
        <div className="p-4 bg-white border-t border-gray-200">
          <div className="mb-2">
            <h2 className="text-xl font-semibold">{video?.title}</h2>
            <p className="text-gray-600">{video?.channel}</p>
          </div>
          
          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-600">
              Progress: {progress}%
            </div>
            <div className="text-sm text-gray-600">
              {Math.floor(currentTime / 60)}:{(currentTime % 60).toString().padStart(2, '0')} / 
              {Math.floor(duration / 60)}:{(duration % 60).toString().padStart(2, '0')}
            </div>
          </div>
        </div>
      </div>
      
      {playlistId && renderPlaylist()}
    </div>
  );
};
