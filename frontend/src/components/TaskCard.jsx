import { Draggable } from 'react-beautiful-dnd';
import { PencilIcon, TrashIcon } from '@heroicons/react/24/outline';

function TaskCard({ task, index, onEdit, onDelete }) {
  return (
    <Draggable draggableId={task.id.toString()} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          className={`bg-white dark:bg-slate-800 p-4 rounded-xl shadow-md mb-4 cursor-move border border-slate-100 dark:border-slate-700
            transition-transform transition-shadow duration-400 ease-in-out
            ${snapshot.isDragging ? 'shadow-2xl scale-105 border-indigo-300 dark:border-indigo-600' : 'hover:shadow-lg hover:scale-[1.02]'}
          group`}
          style={{
            ...provided.draggableProps.style,
            opacity: snapshot.isDragging ? 0.95 : 1,
          }}
        >
          <h3 className="font-semibold text-slate-800 dark:text-white mb-2 text-lg transition-colors">{task.title}</h3>
          <p className="text-slate-500 dark:text-slate-300 mb-3 text-sm break-words whitespace-pre-line max-h-32 overflow-y-hidden group-hover:overflow-y-auto scrollbar-thin scrollbar-thumb-slate-300 dark:scrollbar-thumb-slate-600">{task.description}</p>
          <div className="flex justify-end items-center">
            <button
              onClick={() => onEdit(task)}
              className="text-slate-400 dark:text-slate-300 hover:text-indigo-500 dark:hover:text-indigo-400 transition-colors mr-2"
              title="Edit"
            >
              <PencilIcon className="h-5 w-5" />
            </button>
            <button
              onClick={() => onDelete(task.id)}
              className="text-slate-400 dark:text-slate-300 hover:text-red-500 dark:hover:text-red-400 transition-colors"
              title="Delete"
            >
              <TrashIcon className="h-5 w-5" />
            </button>
          </div>
        </div>
      )}
    </Draggable>
  );
}

export default TaskCard; 