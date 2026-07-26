const express = require('express');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');

const app = express();

app.use(cors());
app.use(express.json());

// الاتصال بـ Supabase من خلال المتغيرات
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
const supabase = (supabaseUrl && supabaseKey) ? createClient(supabaseUrl, supabaseKey) : null;

// 1. Root Check
app.get('/', (req, res) => {
  res.json({ status: 'success', message: 'Remittance API Service Running 🚀' });
});

// 2. جلب جميع التحويلات
app.get('/api/remittances', async (req, res) => {
  try {
    if (!supabase) throw new Error('Supabase configuration missing');
    const { data, error } = await supabase.from('remittances').select('*');
    if (error) throw error;
    res.json({ status: 'success', data });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
});

// 3. إضافة تحويل جديد
app.post('/api/remittances', async (req, res) => {
  try {
    if (!supabase) throw new Error('Supabase configuration missing');
    const newRemittance = req.body;
    const { data, error } = await supabase.from('remittances').insert([newRemittance]).select();
    if (error) throw error;
    res.status(201).json({ status: 'success', data });
  } catch (err) {
    res.status(400).json({ status: 'error', message: err.message });
  }
});

module.exports = app;
