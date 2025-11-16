import { analyzeExif } from './exifAnalyzer';
import { applySobelFilter } from './edgeDetector';
import { analyzeFourier } from './fourierAnalyzer';
import { analyzeVisualClarity } from './visualClarityAnalyzer';
import { AnalysisResult, ImageAnalysisOptions } from './types';

export async function analyzeImage(
  file: File,
  options: ImageAnalysisOptions = {}
): Promise<AnalysisResult> {
  // Create image element for processing
  const img = new Image();
  const imageLoadPromise = new Promise<HTMLImageElement>((resolve, reject) => {
    img.onload = () => resolve(img);
    img.onerror = reject;
  });
  img.src = URL.createObjectURL(file);
  
  try {
    await imageLoadPromise;
    
    // Create canvas for image processing
    const canvas = document.createElement('canvas');
    canvas.width = img.width;
    canvas.height = img.height;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Could not get canvas context');
    
    // Draw image and get image data
    ctx.drawImage(img, 0, 0);
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    
    // Perform all analyses in parallel
    const [exifResult, edgeResult, fourierResult, visualResult] = await Promise.all([
      analyzeExif(file),
      applySobelFilter(imageData),
      options.performFourierAnalysis ? analyzeFourier(imageData) : Promise.resolve({
        spectrumScore: 0,
        frequencyComponents: [],
        suspiciousPatterns: false
      }),
      analyzeVisualClarity(imageData)
    ]);
    
    // Generate feature vector z_I
    const z_I = [
      exifResult.hasExif ? 1 : 0,
      exifResult.missingFields.length / 7, // Normalize by number of critical fields
      exifResult.suspiciousSoftware ? 1 : 0,
      edgeResult.edgeVariance,
      fourierResult.spectrumScore,
      visualResult.clarityScore
    ];
    
    // Generate explanation
    const issues: string[] = [];
    
    if (!exifResult.hasExif) {
      issues.push("missing EXIF metadata");
    } else if (exifResult.missingFields.length > 0) {
      issues.push(`missing ${exifResult.missingFields.length} critical EXIF fields`);
    }
    
    if (exifResult.suspiciousSoftware) {
      issues.push("editing software detected");
    }
    
    if (edgeResult.edgeVariance > (options.edgeDetectionThreshold || 0.7)) {
      issues.push("high edge inconsistency");
    }
    
    if (fourierResult.suspiciousPatterns) {
      issues.push("suspicious frequency patterns");
    }
    
    if (visualResult.clarityScore < 0.5) {
      issues.push("low visual clarity");
    }
    
    const visualExplanation = issues.length === 0
      ? "No suspicious elements detected in the image."
      : `Image flagged due to ${issues.join(', ')}.`;
    
    return {
      exif: exifResult,
      edge: edgeResult,
      fourier: fourierResult,
      visual: visualResult,
      z_I,
      visualExplanation
    };
  } finally {
    URL.revokeObjectURL(img.src);
  }
} 