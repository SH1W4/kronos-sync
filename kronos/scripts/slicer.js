const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

async function sliceImage(imagePath, outputDir, rows, cols, prefix) {
    if (!fs.existsSync(imagePath)) {
        console.error(`File not found: ${imagePath}`);
        return;
    }

    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
    }

    const image = sharp(imagePath);
    const metadata = await image.metadata();
    const width = metadata.width;
    const height = metadata.height;

    const cellWidth = Math.floor(width / cols);
    const cellHeight = Math.floor(height / rows);

    console.log(`Slicing ${imagePath} (${width}x${height}) into ${rows}x${cols} grid...`);

    let count = 0;
    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
            const left = c * cellWidth;
            const top = r * cellHeight;
            const filename = `${prefix}_${r}_${c}.png`;
            const outputPath = path.join(outputDir, filename);

            try {
                await image
                    .clone()
                    .extract({ left, top, width: cellWidth, height: cellHeight })
                    .toFile(outputPath);
                console.log(`Saved ${outputPath}`);
                count++;
            } catch (err) {
                console.error(`Error saving ${filename}: ${err.message}`);
            }
        }
    }
    console.log(`Done! Created ${count} assets.`);
}

const args = process.argv.slice(2);
if (args.length < 5) {
    console.log("Usage: node slicer.js <imagePath> <outputDir> <rows> <cols> <prefix>");
    process.exit(1);
}

const [imagePath, outputDir, rows, cols, prefix] = args;
sliceImage(imagePath, outputDir, parseInt(rows), parseInt(cols), prefix);
