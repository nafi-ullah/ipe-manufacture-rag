from fastapi import FastAPI, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import datetime, timezone

from fastapi.middleware.cors import CORSMiddleware


from database import SessionLocal
from models import ProductCreate, ProductUpdateChat
from crud import create_product, update_product_chat, get_product_ids, get_product_by_id


app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow requests from any origin
    allow_credentials=True,
    allow_methods=["*"],  # Allow all HTTP methods (GET, POST, PUT, DELETE, etc.)
    allow_headers=["*"],  # Allow all headers
)

# Dependency to get the DB session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@app.post("/create_product/")
def create_product_api(product: ProductCreate, db: Session = Depends(get_db)):
    product_dict = product.model_dump()
    product_dict["capture_time"] = datetime.now(timezone.utc)

    created_product = create_product(db, ProductCreate(**product_dict))
    return {"message": "Product created successfully", "product_id": created_product.product_id}


@app.put("/update_product_chat/{product_id}")
def update_chat_history(product_id: str, chat_update: ProductUpdateChat, db: Session = Depends(get_db)):
    updated_product = update_product_chat(db, product_id, chat_update)
    if not updated_product:
        raise HTTPException(status_code=404, detail="Product not found")
    return {"message": "Chat history updated successfully", "product": updated_product}

@app.get("/get_product_ids/")
def fetch_product_ids(db: Session = Depends(get_db)):
    return {"product_ids": get_product_ids(db)}

@app.get("/get_product/{product_id}")
def fetch_product_by_id(product_id: str, db: Session = Depends(get_db)):
    product = get_product_by_id(db, product_id)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return product
