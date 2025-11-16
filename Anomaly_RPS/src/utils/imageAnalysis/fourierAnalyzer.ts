import { FourierAnalysisResult } from './types';

// Step 1: Convert image to grayscale
function imageToGrayscale(imageData: ImageData): number[] {
  const { width, height, data } = imageData;
  const grayscale: number[] = [];

  for (let i = 0; i < height; i++) {
    for (let j = 0; j < width; j++) {
      const idx = (i * width + j) * 4;
      // Weighted sum of RGB values to get luminance
      grayscale.push(
        Math.round(0.299 * data[idx] + 0.587 * data[idx + 1] + 0.114 * data[idx + 2])
      );
    }
  }

  return grayscale;
}

// Step 2: Find the next power of 2 (for efficient FFT computation)
function nextPowerOf2(n: number): number {
  return Math.pow(2, Math.ceil(Math.log2(n)));
}

// Step 3: Custom 1D FFT implementation (naive Cooley–Tukey radix-2 FFT)
// Operates on real-valued input and initializes imaginary part to 0
function fft(signal: number[]): { real: number[], imag: number[] } {
  const N = nextPowerOf2(signal.length);
  const real = new Array(N).fill(0);
  const imag = new Array(N).fill(0);

  // Copy original signal to real part
  for (let i = 0; i < signal.length; i++) {
    real[i] = signal[i];
  }

  // Main FFT computation loop (non-optimized, basic butterfly operations)
  for (let size = 1; size < N; size *= 2) {
    const halfsize = size;
    const tablestep = N / (size * 2);

    for (let i = 0; i < N; i += size * 2) {
      for (let j = i, k = 0; j < i + halfsize; j++, k += tablestep) {
        // Compute twiddle factors (cos/sin)
        const tpre = real[j + halfsize] * Math.cos(k * Math.PI / N) +
                     imag[j + halfsize] * Math.sin(k * Math.PI / N);
        const tpim = -real[j + halfsize] * Math.sin(k * Math.PI / N) +
                     imag[j + halfsize] * Math.cos(k * Math.PI / N);

        // Butterfly computation
        real[j + halfsize] = real[j] - tpre;
        imag[j + halfsize] = imag[j] - tpim;
        real[j] += tpre;
        imag[j] += tpim;
      }
    }
  }

  return { real, imag };
}

// Step 4: Compute magnitude spectrum (sqrt of real^2 + imag^2)
function calculateMagnitudeSpectrum(real: number[], imag: number[]): number[] {
  const N = real.length;
  const magnitude = new Array(N);

  for (let i = 0; i < N; i++) {
    magnitude[i] = Math.sqrt(real[i] * real[i] + imag[i] * imag[i]);
  }

  return magnitude;
}

// Step 5: Analyze frequency distribution in the image
export function analyzeFourier(imageData: ImageData): FourierAnalysisResult {
  // Convert to grayscale first (since FFT is done on 1D signal)
  const grayscale = imageToGrayscale(imageData);

  // Perform Fast Fourier Transform
  const { real, imag } = fft(grayscale);

  // Calculate the magnitude spectrum (used for frequency analysis)
  const magnitudeSpectrum = calculateMagnitudeSpectrum(real, imag);

  // Step 6: Divide spectrum into frequency bands
  const N = magnitudeSpectrum.length;
  const halfN = Math.floor(N / 2); // Only the first half contains unique info

  // Split into low, mid, and high frequency bands
  const lowFreqBand = magnitudeSpectrum.slice(0, Math.max(1, halfN / 4));
  const midFreqBand = magnitudeSpectrum.slice(Math.max(1, halfN / 4), Math.max(1, halfN / 2));
  const highFreqBand = magnitudeSpectrum.slice(Math.max(1, halfN / 2), halfN);

  // Compute average magnitude in each band
  const lowFreq = lowFreqBand.reduce((a, b) => a + b, 0) / Math.max(1, lowFreqBand.length);
  const midFreq = midFreqBand.reduce((a, b) => a + b, 0) / Math.max(1, midFreqBand.length);
  const highFreq = highFreqBand.reduce((a, b) => a + b, 0) / Math.max(1, highFreqBand.length);

  // Step 7: Compute a score based on spectral balance
  // Natural images have dominant low-mid frequencies. Tampered or compressed images may show spikes in high frequencies.
  const spectrumScore = (lowFreq + midFreq) / Math.max(1, highFreq);

  // Step 8: Detect suspicious patterns in frequency distribution
  const suspiciousPatterns =
    (highFreq > lowFreq * 2) || // High-frequency spike
    (midFreq < lowFreq * 0.5);  // Low mid-frequency values (too smooth)

  // Step 9: Return results with normalized score
  return {
    spectrumScore: Math.min(1, Math.max(0, spectrumScore / 10)), // Clamp between 0 and 1
    frequencyComponents: magnitudeSpectrum,                      // Full frequency info
    suspiciousPatterns                                           // Binary flag for anomaly
  };
}
