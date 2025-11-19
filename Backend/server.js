// server.js
const express = require('express');
const connectDB = require('./config/db');
const cors = require('cors');
const complaintRoutes = require('./routes/complaints'); 
require('dotenv').config();

const app = express();

// Connect to Database
connectDB();

// Middleware
app.use(cors()); // Allows your frontend to talk to this backend
app.use(express.json()); // To parse JSON bodies
app.use(express.urlencoded({ extended: true })); // To parse URL-encoded form bodies

// Routes
app.use('/api/complaints', complaintRoutes); 

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));