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

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
const MONGO_URI = process.env.MONGO_URI;

// Create HTTP server from Express app
const server = http.createServer(app);

// Initialize Socket.IO server
const io = new Server(server, {
  cors: {
    origin: ['http://localhost:5173'],  // Adjust to your frontend URL or '*'
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true,
  },
});

// Middleware to make io accessible in routes/controllers
app.set('io', io);

// Socket.IO connection event
io.on("connection", (socket) => {
  socket.on("disconnect", () => {
    // handle user disconnect if needed
  });
});

// --- MIDDLEWARE ---
app.use(cors({
  origin: ['http://localhost:5173'], // Allow your React frontend
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// --- STATIC FILES (Uploads) ---
app.use('/uploads', express.static(path.join(__dirname, process.env.UPLOAD_DIR || 'uploads')));

// --- API ROUTES ---
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

// --- SERVE FRONTEND (SPA) ---
// Update this path to your React app's build output folder
const frontendPath = path.join(__dirname, "../frontend/client/dist");

app.use(express.static(frontendPath));

// SPA fallback: serve index.html for all other non-API routes
app.get("*", (req, res) => {
  res.sendFile(path.join(frontendPath, "index.html"));
});

// --- ROOT TEST ROUTE (optional) ---
app.get('/', (req, res) => {
  res.send('✅ Construction Material Management Backend Running');
});

// --- ERROR HANDLER ---
app.use(errorHandler);

// --- DATABASE CONNECTION ---
mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log('✅ MongoDB Connected Successfully');
    // Start server with http server instance (required for Socket.IO)
    server.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error('❌ MongoDB Connection Failed:', err.message);
    process.exit(1);
  });
