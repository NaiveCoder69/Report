require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const http = require("http");
const { Server } = require("socket.io");
const cors = require('cors');
const path = require('path');

// Import Routes
const authRoutes = require('./routes/authRoutes');
const companyRoutes = require('./routes/companyRoutes');
const projectRoutes = require('./routes/projectRoutes');
const materialRoutes = require('./routes/materialRoutes');
const vendorRoutes = require('./routes/vendorRoutes');
const dashboardRoutes = require("./routes/dashboardRoutes");
const billRoutes = require('./routes/billRoutes');
const expenseRoutes = require('./routes/expenseRoutes');
const laborContractorRoutes = require("./routes/laborContractorRoutes");
const laborPaymentRoutes = require("./routes/laborPaymentRoutes");
const notificationRoutes = require('./routes/notificationRoutes');
const joinRequestRoutes = require('./routes/joinRequestRoutes');
const uploadRoutes = require('./routes/uploadRoutes');
const materialDeliveryRoutes = require('./routes/materialDeliveryRoutes');
const userRoutes = require("./routes/userRoutes");
const projectAccessRoutes = require("./routes/projectAccessRoutes");

const { errorHandler } = require('./middleware/errorMiddleware');

const app = express();
const PORT = process.env.PORT || 5000;

// Create main HTTP server
const server = http.createServer(app);

// Initialize Socket.IO
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
  },
});

// Attach io to app
app.set('io', io);

// Socket events
io.on("connection", (socket) => {
  socket.on("disconnect", () => { });
});

// Middlewares
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Static uploads folder
app.use('/uploads', express.static(path.join(__dirname, process.env.UPLOAD_DIR || 'uploads')));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/companies', companyRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/materials', materialRoutes);
app.use('/api/vendors', vendorRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use('/api/bills', billRoutes);
app.use('/api/expenses', expenseRoutes);
app.use("/api/users", userRoutes);
app.use('/api/join-requests', joinRequestRoutes);
app.use("/api/project-access", projectAccessRoutes);
app.use("/api/labor-contractors", laborContractorRoutes);
app.use("/api/labor-payments", laborPaymentRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/material-deliveries', materialDeliveryRoutes);

// REMOVE frontend serving (Vercel will handle it)

// Basic root route
app.get('/', (req, res) => {
  res.send('🚀 Backend running successfully on Render');
});

// Error Handler
app.use(errorHandler);

// Connect to MongoDB and start server
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('✅ MongoDB Connected Successfully');

    server.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('❌ MongoDB Connection Failed:', err.message);
    process.exit(1);
  });
