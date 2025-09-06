// App.js
import React, { useState, createContext, useContext } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import Login from './components/Auth/Login';
import PatientDashboard from './components/Dashboard/PatientDashboard';
import PatientProfile from './components/Patients/PatientProfile';
import CreatePrescription from './components/Prescriptions/CreatePrescription';
import Navbar from './components/Shared/Navbar';
import PrivateRoute from './components/Shared/PrivateRoute';
import NewPatient from './components/Patients/NewPatient';
import { apiService } from './services/api';

// Create an Auth Context to share user state
export const AuthContext = createContext();

export const useAuth = () => {
  return useContext(AuthContext);
};

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const login = async (credentials) => {
    setLoading(true);
    const result = await apiService.login(credentials);
    setLoading(false);
    if (result.success) {
      setUser(result.user);
      // Store user data in localStorage for persistence
      localStorage.setItem('user', JSON.stringify(result.user));
      localStorage.setItem('token', result.token);
      navigate('/dashboard');
    }
    return result;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    navigate('/login');
  };

  // Check for existing session on app load
  React.useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const storedToken = localStorage.getItem('token');
    
    if (storedUser && storedToken) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const value = {
    user,
    login,
    logout,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      <div className="App">
        {user && <Navbar onLogout={logout} user={user} />}
        <main className={user ? 'main-content' : ''}>
          <Routes>
            <Route 
              path="/login" 
              element={
                user ? <Navigate to="/dashboard" replace /> : <Login />
              } 
            />
            <Route
              path="/dashboard"
              element={
                <PrivateRoute>
                  <PatientDashboard />
                </PrivateRoute>
              }
            />
            <Route
              path="/patient/:id"
              element={
                <PrivateRoute>
                  <PatientProfile />
                </PrivateRoute>
              }
            />
            <Route
              path="/patient/:id/prescription/new"
              element={
                <PrivateRoute>
                  <CreatePrescription />
                </PrivateRoute>
              }
            />
            <Route
              path="/patient/new"
              element={
                <PrivateRoute>
                  <NewPatient />
                </PrivateRoute>
              }
            />
            <Route 
              path="/" 
              element={<Navigate to="/dashboard" replace />} 
            />
            <Route 
              path="*" 
              element={<div className="container">Page not found</div>} 
            />
          </Routes>
        </main>
        
        {/* Global Loading Overlay */}
        {loading && (
          <div className="loading-overlay">
            <div className="loading-spinner"></div>
          </div>
        )}
      </div>
    </AuthContext.Provider>
  );
}

export default App;