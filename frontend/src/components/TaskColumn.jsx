import { Droppable } from 'react-beautiful-dnd';
import TaskCard from './TaskCard';

function TaskColumn({ columnId, title, tasks, onEdit, onDelete }) {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 shadow-lg border border-slate-200 dark:border-slate-700 min-h-[350px] flex flex-col animate-fade-in transition-colors duration-300">
      <h2 className="text-xl font-bold mb-4 tracking-tight flex items-center text-indigo-700 dark:text-indigo-300 font-[Montserrat]">
        {title}
      </h2>
      <Droppable droppableId={columnId}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={`min-h-[200px] p-2 rounded-xl transition-colors duration-200 ${
              snapshot.isDraggingOver ? 'bg-indigo-50 dark:bg-indigo-900' : ''
            }`}
          >
            {tasks.map((task, index) => (
              <TaskCard
                key={task.id}
                task={task}
                index={index}
                onEdit={onEdit}
                onDelete={onDelete}
              />
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </div>
  );
}

export default TaskColumn; 