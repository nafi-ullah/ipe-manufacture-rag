from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

class ProductCreate(BaseModel):
    product_name: str
    image_url: str
    capture_time: datetime

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
