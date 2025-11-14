const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const productRoutes = require('./routes/productRoutes');
const orderRoutes = require('./routes/orderRoutes');
const userRoutes = require('./routes/userRoutes');
const cartRoutes = require('./routes/cartRoutes');
const authRoutes = require('./routes/authRoutes');
const passwordRoutes = require('./routes/passwordRoutes');
const uploadRoutes = require('./routes/uploadRoutes');
const adminUserRoutes = require('./routes/adminUserRoutes');
const path = require('path');
const paymentRoutes = require('./routes/paymentRoutes');
const profileRouter = require('./routes/profileRouter');

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/mycraft', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
    .then(() => console.log('Đã kết nối MongoDB'))
    .catch((err) => console.log('Lỗi kết nối MongoDB:', err));

app.get('/api', (req, res) => {
    res.json({ message: 'Đây là API MyCraft' });
});

app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/users', userRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/auth', passwordRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/users', adminUserRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/profile', profileRouter);

app.use('/api/admin/users', adminUserRoutes);

//demo web an toan
// const uploadRouter = require('./routes/upload');
// app.use('/api/upload', uploadRouter);

const PORT = process.env.PORT || 5000;

// Initialize mailer before starting the server so emails send immediately
const mailer = require('./utils/mailer');

async function start() {
    try {
        if (typeof mailer.init === 'function') {
            await mailer.init();
        }
    } catch (e) {
        console.error('Mailer init error:', e);
    }

    app.listen(PORT, () => {
        console.log(`Server đang chạy trên cổng ${PORT}`);
    });
}

start();