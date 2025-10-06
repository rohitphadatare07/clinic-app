import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { apiService } from '../../services/api';
import MedicineRow from './MedicineRow';

const CreatePrescription = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [patient, setPatient] = useState(null);
  const [medicines, setMedicines] = useState([{ 
    medicine_id: '', name: '', dosage: '', frequency: '', duration: '', instructions: '' 
  }]);
  const [availableMedicines, setAvailableMedicines] = useState([]);
  const [diagnosis, setDiagnosis] = useState('');
  const [additionalNotes, setAdditionalNotes] = useState('');
  const [nextVisitDate, setNextVisitDate] = useState('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchPatientData();
    fetchAvailableMedicines();
  }, [id]);

  const fetchPatientData = async () => {
    try {
      const result = await apiService.getPatient(id);
      if (result.success) {
        setPatient(result.data);
      }
    } catch (error) {
      setError('Failed to load patient data');
    }
  };

  const fetchAvailableMedicines = async () => {
    try {
      const result = await apiService.getMedicines();
      if (result.success) {
        setAvailableMedicines(result.data);
      }
    } catch (error) {
      console.error('Failed to fetch medicines:', error);
    }
  };

  const handleMedicineChange = (index, field, value) => {
    const newMedicines = [...medicines];
    
    if (field === 'medicine_id') {
      // When medicine is selected, find its details and calculate dosage
      const selectedMedicine = availableMedicines.find(med => med.id === parseInt(value));
      if (selectedMedicine) {
        newMedicines[index] = {
          ...newMedicines[index],
          medicine_id: value,
          name: selectedMedicine.name,
          dosage: calculateDosage(selectedMedicine),
          [field]: value
        };
      }
    } else {
      newMedicines[index][field] = value;
    }
    
    setMedicines(newMedicines);
  };

  const calculateDosage = (medicine) => {
    if (!patient || !patient.weight || !medicine.common_dosage) {
      return medicine.common_dosage || '';
    }

    try {
      const weight = parseFloat(patient.weight);
      if (isNaN(weight) || weight <= 0) return medicine.common_dosage;

      // Extract numeric value from common_dosage (e.g., "500mg" -> 500)
      const dosageMatch = medicine.common_dosage.match(/(\d+\.?\d*)\s*mg/i);
      console.log('dosageMatch', dosageMatch);
      if (!dosageMatch) return medicine.common_dosage;

      const baseDosage = parseFloat(dosageMatch[1]);
      console.log('baseDosage', baseDosage);
      if (isNaN(baseDosage)) return medicine.common_dosage;

      // Calculate dosage based on weight (for pediatric patients)
      let calculatedDosage = baseDosage;
      
      if (weight > 0) {
        // Default calculation for other medicines
        calculatedDosage = weight * baseDosage;
        
        // Round to nearest whole number
        calculatedDosage = Math.round(calculatedDosage);
      }

      return `${calculatedDosage}mg`;
      
    } catch (error) {
      console.error('Dosage calculation error:', error);
      return medicine.common_dosage;
    }
  };

  const addMedicine = () => {
    setMedicines([...medicines, { 
      medicine_id: '', name: '', dosage: '', frequency: '', duration: '', instructions: '' 
    }]);
  };

  const removeMedicine = (index) => {
    if (medicines.length === 1) return;
    const newMedicines = medicines.filter((_, i) => i !== index);
    setMedicines(newMedicines);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    // Basic validation
    const validMedicines = medicines.filter(med => 
      med.medicine_id && med.name.trim() !== '' && med.dosage.trim() !== ''
    );
    
    if (validMedicines.length === 0) {
      setError('Please add at least one medicine');
      setSaving(false);
      return;
    }

    const prescriptionData = {
      patient_id: parseInt(id),
      diagnosis: diagnosis.trim(),
      additional_notes: additionalNotes.trim(),
      next_visit_date: nextVisitDate || null,
      medicines: validMedicines.map(med => ({
        medicine_id: parseInt(med.medicine_id),
        medicine_name: med.name,
        dosage: med.dosage,
        frequency: med.frequency,
        duration: med.duration,
        instructions: med.instructions
      }))
    };

    const result = await apiService.createPrescription(prescriptionData);
    setSaving(false);

    if (result.success) {
      alert('Prescription saved successfully!');
      navigate(`/patient/${id}`);
    } else {
      setError(result.message || 'Failed to save prescription.');
    }
  };

  if (!patient) return <div>Loading patient data...</div>;

  return (
    <div className="prescription-container">
      <h1>Create Prescription for {patient.name}</h1>
      
      {error && <div className="error-message">{error}</div>}

      <form onSubmit={handleSubmit}>
        {/* Patient Info */}
        <div className="patient-info-card">
          <h3>Patient Information</h3>
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
              <span className="info-label">Weight:</span>
              <span className="info-value">{patient.weight || 'N/A'} kg</span>
            </div>
            <div className="info-item">
              <span className="info-label">Type:</span>
              <span className="info-value">{patient.is_child ? 'Pediatric' : 'Adult'}</span>
            </div>
          </div>
          {patient.is_child && !patient.weight && (
            <div className="alert alert-warning">
              ⚠️ Weight is required for pediatric dosage calculations
            </div>
          )}
        </div>

        {/* Diagnosis */}
        <div className="form-group">
          <label>Diagnosis *</label>
          <input
            type="text"
            value={diagnosis}
            onChange={(e) => setDiagnosis(e.target.value)}
            required
            placeholder="Enter diagnosis"
          />
        </div>

        {/* Medicines Section */}
        <div className="medicines-section">
          <h3>Medicines *</h3>
          {medicines.map((medicine, index) => (
            <MedicineRow
              key={index}
              index={index}
              medicine={medicine}
              availableMedicines={availableMedicines}
              onChange={handleMedicineChange}
              onRemove={removeMedicine}
              patient={patient}
            />
          ))}
          <button type="button" onClick={addMedicine} className="btn btn-secondary">
            + Add Another Medicine
          </button>
        </div>

        {/* Additional Fields */}
        <div className="form-group">
          <label>Additional Notes:</label>
          <textarea
            value={additionalNotes}
            onChange={(e) => setAdditionalNotes(e.target.value)}
            rows="3"
            placeholder="Additional instructions for the patient"
          />
        </div>

        <div className="form-group">
          <label>Next Visit Date:</label>
          <input
            type="date"
            value={nextVisitDate}
            onChange={(e) => setNextVisitDate(e.target.value)}
            min={new Date().toISOString().split('T')[0]}
          />
        </div>

        <div className="form-actions">
          <button type="button" onClick={() => navigate(-1)} className="btn btn-cancel">
            Cancel
          </button>
          <button type="submit" disabled={saving} className="btn btn-primary">
            {saving ? 'Saving...' : 'Save Prescription'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreatePrescription;