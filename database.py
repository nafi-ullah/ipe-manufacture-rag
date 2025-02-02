from sqlalchemy import Column, Integer, String, JSON, DateTime, create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from datetime import datetime

DATABASE_URL = "sqlite:///./products.db"

engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

class Product(Base):
    __tablename__ = "products"

    product_id = Column(String, primary_key=True, index=True)
    product_name = Column(String, index=True)
    image_url = Column(String)
    capture_time = Column(DateTime, default=datetime.utcnow)
    chat_history = Column(JSON, default=[])
    solution = Column(JSON, default=[])
    relevant_machines = Column(JSON, default=[])

Base.metadata.create_all(bind=engine)
