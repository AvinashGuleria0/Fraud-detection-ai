## 2. Backend Setup (FastAPI)

1.  **Navigate to the backend folder**:
    ```powershell
    cd backend
    ```

2.  **Create a Virtual Environment**:
    ```powershell
    python -m venv venv
    .\venv\Scripts\activate
    ```

3.  **Install Dependencies**:
    ```powershell
    pip install -r requirements.txt
    ```

4.  **Environment Variables**:
    Create a `.env` file in the `backend/` directory:
    ```env
    GROQ_API_KEY=your_groq_api_key_here
    ```

5.  **Run the Backend**:
    ```powershell
    python main.py
    ```
    The backend will start at `http://127.0.0.1:8000`.

---

## 3. Frontend Setup (React + Vite)

1.  **Navigate to the frontend folder**:
    ```powershell
    cd frontend
    ```

2.  **Install Dependencies**:
    ```powershell
    npm install
    ```

3.  **Environment Variables**:
    Create a `.env` file in the `frontend/` directory:
    ```env
    VITE_SUPABASE_URL=your_supabase_project_url
    VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
    VITE_API_URL=http://127.0.0.1:8000
    ```

4.  **Run the Frontend**:
    ```powershell
    npm run dev
    ```
    The app will be available at `http://localhost:5173`.