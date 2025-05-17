import { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import axios from 'axios';
import TaskColumn from './components/TaskColumn';
import TaskForm from './components/TaskForm';
import { MoonIcon, SunIcon, ClipboardDocumentListIcon } from '@heroicons/react/24/outline';

const API_URL = 'http://localhost:8000';

function App() {
  const [tasks, setTasks] = useState([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [newTaskStatus, setNewTaskStatus] = useState(null);
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem('theme') === 'dark';
  });

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
    fetchTasks();
  }, []);

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

  const fetchTasks = async () => {
    try {
      const response = await axios.get(`${API_URL}/tasks/`);
      setTasks(response.data);
    } catch (error) {
      console.error('Error fetching tasks:', error);
    }
  };

  const handleDragEnd = async (result) => {
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
      axios.put(`${API_URL}/tasks/${task.id}`, task)
    ));
  };

  const handleCreateTask = async (taskData) => {
    try {
      // Increment order of all tasks in the same column
      const colTasks = tasks.filter(t => t.status === taskData.status);
      await Promise.all(colTasks.map(t =>
        axios.put(`${API_URL}/tasks/${t.id}`, { ...t, order: t.order + 1 })
      ));
      // Set new task order to 0
      await axios.post(`${API_URL}/tasks/`, { ...taskData, order: 0 });
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
      await axios.put(`${API_URL}/tasks/${taskData.id}`, updatedTask);
      fetchTasks();
      setEditingTask(null);
    } catch (error) {
      console.error('Error updating task:', error);
    }
  };

  const handleDeleteTask = async (taskId) => {
    try {
      await axios.delete(`${API_URL}/tasks/${taskId}`);
      fetchTasks();
    } catch (error) {
      console.error('Error deleting task:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-slate-900 py-8 px-4 transition-colors duration-300">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div className="flex flex-col">
            <div className="flex items-center space-x-3">
              <ClipboardDocumentListIcon className="h-9 w-9 text-indigo-500 drop-shadow-sm" />
              <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 dark:text-white drop-shadow-sm font-[Montserrat]">Task Board</h1>
            </div>
            <div className="h-1 w-24 bg-gradient-to-r from-indigo-500 to-indigo-300 rounded-full mt-2 mb-1 opacity-80" />
          </div>
          <button
            onClick={() => setDarkMode((d) => !d)}
            className="ml-4 p-2 rounded-full bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors"
            title={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {darkMode ? (
              <SunIcon className="h-6 w-6 text-yellow-400" />
            ) : (
              <MoonIcon className="h-6 w-6 text-slate-800" />
            )}
          </button>
        </div>
        <DragDropContext onDragEnd={handleDragEnd}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
                  className="flex items-center justify-center mt-2 text-indigo-600 dark:text-indigo-300 font-bold font-[Montserrat] rounded-lg px-2 py-1 bg-indigo-50 dark:bg-slate-800 border border-transparent dark:border-slate-700 hover:bg-indigo-100 dark:hover:bg-slate-700 hover:text-indigo-700 dark:hover:text-white transition-colors tracking-tight shadow-sm"
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
      </div>
    </div>
  );
}

export default App; 