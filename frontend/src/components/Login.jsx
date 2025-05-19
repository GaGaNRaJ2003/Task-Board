import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import Header from './Header';
import { ClipboardDocumentListIcon } from '@heroicons/react/24/outline';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    try {
      await login(username, password);
      navigate('/tasks');  // Navigate to task board after successful login
    } catch (error) {
      setError(error.message || 'Invalid username or password');
    }
  };

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
              Sign in to your account
            </h2>
          </div>
          <form className="mt-8 space-y-6 w-full" onSubmit={handleSubmit}>
            <div className="rounded-md shadow-sm -space-y-px">
              <div>
                <label htmlFor="username" className="sr-only">
                  Username
                </label>
                <input
                  id="username"
                  name="username"
                  type="text"
                  required
                  className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                  placeholder="Username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
              </div>
              <div>
                <label htmlFor="password" className="sr-only">
                  Password
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            {error && (
              <div className="text-red-500 text-sm text-center">{error}</div>
            )}

            <div>
              <button
                type="submit"
                className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-base font-semibold rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 shadow-md transition-all duration-200 hover:scale-105"
              >
                Sign In
              </button>
            </div>
          </form>
          <div className="relative flex items-center my-2 w-full">
            <div className="flex-grow border-t border-gray-300 dark:border-gray-600" />
            <span className="mx-2 text-gray-500 dark:text-gray-400 text-sm">Don't have an account?</span>
            <div className="flex-grow border-t border-gray-300 dark:border-gray-600" />
          </div>
          <button
            onClick={() => navigate('/register')}
            className="group relative w-full flex justify-center py-3 px-4 border border-indigo-600 text-base font-semibold rounded-lg text-indigo-600 bg-white hover:bg-indigo-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:bg-slate-800 dark:text-indigo-400 dark:border-indigo-400 dark:hover:bg-slate-700 shadow-md transition-all duration-200 hover:scale-105"
          >
            Create Account
          </button>
        </div>
      </div>
    </div>
  );
} 