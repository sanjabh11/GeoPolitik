"""
Collaborative Workspace Service
Backend service for real-time document collaboration, team management, and workspace features
"""

from typing import List, Dict, Any, Optional
from pydantic import BaseModel
from fastapi import APIRouter, HTTPException, Query, Body, Depends
import httpx
import os
import json
import logging
from datetime import datetime, timedelta
import uuid
from enum import Enum

logger = logging.getLogger(__name__)

# Pydantic models and enums
class DocumentPermission(str, Enum):
    READ = "read"
    WRITE = "write"
    ADMIN = "admin"

class WorkspaceRole(str, Enum):
    OWNER = "owner"
    EDITOR = "editor"
    VIEWER = "viewer"

class Document(BaseModel):
    id: str
    title: str
    content: str
    owner_id: str
    workspace_id: str
    permissions: Dict[str, DocumentPermission]
    created_at: str
    updated_at: str
    version: int
    collaborators: List[str]
    comments: List[Dict[str, Any]]

class Workspace(BaseModel):
    id: str
    name: str
    description: str
    owner_id: str
    members: List[Dict[str, Any]]
    documents: List[str]
    created_at: str
    updated_at: str
    settings: Dict[str, Any]

class CollaborationRequest(BaseModel):
    document_id: str
    user_id: str
    action: str
    content: Optional[str] = None
    position: Optional[int] = None
    timestamp: str

class Comment(BaseModel):
    id: str
    document_id: str
    user_id: str
    content: str
    position: Optional[int] = None
    created_at: str
    resolved: bool = False
    replies: List[Dict[str, Any]]

class WorkspaceInvite(BaseModel):
    id: str
    workspace_id: str
    email: str
    role: WorkspaceRole
    invited_by: str
    created_at: str
    expires_at: str
    status: str = "pending"

class CollaborativeWorkspaceService:
    def __init__(self):
        self.workspaces: Dict[str, Workspace] = {}
        self.documents: Dict[str, Document] = {}
        self.active_sessions: Dict[str, List[str]] = {}
        self.real_time_updates: Dict[str, List[CollaborationRequest]] = {}

    async def create_workspace(self, name: str, description: str, owner_id: str, settings: Dict[str, Any] = None) -> Workspace:
        """Create a new collaborative workspace"""
        
        workspace_id = str(uuid.uuid4())
        workspace = Workspace(
            id=workspace_id,
            name=name,
            description=description,
            owner_id=owner_id,
            members=[{"user_id": owner_id, "role": WorkspaceRole.OWNER, "joined_at": datetime.utcnow().isoformat()}],
            documents=[],
            created_at=datetime.utcnow().isoformat(),
            updated_at=datetime.utcnow().isoformat(),
            settings=settings or {}
        )
        
        self.workspaces[workspace_id] = workspace
        return workspace

    async def create_document(self, workspace_id: str, title: str, owner_id: str, initial_content: str = "") -> Document:
        """Create a new collaborative document"""
        
        if workspace_id not in self.workspaces:
            raise HTTPException(status_code=404, detail="Workspace not found")
        
        document_id = str(uuid.uuid4())
        document = Document(
            id=document_id,
            title=title,
            content=initial_content,
            owner_id=owner_id,
            workspace_id=workspace_id,
            permissions={owner_id: DocumentPermission.ADMIN},
            created_at=datetime.utcnow().isoformat(),
            updated_at=datetime.utcnow().isoformat(),
            version=1,
            collaborators=[owner_id],
            comments=[]
        )
        
        self.documents[document_id] = document
        self.workspaces[workspace_id].documents.append(document_id)
        return document

    async def update_document(self, document_id: str, user_id: str, new_content: str, position: int = None) -> Document:
        """Update document content with real-time collaboration"""
        
        if document_id not in self.documents:
            raise HTTPException(status_code=404, detail="Document not found")
        
        document = self.documents[document_id]
        
        # Check permissions
        if user_id not in document.permissions or document.permissions[user_id] not in [DocumentPermission.WRITE, DocumentPermission.ADMIN]:
            raise HTTPException(status_code=403, detail="Insufficient permissions")
        
        # Apply change
        if position is not None:
            # Apply delta change (insert/delete)
            if len(new_content) > len(document.content):
                # Insert
                document.content = document.content[:position] + new_content[position:] + document.content[position:]
            else:
                # Delete
                document.content = document.content[:position] + document.content[position + len(new_content):]
        else:
            # Full content replacement
            document.content = new_content
        
        document.version += 1
        document.updated_at = datetime.utcnow().isoformat()
        
        # Track real-time updates
        if document_id not in self.real_time_updates:
            self.real_time_updates[document_id] = []
        
        self.real_time_updates[document_id].append(CollaborationRequest(
            document_id=document_id,
            user_id=user_id,
            action="update",
            content=new_content,
            position=position,
            timestamp=datetime.utcnow().isoformat()
        ))
        
        return document

    async def add_comment(self, document_id: str, user_id: str, content: str, position: int = None) -> Comment:
        """Add a comment to a document"""
        
        if document_id not in self.documents:
            raise HTTPException(status_code=404, detail="Document not found")
        
        document = self.documents[document_id]
        
        comment = Comment(
            id=str(uuid.uuid4()),
            document_id=document_id,
            user_id=user_id,
            content=content,
            position=position,
            created_at=datetime.utcnow().isoformat(),
            resolved=False,
            replies=[]
        )
        
        document.comments.append(comment.dict())
        document.updated_at = datetime.utcnow().isoformat()
        
        return comment

    async def invite_user_to_workspace(self, workspace_id: str, email: str, role: WorkspaceRole, invited_by: str) -> WorkspaceInvite:
        """Invite a user to a workspace"""
        
        if workspace_id not in self.workspaces:
            raise HTTPException(status_code=404, detail="Workspace not found")
        
        invite = WorkspaceInvite(
            id=str(uuid.uuid4()),
            workspace_id=workspace_id,
            email=email,
            role=role,
            invited_by=invited_by,
            created_at=datetime.utcnow().isoformat(),
            expires_at=(datetime.utcnow() + timedelta(days=7)).isoformat(),
            status="pending"
        )
        
        return invite

    async def accept_workspace_invite(self, invite_id: str, user_id: str) -> Workspace:
        """Accept a workspace invitation"""
        
        # In real implementation, would check database
        # For now, mock implementation
        for workspace in self.workspaces.values():
            if any(member["user_id"] == user_id for member in workspace.members):
                return workspace
        
        raise HTTPException(status_code=404, detail="Invite not found or expired")

    async def get_workspace_documents(self, workspace_id: str, user_id: str) -> List[Document]:
        """Get all documents in a workspace accessible to user"""
        
        if workspace_id not in self.workspaces:
            raise HTTPException(status_code=404, detail="Workspace not found")
        
        workspace = self.workspaces[workspace_id]
        
        # Check if user has access
        if not any(member["user_id"] == user_id for member in workspace.members):
            raise HTTPException(status_code=403, detail="Access denied")
        
        documents = []
        for doc_id in workspace.documents:
            if doc_id in self.documents:
                documents.append(self.documents[doc_id])
        
        return documents

    async def get_real_time_updates(self, document_id: str, since: str = None) -> List[CollaborationRequest]:
        """Get real-time updates for a document"""
        
        if document_id not in self.real_time_updates:
            return []
        
        updates = self.real_time_updates[document_id]
        
        if since:
            # Filter updates since timestamp
            updates = [update for update in updates if update.timestamp > since]
        
        return updates

    async def get_document_history(self, document_id: str) -> List[Dict[str, Any]]:
        """Get document version history"""
        
        if document_id not in self.documents:
            raise HTTPException(status_code=404, detail="Document not found")
        
        # Mock history - in real implementation would fetch from database
        document = self.documents[document_id]
        
        return [
            {
                "version": document.version,
                "user_id": document.owner_id,
                "timestamp": document.updated_at,
                "changes": f"Version {document.version} update"
            }
        ]

    async def share_document(self, document_id: str, user_id: str, target_user_id: str, permission: DocumentPermission) -> Document:
        """Share a document with another user"""
        
        if document_id not in self.documents:
            raise HTTPException(status_code=404, detail="Document not found")
        
        document = self.documents[document_id]
        
        # Check permissions
        if user_id not in document.permissions or document.permissions[user_id] not in [DocumentPermission.ADMIN]:
            raise HTTPException(status_code=403, detail="Insufficient permissions")
        
        document.permissions[target_user_id] = permission
        
        if target_user_id not in document.collaborators:
            document.collaborators.append(target_user_id)
        
        document.updated_at = datetime.utcnow().isoformat()
        return document

