import React, { useState, useEffect, useRef } from 'react';
import { apiService } from '../../services/api';

const MedicineRow = ({ index, medicine, onChange, onRemove }) => {
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const timeoutRef = useRef(null);

  const fetchSuggestions = async (query) => {
    if (query.length < 2) {
      setSuggestions([]);
      return;
    }
    const result = await apiService.searchMedicines(query);
    if (result.success) {
      setSuggestions(result.data);
      setShowSuggestions(true);
    }
  };

  const handleNameChange = (value) => {
    onChange(index, 'name', value);
    // Debounce the API call
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => fetchSuggestions(value), 300);
  };

  const selectSuggestion = (suggestion) => {
    onChange(index, 'name', suggestion.name);
    // Auto-fill a common dosage
    if (suggestion.commonDosage) {
      onChange(index, 'dosage', suggestion.commonDosage);
    }
    setShowSuggestions(false);
  };

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  return (
    <div className="medicine-row">
      <div className="form-group suggestions-container">
        <label>Medicine Name *</label>
        <input
          type="text"
          value={medicine.name}
          onChange={(e) => handleNameChange(e.target.value)}
          onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
          onFocus={() => medicine.name && fetchSuggestions(medicine.name)}
          required
          placeholder="Search medicine..."
        />
        {showSuggestions && suggestions.length > 0 && (
          <ul className="suggestions-list">
            {suggestions.map((suggestion) => (
              <li 
                key={suggestion.id} 
                onMouseDown={() => selectSuggestion(suggestion)}
                className="suggestion-item"
              >
                {suggestion.name} 
                <span className="common-dosage">{suggestion.commonDosage}</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="form-group">
        <label>Dosage *</label>
        <input
          type="text"
          value={medicine.dosage}
          onChange={(e) => onChange(index, 'dosage', e.target.value)}
          placeholder="e.g., 500mg"
          required
        />
      </div>

      <div className="form-group">
        <label>Frequency *</label>
        <input
          type="text"
          value={medicine.frequency}
          onChange={(e) => onChange(index, 'frequency', e.target.value)}
          placeholder="e.g., Twice daily"
          required
        />
      </div>

      <div className="form-group">
        <label>Duration *</label>
        <input
          type="text"
          value={medicine.duration}
          onChange={(e) => onChange(index, 'duration', e.target.value)}
          placeholder="e.g., 5 days"
          required
        />
      </div>

      <div className="form-group">
        <label>Instructions</label>
        <input
          type="text"
          value={medicine.instructions || ''}
          onChange={(e) => onChange(index, 'instructions', e.target.value)}
          placeholder="e.g., After food"
        />
      </div>

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