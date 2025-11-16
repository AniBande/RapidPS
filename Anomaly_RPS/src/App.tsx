import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Shield } from 'lucide-react';
import Navbar from './components/Navbar';
import ImageUploader from './components/ImageUploader';
import AnalysisResults from './components/AnalysisResults';
import { analyzeImage } from './utils/imageAnalysis/imageAnalyzer';
import { AnalysisResult as ImageAnalysisResult } from './utils/imageAnalysis/types';
import { AnalysisResult } from './types/analysisTypes';

function App() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [results, setResults] = useState<AnalysisResult | null>(null);
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [sobelImage, setSobelImage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const transformAnalysisResult = (result: ImageAnalysisResult): AnalysisResult => {
    return {
      has_exif: result.exif.hasExif,
      missing_fields: result.exif.missingFields,
      suspicious_software: result.exif.suspiciousSoftware,
      artist_tag: result.exif.artistTag || 'N/A',
      edge_variance: result.edge.edgeVariance,
      fourier_spectrum_score: result.fourier.spectrumScore,
      visual_clarity_score: result.visual.clarityScore,
      visual_explanation: result.visualExplanation,
      z_I: result.z_I
    };
  };

  const handleImageUpload = async (file: File) => {
    setIsProcessing(true);
    setResults(null);
    setOriginalImage(null);
    setSobelImage(null);
    setError(null);

    try {
      // Display original image
      const originalImageUrl = URL.createObjectURL(file);
      setOriginalImage(originalImageUrl);

      // Analyze image
      const analysisResult = await analyzeImage(file, {
        performFourierAnalysis: true,
        edgeDetectionThreshold: 0.7
      });

      setResults(transformAnalysisResult(analysisResult));
      setSobelImage(analysisResult.edge.sobelImageData);
    } catch (error) {
      console.error('Error analyzing image:', error);
      setError(error instanceof Error ? error.message : 'An error occurred while analyzing the image');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <main className="container mx-auto px-4 py-8">
          <Routes>
            <Route path="/" element={
              <div className="space-y-8">
                {/* Header */}
                <div className="flex items-center space-x-3">
                  <Shield className="h-8 w-8 text-police-navy" />
                  <h1 className="text-2xl font-bold text-police-navy">Image Forensics Analysis</h1>
                </div>

                {/* Main Content */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                  {/* Left Column: Upload and Instructions */}
                  <div className="lg:col-span-5">
                    <div className="police-card p-6 mb-6">
                      <h2 className="text-lg font-semibold text-police-navy mb-4">Upload Evidence Image</h2>
                      <ImageUploader 
                        onImageUpload={handleImageUpload} 
                        isProcessing={isProcessing}
                      />
                    </div>
                    <div className="police-card p-6">
                      <h2 className="text-lg font-semibold text-police-navy mb-4">About Visual Evidence Verification</h2>
                      <p className="text-gray-600 mb-3">
                        This tool analyzes images for signs of tampering, manipulation, or inconsistencies. 
                        It extracts EXIF metadata, performs edge detection, and generates a tamper feature vector.
                      </p>
                      <h3 className="text-md font-medium text-police-navy mb-2">What we check:</h3>
                      <ul className="list-disc list-inside text-gray-600 space-y-1">
                        <li>EXIF metadata integrity</li>
                        <li>Signs of editing software usage</li>
                        <li>Image edge consistency</li>
                        <li>Visual clarity anomalies</li>
                      </ul>
                    </div>
                  </div>

                  {/* Right Column: Results */}
                  <div className="lg:col-span-7">
                    <div className="police-card p-6 min-h-[500px]">
                      <h2 className="text-lg font-semibold text-police-navy mb-4">Analysis Results</h2>
                      
                      {error ? (
                        <div className="flex flex-col items-center justify-center h-[400px] text-sos">
                          <p className="mb-4">Error: {error}</p>
                          <button 
                            onClick={() => setError(null)}
                            className="police-button-primary"
                          >
                            Try Again
                          </button>
                        </div>
                      ) : isProcessing ? (
                        <div className="flex flex-col items-center justify-center h-[400px]">
                          <div className="w-16 h-16 border-4 border-police-navy border-t-transparent rounded-full animate-spin mb-4"></div>
                          <p className="text-gray-600">Analyzing image...</p>
                        </div>
                      ) : results ? (
                        <AnalysisResults 
                          results={results} 
                          originalImage={originalImage}
                          sobelImage={sobelImage}
                        />
                      ) : (
                        <div className="flex flex-col items-center justify-center h-[400px] text-gray-400">
                          <p>Upload an image to see analysis results</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            } />
            <Route path="/complaint/new" element={<div>File Complaint Page</div>} />
            <Route path="/complaint/track" element={<div>Track Case Page</div>} />
            <Route path="/sos" element={<div>Emergency SOS Page</div>} />
            <Route path="/learn" element={<div>Law Learning Page</div>} />
            <Route path="/heatmap" element={<div>Safety Map Page</div>} />
            <Route path="/profile" element={<div>Profile Page</div>} />
            <Route path="/profile/settings" element={<div>Settings Page</div>} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;