import { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import axios from 'axios';
import TaskColumn from './TaskColumn';
import TaskForm from './TaskForm';
import { MoonIcon, SunIcon, ClipboardDocumentListIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../contexts/AuthContext';
import Header from './Header';

const API_URL = 'http://localhost:8000';

export default function TaskBoard() {
  const [tasks, setTasks] = useState([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [newTaskStatus, setNewTaskStatus] = useState(null);
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem('theme') === 'dark';
  });
  const { user, token, logout } = useAuth();
  const [isDragging, setIsDragging] = useState(false);

  const columns = {
    todo: {
      title: 'To Do',
      items: tasks.filter(task => task.status === 'todo').sort((a, b) => a.order - b.order)
    },
    in_progress: {
      title: 'In Progress',
      items: tasks.filter(task => task.status === 'in_progress').sort((a, b) => a.order - b.order)
    },
    done: {
      title: 'Done',
      items: tasks.filter(task => task.status === 'done').sort((a, b) => a.order - b.order)
    }
  };

  useEffect(() => {
    if (token) {
      fetchTasks();
    }
  }, [token]);

  useEffect(() => {
    const root = window.document.documentElement;
    if (darkMode) {
      root.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      root.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [darkMode]);

  useEffect(() => {
    if (isDragging) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [isDragging]);

  const fetchTasks = async () => {
    try {
      const response = await axios.get(`${API_URL}/tasks/`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      setTasks(response.data);
    } catch (error) {
      console.error('Error fetching tasks:', error);
    }
  };

  const handleDragStart = () => setIsDragging(true);
  const handleDragEnd = async (result) => {
    setIsDragging(false);
    if (!result.destination) return;

    const { source, destination, draggableId } = result;
    
    // If dropped in the same position
    if (
      source.droppableId === destination.droppableId &&
      source.index === destination.index
    ) {
      return;
    }

    const taskId = parseInt(draggableId);
    const newStatus = destination.droppableId;

    // Get a copy of the tasks
    let updatedTasks = Array.from(tasks);

    // Find the task being moved
    const movedTaskIndex = updatedTasks.findIndex(t => t.id === taskId);
    const [movedTask] = updatedTasks.splice(movedTaskIndex, 1);

    // Update the status of the moved task
    movedTask.status = newStatus;

    // Insert the moved task at the correct position in the destination column
    // First, get all tasks in the destination column (excluding the moved task)
    const destTasks = updatedTasks.filter(t => t.status === newStatus);
    destTasks.splice(destination.index, 0, movedTask);

    // Update the order for all tasks in the destination column
    destTasks.forEach((task, idx) => {
      task.order = idx;
    });

    // Update the order for all tasks in the source column (if different)
    if (source.droppableId !== destination.droppableId) {
      const sourceTasks = updatedTasks.filter(t => t.status === source.droppableId);
      sourceTasks.forEach((task, idx) => {
        task.order = idx;
      });
    }

    // Merge all tasks back together
    updatedTasks = [
      ...updatedTasks.filter(t => t.status !== newStatus),
      ...destTasks
    ];

    setTasks(updatedTasks);

    // Persist order and status to backend for all affected tasks
    const tasksToUpdate = [...destTasks];
    if (source.droppableId !== destination.droppableId) {
      const sourceTasks = updatedTasks.filter(t => t.status === source.droppableId);
      tasksToUpdate.push(...sourceTasks);
    }
    await Promise.all(tasksToUpdate.map(task =>
      axios.put(`${API_URL}/tasks/${task.id}`, task, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })
    ));
  };

  const handleCreateTask = async (taskData) => {
    try {
      // Increment order of all tasks in the same column
      const colTasks = tasks.filter(t => t.status === taskData.status);
      await Promise.all(colTasks.map(t =>
        axios.put(`${API_URL}/tasks/${t.id}`, { ...t, order: t.order + 1 }, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        })
      ));
      // Set new task order to 0
      await axios.post(`${API_URL}/tasks/`, { ...taskData, order: 0 }, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      fetchTasks();
      setIsFormOpen(false);
    } catch (error) {
      console.error('Error creating task:', error);
    }
  };

  const handleUpdateTask = async (taskData) => {
    try {
      // Find the original task
      const originalTask = tasks.find(t => t.id === taskData.id);
      if (!originalTask) return;
      // If status is unchanged, preserve the order
      const updatedTask = {
        ...taskData,
        order: taskData.status === originalTask.status ? originalTask.order : taskData.order
      };
      await axios.put(`${API_URL}/tasks/${taskData.id}`, updatedTask, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      fetchTasks();
      setEditingTask(null);
    } catch (error) {
      console.error('Error updating task:', error);
    }
  };

  const handleDeleteTask = async (taskId) => {
    try {
      await axios.delete(`${API_URL}/tasks/${taskId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      fetchTasks();
    } catch (error) {
      console.error('Error deleting task:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-blue-50 to-purple-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 py-8 px-4 transition-colors duration-300 relative overflow-x-hidden"
      style={{ maxWidth: '100vw', overflowX: 'hidden' }}
    >
      {/* Decorative blurred shapes */}
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-indigo-300 opacity-20 rounded-full filter blur-3xl z-0 animate-pulse" />
      <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-purple-300 opacity-20 rounded-full filter blur-3xl z-0 animate-pulse" />
      <div className="w-4/5 max-w-5xl mx-auto z-10 relative">
        {/* Hero Section */}
        <div className="flex flex-col items-center mb-10 animate-fade-in">
          <span className="bg-indigo-100 p-4 rounded-full mb-2 shadow-md">
            <ClipboardDocumentListIcon className="h-12 w-12 text-indigo-500" />
          </span>
          <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 dark:text-white font-[Montserrat] tracking-tight text-center mb-2 drop-shadow-sm">
            Welcome, <span className="text-indigo-600 dark:text-indigo-400">{user?.username || 'User'}</span>!
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-300 font-[Montserrat] text-center max-w-2xl">
            Organize your day, drag and drop your tasks, and get things done with style.
          </p>
        </div>
        <div className="flex items-center justify-between mb-8">
          <Header />
          <div className="flex items-center space-x-4">
            <button
              onClick={logout}
              className="px-4 py-2 text-sm font-semibold text-white bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400 shadow-lg transition-all duration-200 hover:scale-105"
            >
              Logout
            </button>
            <button
              onClick={() => setDarkMode((d) => !d)}
              className="p-2 rounded-full bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors shadow-md"
              title={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {darkMode ? (
                <SunIcon className="h-6 w-6 text-yellow-400" />
              ) : (
                <MoonIcon className="h-6 w-6 text-slate-800" />
              )}
            </button>
          </div>
        </div>
        <DragDropContext onDragEnd={handleDragEnd} onDragStart={handleDragStart}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 animate-fade-in-slow">
            {Object.entries(columns).map(([columnId, column]) => (
              <div key={columnId} className="flex flex-col h-full">
                <TaskColumn
                  columnId={columnId}
                  title={column.title}
                  tasks={column.items}
                  onEdit={setEditingTask}
                  onDelete={handleDeleteTask}
                />
                <button
                  onClick={() => { setIsFormOpen(true); setNewTaskStatus(columnId); }}
                  className="flex items-center justify-center mt-2 text-indigo-600 dark:text-indigo-300 font-bold font-[Montserrat] rounded-lg px-2 py-1 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-slate-800 dark:to-slate-900 border border-transparent dark:border-slate-700 hover:bg-indigo-100 dark:hover:bg-slate-700 hover:text-indigo-700 dark:hover:text-white transition-all tracking-tight shadow-md hover:scale-105"
                >
                  <span className="text-xl mr-1">+</span> Add Task
                </button>
              </div>
            ))}
          </div>
        </DragDropContext>
        {(isFormOpen || editingTask) && (
          <TaskForm
            task={editingTask}
            onSubmit={editingTask ? handleUpdateTask : (data) => handleCreateTask({ ...data, status: newTaskStatus })}
            onClose={() => {
              setIsFormOpen(false);
              setEditingTask(null);
              setNewTaskStatus(null);
            }}
            defaultStatus={!editingTask ? newTaskStatus : undefined}
          />
        )}
        {/* Footer */}
        <footer className="mt-16 text-center text-gray-400 dark:text-gray-500 text-sm font-[Montserrat] animate-fade-in-slow">
          <span>&copy; {new Date().getFullYear()} Task Board. Stay productive, stay inspired! 🚀</span>
        </footer>
      </div>
    </div>
  );
} 