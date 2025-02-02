# LangChain Documentation Helper

1. **Create a virtual environment:**

   ```bash
   python -m venv venv
   ```

2. **Activate the virtual environment:**

   - On **macOS/Linux**:
     ```bash
     source venv/bin/activate
     ```
   - On **Windows**:
     ```bash
     .\venv\Scripts\activate
     ```

3. **Install the required dependencies:**

   ```bash
   pip install -r requirements.txt


   pip install tiktoken pinecone 

   pip freeze > requirements.txt


pip install fastapi uvicorn pydantic sqlalchemy sqlite3

uvicorn main:app --reload
