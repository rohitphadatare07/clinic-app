import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { apiService } from '../../services/api';
import MedicineRow from './MedicineRow';

const CreatePrescription = () => {
  const { id } = useParams(); // Patient ID from URL
  const navigate = useNavigate();
  const [patient, setPatient] = useState(null);
  const [medicines, setMedicines] = useState([{ name: '', dosage: '', frequency: '', duration: '', instructions: '' }]);
  const [diagnosis, setDiagnosis] = useState('');
  const [additionalNotes, setAdditionalNotes] = useState('');
  const [nextVisitDate, setNextVisitDate] = useState('');
  // const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchPatient = async () => {
      const result = await apiService.getPatient(id);
      if (result.success) {
        setPatient(result.data);
      }
    };
    fetchPatient();
  }, [id]);

  const handleMedicineChange = (index, field, value) => {
    const newMedicines = [...medicines];
    newMedicines[index][field] = value;
    setMedicines(newMedicines);
  };

  const addMedicine = () => {
    setMedicines([...medicines, { name: '', dosage: '', frequency: '', duration: '', instructions: '' }]);
  };

  const removeMedicine = (index) => {
    if (medicines.length === 1) return; // Keep at least one row
    const newMedicines = medicines.filter((_, i) => i !== index);
    setMedicines(newMedicines);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    // Basic validation
    const validMedicines = medicines.filter(med => med.name.trim() !== '');
    
    if (validMedicines.length === 0) {
      setError('Please add at least one medicine');
      setSaving(false);
      return;
    }

    // CORRECTED: Format data for the new backend API
    const prescriptionData = {
      patient_id: parseInt(id), // Convert to number
      diagnosis: diagnosis.trim(),
      additional_notes: additionalNotes.trim(), // Note: snake_case for backend
      next_visit_date: nextVisitDate || null,
      medicines: validMedicines.map(med => ({
        name: med.name.trim(),
        dosage: med.dosage.trim(),
        frequency: med.frequency.trim(),
        duration: med.duration.trim(),
        instructions: med.instructions?.trim() || ''
      }))
    };

    console.log('Sending prescription data:', prescriptionData);

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
        {/* Add Diagnosis Field */}
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

        <div className="medicines-list">
          <h3>Medicines *</h3>
          {medicines.map((medicine, index) => (
            <MedicineRow
              key={index}
              index={index}
              medicine={medicine}
              onChange={handleMedicineChange}
              onRemove={removeMedicine}
            />
          ))}
          <button type="button" onClick={addMedicine} className="btn btn-secondary">
            + Add Another Medicine
          </button>
        </div>

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