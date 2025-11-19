import { useState } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { FileText, Upload, AlertTriangle, CheckCircle } from 'lucide-react';
import axios from 'axios'; 

// --- Configuration ---
// Define your main backend API URL from your environment variables
const API_URL = import.meta.env.VITE_BACKEND_API_URL || 'http://localhost:5000/api'; 
// Define the Gemini Anomaly Proxy URL (Must match the setup from the original server.js)
const GEMINI_PROXY_URL = import.meta.env?.VITE_GEMINI_PROXY_URL || "http://localhost:5050/analyze";
// ---------------------

// Define the initial form data structure
const INITIAL_FORM_DATA = {
    name: '',
    contactNumber: '',
    email: '',
    address: '',
    aadharNumber: '',
    crimeType: '',
    dateTime: '',
    description: '',
};

// Define Anomaly Score structure
interface AnomalyScores {
    text_score: number;
    image_score: number;
    video_score: number;
    finalScore: number;
    isAnomalous: boolean;
    reasons: string[];
}

const INITIAL_SCORES: AnomalyScores = {
    text_score: 0,
    image_score: 0,
    video_score: 0,
    finalScore: 0,
    isAnomalous: false,
    reasons: [],
};

// --- Helper Functions from Anomaly Detection Code ---

// Compress image to a manageable base64 string for Gemini
const compressImageToBase64 = (file: File) => {
    return new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement("canvas");
                const ctx = canvas.getContext("2d");
                if (!ctx) {
                    reject(new Error("Unable to compress image."));
                    return;
                }

                const maxSize = 800;
                let { width, height } = img;

                if (width > height && width > maxSize) {
                    height = (height * maxSize) / width;
                    width = maxSize;
                } else if (height > maxSize) {
                    width = (width * maxSize) / height;
                    height = maxSize;
                }

                canvas.width = width;
                canvas.height = height;
                ctx.drawImage(img, 0, 0, width, height);

                // Use the file type or default to image/jpeg
                const mime = file.type || "image/jpeg"; 
                // Compress quality to 70%
                const dataUrl = canvas.toDataURL(mime, 0.7); 
                // Extract base64 part
                const base64 = dataUrl.split(",")[1] || ""; 
                resolve(base64);
            };
            img.onerror = reject;
            img.src = reader.result as string;
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
};

// Serialize a list of files (Images only for now, matching the original code)
const serializeEvidence = async (fileList: FileList | null) => {
    if (!fileList || fileList.length === 0) return { images: [], videos: [] };

    // Separate files by type for multimodal processing (assuming video logic is added later if needed)
    const imageFiles: File[] = [];
    const videoFiles: File[] = []; // Placeholder for future video support

    Array.from(fileList).forEach(file => {
        if (file.type.startsWith('image/')) {
            imageFiles.push(file);
        } else if (file.type.startsWith('video/')) {
            // For now, video serialization is complex, only handle images
            // In a real app, video would require splitting into frames or separate proxy
            // videoFiles.push(file); 
        }
    });

    const serializedImages = await Promise.all(
        imageFiles.map(async (file) => ({
            mime: file.type || "image/jpeg",
            base64: await compressImageToBase64(file),
        }))
    );

    // Only return images for now, as the compressImageToBase64 is only for images
    return { images: serializedImages, videos: [] }; 
};

// --- Main Component ---

