import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api/axios';

export default function Dashboard() {
  const [phones, setPhones] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user'));

  useEffect(() => {
    fetchPhones();
  }, []);

  const fetchPhones = async () => {
    try {
      const response = await API.get('/phones', { params: { assigned_to: 'me' } });
      setPhones(response.data);
    } catch (err) {
      console.error('Failed to fetch phones:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-apple-light-gray">
      <nav className="bg-apple-dark bg-opacity-80 backdrop-blur-lg text-white p-4 fixed w-full top-0 z-50">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <h1 className="text-xl font-semibold">Repair System</h1>
          <div className="flex items-center gap-6">
            <span className="text-sm">{user?.name}</span>
            <button
              onClick={handleLogout}
              className="bg-apple-blue hover:bg-blue-600 px-4 py-2 rounded-lg text-sm"
            >
              Logout
            </button>
          </div>
        </div>
      </nav>

      <div className="pt-24 px-6 max-w-7xl mx-auto">
        <div className="mb-8">
          <h2 className="text-4xl font-bold text-apple-dark mb-2 font-sf-pro-display">My Phones</h2>
          <p className="text-gray-600">Manage your repair assignments</p>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <p className="text-gray-600">Loading...</p>
          </div>
        ) : phones.length === 0 ? (
          <div className="bg-white rounded-lg p-12 text-center">
            <p className="text-gray-600 mb-4">No phones assigned yet</p>
            <button
              onClick={() => navigate('/phones')}
              className="bg-apple-blue text-white px-6 py-2 rounded-lg hover:bg-blue-600"
            >
              View All Phones
            </button>
          </div>
        ) : (
          <div className="grid gap-4">
            {phones.map((phone) => (
              <div
                key={phone.id}
                onClick={() => navigate(`/phones/${phone.id}`)}
                className="bg-white rounded-lg p-6 cursor-pointer hover:shadow-lg transition"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-semibold text-apple-dark">
                      {phone.serial_number}
                    </h3>
                    <p className="text-gray-600">{phone.model}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    phone.status === 'completed' ? 'bg-green-100 text-green-800' :
                    phone.status === 'testing' ? 'bg-yellow-100 text-yellow-800' :
                    phone.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {phone.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
