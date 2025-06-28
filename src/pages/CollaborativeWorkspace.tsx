import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, 
  MessageSquare, 
  FileText, 
  Share2, 
  Edit, 
  Clock,
  Save,
  Plus,
  Trash,
  Download,
  Lock,
  Unlock,
  UserPlus,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { useAuth } from '../components/AuthProvider';
import { useToast } from '../hooks/useToast';
import { supabase } from '../lib/supabase';

interface Document {
  id: string;
  title: string;
  content: string;
  created_at: string;
  updated_at: string;
  owner_id: string;
  shared_with: string[];
  version: number;
  locked: boolean;
}

interface Comment {
  id: string;
  document_id: string;
  user_id: string;
  user_name: string;
  content: string;
  created_at: string;
  position?: { x: number; y: number };
}

export default function CollaborativeWorkspace() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [documentContent, setDocumentContent] = useState('');
  const [documentTitle, setDocumentTitle] = useState('');
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [collaborators, setCollaborators] = useState<string[]>([]);
  const [newCollaborator, setNewCollaborator] = useState('');
  
  const { user } = useAuth();
  const { showToast } = useToast();

  useEffect(() => {
    if (user) {
      loadDocuments();
    }
  }, [user]);

  const loadDocuments = async () => {
    setLoading(true);
    try {
      // In a real implementation, this would fetch from Supabase
      // For demo purposes, we'll use mock data
      const mockDocuments: Document[] = [
        {
          id: '1',
          title: 'Eastern Europe Analysis',
          content: 'This document contains a comprehensive analysis of the geopolitical situation in Eastern Europe, focusing on military tensions, economic sanctions, and diplomatic relations.',
          created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
          updated_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          owner_id: user?.id || '',
          shared_with: ['user2@example.com', 'user3@example.com'],
          version: 3,
          locked: false
        },
        {
          id: '2',
          title: 'Trade War Scenario',
          content: 'Analysis of potential trade war scenarios between major economic powers, including game theory modeling of strategic responses and economic impact assessment.',
          created_at: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
          updated_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
          owner_id: user?.id || '',
          shared_with: ['user4@example.com'],
          version: 2,
          locked: true
        }
      ];
      
      setDocuments(mockDocuments);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load documents';
      setError(errorMessage);
      showToast('error', 'Load Failed', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const selectDocument = (document: Document) => {
    setSelectedDocument(document);
    setDocumentContent(document.content);
    setDocumentTitle(document.title);
    setEditMode(false);
    loadComments(document.id);
    setCollaborators(document.shared_with);
  };

  const loadComments = async (documentId: string) => {
    // In a real implementation, this would fetch from Supabase
    // For demo purposes, we'll use mock data
    const mockComments: Comment[] = [
      {
        id: '1',
        document_id: documentId,
        user_id: 'user2',
        user_name: 'Jane Analyst',
        content: 'We should consider adding more economic factors to this analysis.',
        created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: '2',
        document_id: documentId,
        user_id: 'user3',
        user_name: 'Mark Researcher',
        content: 'The military assessment seems accurate based on recent intelligence.',
        created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
      }
    ];
    
    setComments(mockComments);
  };

  const createNewDocument = () => {
    const newDoc: Document = {
      id: Date.now().toString(),
      title: 'New Document',
      content: '',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      owner_id: user?.id || '',
      shared_with: [],
      version: 1,
      locked: false
    };
    
    setDocuments([newDoc, ...documents]);
    selectDocument(newDoc);
    setEditMode(true);
    showToast('success', 'Document Created', 'New document ready for editing');
  };

  const saveDocument = async () => {
    if (!selectedDocument) return;
    
    setLoading(true);
    try {
      // In a real implementation, this would save to Supabase
      const updatedDoc = {
        ...selectedDocument,
        title: documentTitle,
        content: documentContent,
        updated_at: new Date().toISOString(),
        version: selectedDocument.version + 1
      };
      
      setDocuments(docs => docs.map(doc => 
        doc.id === updatedDoc.id ? updatedDoc : doc
      ));
      
      setSelectedDocument(updatedDoc);
      setEditMode(false);
      showToast('success', 'Document Saved', 'Changes saved successfully');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to save document';
      setError(errorMessage);
      showToast('error', 'Save Failed', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const deleteDocument = async (docId: string) => {
    setLoading(true);
    try {
      // In a real implementation, this would delete from Supabase
      setDocuments(docs => docs.filter(doc => doc.id !== docId));
      
      if (selectedDocument?.id === docId) {
        setSelectedDocument(null);
        setDocumentContent('');
        setDocumentTitle('');
      }
      
      showToast('info', 'Document Deleted', 'Document removed successfully');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete document';
      setError(errorMessage);
      showToast('error', 'Delete Failed', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const addComment = async () => {
    if (!selectedDocument || !newComment.trim()) return;
    
    const comment: Comment = {
      id: Date.now().toString(),
      document_id: selectedDocument.id,
      user_id: user?.id || '',
      user_name: user?.email?.split('@')[0] || 'User',
      content: newComment,
      created_at: new Date().toISOString()
    };
    
    setComments([comment, ...comments]);
    setNewComment('');
    showToast('success', 'Comment Added', 'Your comment has been added');
  };

  const toggleDocumentLock = async () => {
    if (!selectedDocument) return;
    
    const updatedDoc = {
      ...selectedDocument,
      locked: !selectedDocument.locked,
      updated_at: new Date().toISOString()
    };
    
    setDocuments(docs => docs.map(doc => 
      doc.id === updatedDoc.id ? updatedDoc : doc
    ));
    
    setSelectedDocument(updatedDoc);
    showToast('info', updatedDoc.locked ? 'Document Locked' : 'Document Unlocked', 
      updatedDoc.locked ? 'Document is now read-only for collaborators' : 'Collaborators can now edit this document');
  };

  const addCollaborator = async () => {
    if (!selectedDocument || !newCollaborator.trim()) return;
    
    if (!newCollaborator.includes('@') || !newCollaborator.includes('.')) {
      showToast('error', 'Invalid Email', 'Please enter a valid email address');
      return;
    }
    
    if (collaborators.includes(newCollaborator)) {
      showToast('warning', 'Already Added', 'This collaborator is already on the list');
      return;
    }
    
    const updatedCollaborators = [...collaborators, newCollaborator];
    
    const updatedDoc = {
      ...selectedDocument,
      shared_with: updatedCollaborators,
      updated_at: new Date().toISOString()
    };
    
    setDocuments(docs => docs.map(doc => 
      doc.id === updatedDoc.id ? updatedDoc : doc
    ));
    
    setSelectedDocument(updatedDoc);
    setCollaborators(updatedCollaborators);
    setNewCollaborator('');
    showToast('success', 'Collaborator Added', `${newCollaborator} can now access this document`);
  };

  const removeCollaborator = async (email: string) => {
    if (!selectedDocument) return;
    
    const updatedCollaborators = collaborators.filter(c => c !== email);
    
    const updatedDoc = {
      ...selectedDocument,
      shared_with: updatedCollaborators,
      updated_at: new Date().toISOString()
    };
    
    setDocuments(docs => docs.map(doc => 
      doc.id === updatedDoc.id ? updatedDoc : doc
    ));
    
    setSelectedDocument(updatedDoc);
    setCollaborators(updatedCollaborators);
    showToast('info', 'Collaborator Removed', `${email} no longer has access`);
  };

  return (
    <div className="min-h-screen pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h1 className="text-3xl lg:text-4xl font-bold text-neutral-100 mb-2">
                Collaborative Workspace
              </h1>
              <p className="text-neutral-400">
                Real-time document collaboration with team members
              </p>
            </div>
            <div className="flex items-center space-x-3 mt-4 lg:mt-0">
              <Button onClick={createNewDocument}>
                <Plus className="h-4 w-4 mr-2" />
                New Document
              </Button>
            </div>
          </div>
        </motion.div>

        {error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mb-6"
          >
            <Card className="p-4 border-error-600/50 bg-error-900/20">
              <div className="flex items-center space-x-2">
                <AlertCircle className="h-5 w-5 text-error-400" />
                <span className="text-error-300">{error}</span>
              </div>
            </Card>
          </motion.div>
        )}

        <div className="grid lg:grid-cols-4 gap-8">
          {/* Document List */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="lg:col-span-1 space-y-6"
          >
            <Card className="p-6">
              <h2 className="text-xl font-semibold text-neutral-100 mb-4 flex items-center">
                <FileText className="h-5 w-5 mr-2 text-primary-400" />
                Documents
              </h2>
              
              {loading && !documents.length ? (
                <div className="flex items-center justify-center py-8">
                  <LoadingSpinner size="md" />
                </div>
              ) : documents.length > 0 ? (
                <div className="space-y-3">
                  {documents.map((doc) => (
                    <motion.div
                      key={doc.id}
                      whileHover={{ scale: 1.02 }}
                      className={`p-4 rounded-lg border cursor-pointer transition-all duration-200 ${
                        selectedDocument?.id === doc.id
                          ? 'border-primary-600/50 bg-primary-900/20'
                          : 'border-neutral-700/50 bg-neutral-800/20 hover:border-neutral-600/50'
                      }`}
                      onClick={() => selectDocument(doc)}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-medium text-neutral-100">{doc.title}</h3>
                        <div className="flex items-center space-x-1">
                          {doc.locked && <Lock className="h-3 w-3 text-warning-400" />}
                          {doc.shared_with.length > 0 && (
                            <div className="flex items-center">
                              <Users className="h-3 w-3 text-primary-400" />
                              <span className="text-xs text-neutral-500 ml-1">{doc.shared_with.length}</span>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center justify-between text-xs text-neutral-500">
                        <span>v{doc.version}</span>
                        <span>{new Date(doc.updated_at).toLocaleDateString()}</span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <FileText className="h-12 w-12 text-neutral-600 mx-auto mb-4" />
                  <p className="text-neutral-400">No documents yet</p>
                  <Button onClick={createNewDocument} className="mt-4" size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Create Document
                  </Button>
                </div>
              )}
            </Card>
          </motion.div>

          {/* Document Editor */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="lg:col-span-2 space-y-6"
          >
            {selectedDocument ? (
              <Card className="p-6">
                <div className="flex items-center justify-between mb-4">
                  {editMode ? (
                    <input
                      type="text"
                      value={documentTitle}
                      onChange={(e) => setDocumentTitle(e.target.value)}
                      className="text-xl font-semibold text-neutral-100 bg-transparent border-b border-neutral-700 focus:border-primary-500 outline-none w-full"
                    />
                  ) : (
                    <h2 className="text-xl font-semibold text-neutral-100">
                      {selectedDocument.title}
                    </h2>
                  )}
                  <div className="flex items-center space-x-2">
                    {editMode ? (
                      <Button onClick={saveDocument} loading={loading}>
                        <Save className="h-4 w-4 mr-2" />
                        Save
                      </Button>
                    ) : (
                      <>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => setEditMode(true)}
                          disabled={selectedDocument.locked && selectedDocument.owner_id !== user?.id}
                        >
                          <Edit className="h-4 w-4 mr-2" />
                          Edit
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={toggleDocumentLock}
                          disabled={selectedDocument.owner_id !== user?.id}
                        >
                          {selectedDocument.locked ? (
                            <Unlock className="h-4 w-4 mr-2" />
                          ) : (
                            <Lock className="h-4 w-4 mr-2" />
                          )}
                          {selectedDocument.locked ? 'Unlock' : 'Lock'}
                        </Button>
                      </>
                    )}
                  </div>
                </div>

                <div className="mb-4 flex items-center justify-between text-sm text-neutral-500">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 mr-1" />
                      <span>Updated: {new Date(selectedDocument.updated_at).toLocaleString()}</span>
                    </div>
                    <div>Version: {selectedDocument.version}</div>
                  </div>
                  <div className="flex items-center">
                    <Users className="h-4 w-4 mr-1" />
                    <span>{selectedDocument.shared_with.length} collaborators</span>
                  </div>
                </div>

                {editMode ? (
                  <textarea
                    value={documentContent}
                    onChange={(e) => setDocumentContent(e.target.value)}
                    className="w-full h-64 bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-2 text-neutral-200 resize-none"
                  />
                ) : (
                  <div className="bg-neutral-800/20 rounded-lg p-4 min-h-64">
                    <p className="text-neutral-300 whitespace-pre-wrap">{selectedDocument.content}</p>
                  </div>
                )}

                <div className="flex items-center justify-between mt-4 pt-4 border-t border-neutral-700">
                  <div className="flex items-center space-x-2">
                    <Badge variant={selectedDocument.locked ? 'warning' : 'success'}>
                      {selectedDocument.locked ? 'Locked' : 'Editable'}
                    </Badge>
                    <Badge variant="info">
                      {selectedDocument.owner_id === user?.id ? 'Owner' : 'Collaborator'}
                    </Badge>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button variant="outline" size="sm">
                      <Download className="h-4 w-4 mr-2" />
                      Export
                    </Button>
                    {selectedDocument.owner_id === user?.id && (
                      <Button 
                        variant="outline" 
                        size="sm"
                        className="text-error-400 border-error-600/50 hover:bg-error-900/20"
                        onClick={() => deleteDocument(selectedDocument.id)}
                      >
                        <Trash className="h-4 w-4 mr-2" />
                        Delete
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            ) : (
              <Card className="p-12 text-center">
                <FileText className="h-16 w-16 text-neutral-600 mx-auto mb-4" />
                <h3 className="text-2xl font-semibold text-neutral-100 mb-2">
                  No Document Selected
                </h3>
                <p className="text-neutral-400 mb-6">
                  Select a document from the list or create a new one
                </p>
                <Button onClick={createNewDocument}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create New Document
                </Button>
              </Card>
            )}
          </motion.div>

          {/* Comments & Collaborators */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="lg:col-span-1 space-y-6"
          >
            {selectedDocument && (
              <>
                <Card className="p-6">
                  <h3 className="text-lg font-semibold text-neutral-100 mb-4 flex items-center">
                    <Users className="h-4 w-4 mr-2 text-secondary-400" />
                    Collaborators
                  </h3>
                  
                  <div className="space-y-4">
                    {selectedDocument.owner_id === user?.id && (
                      <div className="flex items-center space-x-2">
                        <input
                          type="email"
                          value={newCollaborator}
                          onChange={(e) => setNewCollaborator(e.target.value)}
                          placeholder="Email address"
                          className="flex-1 bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-2 text-sm text-neutral-200"
                        />
                        <Button size="sm" onClick={addCollaborator}>
                          <UserPlus className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                    
                    <div className="space-y-2">
                      <div className="flex items-center justify-between p-2 bg-primary-900/20 rounded-lg">
                        <div className="flex items-center">
                          <div className="w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center">
                            <span className="text-white font-medium">
                              {user?.email?.charAt(0).toUpperCase() || 'U'}
                            </span>
                          </div>
                          <div className="ml-2">
                            <div className="text-sm font-medium text-neutral-200">
                              {user?.email?.split('@')[0] || 'You'}
                            </div>
                            <div className="text-xs text-neutral-500">
                              {user?.email || 'Owner'}
                            </div>
                          </div>
                        </div>
                        <Badge variant="info">Owner</Badge>
                      </div>
                      
                      {collaborators.map((email, index) => (
                        <div key={index} className="flex items-center justify-between p-2 bg-neutral-800/20 rounded-lg">
                          <div className="flex items-center">
                            <div className="w-8 h-8 bg-secondary-600 rounded-full flex items-center justify-center">
                              <span className="text-white font-medium">
                                {email.charAt(0).toUpperCase()}
                              </span>
                            </div>
                            <div className="ml-2">
                              <div className="text-sm font-medium text-neutral-200">
                                {email.split('@')[0]}
                              </div>
                              <div className="text-xs text-neutral-500">
                                {email}
                              </div>
                            </div>
                          </div>
                          {selectedDocument.owner_id === user?.id && (
                            <button
                              onClick={() => removeCollaborator(email)}
                              className="text-neutral-400 hover:text-error-400 transition-colors"
                            >
                              <Trash className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </Card>

                <Card className="p-6">
                  <h3 className="text-lg font-semibold text-neutral-100 mb-4 flex items-center">
                    <MessageSquare className="h-4 w-4 mr-2 text-accent-400" />
                    Comments
                  </h3>
                  
                  <div className="space-y-4">
                    <div className="flex items-center space-x-2">
                      <textarea
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        placeholder="Add a comment..."
                        className="flex-1 bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-2 text-sm text-neutral-200 resize-none"
                        rows={2}
                      />
                      <Button size="sm" onClick={addComment} disabled={!newComment.trim()}>
                        <MessageSquare className="h-4 w-4" />
                      </Button>
                    </div>
                    
                    <div className="space-y-3 max-h-96 overflow-y-auto">
                      {comments.map((comment) => (
                        <div key={comment.id} className="p-3 bg-neutral-800/20 rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <div className="font-medium text-neutral-200 text-sm">
                              {comment.user_name}
                            </div>
                            <div className="text-xs text-neutral-500">
                              {new Date(comment.created_at).toLocaleString()}
                            </div>
                          </div>
                          <p className="text-sm text-neutral-400">
                            {comment.content}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                </Card>
              </>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
}