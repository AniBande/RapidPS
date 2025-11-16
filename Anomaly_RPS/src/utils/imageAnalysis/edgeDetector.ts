import { EdgeAnalysisResult } from './types';

export function applySobelFilter(imageData: ImageData): EdgeAnalysisResult {
  const { width, height, data } = imageData;

  // Step 1: Convert the image to grayscale using luminosity method
  const grayscale = new Uint8ClampedArray(width * height);
  for (let i = 0; i < height; i++) {
    for (let j = 0; j < width; j++) {
      const idx = (i * width + j) * 4;
      // Weighted sum of R, G, B channels to get perceived brightness
      grayscale[i * width + j] = Math.round(
        0.299 * data[idx] + 0.587 * data[idx + 1] + 0.114 * data[idx + 2]
      );
    }
  }

  // Step 2: Prepare for Sobel filter application
  const sobelOutput = new Uint8ClampedArray(width * height * 4); // Resultant edge-detected image (RGBA)
  const edgeIntensities: number[] = []; // Stores magnitude of edge at each pixel

  // Step 3: Apply Sobel operator to detect edges
  for (let i = 1; i < height - 1; i++) {
    for (let j = 1; j < width - 1; j++) {
      // Calculate gradient in X direction using Sobel kernel
      const gx = (
        -1 * grayscale[(i - 1) * width + (j - 1)] +
        0 * grayscale[(i - 1) * width + j] +
        1 * grayscale[(i - 1) * width + (j + 1)] +
        -2 * grayscale[i * width + (j - 1)] +
        0 * grayscale[i * width + j] +
        2 * grayscale[i * width + (j + 1)] +
        -1 * grayscale[(i + 1) * width + (j - 1)] +
        0 * grayscale[(i + 1) * width + j] +
        1 * grayscale[(i + 1) * width + (j + 1)]
      );

      // Calculate gradient in Y direction using Sobel kernel
      const gy = (
        -1 * grayscale[(i - 1) * width + (j - 1)] +
        -2 * grayscale[(i - 1) * width + j] +
        -1 * grayscale[(i - 1) * width + (j + 1)] +
        0 * grayscale[i * width + (j - 1)] +
        0 * grayscale[i * width + j] +
        0 * grayscale[i * width + (j + 1)] +
        1 * grayscale[(i + 1) * width + (j - 1)] +
        2 * grayscale[(i + 1) * width + j] +
        1 * grayscale[(i + 1) * width + (j + 1)]
      );

      // Compute gradient magnitude (edge strength)
      const magnitude = Math.min(255, Math.round(Math.sqrt(gx * gx + gy * gy)));
      edgeIntensities.push(magnitude);

      // Store magnitude as grayscale RGBA pixel
      const outputIdx = (i * width + j) * 4;
      sobelOutput[outputIdx] = magnitude;       // R
      sobelOutput[outputIdx + 1] = magnitude;   // G
      sobelOutput[outputIdx + 2] = magnitude;   // B
      sobelOutput[outputIdx + 3] = 255;         // Alpha (fully opaque)
    }
  }

  // Step 4: Analyze edge intensity distribution (variance)
  const mean = edgeIntensities.reduce((sum, val) => sum + val, 0) / edgeIntensities.length;

  const variance = edgeIntensities.reduce(
    (sum, val) => sum + Math.pow(val - mean, 2),
    0
  ) / edgeIntensities.length;

  // Normalize variance to 0–1 range using a fixed scale factor (empirically chosen)
  const normalizedVariance = Math.min(1, variance / 5000);

  // Step 5: Convert sobel output to base64 image for visualization
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Could not get canvas context');

  const sobelImageData = new ImageData(sobelOutput, width, height);
  ctx.putImageData(sobelImageData, 0, 0);

  // Step 6: Return analysis results
  return {
    edgeVariance: normalizedVariance,         // Used to measure edge consistency
    sobelImageData: canvas.toDataURL(),       // Useful for debugging and reports
    edgeIntensities                           // For optional downstream visualization/stats
  };
}
