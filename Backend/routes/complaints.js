// routes/complaints.js
const express = require('express');
const router = express.Router();
const multer = require('multer');
const axios = require('axios');
const FormData = require('form-data');
const Complaint = require('../models/Complaint'); 

// Configure multer to store files in memory for Pinata upload
const upload = multer({ storage: multer.memoryStorage() });

// Helper function to pin a single file to Pinata
const pinFileToPinata = async (file) => {
    // 1. Create FormData for Pinata
    const formData = new FormData();
    formData.append('file', file.buffer, {
        filename: file.originalname,
        contentType: file.mimetype,
    });

    // Add metadata
    formData.append('pinataMetadata', JSON.stringify({ name: file.originalname }));
    formData.append('pinataOptions', JSON.stringify({ cidVersion: 0 }));

    // 2. Call Pinata API
    const response = await axios.post('https://api.pinata.cloud/pinning/pinFileToIPFS', formData, {
        maxBodyLength: Infinity, 
        headers: {
            Authorization: `Bearer ${process.env.PINATA_JWT}`, // Using the sensitive JWT
            ...formData.getHeaders(),
        },
    });

    return response.data.IpfsHash; // Return the CID
};

// POST /api/complaints/submit
router.post('/submit', 
    upload.fields([
        { name: 'aadharFile', maxCount: 1 },
        { name: 'evidenceFiles', maxCount: 10 },
    ]), 
    async (req, res) => {
    
    // Extract text fields from req.body
    const { 
        name, contactNumber, email, address, 
        aadharNumber, crimeType, dateTime, description 
    } = req.body;

    // Extract files from req.files
    const aadharFile = req.files.aadharFile ? req.files.aadharFile[0] : null;
    const evidenceFiles = req.files.evidenceFiles || [];

    let aadharFileCID = null;
    let evidenceCIDs = [];

    try {
        // 1. Pin Aadhar File
        if (aadharFile) {
            console.log(`Pinning Aadhar file: ${aadharFile.originalname}`);
            aadharFileCID = await pinFileToPinata(aadharFile);
        }

        // 2. Pin Evidence Files
        for (const file of evidenceFiles) {
            console.log(`Pinning Evidence file: ${file.originalname}`);
            const cid = await pinFileToPinata(file);
            evidenceCIDs.push(cid);
        }
        
        // 3. Save full complaint data and CIDs to MongoDB
        const newComplaint = new Complaint({
            name, contactNumber, email, address, 
            aadharNumber, crimeType, 
            dateTime: new Date(dateTime), 
            description,
            aadharFileCID,
            evidenceCIDs,
        });

        await newComplaint.save();

        res.json({ 
            msg: 'Complaint submitted successfully and files pinned to IPFS.',
            complaintId: newComplaint._id,
            aadharCID: aadharFileCID,
            evidenceCIDs: evidenceCIDs,
            link: `https://gateway.pinata.cloud/ipfs/${aadharFileCID}` // Example link
        });

    } catch (err) {
        console.error('Pinata or DB Error:', err.response?.data || err.message);
        res.status(500).json({ msg: 'Complaint submission failed. Pinata or Database error.' });
    }
});

module.exports = router;