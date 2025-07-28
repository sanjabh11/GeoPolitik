"""
Collaborative research notebooks service
Provides shared document collaboration with real-time editing, versioning, and peer review
"""

from typing import List, Dict, Any, Optional
from pydantic import BaseModel
from fastapi import APIRouter, HTTPException, Query, Path, Body
import uuid
import json
import logging
from datetime import datetime
from enum import Enum
import asyncio

logger = logging.getLogger(__name__)

class NotebookStatus(str, Enum):
    DRAFT = "draft"
    IN_REVIEW = "in_review"
    PUBLISHED = "published"
    ARCHIVED = "archived"

class PermissionLevel(str, Enum):
    OWNER = "owner"
    EDITOR = "editor"
    COMMENTER = "commenter"
    VIEWER = "viewer"

class ChangeType(str, Enum):
    INSERT = "insert"
    DELETE = "delete"
    UPDATE = "update"
    FORMAT = "format"

class NotebookCell(BaseModel):
    id: str
    content: str
    cell_type: str  # "markdown", "code", "output"
    language: Optional[str] = None
    metadata: Dict[str, Any] = {}
    created_at: str
    updated_at: str
    version: int

class NotebookCollaborator(BaseModel):
    user_id: str
    email: str
    name: str
    permission: PermissionLevel
    joined_at: str
    last_activity: str

class NotebookChange(BaseModel):
    id: str
    notebook_id: str
    user_id: str
    change_type: ChangeType
    cell_id: str
    old_content: Optional[str]
    new_content: Optional[str]
    position: Optional[int]
    timestamp: str
    version: int

class NotebookComment(BaseModel):
    id: str
    notebook_id: str
    user_id: str
    content: str
    cell_id: Optional[str]
    position: Optional[int]
    resolved: bool
    created_at: str
    updated_at: str

class ResearchNotebook(BaseModel):
    id: str
    title: str
    description: Optional[str]
    owner_id: str
    status: NotebookStatus
    cells: List[NotebookCell]
    collaborators: List[NotebookCollaborator]
    tags: List[str]
    created_at: str
    updated_at: str
    version: int
    last_activity: str

class PeerReview(BaseModel):
    id: str
    notebook_id: str
    reviewer_id: str
    reviewer_name: str
    status: str  # "pending", "approved", "needs_revision", "rejected"
    comments: List[str]
    suggestions: List[str]
    overall_score: Optional[float]
    created_at: str
    updated_at: str

