import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { apiService } from '../../services/api';
import MonthlyPatientsChart from '../Charts/MonthlyPatientsChart';

const PatientDashboard = () => {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [stats, setStats] = useState({
    totalPatients: 0,
    totalAppointments: 0,
    todaysPatients: 0
  });

  // Add this state and useEffect
  const [monthlyData, setMonthlyData] = useState({});
  const [chartLoading, setChartLoading] = useState(true);

  useEffect(() => {
    fetchMonthlyStats();
  }, []);

  const fetchMonthlyStats = async () => {
    try {
      const result = await apiService.getMonthlyPatientStats();
      if (result.success) {
        setMonthlyData(result.data);
      }
    } catch (error) {
      console.error('Failed to fetch monthly stats:', error);
    } finally {
      setChartLoading(false);
    }
  };

  // Add loading state for chart
  {chartLoading ? (
    <div className="chart-loading">
      <div className="loading-spinner"></div>
      <p>Loading chart data...</p>
    </div>
  ) : (
    <MonthlyPatientsChart monthlyData={monthlyData} />
  )}
  useEffect(() => {
    fetchPatients();
  }, []);

  const fetchPatients = async () => {
    try {
      setLoading(true);
      const result = await apiService.getPatients();
      
      if (result.success) {
        setPatients(result.data);
        
        // Calculate statistics
        const totalPatients = result.data.length;
        const totalAppointments = result.data.reduce((total, patient) => 
          total + (patient.appointment_count || 0), 0
        );
        
        // Calculate today's patients (mock data - you'll need real appointment data)
        const todaysPatients = result.data.filter(patient => 
          patient.last_visit === new Date().toISOString().split('T')[0]
        ).length;

        setStats({
          totalPatients,
          totalAppointments,
          todaysPatients
        });
      } else {
        setError('Failed to fetch patients.');
      }
    } catch (error) {
      setError('Failed to load patients.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this patient?')) {
      const result = await apiService.deletePatient(id);
      
      if (result.success) {
        setPatients(patients.filter(patient => patient.id !== id));
        setStats(prev => ({ ...prev, totalPatients: prev.totalPatients - 1 }));
      } else {
        alert(result.message || 'Failed to delete patient');
      }
    }
  };

  if (loading) return <div className="loading">Loading dashboard...</div>;
  if (error) return <div className="error-message">{error}</div>;

  return (
    <div className="dashboard-container">
      {/* Dashboard Header */}
      <div className="dashboard-header">
        <h1>Dashboard Overview</h1>
      </div>

      {/* Statistics Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon patients-icon">
            👥
          </div>
          <div className="stat-content">
            <h3 className="stat-number">{stats.totalPatients}</h3>
            <p className="stat-label">Total Patients</p>
          </div>
          <div className="stat-trend">
            <span className="trend-up">+12%</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon appointments-icon">
            📅
          </div>
          <div className="stat-content">
            <h3 className="stat-number">{stats.totalAppointments}</h3>
            <p className="stat-label">Total Appointments</p>
          </div>
          <div className="stat-trend">
            <span className="trend-up">+8%</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon today-icon">
            🌟
          </div>
          <div className="stat-content">
            <h3 className="stat-number">{stats.todaysPatients}</h3>
            <p className="stat-label">Today's Patients</p>
          </div>
          <div className="stat-trend">
            <span className="trend-neutral">0</span>
          </div>
        </div>
      </div>

      <div className="chart-section">
        <MonthlyPatientsChart monthlyData={monthlyData} />
      </div>

      {/* Recent Patients Section */}
      <div className="recent-section">
        <div className="section-header">
          <h2>Recent Patients</h2>
          <Link to="/patients" className="btn btn-outline">
            View All Patients
          </Link>
        </div>

        <div className="patients-grid">
          {patients.slice(0, 6).map(patient => (
            <div key={patient.id} className="patient-card">
              <div className="card-header">
                <div className="patient-avatar">
                  {patient.name ? patient.name.charAt(0).toUpperCase() : '?'}
                </div>
                <div className="patient-info">
                  <h3>{patient.name}</h3>
                  <p>{patient.age} years • {patient.gender}</p>
                </div>
              </div>
              
              <div className="patient-details">
                {patient.contact_number && (
                  <p className="contact-info">📞 {patient.contact_number}</p>
                )}
                {patient.blood_group && (
                  <p className="blood-group">🩸 {patient.blood_group}</p>
                )}
                {patient.last_visit && (
                  <p className="last-visit">📅 Last visit: {new Date(patient.last_visit).toLocaleDateString()}</p>
                )}
              </div>

              <div className="card-actions">
                <Link to={`/patient/${patient.id}`} className="btn btn-sm btn-secondary">
                  View Details
                </Link>
                <Link to={`/patient/${patient.id}/prescription/new`} className="btn btn-sm btn-primary">
                  New Rx
                </Link>
                <button 
                  onClick={() => handleDelete(patient.id)} 
                  className="btn btn-sm btn-danger"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>

        {patients.length === 0 && (
          <div className="empty-state">
            <p>No patients found. Add your first patient!</p>
            <Link to="/patient/new" className="btn btn-primary">
              Add First Patient
            </Link>
          </div>
        )}
      </div>

      {/* Quick Actions Section */}
      <div className="quick-actions">
        <h2>Quick Actions</h2>
        <div className="action-buttons-grid">
          <Link to="/patient/new" className="action-btn">
            <span className="action-icon">➕</span>
            <span className="action-text">Add New Patient</span>
          </Link>
          <Link to="/patients" className="action-btn">
            <span className="action-icon">👥</span>
            <span className="action-text">View All Patients</span>
          </Link>
          <Link to="/appointments" className="action-btn">
            <span className="action-icon">📅</span>
            <span className="action-text">Manage Appointments</span>
          </Link>
          <Link to="/reports" className="action-btn">
            <span className="action-icon">📊</span>
            <span className="action-text">Generate Reports</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default PatientDashboard;