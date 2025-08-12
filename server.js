// Minimal Express server with PostgreSQL insert
// Run: npm install express pg cors helmet express-rate-limit dotenv
// Then: node server.js

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import pkg from 'pg';
const { Pool } = pkg;
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(helmet());
app.use(cors({ origin: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Basic rate limit on the API route
app.use('/api/', rateLimit({ windowMs: 60 * 1000, max: 30 }));

// PostgreSQL pool
const pool = new Pool({
  host: process.env.PGHOST,
  user: process.env.PGUSER,
  password: process.env.PGPASSWORD,
  database: process.env.PGDATABASE,
  port: Number(process.env.PGPORT || 5432),
  max: 10
});

// Simple field validation
function validate(body){
  const errors = [];
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if(!body.name || body.name.trim().length < 2) errors.push('Name is required.');
  if(!body.email || !emailRegex.test(body.email)) errors.push('Valid email required.');
  if(!body.gender) errors.push('Gender is required.');
  const age = Number(body.age);
  if(!Number.isInteger(age) || age < 16 || age > 100) errors.push('Age must be 16–100.');
  if(!body.current_occupation || body.current_occupation.trim().length < 2) errors.push('Current occupation required.');
  return errors;
}

app.post('/api/apply', async (req, res) => {
  try{
    const errors = validate(req.body || {});
    if(errors.length){
      return res.status(400).json({ error: errors.join(' ') });
    }

    const { name, email, gender, age, current_occupation } = req.body;

    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || null;
    const result = await pool.query(
      `INSERT INTO applications (name, email, gender, age, current_occupation, ip_address) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id`,
      [name.trim(), email.trim().toLowerCase(), gender, Number(age), current_occupation.trim(), ip]
    );
    res.json({ ok:true, id: result.rows[0].id });
  }catch(err){
    console.error('Apply error:', err);
    res.status(500).json({ error: 'Server error. Please try again later.' });
  }
});

const port = Number(process.env.APP_PORT || 3000);
app.listen(port, () => console.log(`Server running on http://localhost:${port}`));