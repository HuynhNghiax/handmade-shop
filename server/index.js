const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const sequelize = require('./config/db');

// --- 1. IMPORT MODELS ---
const User = require('./models/User');
const Product = require('./models/Product');
const Order = require('./models/Order');
const CustomOrder = require('./models/CustomOrder');
const Bid = require('./models/Bid');
const Log = require('./models/Log');

// --- 2. IMPORT ROUTES ---
const authRoute = require('./routes/auth');
const productRoute = require('./routes/product');
const orderRoute = require('./routes/order');
const customOrderRoute = require('./routes/customOrder');
const userRoute = require('./routes/user');
const logRoute = require('./routes/log');

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());

// --- 3. ĐĂNG KÝ ROUTES (SỬA LỖI 404 LOGS TẠI ĐÂY) ---
app.use('/api/auth', authRoute);
app.use('/api/products', productRoute);
app.use('/api/orders', orderRoute);
app.use('/api/custom-orders', customOrderRoute);
app.use('/api/users', userRoute);
app.use('/api/logs', logRoute); // Cổng cực kỳ quan trọng

// --- 4. THIẾT LẬP QUAN HỆ ---
User.hasMany(CustomOrder, { foreignKey: 'userId' });
CustomOrder.belongsTo(User, { foreignKey: 'userId' });
CustomOrder.hasMany(Bid, { foreignKey: 'customOrderId' });
Bid.belongsTo(CustomOrder, { foreignKey: 'customOrderId' });
User.hasMany(Bid, { foreignKey: 'makerId' });
Bid.belongsTo(User, { foreignKey: 'makerId' });
User.hasMany(Log, { foreignKey: 'userId' });
Log.belongsTo(User, { foreignKey: 'userId' });

// --- 5. CHẠY SERVER ---
sequelize.sync({ force: false })
    .then(() => {
        console.log('✅ Hệ thống PinkyCrafts đã đồng bộ xong!');
        const PORT = process.env.PORT || 5000;
        app.listen(PORT, () => console.log(`🚀 Server đang chạy tại cổng ${PORT}`));
    })
    .catch(err => console.error('❌ Lỗi DB:', err));