class CollaborativeNotebooksService:
    def __init__(self):
        self.notebooks: Dict[str, ResearchNotebook] = {}
        self.changes: Dict[str, List[NotebookChange]] = {}
        self.comments: Dict[str, List[NotebookComment]] = {}
        self.peer_reviews: Dict[str, List[PeerReview]] = {}
        
    async def create_notebook(self, title: str, description: str, owner_id: str) -> ResearchNotebook:
        """Create a new research notebook"""
        
        notebook_id = str(uuid.uuid4())
        now = datetime.utcnow().isoformat()
        
        notebook = ResearchNotebook(
            id=notebook_id,
            title=title,
            description=description,
            owner_id=owner_id,
            status=NotebookStatus.DRAFT,
            cells=[],
            collaborators=[],
            tags=[],
            created_at=now,
            updated_at=now,
            version=1,
            last_activity=now
        )
        
        self.notebooks[notebook_id] = notebook
        self.changes[notebook_id] = []
        self.comments[notebook_id] = []
        self.peer_reviews[notebook_id] = []
        
        return notebook

    async def add_collaborator(self, notebook_id: str, user_id: str, email: str, name: str, permission: PermissionLevel) -> NotebookCollaborator:
        """Add a collaborator to a notebook"""
        
        if notebook_id not in self.notebooks:
            raise HTTPException(status_code=404, detail="Notebook not found")
        
        notebook = self.notebooks[notebook_id]
        
        # Check if user is already a collaborator
        existing = next((c for c in notebook.collaborators if c.user_id == user_id), None)
        if existing:
            return existing
        
        collaborator = NotebookCollaborator(
            user_id=user_id,
            email=email,
            name=name,
            permission=permission,
            joined_at=datetime.utcnow().isoformat(),
            last_activity=datetime.utcnow().isoformat()
        )
        
        notebook.collaborators.append(collaborator)
        notebook.updated_at = datetime.utcnow().isoformat()
        
        return collaborator

    async def add_cell(self, notebook_id: str, user_id: str, content: str, cell_type: str, language: Optional[str] = None) -> NotebookCell:
        """Add a new cell to the notebook"""
        
        if notebook_id not in self.notebooks:
            raise HTTPException(status_code=404, detail="Notebook not found")
        
        cell_id = str(uuid.uuid4())
        now = datetime.utcnow().isoformat()
        
        cell = NotebookCell(
            id=cell_id,
            content=content,
            cell_type=cell_type,
            language=language,
            created_at=now,
            updated_at=now,
            version=1
        )
        
        notebook = self.notebooks[notebook_id]
        notebook.cells.append(cell)
        notebook.updated_at = now
        notebook.last_activity = now
        notebook.version += 1
        
        # Log the change
        change = NotebookChange(
            id=str(uuid.uuid4()),
            notebook_id=notebook_id,
            user_id=user_id,
            change_type=ChangeType.INSERT,
            cell_id=cell_id,
            new_content=content,
            timestamp=now,
            version=notebook.version
        )
        
        self.changes[notebook_id].append(change)
        
        return cell

    async def update_cell(self, notebook_id: str, user_id: str, cell_id: str, new_content: str) -> NotebookCell:
        """Update an existing cell"""
        
        if notebook_id not in self.notebooks:
            raise HTTPException(status_code=404, detail="Notebook not found")
        
        notebook = self.notebooks[notebook_id]
        cell = next((c for c in notebook.cells if c.id == cell_id), None)
        
        if not cell:
            raise HTTPException(status_code=404, detail="Cell not found")
        
        old_content = cell.content
        cell.content = new_content
        cell.updated_at = datetime.utcnow().isoformat()
        cell.version += 1
        
        notebook.updated_at = datetime.utcnow().isoformat()
        notebook.last_activity = datetime.utcnow().isoformat()
        notebook.version += 1
        
        # Log the change
        change = NotebookChange(
            id=str(uuid.uuid4()),
            notebook_id=notebook_id,
            user_id=user_id,
            change_type=ChangeType.UPDATE,
            cell_id=cell_id,
            old_content=old_content,
            new_content=new_content,
            timestamp=datetime.utcnow().isoformat(),
            version=notebook.version
        )
        
        self.changes[notebook_id].append(change)
        
        return cell

    async def delete_cell(self, notebook_id: str, user_id: str, cell_id: str) -> bool:
        """Delete a cell from the notebook"""
        
        if notebook_id not in self.notebooks:
            raise HTTPException(status_code=404, detail="Notebook not found")
        
        notebook = self.notebooks[notebook_id]
        cell = next((c for c in notebook.cells if c.id == cell_id), None)
        
        if not cell:
            raise HTTPException(status_code=404, detail="Cell not found")
        
        old_content = cell.content
        notebook.cells.remove(cell)
        
        notebook.updated_at = datetime.utcnow().isoformat()
        notebook.last_activity = datetime.utcnow().isoformat()
        notebook.version += 1
        
        # Log the change
        change = NotebookChange(
            id=str(uuid.uuid4()),
            notebook_id=notebook_id,
            user_id=user_id,
            change_type=ChangeType.DELETE,
            cell_id=cell_id,
            old_content=old_content,
            timestamp=datetime.utcnow().isoformat(),
            version=notebook.version
        )
        
        self.changes[notebook_id].append(change)
        
        return True

    async def add_comment(self, notebook_id: str, user_id: str, content: str, cell_id: Optional[str] = None) -> NotebookComment:
        """Add a comment to the notebook"""
        
        if notebook_id not in self.notebooks:
            raise HTTPException(status_code=404, detail="Notebook not found")
        
        comment = NotebookComment(
            id=str(uuid.uuid4()),
            notebook_id=notebook_id,
            user_id=user_id,
            content=content,
            cell_id=cell_id,
            resolved=False,
            created_at=datetime.utcnow().isoformat(),
            updated_at=datetime.utcnow().isoformat()
        )
        
        self.comments[notebook_id].append(comment)
        
        notebook = self.notebooks[notebook_id]
        notebook.updated_at = datetime.utcnow().isoformat()
        
        return comment

    async def create_peer_review(self, notebook_id: str, reviewer_id: str, reviewer_name: str) -> PeerReview:
        """Create a peer review for a notebook"""
        
        if notebook_id not in self.notebooks:
            raise HTTPException(status_code=404, detail="Notebook not found")
        
        review = PeerReview(
            id=str(uuid.uuid4()),
            notebook_id=notebook_id,
            reviewer_id=reviewer_id,
            reviewer_name=reviewer_name,
            status="pending",
            comments=[],
            suggestions=[],
            overall_score=None,
            created_at=datetime.utcnow().isoformat(),
            updated_at=datetime.utcnow().isoformat()
        )
        
        self.peer_reviews[notebook_id].append(review)
        
        notebook = self.notebooks[notebook_id]
        notebook.status = NotebookStatus.IN_REVIEW
        notebook.updated_at = datetime.utcnow().isoformat()
        
        return review

    async def update_peer_review(self, review_id: str, status: str, comments: List[str], suggestions: List[str], score: Optional[float]) -> PeerReview:
        """Update a peer review"""
        
        for notebook_id, reviews in self.peer_reviews.items():
            review = next((r for r in reviews if r.id == review_id), None)
            if review:
                review.status = status
                review.comments = comments
                review.suggestions = suggestions
                review.overall_score = score
                review.updated_at = datetime.utcnow().isoformat()
                
                return review
        
        raise HTTPException(status_code=404, detail="Review not found")

    async def get_notebook_history(self, notebook_id: str) -> List[NotebookChange]:
        """Get notebook change history"""
        
        if notebook_id not in self.changes:
            return []
        
        return self.changes[notebook_id]

    async def get_notebook_comments(self, notebook_id: str) -> List[NotebookComment]:
        """Get notebook comments"""
        
        if notebook_id not in self.comments:
            return []
        
        return self.comments[notebook_id]

    async def get_notebook_reviews(self, notebook_id: str) -> List[PeerReview]:
        """Get notebook peer reviews"""
        
        if notebook_id not in self.peer_reviews:
            return []
        
        return self.peer_reviews[notebook_id]

    async def export_notebook(self, notebook_id: str, format: str = "json") -> Dict[str, Any]:
        """Export notebook in various formats"""
        
        if notebook_id not in self.notebooks:
            raise HTTPException(status_code=404, detail="Notebook not found")
        
        notebook = self.notebooks[notebook_id]
        
        export_data = {
            "notebook": notebook.dict(),
            "changes": [change.dict() for change in self.changes.get(notebook_id, [])],
            "comments": [comment.dict() for comment in self.comments.get(notebook_id, [])],
            "reviews": [review.dict() for review in self.peer_reviews.get(notebook_id, [])]
        }
        
        return export_data

    async def get_user_notebooks(self, user_id: str) -> List[ResearchNotebook]:
        """Get all notebooks for a user"""
        
        user_notebooks = []
        for notebook in self.notebooks.values():
            if notebook.owner_id == user_id or any(c.user_id == user_id for c in notebook.collaborators):
                user_notebooks.append(notebook)
        
        return user_notebooks

    async def search_notebooks(self, query: str, tags: List[str] = None) -> List[ResearchNotebook]:
        """Search notebooks by title, description, or tags"""
        
        results = []
        query_lower = query.lower()
        
        for notebook in self.notebooks.values():
            # Search in title and description
            if query_lower in notebook.title.lower() or (notebook.description and query_lower in notebook.description.lower()):
                results.append(notebook)
            
            # Search in tags
            if tags:
                if any(tag.lower() in [t.lower() for t in notebook.tags] for tag in tags):
                    results.append(notebook)
        
        return results

