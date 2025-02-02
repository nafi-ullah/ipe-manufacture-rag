from sqlalchemy.orm import Session
from datetime import datetime
import uuid
import json
from database import Product
from models import ProductCreate, ProductUpdateChat
from backend.core import run_llm_chat

def create_product(db: Session, product_data: ProductCreate):
    product_id = datetime.now().strftime("%Y%m%d%H%M%S%f")  # Unique timestamp-based ID
    db_product = Product(
        product_id=product_id,
        product_name=product_data.product_name,
        image_url=product_data.image_url,
        capture_time=product_data.capture_time,
        chat_history=[],
        solution=[],
        relevant_machines=[]
    )
    db.add(db_product)
    db.commit()
    db.refresh(db_product)
    return db_product

def update_product_chat(db: Session, product_id: str, chat_update: ProductUpdateChat):
    product = db.query(Product).filter(Product.product_id == product_id).first()
    if not product:
        return None

    # Ensure chat_history is correctly formatted as a list of dictionaries
    chat_history = product.chat_history
    if isinstance(chat_history, str):  # If it's stored as a JSON string in DB
        chat_history = json.loads(chat_history)

    # Use a valid role and 'content' key for the user's prompt
    new_chat_entry = {"role": "human", "content": chat_update.prompt}

    # Get the LLM's answer using existing chat history
    llm_response = run_llm_chat(query=chat_update.prompt, chat_history=chat_history)

    # Use 'assistant' for the AI role and 'content' for the AI response
    ai_response = {"role": "assistant", "content": llm_response['answer']}

    # Update the product's chat history
    updated_chat_history = chat_history + [new_chat_entry, ai_response]
    product.chat_history = updated_chat_history

    db.commit()
    db.refresh(product)
    return product

def get_product_ids(db: Session):
    return [product.product_id for product in db.query(Product).all()]

def get_product_by_id(db: Session, product_id: str):
    return db.query(Product).filter(Product.product_id == product_id).first()
