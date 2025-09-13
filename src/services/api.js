
const API_BASE_URL = 'http://backend:5000/api';

// Helper function to get auth header
const getAuthHeader = () => {
  const token = localStorage.getItem('token');
  return token ? { 'Authorization': `Bearer ${token}` } : {};
};

export const apiService = {
  // Login
  login: async (credentials) => {
    try {
      const response = await fetch(`${API_BASE_URL}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, message: 'Network error' };
    }
  },

  // Get all patients
  getPatients: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/patients`, {
        headers: {
          ...getAuthHeader(),
        },
      });

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Get patients error:', error);
      return { success: false, message: 'Failed to fetch patients' };
    }
  },

  // Get single patient
  getPatient: async (id) => {
    try {
      const response = await fetch(`${API_BASE_URL}/patients/${id}`, {
        headers: {
          ...getAuthHeader(),
        },
      });

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Get patient error:', error);
      return { success: false, message: 'Failed to fetch patient' };
    }
  },

  // Create patient
  createPatient: async (patientData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/patients`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeader(),
        },
        body: JSON.stringify(patientData),
      });

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Create patient error:', error);
      return { success: false, message: 'Failed to create patient' };
    }
  },

  // Update patient
  updatePatient: async (id, patientData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/patients/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeader(),
        },
        body: JSON.stringify(patientData),
      });

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Update patient error:', error);
      return { success: false, message: 'Failed to update patient' };
    }
  },

  // Delete patient
  deletePatient: async (id) => {
    try {
      const response = await fetch(`${API_BASE_URL}/patients/${id}`, {
        method: 'DELETE',
        headers: {
          ...getAuthHeader(),
        },
      });

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Delete patient error:', error);
      return { success: false, message: 'Failed to delete patient' };
    }
  },

  // Get prescriptions for a patient
  getPrescriptions: async (patientId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/patients/${patientId}/prescriptions`, {
        headers: {
          ...getAuthHeader(),
        },
      });

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Get prescriptions error:', error);
      return { success: false, message: 'Failed to fetch prescriptions' };
    }
  },

  // Get single prescription
  getPrescription: async (id) => {
    try {
      const response = await fetch(`${API_BASE_URL}/prescriptions/${id}`, {
        headers: {
          ...getAuthHeader(),
        },
      });

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Get prescription error:', error);
      return { success: false, message: 'Failed to fetch prescription' };
    }
  },

  // Create prescription
  createPrescription: async (prescriptionData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/prescriptions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeader(),
        },
        body: JSON.stringify(prescriptionData),
      });

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Create prescription error:', error);
      return { success: false, message: 'Failed to create prescription' };
    }
  },

  // Update prescription
  updatePrescription: async (id, prescriptionData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/prescriptions/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeader(),
        },
        body: JSON.stringify(prescriptionData),
      });

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Update prescription error:', error);
      return { success: false, message: 'Failed to update prescription' };
    }
  },

  // Delete prescription
  deletePrescription: async (id) => {
    try {
      const response = await fetch(`${API_BASE_URL}/prescriptions/${id}`, {
        method: 'DELETE',
        headers: {
          ...getAuthHeader(),
        },
      });

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Delete prescription error:', error);
      return { success: false, message: 'Failed to delete prescription' };
    }
  },
  // Search medicines
  searchMedicines: async (query) => {
    try {
      // This can remain mock for now or connect to your medicines table
      await new Promise(resolve => setTimeout(resolve, 300));
      
      const mockMedicines = [
        { id: 1, name: 'Amoxicillin', commonDosage: '500mg' },
        { id: 2, name: 'Ibuprofen', commonDosage: '400mg' },
        { id: 3, name: 'Atorvastatin', commonDosage: '20mg' },
      ];

      const results = mockMedicines.filter(med =>
        med.name.toLowerCase().includes(query.toLowerCase())
      );
      
      return { success: true, data: results };
    } catch (error) {
      return { success: false, message: 'Search failed' };
    }
  },
  // Get monthly patient statistics
  getMonthlyPatientStats: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/patients/monthly-stats`, {
        headers: {
          ...getAuthHeader(),
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Get monthly stats error:', error);
      return { 
        success: false, 
        message: 'Failed to fetch monthly statistics',
        data: null
      };
    }
  }
};

