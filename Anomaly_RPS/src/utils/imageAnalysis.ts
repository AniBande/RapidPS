// import ExifReader from 'exifreader';
// import { AnalysisResult } from '../types/analysisTypes';

// export async function analyzeImage(file: File): Promise<{ result: AnalysisResult, sobelImageData: string }> {
//   return new Promise((resolve, reject) => {
//     // Create an image element for processing
//     const img = new Image();
//     img.onload = async () => {
//       try {
//         // Get EXIF data
//         const exifData = await extractExifData(file);
        
//         // Create a canvas for image processing
//         const canvas = document.createElement('canvas');
//         const ctx = canvas.getContext('2d');
        
//         if (!ctx) {
//           throw new Error('Could not get canvas context');
//         }
        
//         // Set canvas dimensions
//         canvas.width = img.width;
//         canvas.height = img.height;
        
//         // Draw the original image on canvas
//         ctx.drawImage(img, 0, 0, img.width, img.height);
        
//         // Get image data for processing
//         const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        
//         // Apply Sobel filter for edge detection
//         const { sobelData, edgeVariance } = applySobelFilter(imageData);
        
//         // Create a canvas for the Sobel-filtered image
//         const sobelCanvas = document.createElement('canvas');
//         sobelCanvas.width = canvas.width;
//         sobelCanvas.height = canvas.height;
        
//         const sobelCtx = sobelCanvas.getContext('2d');
//         if (!sobelCtx) {
//           throw new Error('Could not get Sobel canvas context');
//         }
        
//         // Put Sobel data on the canvas
//         sobelCtx.putImageData(sobelData, 0, 0);
        
//         // Get Sobel image as data URL
//         const sobelImageData = sobelCanvas.toDataURL();
        
//         // Generate random scores for demo purposes (in a real app, these would be calculated)
//         const fourierScore = simulateFourierAnalysis();
//         const visualClarityScore = simulateVisualClarityScore();
        
//         // Create the final analysis result
//         const result: AnalysisResult = {
//           has_exif: exifData.hasExif,
//           missing_fields: exifData.missingFields,
//           suspicious_software: exifData.suspiciousSoftware,
//           artist_tag: exifData.artistTag || 'N/A',
//           edge_variance: edgeVariance,
//           fourier_spectrum_score: fourierScore,
//           visual_clarity_score: visualClarityScore,
//           visual_explanation: generateExplanation(exifData, edgeVariance, fourierScore, visualClarityScore),
//           z_I: [
//             exifData.hasExif ? 1 : 0,
//             exifData.missingFields.length,
//             exifData.suspiciousSoftware ? 1 : 0,
//             edgeVariance,
//             fourierScore,
//             visualClarityScore
//           ]
//         };
        
//         resolve({ result, sobelImageData });
//       } catch (error) {
//         reject(error);
//       }
//     };
    
//     img.onerror = (error) => {
//       reject(error);
//     };
    
//     img.src = URL.createObjectURL(file);
//   });
// }

// async function extractExifData(file: File): Promise<{
//   hasExif: boolean;
//   missingFields: string[];
//   suspiciousSoftware: boolean;
//   artistTag: string | null;
// }> {
//   try {
//     // Read the file as an ArrayBuffer
//     const arrayBuffer = await file.arrayBuffer();
    
//     // Extract tags using ExifReader
//     const tags = ExifReader.load(arrayBuffer);
    
//     // Check if EXIF data exists
//     const hasExif = !!tags && Object.keys(tags).length > 0;
    
//     // Define critical fields to check
//     const criticalFields = ['DateTime', 'Make', 'Model', 'Software', 'Artist', 'GPSLatitude', 'GPSLongitude'];
    
//     // Initialize missing fields array
//     const missingFields: string[] = [];
    
//     // Check for each critical field
//     criticalFields.forEach(field => {
//       let fieldExists = false;
      
//       switch (field) {
//         case 'DateTime':
//           fieldExists = !!tags['ModifyDate'] || !!tags['DateTime'] || !!tags['DateTimeOriginal'];
//           break;
//         case 'Artist':
//           fieldExists = !!tags['Artist'];
//           break;
//         case 'Software':
//           fieldExists = !!tags['Software'];
//           break;
//         case 'Make':
//           fieldExists = !!tags['Make'];
//           break;
//         case 'Model':
//           fieldExists = !!tags['Model'];
//           break;
//         case 'GPSLatitude':
//           fieldExists = !!tags['GPSLatitude'];
//           break;
//         case 'GPSLongitude':
//           fieldExists = !!tags['GPSLongitude'];
//           break;
//       }
      
//       if (!fieldExists) {
//         missingFields.push(field);
//       }
//     });
    
//     // Check for suspicious software
//     let suspiciousSoftware = false;
//     let artistTag = null;
    
//     // Check software field
//     if (tags['Software']) {
//       const softwareName = tags['Software'].description.toLowerCase();
//       suspiciousSoftware = softwareName.includes('photoshop') || 
//                           softwareName.includes('gimp') || 
//                           softwareName.includes('lightroom') || 
//                           softwareName.includes('snapseed') ||
//                           softwareName.includes('picsart');
//     }
    
//     // Get Artist tag
//     if (tags['Artist']) {
//       artistTag = tags['Artist'].description;
//       // Check if artist tag suggests editing
//       suspiciousSoftware = suspiciousSoftware || 
//                           artistTag.toLowerCase().includes('photoshop') || 
//                           artistTag.toLowerCase().includes('editor');
//     }
    
