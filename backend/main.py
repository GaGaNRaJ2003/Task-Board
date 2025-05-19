from fastapi import FastAPI, HTTPException, Depends, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from pydantic import BaseModel
from typing import List, Optional
from sqlalchemy import create_engine, Column, Integer, String, Text, Boolean
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from datetime import datetime, timedelta
from jose import JWTError, jwt
from passlib.context import CryptContext
import os

# Security configuration
SECRET_KEY = "your-super-secret-key-here"  # In production, use a secure secret key from environment variables
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

# Database setup
SQLALCHEMY_DATABASE_URL = "sqlite:///./tasks.db"
engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# Database Models
class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    is_active = Column(Boolean, default=True)

class Task(Base):
    __tablename__ = "tasks"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True)
    description = Column(Text, nullable=True)
    status = Column(String)
    order = Column(Integer, default=0)
    user_id = Column(Integer)  # Add user_id to associate tasks with users

# Create tables
Base.metadata.drop_all(bind=engine)  # Drop all tables
Base.metadata.create_all(bind=engine)  # Recreate tables

# Pydantic models
class UserBase(BaseModel):
    username: str
    email: str

class UserCreate(UserBase):
    password: str

class UserResponse(UserBase):
    id: int
    is_active: bool

    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    username: Optional[str] = None

class TaskBase(BaseModel):
    title: str
    description: Optional[str] = None
    status: str
    order: Optional[int] = 0

class TaskCreate(TaskBase):
    pass

class TaskResponse(TaskBase):
    id: int
    user_id: int

    class Config:
        from_attributes = True

# FastAPI app
app = FastAPI()

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Root endpoint
@app.get("/")
def read_root():
    return {
        "message": "Task Board API is running!",
        "endpoints": {
            "register": "/register - POST - Register a new user",
            "login": "/token - POST - Login and get access token",
            "tasks": "/tasks/ - GET,POST - Manage tasks"
        }
    }

# Security functions
def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password):
    return pwd_context.hash(password)

def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

async def get_current_user(token: str = Depends(oauth2_scheme)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise credentials_exception
        token_data = TokenData(username=username)
    except JWTError:
        raise credentials_exception
    
    db = SessionLocal()
    user = db.query(User).filter(User.username == token_data.username).first()
    db.close()
    if user is None:
        raise credentials_exception
    return user

# Database dependency
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Authentication endpoints
@app.post("/register", response_model=UserResponse)
def register_user(user: UserCreate):
    print(f"Attempting to register user: {user.username}")  # Debug log
    db = SessionLocal()
    # Check for duplicate username
    db_user = db.query(User).filter(User.username == user.username).first()
    if db_user:
        print(f"Username {user.username} already exists")  # Debug log
        db.close()
        raise HTTPException(status_code=400, detail="Username already registered")
    
    # Check for duplicate email
    db_user = db.query(User).filter(User.email == user.email).first()
    if db_user:
        print(f"Email {user.email} already exists")  # Debug log
        db.close()
        raise HTTPException(status_code=400, detail="Email already registered")
    
    print(f"Creating new user: {user.username}")  # Debug log
    hashed_password = get_password_hash(user.password)
    db_user = User(
        username=user.username,
        email=user.email,
        hashed_password=hashed_password
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    db.close()
    print(f"Successfully registered user: {user.username}")  # Debug log
    return db_user

@app.post("/token", response_model=Token)
async def login(form_data: OAuth2PasswordRequestForm = Depends()):
    db = SessionLocal()
    user = db.query(User).filter(User.username == form_data.username).first()
    
    if not user:
        db.close()
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    if not verify_password(form_data.password, user.hashed_password):
        db.close()
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    db.close()
    access_token = create_access_token(data={"sub": user.username})
    return {"access_token": access_token, "token_type": "bearer"}

# Task endpoints (now protected with authentication)
@app.get("/tasks/", response_model=List[TaskResponse])
async def get_tasks(current_user: User = Depends(get_current_user)):
    db = SessionLocal()
    tasks = db.query(Task).filter(Task.user_id == current_user.id).order_by(Task.status, Task.order).all()
    db.close()
    return tasks

@app.post("/tasks/", response_model=TaskResponse)
async def create_task(task: TaskCreate, current_user: User = Depends(get_current_user)):
    db = SessionLocal()
    db_task = Task(**task.model_dump(), user_id=current_user.id)
    db.add(db_task)
    db.commit()
    db.refresh(db_task)
    db.close()
    return db_task

@app.put("/tasks/{task_id}", response_model=TaskResponse)
async def update_task(task_id: int, task: TaskCreate, current_user: User = Depends(get_current_user)):
    db = SessionLocal()
    db_task = db.query(Task).filter(Task.id == task_id, Task.user_id == current_user.id).first()
    if not db_task:
        db.close()
        raise HTTPException(status_code=404, detail="Task not found")
    
    for key, value in task.model_dump().items():
        setattr(db_task, key, value)
    
    db.commit()
    db.refresh(db_task)
    db.close()
    return db_task

@app.delete("/tasks/{task_id}")
async def delete_task(task_id: int, current_user: User = Depends(get_current_user)):
    db = SessionLocal()
    db_task = db.query(Task).filter(Task.id == task_id, Task.user_id == current_user.id).first()
    if not db_task:
        db.close()
        raise HTTPException(status_code=404, detail="Task not found")
    
    db.delete(db_task)
    db.commit()
    db.close()
    return {"message": "Task deleted successfully"}

# Debug endpoint to list all users
@app.get("/debug/users")
def list_users():
    db = SessionLocal()
    users = db.query(User).all()
    db.close()
    return [{"id": user.id, "username": user.username, "email": user.email} for user in users]

@app.get("/users/me", response_model=UserResponse)
async def read_users_me(current_user: User = Depends(get_current_user)):
    return current_user 