# FastAPI router
router = APIRouter(prefix="/workspace", tags=["collaboration"])
service = CollaborativeWorkspaceService()

@router.post("/workspaces", response_model=Workspace)
async def create_workspace(
    name: str = Body(...),
    description: str = Body(...),
    owner_id: str = Body(...),
    settings: Dict[str, Any] = Body(default_factory=dict)
):
    """Create a new collaborative workspace"""
    return await service.create_workspace(name, description, owner_id, settings)

@router.post("/documents", response_model=Document)
async def create_document(
    workspace_id: str = Body(...),
    title: str = Body(...),
    owner_id: str = Body(...),
    initial_content: str = Body(default="")
):
    """Create a new collaborative document"""
    return await service.create_document(workspace_id, title, owner_id, initial_content)

@router.put("/documents/{document_id}", response_model=Document)
async def update_document(
    document_id: str,
    user_id: str = Body(...),
    new_content: str = Body(...),
    position: Optional[int] = Body(None)
):
    """Update document content with real-time collaboration"""
    return await service.update_document(document_id, user_id, new_content, position)

@router.post("/documents/{document_id}/comments", response_model=Comment)
async def add_comment(
    document_id: str,
    user_id: str = Body(...),
    content: str = Body(...),
    position: Optional[int] = Body(None)
):
    """Add a comment to a document"""
    return await service.add_comment(document_id, user_id, content, position)

@router.post("/workspaces/{workspace_id}/invite")
async def invite_user_to_workspace(
    workspace_id: str,
    email: str = Body(...),
    role: WorkspaceRole = Body(...),
    invited_by: str = Body(...)
):
    """Invite a user to a workspace"""
    return await service.invite_user_to_workspace(workspace_id, email, role, invited_by)

@router.get("/workspaces/{workspace_id}/documents", response_model=List[Document])
async def get_workspace_documents(
    workspace_id: str,
    user_id: str = Query(...)
):
    """Get all documents in a workspace accessible to user"""
    return await service.get_workspace_documents(workspace_id, user_id)

@router.get("/documents/{document_id}/updates")
async def get_real_time_updates(
    document_id: str,
    since: Optional[str] = Query(None)
):
    """Get real-time updates for a document"""
    return await service.get_real_time_updates(document_id, since)

@router.get("/documents/{document_id}/history")
async def get_document_history(document_id: str):
    """Get document version history"""
    return await service.get_document_history(document_id)

@router.post("/documents/{document_id}/share")
async def share_document(
    document_id: str,
    user_id: str = Body(...),
    target_user_id: str = Body(...),
    permission: DocumentPermission = Body(...)
):
    """Share a document with another user"""
    return await service.share_document(document_id, user_id, target_user_id, permission)

@router.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy", "timestamp": datetime.utcnow().isoformat()}
