import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api/axios';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const response = await API.post('/auth/login', { username, password });
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed');
    }
  };

  return (
    <div className="min-h-screen bg-apple-dark flex items-center justify-center">
      <div className="w-full max-w-md bg-dark-surface-1 p-8 rounded-lg">
        <h1 className="text-3xl font-bold text-white mb-2 font-sf-pro-display">Repair Tracking</h1>
        <p className="text-gray-400 mb-8">iPhone Repair System</p>

        {error && (
          <div className="bg-red-500 text-white p-4 rounded mb-6 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Username
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full bg-dark-surface-2 border border-dark-surface-3 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-apple-blue"
              required
            />
          </div>

          <div className="mb-8">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-dark-surface-2 border border-dark-surface-3 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-apple-blue"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full bg-apple-blue hover:bg-blue-600 text-white font-medium py-2 rounded-lg transition"
          >
            Sign In
          </button>
        </form>
      </div>
    </div>
  );
}
