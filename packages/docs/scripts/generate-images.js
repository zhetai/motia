const sharp = require('sharp');
const fs = require('fs/promises');
const path = require('path');

async function generateImages() {
  // SVG content matching your HeaderLogo: a blue arrow with transparent background
  const svgContent = `
    <svg width="295" height="127" viewBox="0 0 295 127" fill="none" xmlns="http://www.w3.org/2000/svg">
      <g clip-path="url(#clip0_512_36)">
        <path d="M0.520508 84.2194H32.0014C53.9923 84.2194 74.81 74.298 88.6654 57.2074C102.512 40.1254 123.33 30.1954 145.329 30.1954H173.394" stroke="white" stroke-width="60.3909" stroke-miterlimit="10"/>
        <path d="M119.724 84.2194H151.205C173.196 84.2194 194.014 74.298 207.869 57.2074C221.716 40.1254 242.533 30.1954 264.533 30.1954H292.597" stroke="white" stroke-width="60.3909" stroke-miterlimit="10"/>
        <path d="M292.477 53.8428H232.086V114.122H292.477V53.8428Z" fill="white"/>
      </g>
      <defs>
        <clipPath id="clip0_512_36">
          <rect width="294.199" height="126.993" fill="white" transform="translate(0.520508)"/>
        </clipPath>
      </defs>
    </svg>
  `

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
