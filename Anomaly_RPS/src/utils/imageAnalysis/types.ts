export interface ExifAnalysisResult {
  hasExif: boolean;
  missingFields: string[];
  suspiciousSoftware: boolean;
  artistTag: string | null;
  metadata: Record<string, any>;
}

export interface EdgeAnalysisResult {
  edgeVariance: number;
  sobelImageData: string;
  edgeIntensities: number[];
}

export interface FourierAnalysisResult {
  spectrumScore: number;
  frequencyComponents: number[];
  suspiciousPatterns: boolean;
}

export interface VisualClarityResult {
  clarityScore: number;
  noiseLevel: number;
  sharpness: number;
}

export interface AnalysisResult {
  exif: ExifAnalysisResult;
  edge: EdgeAnalysisResult;
  fourier: FourierAnalysisResult;
  visual: VisualClarityResult;
  z_I: number[]; // Feature vector
  visualExplanation: string;
}

export interface ImageAnalysisOptions {
  performFourierAnalysis?: boolean;
  edgeDetectionThreshold?: number;
  fourierThreshold?: number;
} 