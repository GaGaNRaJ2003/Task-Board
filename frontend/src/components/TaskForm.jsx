import { useState, useEffect } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';

function TaskForm({ task, onSubmit, onClose, defaultStatus }) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    status: defaultStatus || 'todo',
  });

  useEffect(() => {
    if (task) {
      setFormData({
        title: task.title,
        description: task.description || '',
        status: task.status,
      });
    } else if (defaultStatus) {
      setFormData((prev) => ({ ...prev, status: defaultStatus }));
    }
  }, [task, defaultStatus]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      id: task?.id,
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 dark:bg-opacity-70 flex items-center justify-center z-50 transition-opacity animate-fade-in">
      <div className="bg-indigo-50 dark:bg-slate-800 rounded-2xl shadow-2xl p-8 md:p-10 w-full max-w-lg border-2 border-indigo-400 dark:border-indigo-600 transition-all duration-300">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-extrabold text-indigo-700 dark:text-indigo-300 font-[Montserrat] tracking-tight mb-2">
            {task ? 'Edit Task' : 'Create Task'}
          </h2>
          <button
            onClick={onClose}
            className="text-slate-400 dark:text-slate-300 hover:text-indigo-500 dark:hover:text-indigo-400 transition-colors"
            title="Close"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label
                htmlFor="title"
                className="block text-base font-semibold text-slate-700 dark:text-slate-200 font-[Montserrat] tracking-tight"
              >
                Title
              </label>
              <input
                type="text"
                id="title"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                className="mt-1 block w-full rounded-md border-slate-300 dark:border-slate-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 transition-all dark:bg-slate-900 dark:text-white"
                required
              />
            </div>

            <div>
              <label
                htmlFor="description"
                className="block text-base font-semibold text-slate-700 dark:text-slate-200 font-[Montserrat] tracking-tight"
              >
                Description
              </label>
              <textarea
                id="description"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                rows="3"
                className="mt-1 block w-full rounded-md border-slate-300 dark:border-slate-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 transition-all dark:bg-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label
                htmlFor="status"
                className="block text-base font-semibold text-slate-700 dark:text-slate-200 font-[Montserrat] tracking-tight"
              >
                Status
              </label>
              <select
                id="status"
                value={formData.status}
                onChange={(e) =>
                  setFormData({ ...formData, status: e.target.value })
                }
                className="mt-1 block w-full rounded-md border-slate-300 dark:border-slate-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 transition-all dark:bg-slate-900 dark:text-white"
              >
                <option value="todo">To Do</option>
                <option value="in_progress">In Progress</option>
                <option value="done">Done</option>
              </select>
            </div>
          </div>

          <div className="mt-6 flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-bold font-[Montserrat] text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-700 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-400 transition-all tracking-tight shadow-sm"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-bold font-[Montserrat] text-white bg-indigo-500 dark:bg-indigo-600 rounded-lg hover:bg-indigo-600 dark:hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-400 transition-all tracking-tight shadow-sm"
            >
              {task ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default TaskForm; 