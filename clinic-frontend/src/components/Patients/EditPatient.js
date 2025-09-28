import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { apiService } from '../../services/api';

const EditPatient = () => {
  const { id } = useParams(); // get id from URL /patients/edit/:id
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    weight: '',
    gender: '',
    contact_number: '',
    email: '',
    address: '',
    blood_group: '',
    allergies: '',
    medical_history: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [initialLoading, setInitialLoading] = useState(true);

  const navigate = useNavigate();

  // Fetch patient details
  useEffect(() => {
    const fetchPatient = async () => {
      try {
        const result = await apiService.getPatient(id);
        if (result.success) {
          setFormData(result.data); // prefill form with existing data
        } else {
          setError(result.message || 'Failed to load patient details');
        }
      } catch (err) {
        setError('Error fetching patient details');
      } finally {
        setInitialLoading(false);
      }
    };

    fetchPatient();
  }, [id]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const result = await apiService.updatePatient(id, formData);
    setLoading(false);

    if (result.success) {
      navigate('/dashboard');
    } else {
      setError(result.message || 'Failed to update patient');
    }
  };

  if (initialLoading) {
    return <div className="loading">Loading patient details...</div>;
  }

  return (
    <div className="patient-form-container">
      <div className="form-header">
        <h1>Edit Patient</h1>
        <button
          onClick={() => navigate('/dashboard')}
          className="btn btn-cancel"
        >
          Back to Dashboard
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}

      <form onSubmit={handleSubmit} className="patient-form">
        <div className="form-grid">
          <div className="form-group">
            <label>Full Name *</label>
            <input
              type="text"
              name="name"
              value={formData.name || ''}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Age *</label>
            <input
              type="number"
              name="age"
              value={formData.age || ''}
              onChange={handleChange}
              required
              min="0"
              max="120"
            />
          </div>

          <div className="form-group">
            <label>Weight *</label>
            <input
              type="number"
              name="weight"
              value={formData.weight || ''}
              onChange={handleChange}
              required
              min="0"
              max="200"
            />
          </div>

          <div className="form-group">
            <label>Gender *</label>
            <select
              name="gender"
              value={formData.gender || ''}
              onChange={handleChange}
              required
            >
              <option value="">Select Gender</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div className="form-group">
            <label>Contact Number</label>
            <input
              type="tel"
              name="contact_number"
              value={formData.contact_number || ''}
              onChange={handleChange}
              placeholder="+1234567890"
            />
          </div>

          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              name="email"
              value={formData.email || ''}
              onChange={handleChange}
              placeholder="patient@example.com"
            />
          </div>

          <div className="form-group">
            <label>Blood Group</label>
            <select
              name="blood_group"
              value={formData.blood_group || ''}
              onChange={handleChange}
            >
              <option value="">Select Blood Group</option>
              <option value="A+">A+</option>
              <option value="A-">A-</option>
              <option value="B+">B+</option>
              <option value="B-">B-</option>
              <option value="AB+">AB+</option>
              <option value="AB-">AB-</option>
              <option value="O+">O+</option>
              <option value="O-">O-</option>
            </select>
          </div>
        </div>

        <div className="form-group">
          <label>Address</label>
          <textarea
            name="address"
            value={formData.address || ''}
            onChange={handleChange}
            rows="3"
            placeholder="Full address"
          />
        </div>

        <div className="form-group">
          <label>Allergies</label>
          <textarea
            name="allergies"
            value={formData.allergies || ''}
            onChange={handleChange}
            rows="2"
            placeholder="List any known allergies"
          />
        </div>

        <div className="form-group">
          <label>Medical History</label>
          <textarea
            name="medical_history"
            value={formData.medical_history || ''}
            onChange={handleChange}
            rows="3"
            placeholder="Previous conditions, surgeries, chronic diseases, etc."
          />
        </div>

        <div className="form-actions">
          <button
            type="button"
            onClick={() => navigate('/dashboard')}
            className="btn btn-cancel"
            disabled={loading}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary"
          >
            {loading ? 'Updating...' : 'Update Patient'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditPatient;
