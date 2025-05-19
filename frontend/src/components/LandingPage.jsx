import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import Login from './Login';
import Register from './Register';
import Header from './Header';
import { ClipboardDocumentListIcon } from '@heroicons/react/24/outline';

export default function LandingPage() {
  const [showLogin, setShowLogin] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const { user } = useAuth();

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
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-gradient-to-br from-indigo-200 via-blue-100 to-purple-200 relative overflow-hidden">
      {/* Decorative blurred shapes */}
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-indigo-300 opacity-30 rounded-full filter blur-3xl z-0 animate-pulse" />
      <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-purple-300 opacity-30 rounded-full filter blur-3xl z-0 animate-pulse" />
      <div className="w-full max-w-5xl mx-auto mt-8 z-10">
        <Header />
      </div>
      <div className="flex-1 flex items-center justify-center py-8 px-4 sm:px-6 lg:px-8 z-10">
        <div className="max-w-md w-full space-y-8 p-10 bg-white/90 dark:bg-slate-800/90 rounded-2xl shadow-2xl border border-indigo-100 dark:border-slate-700 transition-all duration-300 animate-fade-in flex flex-col items-center">
          <div className="flex flex-col items-center">
            <span className="bg-indigo-100 p-4 rounded-full mb-2 shadow-md">
              <ClipboardDocumentListIcon className="h-12 w-12 text-indigo-500" />
            </span>
            <h2 className="mt-2 text-center text-3xl font-extrabold text-gray-900 dark:text-white font-[Montserrat] tracking-tight">
              Welcome to Task Board
            </h2>
            <p className="mt-2 text-center text-base text-gray-600 dark:text-gray-300 font-[Montserrat]">
              Your personal task management solution
            </p>
          </div>
          <div className="mt-8 space-y-4 w-full">
            <button
              onClick={() => setShowLogin(true)}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-base font-semibold rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 shadow-md transition-all duration-200 hover:scale-105"
            >
              Sign In
            </button>
            <div className="relative flex items-center my-2">
              <div className="flex-grow border-t border-gray-300 dark:border-gray-600" />
              <span className="mx-2 text-gray-500 dark:text-gray-400 text-sm">New to Task Board?</span>
              <div className="flex-grow border-t border-gray-300 dark:border-gray-600" />
            </div>
            <button
              onClick={() => setShowRegister(true)}
              className="group relative w-full flex justify-center py-3 px-4 border border-indigo-600 text-base font-semibold rounded-lg text-indigo-600 bg-white hover:bg-indigo-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:bg-slate-800 dark:text-indigo-400 dark:border-indigo-400 dark:hover:bg-slate-700 shadow-md transition-all duration-200 hover:scale-105"
            >
              Create Account
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 