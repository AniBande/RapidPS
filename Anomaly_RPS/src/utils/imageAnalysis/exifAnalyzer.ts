import ExifReader from 'exifreader';
import { ExifAnalysisResult } from './types';

const CRITICAL_FIELDS = [
  'DateTime',
  'Make',
  'Model',
  'Software',
  'Artist',
  'GPSLatitude',
  'GPSLongitude'
];

const SUSPICIOUS_SOFTWARE = [
  'photoshop',
  'gimp',
  'lightroom',
  'snapseed',
  'picsart',
  'paint.net',
  'coreldraw',
  'affinity'
];

export async function analyzeExif(file: File): Promise<ExifAnalysisResult> {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const tags = ExifReader.load(arrayBuffer);
    
    const hasExif = !!tags && Object.keys(tags).length > 0;
    const missingFields: string[] = [];
    let suspiciousSoftware = false;
    let artistTag: string | null = null;
    
    // Check for missing critical fields
    CRITICAL_FIELDS.forEach(field => {
      let fieldExists = false;
      
      switch (field) {
        case 'DateTime':
          fieldExists = !!(tags['ModifyDate'] || tags['DateTime'] || tags['DateTimeOriginal']);
          break;
        case 'Artist':
          fieldExists = !!tags['Artist'];
          if (tags['Artist']) {
            artistTag = tags['Artist'].description;
          }
          break;
        case 'Software':
          fieldExists = !!tags['Software'];
          if (tags['Software']) {
            const softwareName = tags['Software'].description.toLowerCase();
            suspiciousSoftware = SUSPICIOUS_SOFTWARE.some(s => softwareName.includes(s));
          }
          break;
        case 'Make':
          fieldExists = !!tags['Make'];
          break;
        case 'Model':
          fieldExists = !!tags['Model'];
          break;
        case 'GPSLatitude':
          fieldExists = !!tags['GPSLatitude'];
          break;
        case 'GPSLongitude':
          fieldExists = !!tags['GPSLongitude'];
          break;
      }
      
      if (!fieldExists) {
        missingFields.push(field);
      }
    });
    
    // Check artist tag for suspicious content
    if (artistTag) {
      const lowerArtistTag = artistTag.toLowerCase();
      suspiciousSoftware = suspiciousSoftware || 
        SUSPICIOUS_SOFTWARE.some(s => lowerArtistTag.includes(s)) ||
        lowerArtistTag.includes('editor') ||
        lowerArtistTag.includes('modified');
    }
    
    return {
      hasExif,
      missingFields,
      suspiciousSoftware,
      artistTag,
      metadata: tags
    };
  } catch (error) {
    console.error('Error analyzing EXIF data:', error);
    return {
      hasExif: false,
      missingFields: CRITICAL_FIELDS,
      suspiciousSoftware: false,
      artistTag: null,
      metadata: {}
    };
  }
} 