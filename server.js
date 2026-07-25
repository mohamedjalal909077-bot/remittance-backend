const express = require('express');
const { createClient } = require('@supabase/supabase-js');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(express.json());
app.use(cors());

// الربط المباشر مع Supabase باستخدام بياناتك
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// أسعار صرف استرشادية للخليج مقابل الجنيه المصري
const EXCHANGE_RATES = {
  SAR: 13.00, // ريال سعودي
  KWD: 160.00, // دينار كويتي
  AED: 13.20  // درهم إماراتي
};

// مسار فحص السيرفر (Health Check)
app.get('/', (req, res) => {
  res.send('Remittance Backend Server is Active & Running! 🚀');
});

// API إنشاء طلب تحويل أموال
app.post('/api/transfer', async (req, res) => {
  try {
    const { sender_id, recipient_name, recipient_phone, recipient_type, amount_send, currency_send } = req.body;

    // التأكد من دعم العملة
    const rate = EXCHANGE_RATES[currency_send];
    if (!rate) {
      return res.status(400).json({ error: 'العملة المختارة غير مدعومة حالياً' });
    }

    // حساب المبلغ بالمصري
    const amount_receive = amount_send * rate;

    // تسجيل العملية في قاعدة البيانات
    const { data, error } = await supabase
      .from('transactions')
      .insert([
        {
          sender_id,
          recipient_name,
          recipient_phone,
          recipient_type,
          amount_send,
          currency_send,
          amount_receive,
          exchange_rate: rate,
          status: 'pending'
        }
      ])
      .select();

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    res.status(201).json({
      success: true,
      message: 'تم تسجيل طلب التحويل بنجاح ⚡',
      transaction: data[0]
    });
  } catch (err) {
    res.status(500).json({ error: 'حدث خطأ في الخادم الداخلي' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running live on port ${PORT}`);
});
