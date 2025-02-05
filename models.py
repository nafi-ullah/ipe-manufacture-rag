from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime, timezone

class ProductCreate(BaseModel):
    product_name: str
    image_url: str
    capture_time: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))  # Use timezone-aware datetime

class ChatMessage(BaseModel):
    role: str
    content: str

class ProductCreateWithChat(BaseModel):
    product_name: str
    image_url: str
    capture_time: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    chat_history: List[ChatMessage] = [
        ChatMessage(role="human", content="Explain about the product?"),
        ChatMessage(role="assistant", content="Thinking about the product!!"),
    ]


class ProductUpdateChat(BaseModel):
    prompt: str
    response: str

class ProductResponse(BaseModel):
    product_id: str
    product_name: str
    image_url: str
    capture_time: datetime
    chat_history: List[dict]
    solution: List[str]
    relevant_machines: List[str]
