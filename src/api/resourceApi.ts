import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8001';

export interface Book {
  id: string;
  title: string;
  authors: string[];
  open_access_url?: string;
  preview_url?: string;
  description: string;
  thumbnail?: string;
}

export interface Video {
  id: string;
  title: string;
  channel: string;
  embed_url: string;
  description: string;
  thumbnail: string;
}

export const searchBooks = async (query: string): Promise<Book[]> => {
  try {
    const response = await axios.get(`${API_BASE_URL}/api/books/search`, {
      params: { q: query }
    });
    return response.data;
  } catch (error) {
    console.error('Error searching books:', error);
    throw error;
  }
};

export const searchVideos = async (query: string): Promise<Video[]> => {
  try {
    const response = await axios.get(`${API_BASE_URL}/api/videos/search`, {
      params: { q: query }
    });
    return response.data;
  } catch (error) {
    console.error('Error searching videos:', error);
    throw error;
  }
};
