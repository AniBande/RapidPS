// models/Complaint.js
const mongoose = require('mongoose');

const ComplaintSchema = new mongoose.Schema({
    // Personal Info
    name: { type: String, required: true },
    contactNumber: { type: String, required: true },
    email: { type: String, required: true },
    address: { type: String, required: true },

    // Identity & Details
    aadharNumber: { type: String, required: true },
    crimeType: { type: String, required: true },
    dateTime: { type: Date, required: true },
    description: { type: String, required: true },

    // File CIDs
    aadharFileCID: { type: String }, // CID for the Aadhar file
    evidenceCIDs: [{ type: String }], // Array of CIDs for evidence files

    submittedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Complaint', ComplaintSchema);