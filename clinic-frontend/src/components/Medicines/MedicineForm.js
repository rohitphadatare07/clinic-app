import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiService } from '../../services/api';

const MedicineForm = () => {
  const [formData, setFormData] = useState({
    name: '',
    common_dosage: '',
    generic_name: '',
    medicine_type: '',
    strength: '',
    form: 'tablet',
    manufacturer: '',
    description: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const medicineTypes = [
    'antibiotic', 'analgesic', 'antipyretic', 'antihistamine', 
    'antacid', 'vitamin', 'supplement', 'other'
  ];

  const medicineForms = [
    'tablet', 'capsule', 'syrup', 'injection', 'ointment', 
    'cream', 'drops', 'inhaler', 'spray', 'other'
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const result = await apiService.createMedicine(formData);
      
      if (result.success) {
        setSuccess('Medicine added successfully!');
        setFormData({
          name: '',
          common_dosage: '',
          generic_name: '',
          medicine_type: '',
          strength: '',
          form: 'tablet',
          manufacturer: '',
          description: ''
        });
        
        // Clear success message after 3 seconds
        setTimeout(() => {
          setSuccess('');
        }, 3000);
      } else {
        setError(result.message || 'Failed to add medicine');
      }
    } catch (error) {
      setError('An error occurred while adding medicine');
      console.error('Add medicine error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddAnother = () => {
    setFormData({
      name: '',
      common_dosage: '',
      generic_name: '',
      medicine_type: '',
      strength: '',
      form: 'tablet',
      manufacturer: '',
      description: ''
    });
    setSuccess('');
    setError('');
  };

  return (
    <div className="medicine-form-container">
      <div className="page-header">
        <h1>Add New Medicine</h1>
        <button 
          onClick={() => navigate('/medicines')} 
          className="btn btn-secondary"
        >
          View All Medicines
        </button>
      </div>

      {error && (
        <div className="alert alert-error">
          ❌ {error}
        </div>
      )}

      {success && (
        <div className="alert alert-success">
          ✅ {success}
        </div>
      )}

      <form onSubmit={handleSubmit} className="medicine-form">
        <div className="form-grid">
          <div className="form-group">
            <label>Medicine Name *</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              placeholder="e.g., Amoxicillin"
            />
          </div>

          <div className="form-group">
            <label>Generic Name</label>
            <input
              type="text"
              name="generic_name"
              value={formData.generic_name}
              onChange={handleChange}
              placeholder="e.g., Amoxicillin Trihydrate"
            />
          </div>

          <div className="form-group">
            <label>Common Dosage *</label>
            <input
              type="text"
              name="common_dosage"
              value={formData.common_dosage}
              onChange={handleChange}
              required
              placeholder="e.g., 500mg"
            />
          </div>

          <div className="form-group">
            <label>Strength</label>
            <input
              type="text"
              name="strength"
              value={formData.strength}
              onChange={handleChange}
              placeholder="e.g., 500mg/5ml"
            />
          </div>

          <div className="form-group">
            <label>Medicine Type *</label>
            <select
              name="medicine_type"
              value={formData.medicine_type}
              onChange={handleChange}
              required
            >
              <option value="">Select Type</option>
              {medicineTypes.map(type => (
                <option key={type} value={type}>
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Form *</label>
            <select
              name="form"
              value={formData.form}
              onChange={handleChange}
              required
            >
              {medicineForms.map(form => (
                <option key={form} value={form}>
                  {form.charAt(0).toUpperCase() + form.slice(1)}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Manufacturer</label>
            <input
              type="text"
              name="manufacturer"
              value={formData.manufacturer}
              onChange={handleChange}
              placeholder="e.g., Pfizer"
            />
          </div>
        </div>

        <div className="form-group">
          <label>Description</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows="3"
            placeholder="Additional information about the medicine..."
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
            type="button"
            onClick={handleAddAnother}
            className="btn btn-secondary"
            disabled={loading}
          >
            Clear Form
          </button>
          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary"
          >
            {loading ? 'Adding Medicine...' : 'Add Medicine'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default MedicineForm;