//     return {
//       hasExif,
//       missingFields,
//       suspiciousSoftware,
//       artistTag
//     };
//   } catch (error) {
//     console.error('Error extracting EXIF data:', error);
//     // If there's an error, assume no EXIF data
//     return {
//       hasExif: false,
//       missingFields: ['DateTime', 'Make', 'Model', 'Software', 'Artist', 'GPSLatitude', 'GPSLongitude'],
//       suspiciousSoftware: false,
//       artistTag: null
//     };
//   }
// }

// function applySobelFilter(imageData: ImageData): { sobelData: ImageData, edgeVariance: number } {
//   const { width, height, data } = imageData;
  
//   // Create a grayscale version first
//   const grayscale = new Uint8ClampedArray(width * height);
//   for (let i = 0; i < height; i++) {
//     for (let j = 0; j < width; j++) {
//       const idx = (i * width + j) * 4;
//       // Simple grayscale conversion
//       grayscale[i * width + j] = Math.round(
//         0.299 * data[idx] + 0.587 * data[idx + 1] + 0.114 * data[idx + 2]
//       );
//     }
//   }
  
//   // Apply Sobel filter
//   const sobelOutput = new Uint8ClampedArray(width * height * 4);
//   let edgeIntensities = [];
  
//   for (let i = 1; i < height - 1; i++) {
//     for (let j = 1; j < width - 1; j++) {
//       // Sobel kernels
//       const gx = (
//         -1 * grayscale[(i - 1) * width + (j - 1)] +
//         0 * grayscale[(i - 1) * width + j] +
//         1 * grayscale[(i - 1) * width + (j + 1)] +
//         -2 * grayscale[i * width + (j - 1)] +
//         0 * grayscale[i * width + j] +
//         2 * grayscale[i * width + (j + 1)] +
//         -1 * grayscale[(i + 1) * width + (j - 1)] +
//         0 * grayscale[(i + 1) * width + j] +
//         1 * grayscale[(i + 1) * width + (j + 1)]
//       );
      
//       const gy = (
//         -1 * grayscale[(i - 1) * width + (j - 1)] +
//         -2 * grayscale[(i - 1) * width + j] +
//         -1 * grayscale[(i - 1) * width + (j + 1)] +
//         0 * grayscale[i * width + (j - 1)] +
//         0 * grayscale[i * width + j] +
//         0 * grayscale[i * width + (j + 1)] +
//         1 * grayscale[(i + 1) * width + (j - 1)] +
//         2 * grayscale[(i + 1) * width + j] +
//         1 * grayscale[(i + 1) * width + (j + 1)]
//       );
      
//       // Edge magnitude
//       const magnitude = Math.min(255, Math.round(Math.sqrt(gx * gx + gy * gy)));
//       edgeIntensities.push(magnitude);
      
//       const outputIdx = (i * width + j) * 4;
//       sobelOutput[outputIdx] = magnitude;
//       sobelOutput[outputIdx + 1] = magnitude;
//       sobelOutput[outputIdx + 2] = magnitude;
//       sobelOutput[outputIdx + 3] = 255;
//     }
//   }
  
//   // Calculate edge variance (normalized from 0-1)
//   // Higher variance could indicate inconsistent editing
//   const totalPixels = edgeIntensities.length;
//   if (totalPixels === 0) {
//     return { sobelData: new ImageData(sobelOutput, width, height), edgeVariance: 0 };
//   }
  
//   // Get mean
//   const mean = edgeIntensities.reduce((sum, val) => sum + val, 0) / totalPixels;
  
//   // Get variance
//   const variance = edgeIntensities.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / totalPixels;
  
//   // Normalize to 0-1 range (assuming max variance around 5000)
//   const normalizedVariance = Math.min(1, variance / 5000);
  
//   return {
//     sobelData: new ImageData(sobelOutput, width, height),
//     edgeVariance: normalizedVariance
//   };
// }

// // Simulate Fourier analysis (in a real app, we would do actual FFT)
// function simulateFourierAnalysis(): number {
//   // Random score between 0.3 and 0.9 for demo purposes
//   return 0.3 + Math.random() * 0.6;
// }

// // Simulate visual clarity score
// function simulateVisualClarityScore(): number {
//   // Random score between 0.4 and 0.95 for demo purposes
//   return 0.4 + Math.random() * 0.55;
// }

// function generateExplanation(
//   exifData: { hasExif: boolean, missingFields: string[], suspiciousSoftware: boolean, artistTag: string | null },
//   edgeVariance: number,
//   fourierScore: number,
//   visualClarityScore: number
// ): string {
//   const issues: string[] = [];
  
//   if (!exifData.hasExif) {
//     issues.push("missing EXIF metadata");
//   } else if (exifData.missingFields.length > 0) {
//     issues.push(`missing ${exifData.missingFields.length} critical EXIF fields`);
//   }
  
//   if (exifData.suspiciousSoftware) {
//     issues.push("editing software detected");
//   }
  
//   if (edgeVariance > 0.7) {
//     issues.push("high edge inconsistency");
//   }
  
//   if (fourierScore < 0.5) {
//     issues.push("suspicious frequency patterns");
//   }
  
//   if (visualClarityScore < 0.5) {
//     issues.push("low visual clarity");
//   }
  
//   if (issues.length === 0) {
//     return "No suspicious elements detected in the image.";
//   }
  
//   return `Image flagged due to ${issues.join(', ')}.`;
// }