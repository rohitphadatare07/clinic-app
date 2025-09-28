// App.js
import React, { useState, createContext, useContext } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import Login from './components/Auth/Login';
import PatientDashboard from './components/Dashboard/PatientDashboard';
import PatientProfile from './components/Patients/PatientProfile';
import PatientList from './components/Patients/PatientList';
import CreatePrescription from './components/Prescriptions/CreatePrescription';
import Navbar from './components/Shared/Navbar';
import Sidebar from './components/Shared/Sidebar';
import PrivateRoute from './components/Shared/PrivateRoute';
import NewPatient from './components/Patients/NewPatient';
import EditPatient from './components/Patients/EditPatient';
import { apiService } from './services/api';
import MedicineForm from './components/Medicines/MedicineForm';
import MedicinesList from './components/Medicines/MedicinesList';

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
        {/* Show navbar only when user is logged in */}
        {user && <Navbar onLogout={logout} user={user} />}
        
        {/* Conditional layout based on authentication */}
        {user ? (
          /* Logged-in layout with sidebar */
          <div className="app-layout">
            <Sidebar />
            <main className="main-content with-sidebar">
              <Routes>
                <Route path="/dashboard" element={<PatientDashboard />} />
                <Route path="/patient/:id" element={<PatientProfile />} />
                <Route path="/patients" element={<PatientList />} />
                <Route path="/patient/:id/prescription/new" element={<CreatePrescription />} />
                <Route path="/patient/:id/edit" element={<EditPatient />} />
                <Route path="/patient/new" element={<NewPatient />} />                
                <Route path="/medicines" element={<PrivateRoute><MedicinesList /></PrivateRoute>}/>
                <Route path="/medicines/new" element={<PrivateRoute><MedicineForm /></PrivateRoute>}/>
                <Route path="/" element={<Navigate to="/dashboard" replace />} />
                <Route path="*" element={<div className="container">Page not found</div>} />
              </Routes>
            </main>
          </div>
        ) : (
          /* Public layout without sidebar (for login) */
          <main className="main-content public-layout">
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="*" element={<Navigate to="/login" replace />} />
            </Routes>
          </main>
        )}
        
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