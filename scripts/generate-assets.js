/**
 * Generate Placeholder Assets for PTP Soccer App
 * Run with: node scripts/generate-assets.js
 */

const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

function createColoredPNG(width, height, r, g, b) {
  const signature = Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]);
  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(width, 0);
  ihdrData.writeUInt32BE(height, 4);
  ihdrData[8] = 8; ihdrData[9] = 2; ihdrData[10] = 0; ihdrData[11] = 0; ihdrData[12] = 0;
  const ihdrChunk = createChunk('IHDR', ihdrData);
  const rawData = Buffer.alloc(height * (1 + width * 3));
  for (let y = 0; y < height; y++) {
    const rowStart = y * (1 + width * 3);
    rawData[rowStart] = 0;
    for (let x = 0; x < width; x++) {
      const pixelStart = rowStart + 1 + x * 3;
      rawData[pixelStart] = r; rawData[pixelStart + 1] = g; rawData[pixelStart + 2] = b;
    }
  }
  const compressedData = zlib.deflateSync(rawData);
  const idatChunk = createChunk('IDAT', compressedData);
  const iendChunk = createChunk('IEND', Buffer.alloc(0));
  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

function createChunk(type, data) {
  const length = Buffer.alloc(4);
  length.writeUInt32BE(data.length, 0);
  const typeBuffer = Buffer.from(type, 'ascii');
  const crc = crc32(Buffer.concat([typeBuffer, data]));
  const crcBuffer = Buffer.alloc(4);
  crcBuffer.writeUInt32BE(crc >>> 0, 0);
  return Buffer.concat([length, typeBuffer, data, crcBuffer]);
}

function crc32(buffer) {
  let crc = 0xFFFFFFFF;
  const table = makeCRCTable();
  for (let i = 0; i < buffer.length; i++) crc = (crc >>> 8) ^ table[(crc ^ buffer[i]) & 0xFF];
  return crc ^ 0xFFFFFFFF;
}

function makeCRCTable() {
  const table = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = ((c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1));
    table[n] = c;
  }
  return table;
}

const PTP_YELLOW = { r: 252, g: 185, b: 0 };
const PTP_INK = { r: 14, g: 15, b: 17 };
const assetsDir = path.join(__dirname, '..', 'assets');
if (!fs.existsSync(assetsDir)) fs.mkdirSync(assetsDir, { recursive: true });

console.log('Generating icon.png (1024x1024)...');
fs.writeFileSync(path.join(assetsDir, 'icon.png'), createColoredPNG(1024, 1024, PTP_INK.r, PTP_INK.g, PTP_INK.b));

console.log('Generating adaptive-icon.png (1024x1024)...');
fs.writeFileSync(path.join(assetsDir, 'adaptive-icon.png'), createColoredPNG(1024, 1024, PTP_YELLOW.r, PTP_YELLOW.g, PTP_YELLOW.b));

console.log('Generating splash.png (1284x2778)...');
fs.writeFileSync(path.join(assetsDir, 'splash.png'), createColoredPNG(1284, 2778, PTP_INK.r, PTP_INK.g, PTP_INK.b));

console.log('Generating favicon.png (48x48)...');
fs.writeFileSync(path.join(assetsDir, 'favicon.png'), createColoredPNG(48, 48, PTP_INK.r, PTP_INK.g, PTP_INK.b));

console.log('\nPlaceholder assets generated successfully!');
