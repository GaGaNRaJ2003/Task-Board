import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import Login from './Login';
import Register from './Register';
import Header from './Header';
import { ClipboardDocumentListIcon, SunIcon, MoonIcon } from '@heroicons/react/24/outline';
import { useDarkMode } from '../contexts/DarkModeContext';

export default function LandingPage() {
  const [showLogin, setShowLogin] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const { user } = useAuth();
  const { darkMode, toggleDarkMode } = useDarkMode();

  if (user) {
    return null; // If user is logged in, don't show landing page
  }

  if (showLogin) {
    return <Login />;
  }

  if (showRegister) {
    return <Register />;
  }

  return (
    <div className="min-h-screen w-full flex flex-col bg-gradient-to-br from-indigo-200 via-blue-100 to-purple-200 dark:bg-gradient-to-br dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 relative overflow-hidden">
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-indigo-300 opacity-30 rounded-full filter blur-3xl z-0 animate-pulse" />
      <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-purple-300 opacity-30 rounded-full filter blur-3xl z-0 animate-pulse" />
      <div className="w-full max-w-5xl mx-auto mt-8 z-10 flex items-center justify-between">
        <Header />
        <button
          onClick={toggleDarkMode}
          style={{ position: 'relative', right: '5cm' }}
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
      <div className="flex-1 flex items-center justify-center py-8 px-4 sm:px-6 lg:px-8 z-10">
        <div className="max-w-md w-full p-10 bg-white/90 dark:bg-slate-800/90 rounded-2xl shadow-2xl border border-indigo-100 dark:border-slate-700 transition-all duration-300 animate-fade-in flex flex-col items-center">
          <span className="bg-indigo-100 p-4 rounded-full mb-4 shadow-md">
            <ClipboardDocumentListIcon className="h-12 w-12 text-indigo-500" />
          </span>
          <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white font-[Montserrat] tracking-tight text-center mb-2">
            Welcome to Task Board
          </h2>
          <p className="mb-5 text-center text-md text-gray-600 dark:text-gray-300 font-[Montserrat]">
            Your personal task management solution
          </p>
          <button
            onClick={() => setShowLogin(true)}
            className="w-full py-3 mb-4 text-base font-semibold rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 shadow-md transition-all duration-200"
          >
            Sign In
          </button>
          <div className="flex items-center w-full my-2">
            <div className="flex-grow border-t border-gray-300 dark:border-gray-600" />
            <span className="mx-2 text-gray-500 dark:text-gray-400 text-sm">New to Task Board?</span>
            <div className="flex-grow border-t border-gray-300 dark:border-gray-600" />
          </div>
          <button
            onClick={() => setShowRegister(true)}
            className="w-full py-3 text-base font-semibold rounded-lg text-indigo-600 border-2 border-indigo-600 bg-white hover:bg-indigo-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:bg-slate-800 dark:text-indigo-400 dark:border-indigo-400 dark:hover:bg-slate-700 transition-all duration-200"
          >
            Create Account
          </button>
        </div>
      </div>
    </div>
  );
} 