const ComplaintForm = () => {
    const [step, setStep] = useState(1);
    const [isSubmitting, setIsSubmitting] = useState(false); 
    const [isAnalyzing, setIsAnalyzing] = useState(false); 
    const [statusMessage, setStatusMessage] = useState({ type: '', text: '' });
    const [anomalyScores, setAnomalyScores] = useState<AnomalyScores>(INITIAL_SCORES);

    const [formData, setFormData] = useState(INITIAL_FORM_DATA);
    const [aadharFile, setaadharFile] = useState<File | null>(null);
    const [evidenceFiles, setEvidenceFiles] = useState<FileList | null>(null);

    const handleInput = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleAnomalyCheck = async () => {
        const trimmedText = formData.description.trim();
        const hasEvidence = evidenceFiles && evidenceFiles.length > 0;
        
        if (!trimmedText && !hasEvidence) {
            setStatusMessage({ 
                type: 'warning', 
                text: "Please add a description or upload evidence files for review." 
            });
            return;
        }

        setStatusMessage({ type: 'info', text: 'Analyzing complaint data for anomalies...' });
        setIsAnalyzing(true);
        setAnomalyScores(INITIAL_SCORES); // Reset scores before check

        try {
            const { images, videos } = await serializeEvidence(evidenceFiles);

            const response = await fetch(GEMINI_PROXY_URL, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    text: trimmedText,
                    images: images,
                    videos: videos, // Empty for now, but part of the contract
                }),
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(
                    `Anomaly check failed (${response.status}): ${errorText || "Unknown error"}`
                );
            }

            const json = await response.json();
            
            // Extract raw values (could be number or null)
            const rawText = json.text_score;
            const rawImage = json.image_score;
            const rawVideo = json.video_score;

            // Convert null → 0
            const text_score = rawText !== null ? Number(rawText) : 0;
            const image_score = rawImage !== null ? Number(rawImage) : 0;
            const video_score = rawVideo !== null ? Number(rawVideo) : 0;

            // Thresholds (Copied from the provided frontend logic)
            const TEXT_THRESHOLD = 0.60;
            const IMAGE_THRESHOLD = 0.50;
            const VIDEO_THRESHOLD = 0.70;

            let isAnomalous = false;
            const reasons = [];

            // Check text anomaly
            if (text_score > TEXT_THRESHOLD) {
                isAnomalous = true;
                reasons.push(`Text anomaly score (${text_score.toFixed(2)}) is above threshold (${TEXT_THRESHOLD.toFixed(2)}).`);
            }

            // Check image anomaly
            if (image_score > IMAGE_THRESHOLD) {
                isAnomalous = true;
                reasons.push(`Image anomaly score (${image_score.toFixed(2)}) is above threshold (${IMAGE_THRESHOLD.toFixed(2)}).`);
            }

            // Check video anomaly
            if (video_score > VIDEO_THRESHOLD) {
                isAnomalous = true;
                reasons.push(`Video anomaly score (${video_score.toFixed(2)}) is above threshold (${VIDEO_THRESHOLD.toFixed(2)}).`);
            }

            // Highest score for display
            const finalScore = Math.max(text_score, image_score, video_score);

            setAnomalyScores({
                text_score,
                image_score,
                video_score,
                finalScore,
                isAnomalous,
                reasons,
            });

            setStatusMessage({ 
                type: isAnomalous ? 'error' : 'success', 
                text: isAnomalous ? `Anomaly Detected! Highest score: ${finalScore.toFixed(2)}` : `Anomaly check passed. Highest score: ${finalScore.toFixed(2)}` 
            });

        } catch (error: any) {
            console.error("Anomaly Check Error:", error);
            setStatusMessage({ 
                type: 'error', 
                text: `Anomaly check failed: ${error.message}` 
            });
        } finally {
            setIsAnalyzing(false);
            setStep(5); // Move to review step after analysis
        }
    };


    /**
     * Handles the final submission: collects all data, sends to backend, 
     * where files are pinned to Pinata, and data is saved to MongoDB.
     */
    const handleSubmit = async () => {
        // Simple check to ensure anomaly check was at least attempted, or for cases where no evidence was provided
        if (anomalyScores.finalScore === 0 && (formData.description.trim() || (evidenceFiles && evidenceFiles.length > 0)) && !anomalyScores.isAnomalous) {
            setStatusMessage({ type: 'warning', text: 'Please run the Anomaly Check first.' });
            return;
        }

        setIsSubmitting(true);
        setStatusMessage({ type: 'info', text: 'Uploading files and submitting complaint...' });

        try {
            // 1. Prepare FormData for the Express Backend (Multipart)
            const formUploadData = new FormData();

            // Append all text fields first
            Object.keys(formData).forEach(key => {
                // @ts-ignore
                formUploadData.append(key, formData[key]);
            });

            // Append Anomaly scores as hidden fields (OPTIONAL but good for auditing)
            formUploadData.append('anomalyScores', JSON.stringify(anomalyScores));

            // Append Aadhar file
            if (aadharFile) {
                formUploadData.append('aadharFile', aadharFile);
            }

            // Append Evidence files
            if (evidenceFiles) {
                for (let i = 0; i < evidenceFiles.length; i++) {
                    formUploadData.append('evidenceFiles', evidenceFiles[i]);
                }
            }

            // 2. Submit EVERYTHING to the custom backend route
            const response = await axios.post(
                `${API_URL}/complaints/submit`, 
                formUploadData, 
                {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                }
            );
            
            // 3. Handle Success
            const { complaintId, aadharCID } = response.data;

            setStatusMessage({ 
                type: 'success', 
                text: `Complaint ID: ${complaintId} submitted successfully! Your files are secured on IPFS. Aadhar CID: ${aadharCID}`
            });
            
            // Resetting state
            setFormData(INITIAL_FORM_DATA); 
            setaadharFile(null);
            setEvidenceFiles(null);
            setAnomalyScores(INITIAL_SCORES);
            setStep(1); 
            
        } catch (err: any) {
            // 4. Handle Errors
            const errorMsg = err.response?.data?.msg || 'An unexpected error occurred during submission.';
            setStatusMessage({ 
                type: 'error', 
                text: `Error submitting complaint: ${errorMsg}` 
            });
            console.error('Submission Error:', err.response?.data || err.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    // Helper to check if a step is complete before allowing navigation
    const canAdvanceToStep4 = formData.crimeType && formData.dateTime && formData.description;
    const canAdvanceToStep5 = (formData.description.trim() || (evidenceFiles && evidenceFiles.length > 0));


    // --- Render Logic ---

    return (
        <MainLayout>
            <div className="container mx-auto px-4 py-8">
                <div className="max-w-3xl mx-auto">
                    <h1 className="text-3xl font-bold text-police-navy mb-6">File a Complaint</h1>

                    {/* Progress bar */}
                    <div className="mb-8">
                        <div className="h-2 bg-gray-200 rounded-full">
                            <div
                              className="h-full bg-police-saffron rounded-full transition-all"
                              style={{ width: `${(step / 5) * 100}%` }}
                            />
                        </div>
                        <div className="flex justify-between mt-2 text-sm text-gray-600">
                            <span>Personal Info</span>
                            <span>Identity</span>
                            <span>Details</span>
                            <span>Evidence Check</span> {/* Renamed for clarity */}
                            <span>Review & Submit</span>
                        </div>
                    </div>

                    <Tabs defaultValue="1" value={step.toString()}>
                        {/* Tab 1: Personal Info */}
                        <TabsContent value="1">
                            <div className="space-y-4">
                                <Input name="name" placeholder="Full Name" onChange={handleInput} value={formData.name} required/>
                                <Input name="contactNumber" placeholder="Contact Number" onChange={handleInput} value={formData.contactNumber} required/>
                                <Input name="email" placeholder="Email Address" onChange={handleInput} value={formData.email} type="email" required/>
                                <Textarea name="address" placeholder="Residential Address" onChange={handleInput} value={formData.address} required/>
                                <Button onClick={() => setStep(2)} className="w-full" disabled={!formData.name || !formData.contactNumber || !formData.email || !formData.address}>Next</Button>
                            </div>
                        </TabsContent>

                        {/* Tab 2: Identity (Aadhar File) */}
                        <TabsContent value="2">
                            <div className="space-y-4">
                                <Input name="aadharNumber" placeholder="Aadhar Card Number" onChange={handleInput} value={formData.aadharNumber} required/>
                                <label className="block text-sm font-medium text-gray-700">Upload Aadhar File (PDF, JPG, PNG)</label>
                                <Input 
                                    type="file" 
                                    accept=".pdf,.jpg,.jpeg,.png" 
                                    onChange={(e) => setaadharFile(e.target.files?.[0] || null)} 
                                    required
                                />
                                {aadharFile && <p className="text-sm text-gray-600">Selected: **{aadharFile.name}**</p>}
                                <Button onClick={() => setStep(3)} className="w-full" disabled={!formData.aadharNumber || !aadharFile}>Next</Button>
                            </div>
                        </TabsContent>

                        {/* Tab 3: Details */}
                        <TabsContent value="3">
                            <div className="space-y-4">
                                <select 
                                    name="crimeType" 
                                    className="w-full border rounded-md p-2 h-10 bg-white" 
                                    onChange={handleInput} 
                                    value={formData.crimeType}
                                    required
                                >
                                    <option value="">Select Crime Type</option>
                                    <option value="Theft">Theft</option>
                                    <option value="Assault">Assault</option>
                                    <option value="Cybercrime">Cybercrime</option>
                                    <option value="Fraud">Fraud</option>
                                    <option value="Other">Other</option>
                                </select>
                                <Input name="dateTime" type="datetime-local" onChange={handleInput} value={formData.dateTime} required/>
                                <Textarea name="description" placeholder="Describe the incident (max 2000 characters)" onChange={handleInput} value={formData.description} maxLength={2000} required/>
                                <Button onClick={() => setStep(4)} className="w-full" disabled={!canAdvanceToStep4}>Next</Button>
                            </div>
                        </TabsContent>

                        {/* Tab 4: Evidence Files & Anomaly Check Prep */}
                        <TabsContent value="4">
                            <div className="space-y-6">
                                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                                    <Upload className="mx-auto h-12 w-12 text-gray-400" />
                                    <p className="mt-2 font-medium">Upload Evidence Files (Optional)</p>
                                    <p className="text-sm text-gray-500 mt-1">Supported: Image/Video/PDF (Will be analyzed for anomalies)</p>
                                    <Input 
                                        type="file" 
                                        multiple 
                                        accept="image/*,video/*,.pdf" 
                                        onChange={(e) => setEvidenceFiles(e.target.files)} 
                                        className="mt-4"
                                    />
                                    {evidenceFiles && <p className="text-sm text-gray-600 mt-2">Selected **{evidenceFiles.length}** file(s).</p>}
                                </div>
                                <Button 
                                    onClick={handleAnomalyCheck} 
                                    className="w-full bg-police-navy text-white hover:bg-police-navy/90" 
                                    disabled={isAnalyzing || !canAdvanceToStep5}
                                >
                                    {isAnalyzing ? 'Analyzing...' : 'Run Anomaly Check & Proceed to Review'}
                                </Button>
                            </div>
                        </TabsContent>

                        {/* Tab 5: Review and Submit (with Anomaly Results) */}
                        <TabsContent value="5">
                            <div className="space-y-4 bg-gray-50 p-6 rounded-lg">
                                <h3 className="text-xl font-bold text-police-navy">Review & Final Submission</h3>
                                
                                <div className={`p-4 rounded-lg shadow-inner ${anomalyScores.isAnomalous ? 'bg-red-100 border-l-4 border-red-500' : 'bg-green-100 border-l-4 border-green-500'}`}>
                                    <div className="flex items-center space-x-2">
                                        {anomalyScores.isAnomalous ? (
                                            <AlertTriangle className="h-6 w-6 text-red-600" />
                                        ) : (
                                            <CheckCircle className="h-6 w-6 text-green-600" />
                                        )}
                                        <p className="font-semibold text-lg">
                                            {anomalyScores.isAnomalous ? 'Anomaly Detected (Review Required)' : 'Anomaly Check Passed'}
                                        </p>
                                    </div>
                                    <p className="mt-2 text-sm">Highest Score: **{anomalyScores.finalScore.toFixed(2)}**</p>
                                    {anomalyScores.isAnomalous && (
                                        <div className="mt-3">
                                            <p className="font-medium text-sm text-red-800">Reasons:</p>
                                            <ul className="list-disc list-inside text-xs ml-2 text-red-700">
                                                {anomalyScores.reasons.map((r, i) => <li key={i}>{r}</li>)}
                                            </ul>
                                        </div>
                                    )}
                                </div>

                                <Button 
                                    onClick={handleSubmit} 
                                    disabled={isSubmitting}
                                    className="w-full bg-police-green text-white hover:bg-police-green/90"
                                >
                                    <FileText className="mr-2 h-4 w-4" />
                                    {isSubmitting ? 'Submitting...' : 'Confirm and Submit Complaint'}
                                </Button>
                                {statusMessage.text && (
                                    <div className={`mt-4 p-3 rounded-md ${statusMessage.type === 'error' || statusMessage.type === 'warning' ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
                                        <p className="font-semibold">{statusMessage.text}</p>
                                    </div>
                                )}
                            </div>
                        </TabsContent>
                    </Tabs>
                </div>
            </div>
        </MainLayout>
    );
};

export default ComplaintForm;