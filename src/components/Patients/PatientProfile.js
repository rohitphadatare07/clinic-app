import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { apiService } from '../../services/api';

const PatientProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [patient, setPatient] = useState(null);
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchPatientData();
  }, [id]);

  const fetchPatientData = async () => {
    try {
      setLoading(true);
      
      // Fetch patient details
      const patientResult = await apiService.getPatient(id);
      if (!patientResult.success) {
        setError('Failed to fetch patient details');
        return;
      }

      // Fetch patient's prescriptions
      const prescriptionsResult = await apiService.getPrescriptions(id);
      
      if (patientResult.success) {
        setPatient(patientResult.data);
      }
      
      if (prescriptionsResult.success) {
        setPrescriptions(prescriptionsResult.data);
      }

    } catch (error) {
      setError('Failed to load patient data');
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePrescription = async (prescriptionId) => {
    if (window.confirm('Are you sure you want to delete this prescription?')) {
      const result = await apiService.deletePrescription(prescriptionId);
      
      if (result.success) {
        setPrescriptions(prescriptions.filter(p => p.id !== prescriptionId));
        alert('Prescription deleted successfully');
      } else {
        alert(result.message || 'Failed to delete prescription');
      }
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) return <div className="loading">Loading patient data...</div>;
  if (error) return <div className="error-message">{error}</div>;
  if (!patient) return <div>Patient not found</div>;

  return (
    <div className="patient-profile-container">
      <div className="profile-header">
        <div className="header-actions">
          <button onClick={() => navigate('/dashboard')} className="btn btn-secondary">
            ← Back to Dashboard
          </button>
          <div className="action-buttons">
            <Link to={`/patient/${id}/prescription/new`} className="btn btn-primary">
              New Prescription
            </Link>
            <Link to={`/patient/${id}/edit`} className="btn btn-secondary">
              Edit Patient
            </Link>
          </div>
        </div>

        <h1>Patient Details: {patient.name}</h1>
      </div>

      <div className="patient-info-grid">
        <div className="patient-basic-info">
          <h2>Basic Information</h2>
          <div className="info-grid">
            <div className="info-item">
              <span className="info-label">Name:</span>
              <span className="info-value">{patient.name}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Age:</span>
              <span className="info-value">{patient.age} years</span>
            </div>
            <div className="info-item">
              <span className="info-label">Gender:</span>
              <span className="info-value">{patient.gender}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Blood Group:</span>
              <span className="info-value">{patient.blood_group || 'Not specified'}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Contact:</span>
              <span className="info-value">{patient.contact_number || 'Not provided'}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Email:</span>
              <span className="info-value">{patient.email || 'Not provided'}</span>
            </div>
          </div>
        </div>

        <div className="patient-medical-info">
          <h2>Medical Information</h2>
          <div className="info-section">
            <h4>Allergies</h4>
            <p>{patient.allergies || 'No known allergies'}</p>
          </div>
          <div className="info-section">
            <h4>Medical History</h4>
            <p>{patient.medical_history || 'No significant medical history'}</p>
          </div>
          <div className="info-section">
            <h4>Address</h4>
            <p>{patient.address || 'Address not provided'}</p>
          </div>
        </div>
      </div>

      <div className="prescriptions-section">
        <div className="section-header">
          <h2>Prescription History</h2>
          <span className="prescription-count">
            ({prescriptions.length} prescription{prescriptions.length !== 1 ? 's' : ''})
          </span>
        </div>

        {prescriptions.length === 0 ? (
          <div className="empty-state">
            <p>No prescriptions found for this patient.</p>
            <Link to={`/patient/${id}/prescription/new`} className="btn btn-primary">
              Create First Prescription
            </Link>
          </div>
        ) : (
          <div className="prescriptions-list">
            {prescriptions.map((prescription) => (
              <div key={prescription.id} className="prescription-card">
                <div className="prescription-header">
                  <div className="prescription-meta">
                    <h3>Prescription from {formatDate(prescription.prescribed_date)}</h3>
                    {prescription.next_visit_date && (
                      <p className="next-visit">
                        Next visit: {formatDate(prescription.next_visit_date)}
                      </p>
                    )}
                  </div>
                  <div className="prescription-actions">
                    <button className="btn-text">Print</button>
                    <button 
                      onClick={() => handleDeletePrescription(prescription.id)}
                      className="btn-text danger"
                    >
                      Delete
                    </button>
                  </div>
                </div>

                {prescription.diagnosis && (
                  <div className="diagnosis-section">
                    <h4>Diagnosis</h4>
                    <p>{prescription.diagnosis}</p>
                  </div>
                )}

                <div className="medicines-section">
                  <h4>Medicines Prescribed</h4>
                  <div className="medicines-list">
                    {prescription.medicines && prescription.medicines.map((medicine, index) => (
                      <div key={index} className="medicine-item">
                        <span className="medicine-name">{medicine.medicine_name}</span>
                        <span className="medicine-details">
                          {medicine.dosage} • {medicine.frequency} • {medicine.duration}
                          {medicine.instructions && ` • ${medicine.instructions}`}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {prescription.additional_notes && (
                  <div className="notes-section">
                    <h4>Additional Notes</h4>
                    <p>{prescription.additional_notes}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default PatientProfile;