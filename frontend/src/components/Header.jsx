import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { ClipboardDocumentListIcon } from '@heroicons/react/24/outline';

export default function Header() {
  const { user } = useAuth();

  return (
    <div className="flex flex-col">
      <Link 
        to={user ? "/tasks" : "/"} 
        className="flex items-center space-x-3 hover:opacity-80 transition-opacity"
      >
        <ClipboardDocumentListIcon className="h-9 w-9 text-indigo-500 drop-shadow-sm" />
        <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 dark:text-white drop-shadow-sm font-[Montserrat]">
          Task Board
        </h1>
      </Link>
      <div className="h-1 w-24 bg-gradient-to-r from-indigo-500 to-indigo-300 rounded-full mt-2 mb-1 opacity-80" />
    </div>
  );
} 