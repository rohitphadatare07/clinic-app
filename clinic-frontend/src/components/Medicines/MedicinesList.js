import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { apiService } from '../../services/api';

const MedicinesList = () => {
  const [medicines, setMedicines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('');

  useEffect(() => {
    fetchMedicines();
  }, []);

  const fetchMedicines = async () => {
    try {
      setLoading(true);
      const result = await apiService.getMedicines();
      
      if (result.success) {
        setMedicines(result.data);
      } else {
        setError(result.message || 'Failed to fetch medicines');
      }
    } catch (error) {
      setError('Failed to load medicines');
      console.error('Fetch medicines error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this medicine?')) {
      try {
        const result = await apiService.deleteMedicine(id);
        
        if (result.success) {
          setMedicines(medicines.filter(med => med.id !== id));
          alert('Medicine deleted successfully');
        } else {
          alert(result.message || 'Failed to delete medicine');
        }
      } catch (error) {
        alert('Error deleting medicine');
        console.error('Delete medicine error:', error);
      }
    }
  };

  const filteredMedicines = medicines.filter(medicine => {
    const matchesSearch = medicine.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         medicine.generic_name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = !filterType || medicine.medicine_type === filterType;
    return matchesSearch && matchesType;
  });

  const medicineTypes = [...new Set(medicines.map(med => med.medicine_type).filter(Boolean))];

  if (loading) return <div className="loading">Loading medicines...</div>;
  if (error) return <div className="error-message">{error}</div>;

  return (
    <div className="medicines-list-container">
      <div className="page-header">
        <h1>Medicines Inventory</h1>
        <Link to="/medicines/new" className="btn btn-primary">
          + Add New Medicine
        </Link>
      </div>

      <div className="filters">
        <div className="search-box">
          <input
            type="text"
            placeholder="Search medicines..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
          <span className="search-icon">🔍</span>
        </div>

        {medicineTypes.length > 0 && (
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="filter-select"
          >
            <option value="">All Types</option>
            {medicineTypes.map(type => (
              <option key={type} value={type}>
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </option>
            ))}
          </select>
        )}
      </div>

      <div className="medicines-grid">
        {filteredMedicines.map(medicine => (
          <div key={medicine.id} className="medicine-card">
            <div className="card-header">
              <h3>{medicine.name}</h3>
              {medicine.medicine_type && (
                <span className="medicine-type">{medicine.medicine_type}</span>
              )}
            </div>
            
            <div className="medicine-details">
              {medicine.generic_name && (
                <p><strong>Generic:</strong> {medicine.generic_name}</p>
              )}
              <p><strong>Dosage:</strong> {medicine.common_dosage}</p>
              {medicine.strength && (
                <p><strong>Strength:</strong> {medicine.strength}</p>
              )}
              {medicine.form && (
                <p><strong>Form:</strong> {medicine.form}</p>
              )}
              {medicine.manufacturer && (
                <p><strong>Manufacturer:</strong> {medicine.manufacturer}</p>
              )}
              {medicine.description && (
                <p className="description">{medicine.description}</p>
              )}
              <p className="created-date">
                Added: {new Date(medicine.created_at).toLocaleDateString()}
              </p>
            </div>

            <div className="card-actions">
              <button
                onClick={() => handleDelete(medicine.id)}
                className="btn btn-sm btn-danger"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {filteredMedicines.length === 0 && (
        <div className="empty-state">
          {searchTerm || filterType ? (
            <p>No medicines found matching your criteria</p>
          ) : (
            <>
              <p>No medicines found in inventory</p>
              <Link to="/medicines/new" className="btn btn-primary">
                Add First Medicine
              </Link>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default MedicinesList;