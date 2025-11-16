import React, { useState } from 'react';
import { Check, X, AlertTriangle, Layers, FileImage, BarChart, Info, Shield } from 'lucide-react';
import { AnalysisResult } from '../types/analysisTypes';

interface AnalysisResultsProps {
  results: AnalysisResult;
  originalImage: string | null;
  sobelImage: string | null;
}

const AnalysisResults: React.FC<AnalysisResultsProps> = ({ results, originalImage, sobelImage }) => {
  const [activeTab, setActiveTab] = useState<'summary' | 'exif' | 'visual' | 'vector'>('summary');
  
  const getStatusIcon = (isPositive: boolean, isSuspicious: boolean = false) => {
    if (isSuspicious) return <AlertTriangle className="text-police-saffron" size={18} />;
    return isPositive 
      ? <Check className="text-police-green" size={18} /> 
      : <X className="text-sos" size={18} />;
  };

  const getThreatLevel = () => {
    let score = 0;
    
    if (!results.has_exif) score += 2;
    if (results.suspicious_software) score += 2;
    if (results.missing_fields.length > 2) score += results.missing_fields.length / 2;
    if (results.edge_variance > 0.7) score += 2;
    if (results.fourier_spectrum_score < 0.5) score += 2;
    if (results.visual_clarity_score < 0.5) score += 1;
    
    if (score < 3) return { level: 'Low', color: 'text-police-green' };
    if (score < 6) return { level: 'Medium', color: 'text-police-saffron' };
    return { level: 'High', color: 'text-sos' };
  };

  const threatLevel = getThreatLevel();

  return (
    <div className="space-y-6">
      {/* Summary Section */}
      <div className="police-card p-4">
        <div className="flex justify-between items-start flex-wrap gap-4">
          <div>
            <h3 className="text-lg font-semibold text-police-navy">Analysis Summary</h3>
            <p className="text-gray-600 mt-1 text-sm">{results.visual_explanation}</p>
          </div>
          <div className="flex items-center">
            <div className="mr-2 text-right">
              <div className="text-sm text-gray-500">Threat Level:</div>
              <div className={`font-bold ${threatLevel.color}`}>{threatLevel.level}</div>
            </div>
            <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
              threatLevel.level === 'Low' ? 'bg-police-green/20' : 
              threatLevel.level === 'Medium' ? 'bg-police-saffron/20' : 
              'bg-sos/20'
            }`}>
              <span className={`text-xl font-bold ${threatLevel.color}`}>
                {threatLevel.level === 'Low' ? 'L' : 
                 threatLevel.level === 'Medium' ? 'M' : 'H'}
              </span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Images Preview */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="police-card p-3">
          <h4 className="text-sm font-medium mb-2 flex items-center text-police-navy">
            <FileImage size={16} className="mr-1 text-police-navy" />
            Original Image
          </h4>
          <div className="aspect-video bg-gray-50 rounded overflow-hidden flex items-center justify-center">
            {originalImage ? (
              <img 
                src={originalImage} 
                alt="Original" 
                className="max-w-full max-h-full object-contain"
              />
            ) : (
              <p className="text-gray-400 text-sm">No image</p>
            )}
          </div>
        </div>
        
        <div className="police-card p-3">
          <h4 className="text-sm font-medium mb-2 flex items-center text-police-navy">
            <Layers size={16} className="mr-1 text-police-navy" />
            Sobel Edge Detection
          </h4>
          <div className="aspect-video bg-gray-50 rounded overflow-hidden flex items-center justify-center">
            {sobelImage ? (
              <img 
                src={sobelImage} 
                alt="Sobel Filter" 
                className="max-w-full max-h-full object-contain"
              />
            ) : (
              <p className="text-gray-400 text-sm">No image</p>
            )}
          </div>
        </div>
      </div>
      
      {/* Tabs Navigation */}
      <div className="border-b border-gray-200 mb-4">
        <nav className="flex -mb-px space-x-6">
          <button
            className={`py-2 font-medium text-sm border-b-2 transition-colors ${
              activeTab === 'summary' 
                ? 'border-police-navy text-police-navy' 
                : 'border-transparent text-gray-500 hover:text-police-navy'
            }`}
            onClick={() => setActiveTab('summary')}
          >
            Summary
          </button>
          <button
            className={`py-2 font-medium text-sm border-b-2 transition-colors ${
              activeTab === 'exif' 
                ? 'border-police-navy text-police-navy' 
                : 'border-transparent text-gray-500 hover:text-police-navy'
            }`}
            onClick={() => setActiveTab('exif')}
          >
            EXIF Data
          </button>
          <button
            className={`py-2 font-medium text-sm border-b-2 transition-colors ${
              activeTab === 'visual' 
                ? 'border-police-navy text-police-navy' 
                : 'border-transparent text-gray-500 hover:text-police-navy'
            }`}
            onClick={() => setActiveTab('visual')}
          >
            Visual Analysis
          </button>
          <button
            className={`py-2 font-medium text-sm border-b-2 transition-colors ${
              activeTab === 'vector' 
                ? 'border-police-navy text-police-navy' 
                : 'border-transparent text-gray-500 hover:text-police-navy'
            }`}
            onClick={() => setActiveTab('vector')}
          >
            Feature Vector
          </button>
        </nav>
      </div>
      
      {/* Tab Content */}
      <div className="mb-4">
        {activeTab === 'summary' && (
          <div className="space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="police-card p-3 flex items-center">
                <div className="mr-3">
                  {getStatusIcon(results.has_exif)}
                </div>
                <div>
                  <h4 className="text-sm font-medium text-police-navy">EXIF Metadata</h4>
                  <p className="text-xs text-gray-500">
                    {results.has_exif 
                      ? 'Image contains EXIF data' 
                      : 'No EXIF data found'}
                  </p>
                </div>
              </div>
              
              <div className="police-card p-3 flex items-center">
                <div className="mr-3">
                  {getStatusIcon(!results.suspicious_software, results.suspicious_software)}
                </div>
                <div>
                  <h4 className="text-sm font-medium text-police-navy">Editing Software</h4>
                  <p className="text-xs text-gray-500">
                    {results.suspicious_software 
                      ? 'Editing software detected' 
                      : 'No editing software detected'}
                  </p>
                </div>
              </div>
              
              <div className="police-card p-3 flex items-center">
                <div className="mr-3">
                  {getStatusIcon(results.edge_variance < 0.7, results.edge_variance >= 0.7)}
                </div>
                <div>
                  <h4 className="text-sm font-medium text-police-navy">Edge Variance</h4>
                  <p className="text-xs text-gray-500">
                    Score: {results.edge_variance.toFixed(2)}
                    {results.edge_variance >= 0.7 ? ' (Suspicious)' : ''}
                  </p>
                </div>
              </div>
              
              <div className="police-card p-3 flex items-center">
                <div className="mr-3">
                  {getStatusIcon(results.fourier_spectrum_score > 0.5, results.fourier_spectrum_score <= 0.5)}
                </div>
                <div>
                  <h4 className="text-sm font-medium text-police-navy">Fourier Analysis</h4>
                  <p className="text-xs text-gray-500">
                    Score: {results.fourier_spectrum_score.toFixed(2)}
                    {results.fourier_spectrum_score <= 0.5 ? ' (Suspicious)' : ''}
                  </p>
                </div>
              </div>
            </div>
            
            {results.missing_fields.length > 0 && (
              <div className="police-card p-3 border border-police-saffron/30">
                <h4 className="text-sm font-medium flex items-center text-police-saffron">
                  <AlertTriangle size={16} className="text-police-saffron mr-1" />
                  Missing EXIF Fields:
                </h4>
                <p className="text-xs text-gray-600 mt-1">
                  {results.missing_fields.join(', ')}
                </p>
              </div>
            )}
          </div>
        )}
        
        {activeTab === 'exif' && (
          <div>
            <div className="flex items-center mb-3">
              <Info size={18} className="text-police-navy mr-2" />
              <h3 className="text-sm font-medium text-police-navy">EXIF Metadata Details</h3>
            </div>
            
            <div className="police-card p-4 mb-3">
              <h4 className="text-xs uppercase text-gray-500 mb-2">Status</h4>
              <div className="flex items-center mb-2">
                <div className="w-4 h-4 mr-2">
                  {getStatusIcon(results.has_exif)}
                </div>
                <p className="text-sm text-gray-600">
                  {results.has_exif 
                    ? 'Image contains EXIF metadata' 
                    : 'No EXIF metadata found in image'}
                </p>
              </div>
              
              {results.has_exif && results.artist_tag && (
                <div className="mt-3">
                  <h4 className="text-xs uppercase text-gray-500 mb-1">Artist Tag</h4>
                  <p className="text-sm font-mono bg-gray-50 p-2 rounded text-police-navy">
                    {results.artist_tag}
                  </p>
                </div>
              )}
            </div>
            
            {results.missing_fields.length > 0 && (
              <div className="police-card p-4 mb-3">
                <h4 className="text-xs uppercase text-gray-500 mb-2">Missing Fields</h4>
                <div className="grid grid-cols-2 gap-2">
                  {results.missing_fields.map((field, index) => (
                    <div key={index} className="flex items-center">
                      <X size={14} className="text-sos mr-2" />
                      <p className="text-sm text-gray-600">{field}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {results.suspicious_software && (
              <div className="police-card p-3 border border-sos/30">
                <h4 className="text-sm font-medium text-sos mb-1">Suspicious Software Detected</h4>
                <p className="text-xs text-gray-600">
                  The image metadata indicates it was processed with editing software that may have altered the original content.
                </p>
              </div>
            )}
          </div>
        )}
        
        {activeTab === 'visual' && (
          <div>
            <div className="flex items-center mb-3">
              <BarChart size={18} className="text-police-navy mr-2" />
              <h3 className="text-sm font-medium text-police-navy">Visual Analysis Metrics</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div className="police-card p-4">
                <h4 className="text-xs uppercase text-gray-500 mb-2">Edge Variance</h4>
                <div className="flex items-center mb-2">
                  <span className="text-2xl font-bold mr-2 text-police-navy">
                    {results.edge_variance.toFixed(2)}
                  </span>
                  <span className={`text-sm ${
                    results.edge_variance < 0.7 ? 'text-police-green' : 'text-sos'
                  }`}>
                    {results.edge_variance < 0.7 ? 'Normal' : 'Suspicious'}
                  </span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2 mt-2">
                  <div 
                    className={`h-2 rounded-full ${
                      results.edge_variance < 0.4 ? 'bg-police-green' :
                      results.edge_variance < 0.7 ? 'bg-police-saffron' : 'bg-sos'
                    }`}
                    style={{ width: `${Math.min(results.edge_variance * 100, 100)}%` }}
                  ></div>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Edge variance measures the consistency of image edges. Higher values may indicate tampering.
                </p>
              </div>
              
              <div className="police-card p-4">
                <h4 className="text-xs uppercase text-gray-500 mb-2">Fourier Spectrum</h4>
                <div className="flex items-center mb-2">
                  <span className="text-2xl font-bold mr-2 text-police-navy">
                    {results.fourier_spectrum_score.toFixed(2)}
                  </span>
                  <span className={`text-sm ${
                    results.fourier_spectrum_score > 0.5 ? 'text-police-green' : 'text-sos'
                  }`}>
                    {results.fourier_spectrum_score > 0.5 ? 'Normal' : 'Suspicious'}
                  </span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2 mt-2">
                  <div 
                    className={`h-2 rounded-full ${
                      results.fourier_spectrum_score > 0.7 ? 'bg-police-green' :
                      results.fourier_spectrum_score > 0.5 ? 'bg-police-saffron' : 'bg-sos'
                    }`}
                    style={{ width: `${Math.min(results.fourier_spectrum_score * 100, 100)}%` }}
                  ></div>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Fourier analysis evaluates frequency patterns. Lower scores may indicate digital manipulation.
                </p>
              </div>
            </div>
            
            <div className="police-card p-4">
              <h4 className="text-xs uppercase text-gray-500 mb-2">Visual Clarity</h4>
              <div className="flex items-center mb-2">
                <span className="text-2xl font-bold mr-2 text-police-navy">
                  {results.visual_clarity_score.toFixed(2)}
                </span>
                <span className={`text-sm ${
                  results.visual_clarity_score > 0.6 ? 'text-police-green' :
                  results.visual_clarity_score > 0.4 ? 'text-police-saffron' : 'text-sos'
                }`}>
                  {results.visual_clarity_score > 0.6 ? 'Clear' :
                   results.visual_clarity_score > 0.4 ? 'Moderate' : 'Poor'}
                </span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-2 mt-2">
                <div 
                  className={`h-2 rounded-full ${
                    results.visual_clarity_score > 0.6 ? 'bg-police-green' :
                    results.visual_clarity_score > 0.4 ? 'bg-police-saffron' : 'bg-sos'
                  }`}
                  style={{ width: `${Math.min(results.visual_clarity_score * 100, 100)}%` }}
                ></div>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Visual clarity measures image quality and artifacts. Lower scores may indicate resaving or compression artifacts.
              </p>
            </div>
          </div>
        )}
        
        {activeTab === 'vector' && (
          <div>
            <div className="flex items-center mb-3">
              <BarChart size={18} className="text-police-navy mr-2" />
              <h3 className="text-sm font-medium text-police-navy">Feature Vector Output</h3>
            </div>
            
            <div className="police-card p-4 mb-4">
              <h4 className="text-xs uppercase text-gray-500 mb-2">Visual Tamper Feature Vector (z_I)</h4>
              <div className="bg-gray-50 p-3 rounded font-mono text-sm overflow-x-auto">
                <pre className="whitespace-pre-wrap text-police-navy">
                  {JSON.stringify(results, null, 2)}
                </pre>
              </div>
              <p className="text-xs text-gray-500 mt-3">
                This feature vector is used for downstream machine learning fusion to detect potential tampering.
              </p>
            </div>
            
            <div className="police-card p-3 border border-police-navy/30">
              <h4 className="text-sm font-medium text-police-navy mb-1">Vector Explanation</h4>
              <ul className="text-xs text-gray-600 space-y-1 mt-2">
                <li><span className="text-police-navy">has_exif</span>: Whether image contains EXIF metadata</li>
                <li><span className="text-police-navy">missing_fields</span>: Critical EXIF fields that are missing</li>
                <li><span className="text-police-navy">suspicious_software</span>: Whether editing software was detected</li>
                <li><span className="text-police-navy">artist_tag</span>: The value of the Artist EXIF field</li>
                <li><span className="text-police-navy">edge_variance</span>: Score for edge consistency (higher = less consistent)</li>
                <li><span className="text-police-navy">fourier_spectrum_score</span>: Score for frequency pattern analysis</li>
                <li><span className="text-police-navy">visual_clarity_score</span>: Score for visual quality</li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AnalysisResults;