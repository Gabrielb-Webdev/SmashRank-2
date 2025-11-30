const fs = require('fs');
const path = require('path');

// Crear SVG simple para iconos
const createSVG = (size) => `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#dc143c;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#ffd700;stop-opacity:1" />
    </linearGradient>
  </defs>
  <rect width="${size}" height="${size}" rx="${size * 0.15}" fill="url(#grad)"/>
  <text x="50%" y="50%" font-size="${size * 0.6}" text-anchor="middle" dominant-baseline="middle" fill="white">🎮</text>
</svg>`;

// Guardar en public
const publicDir = path.join(__dirname, 'public');
fs.writeFileSync(path.join(publicDir, 'icon.svg'), createSVG(512));
console.log('✅ Iconos SVG creados');
