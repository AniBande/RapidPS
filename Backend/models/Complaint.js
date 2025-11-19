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

    // File CIDs stored after Pinata upload
    aadharFileCID: { type: String }, 
    evidenceCIDs: [{ type: String }], // Array of CIDs

    submittedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Complaint', ComplaintSchema);