import sharp from 'sharp';
import path from 'path';
import fs from 'fs';

const SIZES = [72, 96, 128, 144, 152, 192, 384, 512];
const INPUT_FILE = path.join(process.cwd(), 'public/brand/logo_clean.svg');
const OUTPUT_DIR = path.join(process.cwd(), 'public/icons');

async function generateIcons() {
    if (!fs.existsSync(OUTPUT_DIR)) {
        fs.mkdirSync(OUTPUT_DIR, { recursive: true });
    }

    console.log(`🎨 Generating icons from ${INPUT_FILE}...`);

    for (const size of SIZES) {
        const fileName = `icon-${size}x${size}.png`;
        const outputPath = path.join(OUTPUT_DIR, fileName);

        await sharp(INPUT_FILE)
            .resize(size, size)
            .png()
            .toFile(outputPath);

        console.log(`✅ Generated ${fileName}`);
    }

    // Generate apple-icon.png and icon.png (root)
    await sharp(INPUT_FILE).resize(192, 192).png().toFile(path.join(process.cwd(), 'public/apple-icon.png'));
    console.log('✅ Generated public/apple-icon.png');

    await sharp(INPUT_FILE).resize(512, 512).png().toFile(path.join(process.cwd(), 'public/icon.png'));
    console.log('✅ Generated public/icon.png');
}

generateIcons().catch(console.error);
