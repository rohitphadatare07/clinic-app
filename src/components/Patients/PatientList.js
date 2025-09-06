import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { apiService } from '../../services/api';

const PatientList = () => {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchPatientList();
  }, []);

  const fetchPatientList = async () => {
    try {
      setLoading(true);
      setError('');
      
      const result = await apiService.getPatients();
      
      if (result.success) {
        setPatients(result.data);
      } else {
        setError(result.message || 'Failed to fetch patients');
      }
    } catch (error) {
      setError('Failed to load patient data. Please try again.');
      console.error('Fetch patients error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (patientId) => {
    if (window.confirm('Are you sure you want to delete this patient? This action cannot be undone.')) {
      try {
        const result = await apiService.deletePatient(patientId);
        
        if (result.success) {
          setPatients(patients.filter(patient => patient.id !== patientId));
          alert('Patient deleted successfully');
        } else {
          alert(result.message || 'Failed to delete patient');
        }
      } catch (error) {
        alert('Error deleting patient');
        console.error('Delete patient error:', error);
      }
    }
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  // Filter patients based on search term
  const filteredPatients = patients.filter(patient =>
    patient.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.contact_number?.includes(searchTerm) ||
    patient.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading patients...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <div className="error-message">{error}</div>
        <button onClick={fetchPatientList} className="btn btn-primary">
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="patient-list-container">
      <div className="page-header">
        <h1>All Patients</h1>
        <Link to="/patient/new" className="btn btn-primary">
          Add New Patient
        </Link>
      </div>

      {/* Search Box */}
      <div className="search-box">
        <input
          type="text"
          placeholder="Search patients by name, phone, or email..."
          value={searchTerm}
          onChange={handleSearch}
          className="search-input"
        />
        <span className="search-icon">🔍</span>
      </div>

      {/* Patients Count */}
      <div className="patients-count">
        Showing {filteredPatients.length} of {patients.length} patients
      </div>

      {/* Patients Table */}
      <div className="patients-table-container">
        <table className="patients-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Age</th>
              <th>Gender</th>
              <th>Contact</th>
              <th>Last Visit</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredPatients.length === 0 ? (
              <tr>
                <td colSpan="6" className="no-patients">
                  {searchTerm ? 'No patients found matching your search' : 'No patients found'}
                </td>
              </tr>
            ) : (
              filteredPatients.map((patient) => (
                <tr key={patient.id} className="patient-row">
                  <td>
                    <div className="patient-info">
                      <strong>{patient.name || 'Unknown'}</strong>
                      {patient.email && (
                        <span className="patient-email">{patient.email}</span>
                      )}
                    </div>
                  </td>
                  <td>{patient.age || 'N/A'}</td>
                  <td>{patient.gender || 'N/A'}</td>
                  <td>
                    {patient.contact_number || 'No contact'}
                    {patient.blood_group && (
                      <span className="blood-group">({patient.blood_group})</span>
                    )}
                  </td>
                  <td>{formatDate(patient.last_visit)}</td>
                  <td>
                    <div className="action-buttons">
                      <Link
                        to={`/patient/${patient.id}`}
                        className="btn btn-sm btn-secondary"
                        title="View Details"
                      >
                        👁️ View
                      </Link>
                      <Link
                        to={`/patient/${patient.id}/prescription/new`}
                        className="btn btn-sm btn-primary"
                        title="New Prescription"
                      >
                        💊 Rx
                      </Link>
                      <button
                        onClick={() => handleDelete(patient.id)}
                        className="btn btn-sm btn-danger"
                        title="Delete Patient"
                      >
                        🗑️ Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Export Options */}
      <div className="export-options">
        <button className="btn btn-outline">
          📄 Export to CSV
        </button>
        <button className="btn btn-outline">
          🖨️ Print List
        </button>
      </div>
    </div>
  );
};

export default PatientList;