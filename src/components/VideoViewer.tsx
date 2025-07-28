import React, { useState } from 'react';
import { searchVideos } from '../api/resourceApi';

interface Video {
  id: string;
  title: string;
  channel: string;
  embed_url: string;
  description: string;
  thumbnail: string;
}

export const VideoViewer: React.FC = () => {
  const [query, setQuery] = useState('');
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);

  const handleSearch = async () => {
    if (!query.trim()) return;
    
    setLoading(true);
    try {
      const results = await searchVideos(query);
      setVideos(results);
    } catch (error) {
      console.error('Failed to search videos:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-4">Game Theory Videos</h2>
      
      <div className="flex gap-2 mb-4">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search videos..."
          className="flex-1 px-3 py-2 border rounded-lg"
          onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
        />
        <button
          onClick={handleSearch}
          disabled={loading}
          className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:opacity-50"
        >
          {loading ? 'Searching...' : 'Search'}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {videos.map((video) => (
          <div key={video.id} className="border rounded-lg overflow-hidden hover:shadow-md">
            <img
              src={video.thumbnail}
              alt={video.title}
              className="w-full h-48 object-cover"
            />
            <div className="p-4">
              <h3 className="text-lg font-semibold mb-1">{video.title}</h3>
              <p className="text-sm text-gray-600 mb-2">{video.channel}</p>
              <p className="text-sm mb-3">{video.description}</p>
              
              <button
                onClick={() => setSelectedVideo(video)}
                className="px-3 py-1 bg-red-500 text-white text-sm rounded hover:bg-red-600"
              >
                Watch
              </button>
            </div>
          </div>
        ))}
      </div>

      {selectedVideo && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-4xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold mb-4">{selectedVideo.title}</h3>
            
            <div className="aspect-video mb-4">
              <iframe
                src={selectedVideo.embed_url}
                className="w-full h-full rounded"
                title={selectedVideo.title}
                allowFullScreen
              />
            </div>
            
            <p className="text-gray-600 mb-4">{selectedVideo.description}</p>
            
            <button
              onClick={() => setSelectedVideo(null)}
              className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