# FastAPI router
router = APIRouter(prefix="/api/notebooks", tags=["notebooks"])
service = CollaborativeNotebooksService()

@router.post("/", response_model=ResearchNotebook)
async def create_notebook(
    title: str = Query(..., description="Notebook title"),
    description: str = Query(..., description="Notebook description"),
    owner_id: str = Query(..., description="Owner user ID")
):
    """Create a new research notebook"""
    return await service.create_notebook(title, description, owner_id)

@router.get("/{notebook_id}", response_model=ResearchNotebook)
async def get_notebook(notebook_id: str):
    """Get notebook details"""
    if notebook_id not in service.notebooks:
        raise HTTPException(status_code=404, detail="Notebook not found")
    return service.notebooks[notebook_id]

@router.put("/{notebook_id}/collaborators")
async def add_collaborator(
    notebook_id: str,
    user_id: str = Query(..., description="User ID"),
    email: str = Query(..., description="User email"),
    name: str = Query(..., description="User name"),
    permission: PermissionLevel = Query(..., description="Permission level")
):
    """Add a collaborator to notebook"""
    return await service.add_collaborator(notebook_id, user_id, email, name, permission)

@router.post("/{notebook_id}/cells")
async def add_cell(
    notebook_id: str,
    user_id: str = Query(..., description="User ID"),
    content: str = Query(..., description="Cell content"),
    cell_type: str = Query(..., description="Cell type (markdown/code)"),
    language: Optional[str] = Query(None, description="Programming language for code cells")
):
    """Add a cell to notebook"""
    return await service.add_cell(notebook_id, user_id, content, cell_type, language)

