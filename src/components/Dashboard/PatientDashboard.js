import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { apiService } from '../../services/api';

const PatientDashboard = () => {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchPatients();
  }, []);

  const fetchPatients = async () => {
    setLoading(true);
    const result = await apiService.getPatients();
    
    if (result.success) {
      setPatients(result.data);
    } else {
      setError(result.message || 'Failed to fetch patients');
    }
    setLoading(false);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this patient?')) {
      const result = await apiService.deletePatient(id);
      
      if (result.success) {
        setPatients(patients.filter(patient => patient.id !== id));
      } else {
        alert(result.message || 'Failed to delete patient');
      }
    }
  };

  if (loading) return <div className="loading">Loading patients...</div>;
  if (error) return <div className="error-message">{error}</div>;

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>Patients</h1>
        <Link to="/patient/new" className="btn btn-primary">
          Add New Patient
        </Link>
      </div>

      <div className="patient-grid">
        {patients.length === 0 ? (
          <div className="empty-state">
            <p>No patients found. Add your first patient!</p>
          </div>
        ) : (
          patients.map(patient => (
            <div key={patient.id} className="patient-card">
              <h3>
                <Link to={`/patient/${patient.id}`}>{patient.name}</Link>
              </h3>
              <div className="patient-meta">
                <p>Age: {patient.age} | Gender: {patient.gender}</p>
                <p>Contact: {patient.contact_number || 'N/A'}</p>
                {patient.blood_group && <p>Blood Group: {patient.blood_group}</p>}
              </div>
              
              <div className="patient-actions">
                <Link 
                  to={`/patient/${patient.id}`} 
                  className="btn btn-secondary"
                >
                  View Details
                </Link>
                <Link 
                  to={`/patient/${patient.id}/prescription/new`} 
                  className="btn btn-secondary"
                >
                  New Prescription
                </Link>
                <button
                  onClick={() => handleDelete(patient.id)}
                  className="btn btn-danger"
                >
                  Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default PatientDashboard;