const express = require('express');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// جلب المتغيرات من البيئة
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

// إنشاء العميل بشكل آمن بدون كراش
let supabase = null;
if (supabaseUrl && supabaseKey) {
  supabase = createClient(supabaseUrl, supabaseKey);
}

// الصفحة الرئيسية
app.get('/', (req, res) => {
  res.json({
    status: 'success',
    message: 'Remittance Backend Server is Running Successfully on Vercel! 🚀'
  });
});

// مسار الاختبار
app.get('/api/test', async (req, res) => {
  try {
    if (!supabase) {
      return res.status(500).json({ 
        status: 'error', 
        message: 'Supabase credentials are missing in Vercel Environment Variables!' 
      });
    }
    const { data, error } = await supabase.from('remittances').select('*').limit(5);
    if (error) throw error;
    res.json({ status: 'success', data });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
});

module.exports = app;

if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}
