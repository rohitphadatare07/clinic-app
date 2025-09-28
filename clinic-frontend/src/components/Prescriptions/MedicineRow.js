import React, { useState, useEffect, useRef } from 'react';
import { apiService } from '../../services/api';

const MedicineRow = ({ index, medicine, availableMedicines, onChange, onRemove, patient }) => {
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const timeoutRef = useRef(null);

  const handleMedicineSelect = (medicineId) => {
    onChange(index, 'medicine_id', medicineId);
    setShowSuggestions(false);
  };

  const handleNameChange = (value) => {
    onChange(index, 'name', value);
    
    // Filter suggestions
    if (value.length < 2) {
      setSuggestions([]);
      return;
    }
    
    const filtered = availableMedicines.filter(med =>
      med.name.toLowerCase().includes(value.toLowerCase()) ||
      med.generic_name?.toLowerCase().includes(value.toLowerCase())
    );
    
    setSuggestions(filtered);
    setShowSuggestions(true);
  };

  return (
    <div className="medicine-row">
      {/* Medicine Selection */}
      <div className="form-group">
        <label>Medicine Name *</label>
        <select
          value={medicine.medicine_id}
          onChange={(e) => handleMedicineSelect(e.target.value)}
          required
        >
          <option value="">Select Medicine</option>
          {availableMedicines.map(med => (
            <option key={med.id} value={med.id}>
              {med.name} {med.generic_name && `(${med.generic_name})`} - {med.strength}
            </option>
          ))}
        </select>
      </div>

      {/* Dosage (auto-calculated) */}
      <div className="form-group">
        <label>Dosage *</label>
        <input
          type="text"
          value={medicine.dosage}
          onChange={(e) => onChange(index, 'dosage', e.target.value)}
          required
          placeholder="Dosage will be calculated automatically"
          readOnly={!!medicine.medicine_id} // Make read-only when medicine is selected
          className={medicine.medicine_id ? 'read-only' : ''}
        />
        {medicine.medicine_id && patient?.is_child && patient?.weight && (
          <small className="dosage-note">
            Calculated based on {patient.weight}kg weight
          </small>
        )}
      </div>

      {/* Frequency */}
      <div className="form-group">
        <label>Frequency *</label>
        <select
          value={medicine.frequency}
          onChange={(e) => onChange(index, 'frequency', e.target.value)}
          required
        >
          <option value="">Select Frequency</option>
          <option value="Once daily">Once daily</option>
          <option value="Twice daily">Twice daily</option>
          <option value="Three times daily">Three times daily</option>
          <option value="Four times daily">Four times daily</option>
          <option value="Every 6 hours">Every 6 hours</option>
          <option value="Every 8 hours">Every 8 hours</option>
          <option value="Every 12 hours">Every 12 hours</option>
          <option value="As needed">As needed</option>
        </select>
      </div>

      {/* Duration */}
      <div className="form-group">
        <label>Duration *</label>
        <input
          type="text"
          value={medicine.duration}
          onChange={(e) => onChange(index, 'duration', e.target.value)}
          required
          placeholder="e.g., 5 days, 1 week, 10 days"
        />
      </div>

      {/* Instructions */}
      <div className="form-group">
        <label>Instructions</label>
        <input
          type="text"
          value={medicine.instructions}
          onChange={(e) => onChange(index, 'instructions', e.target.value)}
          placeholder="e.g., After food, Before sleep"
        />
      </div>

      {/* Remove Button */}
      <div className="form-group">
        <label>&nbsp;</label>
        <button 
          type="button" 
          onClick={() => onRemove(index)} 
          className="btn-remove"
          title="Remove medicine"
        >
          ×
        </button>
      </div>
    </div>
  );
};

export default MedicineRow;