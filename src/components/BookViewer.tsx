import React, { useState } from 'react';
import { searchBooks } from '../api/resourceApi';

interface Book {
  id: string;
  title: string;
  authors: string[];
  open_access_url?: string;
  preview_url?: string;
  description: string;
  thumbnail?: string;
}

export const BookViewer: React.FC = () => {
  const [query, setQuery] = useState('');
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);

  const handleSearch = async () => {
    if (!query.trim()) return;
    
    setLoading(true);
    try {
      const results = await searchBooks(query);
      setBooks(results);
    } catch (error) {
      console.error('Failed to search books:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-4">Game Theory Books</h2>
      
      <div className="flex gap-2 mb-4">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search books..."
          className="flex-1 px-3 py-2 border rounded-lg"
          onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
        />
        <button
          onClick={handleSearch}
          disabled={loading}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"
        >
          {loading ? 'Searching...' : 'Search'}
        </button>
      </div>

      <div className="grid gap-4">
        {books.map((book) => (
          <div key={book.id} className="border rounded-lg p-4 hover:shadow-md">
            <h3 className="text-lg font-semibold">{book.title}</h3>
            <p className="text-sm text-gray-600 mb-2">{book.authors.join(', ')}</p>
            <p className="text-sm mb-3">{book.description}</p>
            
            <div className="flex gap-2">
              {book.open_access_url && (
                <a
                  href={book.open_access_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1 bg-green-500 text-white text-sm rounded hover:bg-green-600"
                >
                  Read PDF
                </a>
              )}
              <button
                onClick={() => setSelectedBook(book)}
                className="px-3 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-600"
              >
                Preview
              </button>
            </div>
          </div>
        ))}
      </div>

      {selectedBook && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl max-h-[80vh] overflow-y-auto">
            <h3 className="text-xl font-bold mb-2">{selectedBook.title}</h3>
            <p className="text-gray-600 mb-4">{selectedBook.authors.join(', ')}</p>
            <p className="mb-4">{selectedBook.description}</p>
            
            {selectedBook.open_access_url && (
              <iframe
                src={selectedBook.open_access_url}
                className="w-full h-96 border rounded"
                title={selectedBook.title}
              />
            )}
            
            <button
              onClick={() => setSelectedBook(null)}
              className="mt-4 px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
