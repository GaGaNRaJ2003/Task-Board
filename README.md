# Task Management Board

A drag-and-drop task management board application built with React, Vite, and Python FastAPI.

## Features

- View tasks organized in columns (To Do, In Progress, Done)
- Create new tasks
- Edit existing tasks
- Delete tasks
- Drag and drop tasks between columns
- Persistent state management

## Tech Stack

### Frontend
- React with Vite
- Tailwind CSS
- react-beautiful-dnd for drag and drop functionality
- Axios for API calls

### Backend
- Python FastAPI
- SQLite database
- Pydantic for data validation

## Project Structure

```
task-board/
├── frontend/          # React + Vite frontend
├── backend/           # Python FastAPI backend
└── README.md
```

## Setup Instructions

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Create a virtual environment:
   ```bash
   python -m venv venv
   ```

3. Activate the virtual environment:
   - Windows:
     ```bash
     .\venv\Scripts\activate
     ```
   - Unix/MacOS:
     ```bash
     source venv/bin/activate
     ```

4. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

5. Run the backend server:
   ```bash
   uvicorn main:app --reload
   ```

The backend will be available at `http://localhost:8000`

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Run the development server:
   ```bash
   npm run dev
   ```

The frontend will be available at `http://localhost:5173`

## API Documentation

Once the backend is running, you can access the API documentation at:
- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

## License

MIT 