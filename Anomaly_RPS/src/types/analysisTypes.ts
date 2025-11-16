export interface AnalysisResult {
  has_exif: boolean;
  missing_fields: string[];
  suspicious_software: boolean;
  artist_tag: string;
  edge_variance: number;
  fourier_spectrum_score: number;
  visual_clarity_score: number;
  visual_explanation: string;
  z_I: number[];
}