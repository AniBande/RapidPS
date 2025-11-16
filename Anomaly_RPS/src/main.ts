import { analyzeImage } from './utils/imageAnalysis/imageAnalyzer';

const fileInput = document.getElementById('fileInput') as HTMLInputElement;
const originalImage = document.getElementById('originalImage') as HTMLImageElement;
const edgeImage = document.getElementById('edgeImage') as HTMLImageElement;
const resultsDiv = document.getElementById('results') as HTMLDivElement;
const loadingDiv = document.getElementById('loading') as HTMLDivElement;

fileInput.addEventListener('change', async (event) => {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;

    // Show loading state
    loadingDiv.style.display = 'block';
    resultsDiv.innerHTML = '';
    originalImage.style.display = 'none';
    edgeImage.style.display = 'none';

    try {
        // Display original image
        const originalImageUrl = URL.createObjectURL(file);
        originalImage.src = originalImageUrl;
        originalImage.style.display = 'block';

        // Analyze image
        const result = await analyzeImage(file, {
            performFourierAnalysis: true,
            edgeDetectionThreshold: 0.7
        });

        // Display edge detection image
        edgeImage.src = result.edge.sobelImageData;
        edgeImage.style.display = 'block';

        // Display results
        const resultsHTML = `
            <h3>Analysis Summary</h3>
            <p>${result.visualExplanation}</p>
            
            <h3>Detailed Results</h3>
            <ul>
                <li>EXIF Data: ${result.exif.hasExif ? 'Present' : 'Missing'}</li>
                <li>Missing Fields: ${result.exif.missingFields.join(', ') || 'None'}</li>
                <li>Artist Tag: ${result.exif.artistTag || 'Not found'}</li>
                <li>Edge Variance: ${result.edge.edgeVariance.toFixed(3)}</li>
                <li>Fourier Score: ${result.fourier.spectrumScore.toFixed(3)}</li>
                <li>Visual Clarity: ${result.visual.clarityScore.toFixed(3)}</li>
            </ul>
            
            <h3>Feature Vector (z_I)</h3>
            <p>${result.z_I.map((v, i) => `z_${i}: ${v.toFixed(3)}`).join(', ')}</p>
        `;

        resultsDiv.innerHTML = resultsHTML;

    } catch (error) {
        resultsDiv.innerHTML = `<p style="color: red;">Error analyzing image: ${error}</p>`;
    } finally {
        loadingDiv.style.display = 'none';
    }
}); 