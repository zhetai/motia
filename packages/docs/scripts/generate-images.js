const sharp = require('sharp');
const fs = require('fs/promises');
const path = require('path');

async function generateImages() {
  // SVG content matching your HeaderLogo: a blue arrow with transparent background
  const svgContent = `
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#3B82F6" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <line x1="5" y1="12" x2="19" y2="12"/>
      <polyline points="12 5 19 12 12 19"/>
    </svg>
  `;

  // Create public directory if it doesn't exist.
  const publicDir = path.join(process.cwd(), 'public');
  await fs.mkdir(publicDir, { recursive: true });

  // Create a Buffer from the SVG string.
  const svgBuffer = Buffer.from(svgContent);

  // Define desired sizes.
  const sizes = {
    'favicon-16x16.png': 16,
    'favicon-32x32.png': 32,
    'favicon-48x48.png': 48,
    'android-icon-192x192.png': 192,
    'apple-icon.png': 180,
    'icon.png': 512
  };

  for (const [filename, size] of Object.entries(sizes)) {
    await sharp(svgBuffer, { density: 300 })
      .resize({
        width: size,
        height: size,
        fit: 'contain',
        background: { r: 0, g: 0, b: 0, alpha: 0 }
      })
      .png()
      .toFile(path.join(publicDir, filename));

    console.log(`Generated ${filename}`);
  }

  // Generate favicon.ico at 32x32 pixels.
  await sharp(svgBuffer, { density: 300 })
    .resize({
      width: 32,
      height: 32,
      fit: 'contain',
      background: { r: 0, g: 0, b: 0, alpha: 0 }
    })
    .toFile(path.join(publicDir, 'favicon.ico'));

  console.log('Generated favicon.ico');
  console.log('✅ All images generated successfully');
}

generateImages().catch(console.error);
