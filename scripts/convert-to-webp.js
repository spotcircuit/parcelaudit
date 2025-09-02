const sharp = require('sharp');
const fs = require('fs').promises;
const path = require('path');

async function convertToWebP(inputPath, outputPath) {
  try {
    await sharp(inputPath)
      .webp({ quality: 85 })
      .toFile(outputPath);
    console.log(`✓ Converted: ${path.basename(inputPath)} → ${path.basename(outputPath)}`);
  } catch (error) {
    console.error(`✗ Failed to convert ${inputPath}:`, error.message);
  }
}

async function processDirectory(dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    
    if (entry.isDirectory()) {
      await processDirectory(fullPath);
    } else if (entry.isFile() && entry.name.endsWith('.png')) {
      const webpPath = fullPath.replace('.png', '.webp');
      await convertToWebP(fullPath, webpPath);
    }
  }
}

async function main() {
  const publicImagesPath = path.join(__dirname, '..', 'public', 'images');
  console.log('Starting WebP conversion...');
  console.log(`Processing directory: ${publicImagesPath}`);
  
  try {
    await processDirectory(publicImagesPath);
    console.log('\n✅ WebP conversion complete!');
  } catch (error) {
    console.error('Error during conversion:', error);
    process.exit(1);
  }
}

main();