@router.put("/{notebook_id}/cells/{cell_id}")
async def update_cell(
    notebook_id: str,
    cell_id: str,
    user_id: str = Query(..., description="User ID"),
    content: str = Query(..., description="New cell content")
):
    """Update a cell"""
    return await service.update_cell(notebook_id, user_id, cell_id, content)

@router.delete("/{notebook_id}/cells/{cell_id}")
async def delete_cell(
    notebook_id: str,
    cell_id: str,
    user_id: str = Query(..., description="User ID")
):
    """Delete a cell"""
    return await service.delete_cell(notebook_id, user_id, cell_id)

@router.post("/{notebook_id}/comments")
async def add_comment(
    notebook_id: str,
    user_id: str = Query(..., description="User ID"),
    content: str = Query(..., description="Comment content"),
    cell_id: Optional[str] = Query(None, description="Cell ID for cell-specific comments")
):
    """Add a comment to notebook"""
    return await service.add_comment(notebook_id, user_id, content, cell_id)

@router.post("/{notebook_id}/reviews")
async def create_peer_review(
    notebook_id: str,
    reviewer_id: str = Query(..., description="Reviewer user ID"),
    reviewer_name: str = Query(..., description="Reviewer name")
):
    """Create a peer review"""
    return await service.create_peer_review(notebook_id, reviewer_id, reviewer_name)

@router.put("/{notebook_id}/reviews/{review_id}")
async def update_peer_review(
    review_id: str,
    status: str = Query(..., description="Review status"),
    comments: List[str] = Query(..., description="Review comments"),
    suggestions: List[str] = Query(..., description="Review suggestions"),
    score: Optional[float] = Query(None, description="Overall score")
):
    """Update a peer review"""
    return await service.update_peer_review(review_id, status, comments, suggestions, score)

@router.get("/{notebook_id}/history")
async def get_notebook_history(notebook_id: str):
    """Get notebook change history"""
    return await service.get_notebook_history(notebook_id)

@router.get("/{notebook_id}/comments")
async def get_notebook_comments(notebook_id: str):
    """Get notebook comments"""
    return await service.get_notebook_comments(notebook_id)

@router.get("/{notebook_id}/reviews")
async def get_notebook_reviews(notebook_id: str):
    """Get notebook peer reviews"""
    return await service.get_notebook_reviews(notebook_id)

@router.get("/{notebook_id}/export")
async def export_notebook(
    notebook_id: str,
    format: str = Query("json", regex="^(json|pdf|html)$")
):
    """Export notebook"""
    return await service.export_notebook(notebook_id, format)

@router.get("/user/{user_id}")
async def get_user_notebooks(user_id: str):
    """Get user notebooks"""
    return await service.get_user_notebooks(user_id)

@router.get("/search")
async def search_notebooks(
    query: str = Query(..., description="Search query"),
    tags: Optional[List[str]] = Query(None, description="Tags to filter by")
):
    """Search notebooks"""
    return await service.search_notebooks(query, tags)

@router.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy", "timestamp": datetime.utcnow().isoformat()}
