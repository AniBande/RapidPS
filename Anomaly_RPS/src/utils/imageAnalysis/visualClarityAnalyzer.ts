import { VisualClarityResult } from './types';

function calculateNoiseLevel(imageData: ImageData): number {
  const { width, height, data } = imageData;
  let noiseSum = 0;
  let count = 0;
  
  // Calculate local variance as a measure of noise
  for (let i = 1; i < height - 1; i++) {
    for (let j = 1; j < width - 1; j++) {
      const idx = (i * width + j) * 4;
      const center = (data[idx] + data[idx + 1] + data[idx + 2]) / 3;
      
      // Calculate average of 8 surrounding pixels
      let surroundingSum = 0;
      for (let di = -1; di <= 1; di++) {
        for (let dj = -1; dj <= 1; dj++) {
          if (di === 0 && dj === 0) continue;
          const sidx = ((i + di) * width + (j + dj)) * 4;
          surroundingSum += (data[sidx] + data[sidx + 1] + data[sidx + 2]) / 3;
        }
      }
      const surroundingAvg = surroundingSum / 8;
      
      // Accumulate squared difference
      noiseSum += Math.pow(center - surroundingAvg, 2);
      count++;
    }
  }
  
  // Normalize noise level to 0-1 range
  return Math.min(1, Math.sqrt(noiseSum / count) / 50);
}

function calculateSharpness(imageData: ImageData): number {
  const { width, height, data } = imageData;
  let sharpnessSum = 0;
  let count = 0;
  
  // Calculate sharpness using Laplacian operator
  for (let i = 1; i < height - 1; i++) {
    for (let j = 1; j < width - 1; j++) {
      const idx = (i * width + j) * 4;
      const center = (data[idx] + data[idx + 1] + data[idx + 2]) / 3;
      
      // Laplacian kernel
      const laplacian = (
        -1 * ((data[idx - width * 4] + data[idx - width * 4 + 1] + data[idx - width * 4 + 2]) / 3) +
        -1 * ((data[idx - 4] + data[idx - 4 + 1] + data[idx - 4 + 2]) / 3) +
        4 * center +
        -1 * ((data[idx + 4] + data[idx + 4 + 1] + data[idx + 4 + 2]) / 3) +
        -1 * ((data[idx + width * 4] + data[idx + width * 4 + 1] + data[idx + width * 4 + 2]) / 3)
      );
      
      sharpnessSum += Math.abs(laplacian);
      count++;
    }
  }
  
  // Normalize sharpness to 0-1 range
  return Math.min(1, sharpnessSum / count / 100);
}

export function analyzeVisualClarity(imageData: ImageData): VisualClarityResult {
  const noiseLevel = calculateNoiseLevel(imageData);
  const sharpness = calculateSharpness(imageData);
  
  // Calculate overall clarity score
  // Higher noise and lower sharpness reduce the score
  const clarityScore = Math.max(0, 1 - noiseLevel * 0.6 - (1 - sharpness) * 0.4);
  
  return {
    clarityScore,
    noiseLevel,
    sharpness
  };
} 