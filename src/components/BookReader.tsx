import React, { useState, useEffect, useRef } from 'react';
import { useReadingProgress } from '../hooks/useReadingProgress';
import { bookService } from '../services/bookService';

interface BookReaderProps {
  bookId: string;
  sectionId?: string;
  className?: string;
}

interface Annotation {
  id: string;
  text: string;
  note: string;
  color: string;
  position: { start: number; end: number };
}

interface Bookmark {
  id: string;
  title: string;
  page: number;
  position: number;
}

export const BookReader: React.FC<BookReaderProps> = ({ 
  bookId, 
  sectionId = 'ch1', 
  className 
}) => {
  const [content, setContent] = useState<string>('');
  const [toc, setToc] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [annotations, setAnnotations] = useState<Annotation[]>([]);
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [selectedText, setSelectedText] = useState('');
  const [showAnnotationDialog, setShowAnnotationDialog] = useState(false);
  const [annotationNote, setAnnotationNote] = useState('');
  
  const { progress, updateProgress } = useReadingProgress(bookId);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadBookContent();
  }, [bookId, sectionId]);

  const loadBookContent = async () => {
    try {
      setLoading(true);
      const [contentData, tocData] = await Promise.all([
        bookService.getSection(bookId, sectionId),
        bookService.getToc(bookId)
      ]);
      
      setContent(contentData.content || '');
      setToc(tocData);
      setLoading(false);
    } catch (error) {
      console.error('Error loading book content:', error);
      setLoading(false);
    }
  };

  const handleTextSelection = () => {
    const selection = window.getSelection();
    if (selection && selection.toString().trim()) {
      setSelectedText(selection.toString());
      setShowAnnotationDialog(true);
    }
  };

  const addAnnotation = () => {
    if (selectedText && annotationNote) {
      const newAnnotation: Annotation = {
        id: Date.now().toString(),
        text: selectedText,
        note: annotationNote,
        color: '#ffeb3b',
        position: { start: 0, end: selectedText.length }
      };
      
      setAnnotations([...annotations, newAnnotation]);
      setSelectedText('');
      setAnnotationNote('');
      setShowAnnotationDialog(false);
    }
  };

  const addBookmark = (title: string, position: number) => {
    const newBookmark: Bookmark = {
      id: Date.now().toString(),
      title,
      page: 1,
      position
    };
    
    setBookmarks([...bookmarks, newBookmark]);
  };

  const handleScroll = () => {
    if (contentRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = contentRef.current;
      const progress = Math.round((scrollTop / (scrollHeight - clientHeight)) * 100);
      updateProgress(progress);
    }
  };

  const renderContent = () => {
    if (loading) return <div className="text-center p-8">Loading...</div>;
    if (!content) return <div className="text-center p-8">Content not found</div>;
    
    return (
      <div 
        ref={contentRef}
        className="prose prose-lg max-w-none p-6 bg-white rounded-lg shadow-lg"
        onScroll={handleScroll}
        onMouseUp={handleTextSelection}
      >
        <div 
          dangerouslySetInnerHTML={{ __html: content }}
          className="leading-relaxed"
        />
      </div>
    );
  };

  return (
    <div className={`flex h-screen ${className}`}>
      {/* Sidebar */}
      <div className="w-64 bg-gray-50 border-r border-gray-200 p-4 overflow-y-auto">
        <h3 className="font-semibold mb-4">Table of Contents</h3>
        {toc?.chapters?.map((chapter: any) => (
          <button
            key={chapter.id}
            onClick={() => bookService.getSection(bookId, chapter.id)}
            className="block w-full text-left p-2 mb-1 rounded hover:bg-gray-100 text-sm"
          >
            {chapter.title}
          </button>
        ))}
        
        <h4 className="font-semibold mt-6 mb-2">Bookmarks</h4>
        {bookmarks.map(bookmark => (
          <div key={bookmark.id} className="text-sm p-2 bg-blue-50 rounded mb-1">
            {bookmark.title}
          </div>
        ))}
        
        <h4 className="font-semibold mt-6 mb-2">Annotations</h4>
        {annotations.map(annotation => (
          <div key={annotation.id} className="text-sm p-2 bg-yellow-50 rounded mb-1">
            {annotation.text.substring(0, 30)}...
          </div>
        ))}
      </div>
      
      {/* Main Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto p-6">
          <div className="mb-4 flex justify-between items-center">
            <h1 className="text-2xl font-bold">{toc?.title || 'Book Reader'}</h1>
            <div className="text-sm text-gray-600">
              Progress: {progress}%
            </div>
          </div>
          
          {renderContent()}
        </div>
      </div>
      
      {/* Annotation Dialog */}
      {showAnnotationDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-md">
            <h3 className="text-lg font-semibold mb-2">Add Annotation</h3>
            <p className="text-sm text-gray-600 mb-4">{selectedText}</p>
            <textarea
              value={annotationNote}
              onChange={(e) => setAnnotationNote(e.target.value)}
              className="w-full p-2 border rounded mb-4"
              placeholder="Add your note..."
              rows={3}
            />
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setShowAnnotationDialog(false)}
                className="px-4 py-2 text-gray-600"
              >
                Cancel
              </button>
              <button
                onClick={addAnnotation}
                className="px-4 py-2 bg-blue-500 text-white rounded"
              >
                Add
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
