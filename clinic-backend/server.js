const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// PostgreSQL connection - UPDATED FOR DOCKER COMPOSE
const pool = new Pool({
  // connectionString: process.env.DATABASE_URL || 'postgresql://postgres:myapppassword@localhost:5432/clinic_db',
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:Gcp@12345678@localhost:5432/clinic_db',
  // Remove individual properties and use connectionString instead
});

// Test database connection on startup
pool.connect((err, client, release) => {
  if (err) {
    console.error('Error acquiring client', err.stack);
  } else {
    console.log('Database connected successfully');
    release();
  }
});

// JWT secret
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// Authentication middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid token' });
    }
    req.user = user;
    next();
  });
};

// Routes

// Login
app.post('/api/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    const result = await pool.query(
      'SELECT * FROM users WHERE username = $1',
      [username]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const user = result.rows[0];
    const validPassword = await bcrypt.compare(password, user.password_hash);

    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      success: true,
      token,
      user: {
        id: user.id,
        name: user.full_name,
        role: user.role
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get monthly patient statistics
app.get('/api/patients/monthly-stats', authenticateToken, async (req, res) => {
    try {
    const currentYear = new Date().getFullYear();
    
    const result = await pool.query(`
        SELECT 
        TO_CHAR(created_at, 'Month') as month,
        EXTRACT(MONTH FROM created_at) as month_num,
        COUNT(*) as patient_count
        FROM patients
        WHERE EXTRACT(YEAR FROM created_at) = $1
        GROUP BY month, month_num
        ORDER BY month_num
    `, [currentYear]);

    // Create a complete year object with all months
    const allMonths = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ];

    // Initialize with zeros
    const monthlyData = {};
    allMonths.forEach(month => {
        monthlyData[month] = 0;
    });

    // Fill with actual data
    result.rows.forEach(row => {
        const monthName = row.month.trim();
        monthlyData[monthName] = parseInt(row.patient_count);
    });

    res.json({ success: true, data: monthlyData });
    } catch (error) {
    console.error('Monthly stats error:', error);
    res.status(500).json({ error: 'Internal server error' });
    }
});

// Get all patients
app.get('/api/patients', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM patients ORDER BY created_at DESC'
    );
    res.json({ success: true, data: result.rows });
  } catch (error) {
    console.error('Get patients error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get single patient
app.get('/api/patients/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      'SELECT * FROM patients WHERE id = $1',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Patient not found' });
    }

    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error('Get patient error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create new patient
app.post('/api/patients', authenticateToken, async (req, res) => {
  try {
    const {
      name,
      age,
      gender,
      contact_number,
      email,
      address,
      blood_group,
      allergies,
      medical_history
    } = req.body;

    const result = await pool.query(
      `INSERT INTO patients 
       (name, age, gender, contact_number, email, address, blood_group, allergies, medical_history) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) 
       RETURNING *`,
      [name, age, gender, contact_number, email, address, blood_group, allergies, medical_history]
    );

    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error('Create patient error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update patient
app.put('/api/patients/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, age, gender, contact_number, email, address, blood_group, allergies, medical_history } = req.body;

    const result = await pool.query(
      `UPDATE patients 
       SET name = $1, age = $2, gender = $3, contact_number = $4, email = $5, 
           address = $6, blood_group = $7, allergies = $8, medical_history = $9,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $10 
       RETURNING *`,
      [name, age, gender, contact_number, email, address, blood_group, allergies, medical_history, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Patient not found' });
    }

    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error('Update patient error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete patient
app.delete('/api/patients/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      'DELETE FROM patients WHERE id = $1 RETURNING *',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Patient not found' });
    }

    res.json({ success: true, message: 'Patient deleted successfully' });
  } catch (error) {
    console.error('Delete patient error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get all prescriptions for a patient
app.get('/api/patients/:patientId/prescriptions', authenticateToken, async (req, res) => {
    try {
      const { patientId } = req.params;
      
      const result = await pool.query(
        `SELECT p.*, 
                json_agg(
                  json_build_object(
                    'id', pm.id,
                    'medicine_name', pm.medicine_name,
                    'dosage', pm.dosage,
                    'frequency', pm.frequency,
                    'duration', pm.duration,
                    'instructions', pm.instructions
                  )
                ) as medicines
         FROM prescriptions p
         LEFT JOIN prescription_medicines pm ON p.id = pm.prescription_id
         WHERE p.patient_id = $1
         GROUP BY p.id
         ORDER BY p.prescribed_date DESC`,
        [patientId]
      );
  
      res.json({ success: true, data: result.rows });
    } catch (error) {
      console.error('Get prescriptions error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
});
  
// Get single prescription
app.get('/api/prescriptions/:id', authenticateToken, async (req, res) => {
    try {
      const { id } = req.params;
      
      const prescriptionResult = await pool.query(
        `SELECT p.*, 
                json_build_object(
                  'id', pat.id,
                  'name', pat.name,
                  'age', pat.age,
                  'gender', pat.gender
                ) as patient
         FROM prescriptions p
         JOIN patients pat ON p.patient_id = pat.id
         WHERE p.id = $1`,
        [id]
      );
  
      if (prescriptionResult.rows.length === 0) {
        return res.status(404).json({ error: 'Prescription not found' });
      }
  
      const medicinesResult = await pool.query(
        'SELECT * FROM prescription_medicines WHERE prescription_id = $1 ORDER BY id',
        [id]
      );
  
      const prescription = {
        ...prescriptionResult.rows[0],
        medicines: medicinesResult.rows
      };
  
      res.json({ success: true, data: prescription });
    } catch (error) {
      console.error('Get prescription error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
});
  
// Create new prescription
app.post('/api/prescriptions', authenticateToken, async (req, res) => {
    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');
      
      const { patient_id, diagnosis, additional_notes, next_visit_date, medicines } = req.body;
  
      // Insert prescription
      const prescriptionResult = await client.query(
        `INSERT INTO prescriptions 
         (patient_id, diagnosis, additional_notes, next_visit_date) 
         VALUES ($1, $2, $3, $4) 
         RETURNING *`,
        [patient_id, diagnosis, additional_notes, next_visit_date]
      );
  
      const prescription = prescriptionResult.rows[0];
  
      // Insert medicines
      if (medicines && medicines.length > 0) {
        for (const medicine of medicines) {
          await client.query(
            `INSERT INTO prescription_medicines 
             (prescription_id, medicine_name, dosage, frequency, duration, instructions) 
             VALUES ($1, $2, $3, $4, $5, $6)`,
            [
              prescription.id,
              medicine.name,
              medicine.dosage,
              medicine.frequency,
              medicine.duration,
              medicine.instructions
            ]
          );
        }
      }
  
      await client.query('COMMIT');
      
      // Get the complete prescription with medicines
      const completePrescription = await getCompletePrescription(client, prescription.id);
      
      res.json({ success: true, data: completePrescription });
      
    } catch (error) {
      await client.query('ROLLBACK');
      console.error('Create prescription error:', error);
      res.status(500).json({ error: 'Internal server error' });
    } finally {
      client.release();
    }
});
  
// Helper function to get complete prescription
async function getCompletePrescription(client, prescriptionId) {
    const prescriptionResult = await client.query(
      'SELECT * FROM prescriptions WHERE id = $1',
      [prescriptionId]
    );
    
    const medicinesResult = await client.query(
      'SELECT * FROM prescription_medicines WHERE prescription_id = $1 ORDER BY id',
      [prescriptionId]
    );
    
    return {
      ...prescriptionResult.rows[0],
      medicines: medicinesResult.rows
    };
}
  
// Update prescription
app.put('/api/prescriptions/:id', authenticateToken, async (req, res) => {
    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');
      
      const { id } = req.params;
      const { diagnosis, additional_notes, next_visit_date, medicines } = req.body;
  
      // Update prescription
      const prescriptionResult = await client.query(
        `UPDATE prescriptions 
         SET diagnosis = $1, additional_notes = $2, next_visit_date = $3,
             updated_at = CURRENT_TIMESTAMP
         WHERE id = $4 
         RETURNING *`,
        [diagnosis, additional_notes, next_visit_date, id]
      );
  
      if (prescriptionResult.rows.length === 0) {
        await client.query('ROLLBACK');
        return res.status(404).json({ error: 'Prescription not found' });
      }
  
      // Delete existing medicines
      await client.query(
        'DELETE FROM prescription_medicines WHERE prescription_id = $1',
        [id]
      );
  
      // Insert new medicines
      if (medicines && medicines.length > 0) {
        for (const medicine of medicines) {
          await client.query(
            `INSERT INTO prescription_medicines 
             (prescription_id, medicine_name, dosage, frequency, duration, instructions) 
             VALUES ($1, $2, $3, $4, $5, $6)`,
            [
              id,
              medicine.name,
              medicine.dosage,
              medicine.frequency,
              medicine.duration,
              medicine.instructions
            ]
          );
        }
      }
  
      await client.query('COMMIT');
      
      const completePrescription = await getCompletePrescription(client, id);
      res.json({ success: true, data: completePrescription });
      
    } catch (error) {
      await client.query('ROLLBACK');
      console.error('Update prescription error:', error);
      res.status(500).json({ error: 'Internal server error' });
    } finally {
      client.release();
    }
});
  
// Delete prescription
app.delete('/api/prescriptions/:id', authenticateToken, async (req, res) => {
    try {
      const { id } = req.params;
      
      const result = await pool.query(
        'DELETE FROM prescriptions WHERE id = $1 RETURNING *',
        [id]
      );
  
      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Prescription not found' });
      }
  
      res.json({ success: true, message: 'Prescription deleted successfully' });
    } catch (error) {
      console.error('Delete prescription error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Database URL: ${process.env.DATABASE_URL || 'Using default connection'}`);
});

// Medicines routes
app.get('/api/medicines', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM medicines ORDER BY name ASC'
    );
    res.json({ success: true, data: result.rows });
  } catch (error) {
    console.error('Get medicines error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/medicines', authenticateToken, async (req, res) => {
  try {
    const {
      name,
      common_dosage,
      generic_name,
      medicine_type,
      strength,
      form,
      manufacturer,
      description
    } = req.body;

    const result = await pool.query(
      `INSERT INTO medicines 
       (name, common_dosage, generic_name, medicine_type, strength, form, manufacturer, description) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) 
       RETURNING *`,
      [name, common_dosage, generic_name, medicine_type, strength, form, manufacturer, description]
    );

    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error('Create medicine error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.delete('/api/medicines/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      'DELETE FROM medicines WHERE id = $1 RETURNING *',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Medicine not found' });
    }

    res.json({ success: true, message: 'Medicine deleted successfully' });
  } catch (error) {
    console.error('Delete medicine error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});